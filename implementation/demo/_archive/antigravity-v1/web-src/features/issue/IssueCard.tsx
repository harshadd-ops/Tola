"use client";

import React from "react";
import * as m from "motion/react-m";
import { GramFigure } from "@/components/ui/GramFigure";
import { Pill } from "@/components/ui/Pill";
import { TickPair } from "@/components/ui/TickPair";
import { useReducedMotion } from "@/lib/a11y";
import { pick } from "@/lib/springs";

export function IssueCard({
  goldMg = 40000,
  sigCount = 0,
  loading = false,
  onSignJeweller,
}: {
  goldMg?: number;
  sigCount?: 0 | 1 | 2 | number;
  loading?: boolean;
  onSignJeweller?: () => void | Promise<void>;
}) {
  const reduced = useReducedMotion();
  const clampedSigs = Math.max(0, Math.min(2, sigCount)) as 0 | 1 | 2;

  return (
    <div
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
            F-01 · F-03 · Gold Issue Draft (Event R5)
          </p>
          <h2
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
            className="mt-0.5 text-xl font-normal"
          >
            Order #14 · Plain 22K bangle pair → Rafiq Sheikh
          </h2>
        </div>

        <TickPair count={clampedSigs} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div
          style={{
            background: "var(--surface-sunken)",
            borderColor: "var(--hairline)",
          }}
          className="rounded-2xl border p-3.5"
        >
          <p style={{ color: "var(--ink-3)" }} className="text-xs">
            Gross issued (916‰ · 22K)
          </p>
          <div className="mt-1">
            <GramFigure mg={goldMg} fineness={916} size="lg" />
          </div>
        </div>

        <div
          style={{
            background: "var(--surface-sunken)",
            borderColor: "var(--hairline)",
          }}
          className="rounded-2xl border p-3.5"
        >
          <p style={{ color: "var(--ink-3)" }} className="text-xs">
            Agreed wastage norm (up front)
          </p>
          <p
            style={{ fontFamily: "var(--font-mono)", color: "var(--ink)" }}
            className="mt-1 text-lg font-medium"
          >
            2.50% (250 bp)
          </p>
          <p style={{ color: "var(--ink-3)" }} className="text-xs">
            Allowed: <GramFigure mg={1000} size="sm" className="inline" />
          </p>
        </div>

        <div
          style={{
            background: "var(--surface-sunken)",
            borderColor: "var(--hairline)",
          }}
          className="flex items-center justify-between gap-3 rounded-2xl border p-3.5"
        >
          <div>
            <p style={{ color: "var(--ink-3)" }} className="text-xs">
              Bar photo attached
            </p>
            <p className="mt-1 font-mono text-xs font-medium">order14-bar.jpg</p>
            <Pill tone="gold" className="mt-1.5">
              22K · 916‰
            </Pill>
          </div>
          <div
            role="img"
            aria-label="Order 14 40.000 g gold bar on balance pan"
            style={{
              borderColor: "var(--gold-hairline)",
              background: "var(--gold-tint)",
            }}
            className="flex h-12 w-16 shrink-0 items-center justify-center rounded-xl border"
          >
            <svg width="44" height="32" viewBox="0 0 44 32" fill="none" aria-hidden="true">
              <ellipse cx="22" cy="24" rx="18" ry="4" fill="var(--hairline-strong)" />
              <path
                d="M11 19L14 11H30L33 19H11Z"
                fill="var(--gold)"
                stroke="var(--gold-deep)"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
              <path d="M14 11L16 14H28L30 11" stroke="var(--surface-elevated)" strokeWidth="0.9" opacity="0.6" />
              <text
                x="22"
                y="17.5"
                textAnchor="middle"
                fill="var(--surface-elevated)"
                fontSize="5.5"
                fontWeight="700"
                fontFamily="monospace"
              >
                916
              </text>
            </svg>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p style={{ color: "var(--ink-3)" }} className="text-xs">
          {clampedSigs === 0
            ? "Human gate: Suresh signs first; then Rafiq hears the Bengali read-back and signs."
            : clampedSigs === 1
              ? "1 of 2 signatures: awaiting Rafiq's হ্যাঁ (haan) on his phone."
              : "R5 sealed with 2 of 2 Ed25519 signatures and chained."}
        </p>

        <m.button
          id="step-s02-issue-sign"
          data-testid="step-s02-issue-sign"
          type="button"
          disabled={loading || clampedSigs >= 1}
          whileTap={reduced || clampedSigs >= 1 ? undefined : { scale: 0.97 }}
          transition={pick("press", reduced)}
          onClick={() => void onSignJeweller?.()}
          style={{
            background:
              clampedSigs >= 1 ? "var(--tick-pending-bg)" : "var(--accent)",
            color:
              clampedSigs >= 1
                ? "var(--tick-pending)"
                : "var(--accent-foreground)",
          }}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold disabled:opacity-75"
        >
          <span>
            {clampedSigs >= 1 ? "Signed by Suresh ✓" : "Sign as Suresh"}
          </span>
        </m.button>
      </div>
    </div>
  );
}
