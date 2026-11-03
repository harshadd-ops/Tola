"use client";

import React from "react";
import { CachedPill } from "@/components/ui/CachedPill";
import { GramFigure } from "@/components/ui/GramFigure";
import { Pill } from "@/components/ui/Pill";

export function IntakeAgentCard({
  orderCode = "#14",
  pieceMg = 38120,
  scrapMg = 500,
  dustMg = 0,
  note = "solder joint cracked, redone",
  tag = "REWORK_SOLDER",
  scaleMatchesVoice = true,
  sourceMode = "cached",
}: {
  orderCode?: string;
  pieceMg?: number;
  scrapMg?: number;
  dustMg?: number;
  note?: string;
  tag?: string;
  scaleMatchesVoice?: boolean;
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
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold">
            IntakeAgent · Structured Return Draft
          </span>
          <CachedPill mode={sourceMode} />
        </div>
        {scaleMatchesVoice ? (
          <Pill tone="sealed">Scale matches voice ✓</Pill>
        ) : (
          <Pill tone="flag">Scale used: 38.120 g (EC-4)</Pill>
        )}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-4">
        <div>
          <p style={{ color: "var(--ink-3)" }} className="text-[11px]">
            Order
          </p>
          <p
            style={{ fontFamily: "var(--font-mono)" }}
            className="text-sm font-semibold"
          >
            {orderCode}
          </p>
        </div>
        <div>
          <p style={{ color: "var(--ink-3)" }} className="text-[11px]">
            Finished piece (scale)
          </p>
          <GramFigure mg={pieceMg} size="md" />
        </div>
        <div>
          <p style={{ color: "var(--ink-3)" }} className="text-[11px]">
            Scrap returned (scale)
          </p>
          <GramFigure mg={scrapMg} size="md" />
        </div>
        <div>
          <p style={{ color: "var(--ink-3)" }} className="text-[11px]">
            Dust credit (swept monthly)
          </p>
          <GramFigure mg={dustMg} size="md" />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-2.5" style={{ borderTopColor: "var(--hairline)" }}>
        <p className="text-xs">
          <span style={{ color: "var(--ink-3)" }}>Extracted note: </span>
          <span className="font-medium">&ldquo;{note}&rdquo;</span>
        </p>
        <Pill tone="gold">{tag}</Pill>
      </div>
    </div>
  );
}
