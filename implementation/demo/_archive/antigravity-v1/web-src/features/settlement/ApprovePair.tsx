"use client";

import React from "react";
import { CheckCircle2, Lock, PenTool } from "lucide-react";
import { TickPair } from "@/components/ui/TickPair";

export interface ApprovePairProps {
  jewellerApproved: boolean;
  karigarApproved: boolean;
  sealed: boolean;
  loading?: boolean;
  onApproveBoth?: () => void;
  onApproveJeweller?: () => void;
  onApproveKarigar?: () => void;
}

export function ApprovePair({
  jewellerApproved,
  karigarApproved,
  sealed,
  loading = false,
  onApproveBoth,
  onApproveJeweller,
  onApproveKarigar,
}: ApprovePairProps) {
  return (
    <div
      className="rounded-[var(--r-md)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4"
      data-testid="settlement-approve-pair"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <TickPair
            jewellerSigned={jewellerApproved}
            karigarSigned={karigarApproved}
            jewellerLabel="Suresh Shetty (Jeweller)"
            karigarLabel="Rafiq Sheikh (Karigar)"
          />
          <div>
            <div className="text-sm font-medium text-[var(--text-primary)]">
              {sealed
                ? "Settlement sealed by both parties"
                : jewellerApproved
                  ? "Jeweller signed · awaiting Karigar signature"
                  : "Dual signature required to seal weekly settlement"}
            </div>
            <div className="font-mono text-[11px] text-[var(--text-muted)]">
              {sealed
                ? "SETTLEMENT_SEAL · Ed25519 verified"
                : "Appends SETTLEMENT_SEAL event to Rafiq's hash chain"}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!sealed ? (
            <>
              {onApproveBoth ? (
                <button
                  type="button"
                  id="step-s08-settlement"
                  data-testid="step-s08-settlement"
                  disabled={loading}
                  onClick={onApproveBoth}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--accent-foreground)] transition-transform active:scale-[0.98] disabled:opacity-50"
                >
                  <PenTool className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{loading ? "Sealing settlement..." : "Approve & seal settlement"}</span>
                </button>
              ) : null}
              {!jewellerApproved && onApproveJeweller ? (
                <button
                  type="button"
                  data-testid="approve-jeweller-btn"
                  disabled={loading}
                  onClick={onApproveJeweller}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-[var(--r-md)] border border-[var(--border-gold)] bg-[var(--bg-glass)] px-3 py-1.5 text-xs font-medium text-[var(--gold-300)]"
                >
                  <span>Sign as Suresh</span>
                </button>
              ) : null}
              {jewellerApproved && !karigarApproved && onApproveKarigar ? (
                <button
                  type="button"
                  data-testid="approve-karigar-btn"
                  disabled={loading}
                  onClick={onApproveKarigar}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-[var(--r-md)] border border-[var(--border-gold)] bg-[var(--bg-glass)] px-3 py-1.5 text-xs font-medium text-[var(--gold-300)]"
                >
                  <span>Sign as Rafiq</span>
                </button>
              ) : null}
            </>
          ) : (
            <span
              data-testid="settlement-sealed-badge"
              className="inline-flex items-center gap-1.5 rounded-[var(--r-pill)] border border-[var(--border-gold)] bg-[var(--bg-glass)] px-3 py-1 font-mono text-xs font-semibold text-[var(--ok)]"
            >
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>SEALED · 2/2 SIGS</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
