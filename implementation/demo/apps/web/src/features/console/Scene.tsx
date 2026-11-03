"use client";

import { useCallback, useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { getStepByIndex, type StoryStepDef } from "@/features/story/steps";
import { usePerform, useStoryState } from "@/features/story/useStory";
import type { StepId, StoryState } from "@/lib/story";
import { useStoryStore } from "@/stores/story";

/** A console surface: eyebrow, title, one status on the right, then content (DESIGN §14.2 wayfinding). */
export function Scene({
  eyebrow,
  title,
  aside,
  children,
  testId,
}: {
  eyebrow: string;
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <section
      className="rounded-[var(--r-xl)] border border-[var(--hairline-strong)] bg-[var(--card)] p-6 lg:p-7"
      data-testid={testId}
    >
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="t-label">{eyebrow}</p>
          <h2
            className="mt-1.5 text-[1.625rem] leading-tight text-[var(--ink)]"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em", fontWeight: 540 }}
          >
            {title}
          </h2>
        </div>
        {aside && <div className="flex shrink-0 items-center gap-2">{aside}</div>}
      </header>
      {children}
    </section>
  );
}

export interface Beat {
  state: StoryState | undefined;
  step: StoryStepDef;
  done: (id: StepId) => boolean;
  /** True when this control is the one the presenter should press now. */
  cue: (id: StepId) => boolean;
  perform: (id: StepId, party?: "jeweller" | "karigar") => Promise<void>;
  pending: boolean;
}

/**
 * Everything a scene needs for the current beat. On /stage the beat is the presenter's pointer; elsewhere
 * (`followServer`) it is the next beat the server has not done yet, so a real phone mirrors the story.
 */
export function useBeat(followServer = false): Beat {
  const { data: state } = useStoryState(followServer);
  const pointer = useStoryStore((s) => s.stepIndex);
  const stepIndex = followServer ? Math.min(state?.done.length ?? 0, 12) : pointer;
  const step = getStepByIndex(stepIndex);
  const mutation = usePerform();

  const done = useCallback((id: StepId) => !!state?.done.includes(id), [state]);
  const cue = useCallback((id: StepId) => step.id === id && !state?.done.includes(id), [state, step.id]);
  const perform = useCallback(
    async (id: StepId, party?: "jeweller" | "karigar") => {
      await mutation.mutateAsync({ step: id, party });
    },
    [mutation],
  );
  return { state, step, done, cue, perform, pending: mutation.isPending };
}

/** Row in a statement: label left, figure right, decimals aligned. */
export function Line({
  label,
  hint,
  children,
  strong = false,
  testId,
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  children: React.ReactNode;
  strong?: boolean;
  testId?: string;
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 py-2.5 ${strong ? "" : "border-b border-[var(--hairline)]"}`}
      data-testid={testId}
    >
      <div className="min-w-0">
        <p className={`text-sm ${strong ? "font-semibold text-[var(--ink)]" : "text-[var(--ink-2)]"}`}>{label}</p>
        {hint && <p className="text-xs text-[var(--ink-3)]">{hint}</p>}
      </div>
      <div className="shrink-0 text-right">{children}</div>
    </div>
  );
}

/**
 * When something new lands in a scene (a flag, a reply, a QR), bring it into view above the story rail.
 * Skips the first render so jumping to a beat never scrolls on its own.
 */
export function RevealAnchor({ when }: { when: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const last = useRef(when);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (last.current === when) return;
    last.current = when;
    ref.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "end" });
  }, [when, reduced]);
  return <span ref={ref} aria-hidden="true" className="block h-px scroll-mb-40" />;
}
