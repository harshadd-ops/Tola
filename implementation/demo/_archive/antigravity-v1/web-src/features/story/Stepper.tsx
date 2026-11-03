"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  HelpCircle,
  RotateCcw,
} from "lucide-react";
import { STORY_STEPS, getStepByIndex, type StoryStepDef } from "./steps";
import { useStoryKeys } from "./useStoryKeys";
import { useSessionStore } from "@/stores/session";
import { useStoryStore } from "@/stores/story";

export interface StepperProps {
  onStepChange?: (step: StoryStepDef) => void;
  onResetDemo?: () => void;
}

export function Stepper({ onStepChange, onResetDemo }: StepperProps) {
  const stepIndex = useStoryStore((s) => s.stepIndex);
  const completedSteps = useStoryStore((s) => s.completedSteps);
  const mode = useStoryStore((s) => s.mode);
  const setStepIndex = useStoryStore((s) => s.setStepIndex);
  const toggleMode = useStoryStore((s) => s.toggleMode);
  const setShowRealVsMocked = useStoryStore((s) => s.setShowRealVsMocked);
  const resetStoryState = useStoryStore((s) => s.resetStoryState);
  const setPersona = useSessionStore((s) => s.setPersona);

  const currentStep = getStepByIndex(stepIndex);

  const jumpTo = (idx: number) => {
    const target = getStepByIndex(idx);
    setStepIndex(target.index, "waiting");
    setPersona(target.persona);
    onStepChange?.(target);
  };

  const handlePrev = () => {
    const prevIdx = Math.max(0, stepIndex - 1);
    jumpTo(prevIdx);
  };

  const handleNext = () => {
    const nextIdx = Math.min(STORY_STEPS.length - 1, stepIndex + 1);
    jumpTo(nextIdx);
  };

  const handleReset = () => {
    resetStoryState();
    const first = STORY_STEPS[0]!;
    setPersona(first.persona);
    onResetDemo?.();
    onStepChange?.(first);
  };

  useStoryKeys({
    onJumpToStep: jumpTo,
    onNextStep: handleNext,
    onPrevStep: handlePrev,
    onReset: handleReset,
  });

  return (
    <footer
      aria-label="Guided story stepper"
      data-testid="story-stepper"
      style={{
        borderTopColor: "var(--hairline)",
      }}
      className="glass-chrome sticky bottom-0 z-40 border-t py-2.5 pl-14 pr-4"
    >
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            data-testid="stepper-prev"
            aria-label="Previous step"
            disabled={stepIndex <= 0}
            onClick={handlePrev}
            style={{
              background: "var(--surface-elevated)",
              borderColor: "var(--hairline-strong)",
              color: "var(--ink)",
            }}
            className="inline-flex min-h-9 items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          <button
            type="button"
            data-testid="stepper-next"
            aria-label="Next step"
            disabled={stepIndex >= STORY_STEPS.length - 1}
            onClick={handleNext}
            style={{
              background: "var(--slate)",
              color: "var(--surface-elevated)",
            }}
            className="inline-flex min-h-9 items-center gap-1 rounded-full px-3.5 py-1 text-xs font-semibold transition-transform active:scale-[0.98] disabled:opacity-40"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        <div
          className="no-scrollbar flex flex-1 items-center gap-1 overflow-x-auto px-1 py-0.5"
          role="tablist"
          aria-label="Story steps S01 to S13"
        >
          {STORY_STEPS.map((step) => {
            const isActive = step.index === stepIndex;
            const isDone = Boolean(completedSteps[step.id]) || step.index < stepIndex;
            return (
              <button
                key={step.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`${step.id}: ${step.day} ${step.timeLabel} — ${step.title}`}
                data-testid={`stepper-pill-${step.id}`}
                onClick={() => jumpTo(step.index)}
                style={{
                  background: isActive
                    ? "var(--slate)"
                    : isDone
                      ? "var(--gold-tint)"
                      : "var(--surface-elevated)",
                  color: isActive
                    ? "var(--surface-elevated)"
                    : isDone
                      ? "var(--gold-deep)"
                      : "var(--ink-3)",
                  borderColor: isActive
                    ? "var(--slate)"
                    : isDone
                      ? "var(--gold-hairline)"
                      : "var(--hairline)",
                }}
                className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[11px] font-medium transition-all"
              >
                {isActive ? (
                  <span className="text-[9px] uppercase opacity-80">{step.day}</span>
                ) : null}
                <span className={isActive ? "font-bold" : ""}>{step.id}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5">
          <div
            style={{ color: "var(--ink-2)" }}
            className="hidden max-w-[240px] truncate text-xs xl:block"
            data-testid="stepper-current-title"
          >
            <span
              style={{ color: "var(--gold-deep)" }}
              className="font-mono font-semibold"
            >
              {currentStep.id}
            </span>{" "}
            · {currentStep.title}
          </div>

          <button
            type="button"
            data-testid="stepper-mode-toggle"
            onClick={() => toggleMode()}
            style={{
              background: "var(--surface-elevated)",
              borderColor: "var(--hairline)",
              color: "var(--ink-2)",
            }}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] font-medium transition-colors"
          >
            <Compass
              style={{ color: "var(--gold-deep)" }}
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />
            <span>{mode === "story" ? "Story" : "Explore"}</span>
          </button>

          <button
            type="button"
            data-testid="stepper-real-vs-mocked"
            aria-label="What's real vs mocked"
            onClick={() => setShowRealVsMocked(true)}
            style={{
              background: "var(--gold-tint)",
              borderColor: "var(--gold-hairline)",
              color: "var(--gold-deep)",
            }}
            className="inline-flex min-h-9 items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[11px] font-semibold"
          >
            <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden md:inline">Real/Mock</span>
          </button>

          <button
            type="button"
            data-testid="stepper-reset"
            onClick={handleReset}
            style={{
              background: "var(--surface-elevated)",
              borderColor: "var(--hairline)",
              color: "var(--ink-2)",
            }}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Reset demo</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
