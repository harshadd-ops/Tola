"use client";

import React from "react";
import { Compass, Sparkles } from "lucide-react";
import { getStepByIndex } from "./steps";
import { useStoryStore } from "@/stores/story";

export interface StepSpotlightProps {
  onPerformStep?: (stepId: string) => void;
}

export function StepSpotlight({ onPerformStep }: StepSpotlightProps) {
  const stepIndex = useStoryStore((s) => s.stepIndex);
  const mode = useStoryStore((s) => s.mode);
  const status = useStoryStore((s) => s.status);
  const step = getStepByIndex(stepIndex);

  if (mode === "explore") {
    return (
      <div
        style={{
          background: "var(--surface-elevated)",
          borderColor: "var(--hairline)",
          boxShadow: "var(--shadow-sm)",
        }}
        className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border px-4 py-2.5 text-xs"
        data-testid="explore-mode-banner"
      >
        <div
          style={{ color: "var(--ink-2)" }}
          className="flex items-center gap-2"
        >
          <Compass
            style={{ color: "var(--gold-deep)" }}
            className="h-4 w-4"
            aria-hidden="true"
          />
          <span>
            <strong style={{ color: "var(--ink)" }}>Free Explore Mode</strong> · Navigate any route, inspect events, or press{" "}
            <kbd
              style={{
                background: "var(--surface-sunken)",
                borderColor: "var(--hairline)",
              }}
              className="rounded border px-1.5 py-0.5 font-mono text-[10px]"
            >
              M
            </kbd>{" "}
            to return to guided Story Mode.
          </span>
        </div>
      </div>
    );
  }

  const handleFocusTarget = () => {
    if (typeof document !== "undefined") {
      const el = document.getElementById(step.spotlightTargetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus({ preventScroll: true });
      }
    }
    onPerformStep?.(step.id);
  };

  return (
    <div
      style={{
        background: "var(--surface-elevated)",
        borderColor: "var(--gold-hairline)",
        boxShadow: "var(--shadow-sm)",
      }}
      className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-2.5"
      data-testid="step-spotlight-banner"
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <span
          style={{
            background: "var(--slate)",
            color: "var(--surface-elevated)",
          }}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 font-mono text-xs font-semibold"
        >
          <Sparkles
            style={{ color: "var(--gold)" }}
            className="h-3 w-3"
            aria-hidden="true"
          />
          <span data-testid="spotlight-step-id">{step.id}</span>
        </span>
        <span
          style={{
            background: "var(--gold-tint)",
            borderColor: "var(--gold-hairline)",
            color: "var(--gold-deep)",
          }}
          className="rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-semibold"
        >
          {step.day} {step.timeLabel}
        </span>
        <span
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          className="text-base font-normal"
          data-testid="spotlight-step-title"
        >
          {step.title}
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <span
          style={{ color: "var(--ink-3)" }}
          className="hidden font-mono text-[11px] uppercase tracking-wider sm:inline"
        >
          {status === "done" ? "Step complete" : `Action: ${step.action}`}
        </span>
        <button
          type="button"
          data-testid="spotlight-perform-btn"
          onClick={handleFocusTarget}
          style={{
            background: "var(--gold-tint)",
            borderColor: "var(--gold-hairline)",
            color: "var(--gold-deep)",
          }}
          className="inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs font-semibold transition-transform active:scale-[0.98]"
        >
          <span>Run {step.id}</span>
        </button>
      </div>
    </div>
  );
}
