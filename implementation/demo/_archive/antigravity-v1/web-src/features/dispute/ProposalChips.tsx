"use client";

import React from "react";
import * as m from "motion/react-m";
import { useReducedMotion } from "@/lib/a11y";
import { pick } from "@/lib/springs";

export function ProposalChips({
  selectedAllowanceMg = null,
  disabled = false,
  onPropose,
}: {
  selectedAllowanceMg?: number | null;
  disabled?: boolean;
  onPropose: (allowanceMg: number) => void | Promise<void>;
}) {
  const reduced = useReducedMotion();

  const proposals = [
    {
      id: "step-s07-accept-130",
      allowanceMg: 130,
      label: "Accept 0.130 g",
      sub: "Rework allowance · Carry 0.250 g",
    },
    {
      id: "step-s07-accept-380",
      allowanceMg: 380,
      label: "Accept all 0.380 g",
      sub: "Full waiver · Carry 0.000 g",
    },
    {
      id: "step-s07-reject-0",
      allowanceMg: 0,
      label: "Reject",
      sub: "No extra allowance · Carry 0.380 g",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2.5" role="group" aria-label="Dispute resolution proposals">
      {proposals.map((p) => {
        const active = selectedAllowanceMg === p.allowanceMg;
        return (
          <m.button
            key={p.allowanceMg}
            id={p.id}
            data-testid={p.id}
            type="button"
            disabled={disabled}
            whileTap={reduced || disabled ? undefined : { scale: 0.97 }}
            transition={pick("press", reduced)}
            onClick={() => void onPropose(p.allowanceMg)}
            style={{
              background: active ? "var(--accent)" : "var(--surface)",
              color: active ? "var(--accent-foreground)" : "var(--ink)",
              borderColor: active ? "var(--accent)" : "var(--hairline-strong)",
            }}
            className="flex min-h-[44px] flex-col items-start justify-center rounded-2xl border px-4 py-2 text-left text-xs transition-colors disabled:opacity-60"
          >
            <span className="font-semibold">{p.label}</span>
            <span
              style={{
                color: active ? "var(--accent-foreground)" : "var(--ink-3)",
              }}
              className="text-[11px] opacity-85"
            >
              {p.sub}
            </span>
          </m.button>
        );
      })}
    </div>
  );
}
