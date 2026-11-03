"use client";

import React from "react";
import * as m from "motion/react-m";
import { pick } from "@/lib/springs";
import { useReducedMotion } from "@/lib/a11y";

export function TickPair({
  count,
  jewellerSigned,
  karigarSigned,
  jewellerLabel,
  karigarLabel,
  className = "",
}: {
  count?: 0 | 1 | 2 | number;
  jewellerSigned?: boolean;
  karigarSigned?: boolean;
  jewellerLabel?: string;
  karigarLabel?: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const computedCount =
    count !== undefined
      ? count
      : (jewellerSigned ? 1 : 0) + (karigarSigned ? 1 : 0);
  const clamped = Math.max(0, Math.min(2, computedCount));
  void jewellerLabel;
  void karigarLabel;
  const isSealed = clamped === 2;
  const isPending = clamped === 1;

  const badgeStyle: React.CSSProperties = isSealed
    ? {
        background: "var(--tick-sealed-bg)",
        color: "var(--tick-sealed)",
        borderColor: "var(--tick-sealed)",
      }
    : isPending
      ? {
          background: "var(--tick-pending-bg)",
          color: "var(--tick-pending)",
          borderColor: "var(--tick-pending)",
        }
      : {
          background: "var(--surface-sunken)",
          color: "var(--ink-3)",
          borderColor: "var(--hairline)",
        };

  return (
    <m.span
      initial={reduced ? { opacity: 0.9 } : { scale: 0.94 }}
      animate={reduced ? { opacity: 1 } : { scale: 1 }}
      transition={pick("snappy", reduced)}
      style={badgeStyle}
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}
      aria-label={`${clamped} of 2 signatures`}
    >
      <span className="inline-flex shrink-0 items-center -space-x-1" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path
            d="M3.5 8.5 6.5 11.5 12.5 4.5"
            stroke={clamped >= 1 ? "currentColor" : "var(--ink-4)"}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path
            d="M3.5 8.5 6.5 11.5 12.5 4.5"
            stroke={clamped >= 2 ? "currentColor" : "var(--ink-4)"}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="whitespace-nowrap" style={{ fontFamily: "var(--font-mono)" }}>
        {clamped} of 2
      </span>
    </m.span>
  );
}
