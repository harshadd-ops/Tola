"use client";

import { m, useReducedMotion } from "motion/react";
import { spring } from "@/lib/springs";

const PATHS = ["M2 10.5l4.2 4.2L15 5.5", "M10.6 14.1L19.3 5.5"] as const;

/**
 * Signature ticks (DESIGN §4.2, §10.4): one indigo tick per signature, WhatsApp-familiar.
 * A new signature draws its tick (spring, no overshoot). When both land the pair gets one gold halo.
 * Colour is never the only cue: the label says it too.
 */
export function Ticks({
  count,
  showLabel = true,
  size = 18,
  waitingFor,
}: {
  count: 0 | 1 | 2;
  showLabel?: boolean;
  size?: number;
  waitingFor?: string;
}) {
  const reduced = useReducedMotion();
  const both = count === 2;
  const label = both
    ? "Both signed"
    : count === 1
      ? waitingFor
        ? `Waiting for ${waitingFor}`
        : "1 of 2 signed"
      : "Not signed";
  return (
    <span className="inline-flex items-center gap-1.5" data-testid="sig-ticks" data-count={count}>
      <span
        className="inline-flex rounded-full transition-shadow duration-500"
        style={{
          boxShadow: both ? "0 0 14px 3px color-mix(in oklab, var(--gold) 50%, transparent)" : "none",
        }}
        aria-hidden="true"
      >
        <svg width={size * 1.35} height={size} viewBox="0 0 22 20" fill="none">
          {PATHS.map((d, i) => {
            const signed = i < count;
            return (
              <m.path
                key={`${i}-${signed}`}
                d={d}
                stroke={signed ? "var(--indigo-700)" : "var(--hairline-strong)"}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: signed && !reduced ? 0 : 1 }}
                animate={{ pathLength: 1 }}
                transition={spring.snappy}
              />
            );
          })}
        </svg>
      </span>
      <span className={showLabel ? "" : "sr-only"}>
        <span className={`text-xs font-medium ${both ? "text-[var(--indigo-700)]" : "text-[var(--ink-3)]"}`}>
          {label}
        </span>
      </span>
    </span>
  );
}
