"use client";

import React from "react";
import { CachedPill } from "@/components/ui/CachedPill";

export const DEFAULT_RECONCILE_EXPLANATION =
  "Order #14 lost 1.380 g against an agreed 1.000 g (2.50% of 40.000 g). That is 0.380 g over the norm, 0.348 g of fine gold, about ₹5,188 at today's rate. Rafiq's return note mentions a cracked solder joint that was redone. Orders #12 and #13 closed inside their norms. Suggest asking Rafiq before settlement.";

export function AgentExplanation({
  explanation = DEFAULT_RECONCILE_EXPLANATION,
  sourceMode = "cached",
}: {
  explanation?: string;
  sourceMode?: "live" | "cached" | "template";
}) {
  return (
    <div
      style={{
        background: "var(--surface-sunken)",
        borderColor: "var(--hairline-strong)",
      }}
      className="rounded-2xl border p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold">
          ReconcileAgent · Weekly Variance Note
        </span>
        <div className="flex items-center gap-2">
          <span style={{ color: "var(--ink-3)" }} className="text-[11px]">
            Maths by ledger_core · AI explains only
          </span>
          <CachedPill mode={sourceMode} />
        </div>
      </div>
      <p
        style={{ color: "var(--ink)" }}
        className="mt-2 text-sm leading-relaxed"
      >
        {explanation}
      </p>
    </div>
  );
}
