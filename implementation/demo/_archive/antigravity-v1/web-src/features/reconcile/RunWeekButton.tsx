"use client";

import React from "react";
import * as m from "motion/react-m";
import { useReducedMotion } from "@/lib/a11y";
import { pick } from "@/lib/springs";

export function RunWeekButton({
  onRun,
  loading = false,
  ran = false,
}: {
  onRun: () => void | Promise<void>;
  loading?: boolean;
  ran?: boolean;
}) {
  const reduced = useReducedMotion();

  return (
    <m.button
      id="step-s05-run-week"
      data-testid="step-s05-run-week"
      type="button"
      disabled={loading}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      transition={pick("press", reduced)}
      onClick={() => void onRun()}
      style={{
        background: ran ? "var(--surface-raised)" : "var(--accent)",
        color: ran ? "var(--ink)" : "var(--accent-foreground)",
        borderColor: "var(--hairline-strong)",
      }}
      className="inline-flex min-h-[44px] items-center gap-2 rounded-full border px-5 py-2 text-xs font-semibold shadow-xs"
    >
      <span>{loading ? "Running week…" : ran ? "Run week again" : "Run week"}</span>
    </m.button>
  );
}
