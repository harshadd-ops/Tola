"use client";

import React, { useState } from "react";
import * as m from "motion/react-m";
import { GramFigure } from "@/components/ui/GramFigure";
import { TickPair } from "@/components/ui/TickPair";
import { useReducedMotion } from "@/lib/a11y";
import { pick } from "@/lib/springs";
import { IntakeAgentCard } from "./IntakeAgentCard";

export function ReturnIntakeCard({
  voiceCaptured = false,
  sigCount = 0,
  loading = false,
  onTriggerVoiceIntake,
  onSignReturn,
}: {
  voiceCaptured?: boolean;
  sigCount?: 0 | 1 | 2 | number;
  loading?: boolean;
  onTriggerVoiceIntake?: () => void | Promise<void>;
  onSignReturn?: () => void | Promise<void>;
}) {
  const reduced = useReducedMotion();
  const [pieceCaptured, setPieceCaptured] = useState(true);
  const [scrapCaptured, setScrapCaptured] = useState(true);
  const clampedSigs = Math.max(0, Math.min(2, sigCount)) as 0 | 1 | 2;

  return (
    <div
      id="step-s04-return-intake"
      style={{
        background: "var(--surface)",
        borderColor: "var(--hairline)",
        boxShadow: "var(--shadow-card)",
      }}
      className="rounded-3xl border p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p
            style={{
              color: "var(--ink-3)",
              letterSpacing: "var(--track-label)",
            }}
            className="text-xs font-semibold uppercase"
          >
            F-04 · Return Intake · Events R6 + R7
          </p>
          <h2
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
            className="mt-0.5 text-xl font-normal"
          >
            Thursday return: Order #14 bangles + scrap on the scale
          </h2>
        </div>

        <TickPair count={clampedSigs} />
      </div>

      {/* Three scale captures */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div
          style={{
            background: "var(--surface-sunken)",
            borderColor: "var(--hairline)",
          }}
          className="flex items-center justify-between rounded-2xl border p-3.5"
        >
          <div>
            <p style={{ color: "var(--ink-3)" }} className="text-xs">
              1. Finished piece
            </p>
            <GramFigure mg={38120} fineness={916} size="lg" />
          </div>
          <button
            type="button"
            onClick={() => setPieceCaptured(true)}
            style={{
              background: pieceCaptured
                ? "var(--tick-sealed-bg)"
                : "var(--surface)",
              color: pieceCaptured ? "var(--tick-sealed)" : "var(--ink)",
              borderColor: "var(--hairline)",
            }}
            className="min-h-[44px] rounded-full border px-3 text-xs font-semibold"
          >
            {pieceCaptured ? "Piece ✓" : "Capture piece"}
          </button>
        </div>

        <div
          style={{
            background: "var(--surface-sunken)",
            borderColor: "var(--hairline)",
          }}
          className="flex items-center justify-between rounded-2xl border p-3.5"
        >
          <div>
            <p style={{ color: "var(--ink-3)" }} className="text-xs">
              2. Scrap filings
            </p>
            <GramFigure mg={500} fineness={916} size="lg" />
          </div>
          <button
            type="button"
            onClick={() => setScrapCaptured(true)}
            style={{
              background: scrapCaptured
                ? "var(--tick-sealed-bg)"
                : "var(--surface)",
              color: scrapCaptured ? "var(--tick-sealed)" : "var(--ink)",
              borderColor: "var(--hairline)",
            }}
            className="min-h-[44px] rounded-full border px-3 text-xs font-semibold"
          >
            {scrapCaptured ? "Scrap ✓" : "Capture scrap"}
          </button>
        </div>

        <div
          style={{
            background: "var(--surface-sunken)",
            borderColor: "var(--hairline)",
          }}
          className="flex items-center justify-between rounded-2xl border p-3.5"
        >
          <div>
            <p style={{ color: "var(--ink-3)" }} className="text-xs">
              3. Total returned
            </p>
            <GramFigure mg={38620} fineness={916} size="lg" />
          </div>
          <span style={{ color: "var(--ink-3)" }} className="text-[11px]">
            Dust: 0.000 g
          </span>
        </div>
      </div>

      <div className="mt-4">
        <IntakeAgentCard />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p style={{ color: "var(--ink-3)" }} className="text-xs">
          EC-4 rule: Weights come from the scale readings (38.120 g + 0.500 g = 38.620 g); the voice transcript only fills order, note and tags.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {!voiceCaptured && onTriggerVoiceIntake && (
            <button
              type="button"
              onClick={() => void onTriggerVoiceIntake()}
              style={{
                background: "var(--surface-sunken)",
                borderColor: "var(--hairline-strong)",
                color: "var(--ink)",
              }}
              className="min-h-[44px] rounded-full border px-4 py-2 text-xs font-semibold"
            >
              Play voice note (S04)
            </button>
          )}
          <m.button
            type="button"
            data-testid="step-s04-sign-return"
            disabled={loading || clampedSigs >= 2}
            whileTap={reduced || clampedSigs >= 2 ? undefined : { scale: 0.97 }}
            transition={pick("press", reduced)}
            onClick={() => void onSignReturn?.()}
            style={{
              background:
                clampedSigs >= 2 ? "var(--tick-sealed-bg)" : "var(--accent)",
              color:
                clampedSigs >= 2
                  ? "var(--tick-sealed)"
                  : "var(--accent-foreground)",
            }}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold"
          >
            <span>
              {clampedSigs >= 2
                ? "Return sealed (2 of 2) ✓"
                : "Sign return"}
            </span>
          </m.button>
        </div>
      </div>
    </div>
  );
}
