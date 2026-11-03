"use client";

import React from "react";
import { AudioCaption } from "@/components/ui/AudioCaption";
import { GramFigure } from "@/components/ui/GramFigure";
import { Pill } from "@/components/ui/Pill";
import { TickPair } from "@/components/ui/TickPair";
import { S06_VOICE_NOTE } from "@/features/story/steps";
import { ProposalChips } from "./ProposalChips";

export function DisputeThread({
  status = "open",
  proposedAllowanceMg = null,
  resolved = false,
  onPropose,
}: {
  status?: "none" | "open" | "proposed" | "resolved";
  proposedAllowanceMg?: number | null;
  resolved?: boolean;
  onPropose: (allowanceMg: number) => void | Promise<void>;
}) {
  const isResolved = resolved || status === "resolved";

  return (
    <div
      data-testid="dispute-thread"
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
            F-06 · F-03 · Append-Only Dispute Thread (Order #14)
          </p>
          <h2
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
            className="mt-0.5 text-xl font-normal"
          >
            Variance +0.380 g · Solder joint rework
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {isResolved ? (
            <Pill tone="sealed">Resolved · Append-only</Pill>
          ) : (
            <Pill tone="dispute">Open dispute</Pill>
          )}
          <TickPair count={isResolved ? 2 : status === "proposed" ? 1 : 2} />
        </div>
      </div>

      {/* Original disputed line — struck through when resolved, never deleted */}
      <div
        style={{
          background: "var(--surface-sunken)",
          borderColor: "var(--hairline)",
        }}
        className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3.5"
      >
        <div>
          <p style={{ color: "var(--ink-3)" }} className="text-xs">
            Event R8 · DISPUTE_OPEN (signed by Rafiq; Suresh signed &ldquo;seen&rdquo;)
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs font-medium">Disputed variance:</span>
            <GramFigure
              mg={380}
              signed
              fineness={916}
              strikeThrough={isResolved}
            />
          </div>
        </div>
        <Pill tone="gold">Reason: REWORK</Pill>
      </div>

      {/* Rafiq's Bengali voice message */}
      <div className="mt-3">
        <AudioCaption
          nativeText={S06_VOICE_NOTE.transcript}
          nativeLang="bn"
          englishCaption={S06_VOICE_NOTE.en}
          audioPath={S06_VOICE_NOTE.cachedAudio}
          sourceMode="cached"
        />
      </div>

      {/* Suresh's proposal chips */}
      <div className="mt-4">
        <p style={{ color: "var(--ink-2)" }} className="mb-2 text-xs font-medium">
          Suresh proposes rework adjustment (creates new ADJUSTMENT + DISPUTE_RESOLVE events):
        </p>
        <ProposalChips
          selectedAllowanceMg={proposedAllowanceMg ?? (isResolved ? 130 : null)}
          disabled={isResolved}
          onPropose={onPropose}
        />
      </div>

      {/* Resolution block under struck-through thread */}
      {(isResolved || status === "proposed") && (
        <div
          data-testid="dispute-resolved-badge"
          style={{
            background: isResolved
              ? "var(--tick-sealed-bg)"
              : "var(--tick-pending-bg)",
            borderColor: isResolved
              ? "var(--tick-sealed)"
              : "var(--tick-pending)",
            color: "var(--ink)",
          }}
          className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4"
        >
          <div>
            <p className="text-xs font-semibold">
              {isResolved
                ? "Events R9 (ADJUSTMENT +0.130 g) + R10 (DISPUTE_RESOLVE) sealed"
                : "Proposal drafted by Suresh (+0.130 g rework allowance) · Awaiting Rafiq's হ্যাঁ"}
            </p>
            <p
              style={{ fontFamily: "var(--font-mono)" }}
              className="mt-1 text-sm font-semibold"
            >
              Allowed rework: 0.130 g · Carried 0.250 g (0.229 g fine)
            </p>
          </div>
          <TickPair count={isResolved ? 2 : 1} />
        </div>
      )}
    </div>
  );
}
