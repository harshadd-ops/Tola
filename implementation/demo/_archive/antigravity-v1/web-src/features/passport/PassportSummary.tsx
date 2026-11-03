"use client";

import React from "react";
import { Award, CheckCircle2, Clock, Scale, ShieldCheck, Users } from "lucide-react";
import type { PassportSummaryData } from "@/lib/api";
import { formatMgToGrams } from "@/lib/units";

export interface PassportSummaryProps {
  summary?: Partial<PassportSummaryData>;
  karigarName?: string;
  nativeName?: string;
  vishwakarmaId?: string;
  pubkeyHex?: string;
}

export const DEFAULT_PASSPORT_SUMMARY: PassportSummaryData = {
  window: "2026-07-20..2026-10-18",
  orders: 18,
  grams_handled_mg: 387_450,
  grams_handled_fine_mg: 354_904,
  returned: 18,
  on_time: 17,
  on_time_bps: 9440,
  on_time_pct_x10: 944,
  on_time_pct_str: "94.4%",
  allowed_wastage_mg: 9_686,
  actual_wastage_mg: 9_110,
  approved_adjustment_mg: 130,
  net_variance_mg: -576,
  allowance_used_bps: 9405,
  allowance_used_pct_x10: 941,
  allowance_used_pct_str: "94.1%",
  disputes_opened: 1,
  disputes_resolved: 1,
  dispute_resolution_minutes: 45,
  jewellers_on_tola: 1,
  jewellers_total_declared: 3,
};

export function PassportSummary({
  summary: rawSummary,
  karigarName = "Rafiq Sheikh",
  nativeName = "রফিক শেখ",
  vishwakarmaId = "PMV-KA-BLR-2025-084212",
  pubkeyHex = "d0f3fe4d3f5e0182ef2cd658bb9ef459ca3912ca1cf5d9aa0a8e5c5fe1e6c95a",
}: PassportSummaryProps) {
  const s: PassportSummaryData = {
    ...DEFAULT_PASSPORT_SUMMARY,
    ...rawSummary,
  };

  return (
    <div
      className="rounded-[var(--r-lg)] border border-[var(--border-gold)] bg-[var(--bg-surface)] p-4"
      data-testid="passport-summary-card"
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--r-md)] border border-[var(--border-gold)] bg-[var(--bg-elevated)] text-[var(--gold-400)]">
            <Award className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg font-medium text-[var(--text-primary)]">
                {karigarName}
              </h3>
              <span className="font-bengali text-sm text-[var(--gold-300)]">({nativeName})</span>
            </div>
            <div className="font-mono text-[11px] text-[var(--text-muted)]">
              PM Vishwakarma: {vishwakarmaId} · Window: 2026-07-20 to 2026-10-18 (90d)
            </div>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-[var(--r-pill)] border border-[var(--border-gold)] bg-[var(--bg-glass)] px-2.5 py-1 font-mono text-[11px] text-[var(--gold-300)]">
          <ShieldCheck className="h-3.5 w-3.5 text-[var(--ok)]" aria-hidden="true" />
          <span>Ed25519 Signed Record</span>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-[var(--r-md)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
            <Scale className="h-3.5 w-3.5 text-[var(--gold-400)]" aria-hidden="true" />
            <span>Orders Completed (90d)</span>
          </div>
          <div
            className="font-mono text-lg font-semibold text-[var(--text-primary)]"
            data-testid="passport-orders-completed"
          >
            {s.orders} orders · {formatMgToGrams(s.grams_handled_mg)}
          </div>
          <div className="font-mono text-[11px] text-[var(--text-secondary)]">
            {formatMgToGrams(s.grams_handled_fine_mg)} fine gold (999 eq.)
          </div>
        </div>

        <div className="rounded-[var(--r-md)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
            <Clock className="h-3.5 w-3.5 text-[var(--gold-400)]" aria-hidden="true" />
            <span>On-Time Delivery Rate</span>
          </div>
          <div
            className="font-mono text-lg font-semibold text-[var(--ok)]"
            data-testid="passport-ontime-rate"
          >
            {s.on_time} / {s.orders} = {s.on_time_pct_str ?? "94.4%"}
          </div>
          <div className="font-mono text-[11px] text-[var(--text-secondary)]">
            Zero unreturned challans
          </div>
        </div>

        <div className="rounded-[var(--r-md)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
            <CheckCircle2 className="h-3.5 w-3.5 text-[var(--gold-400)]" aria-hidden="true" />
            <span>Wastage vs Agreed Norm</span>
          </div>
          <div
            className="font-mono text-sm font-semibold text-[var(--text-primary)]"
            data-testid="passport-wastage-norm"
          >
            {formatMgToGrams(s.actual_wastage_mg)} actual vs {formatMgToGrams(s.allowed_wastage_mg)}{" "}
            allowed
          </div>
          <div className="font-mono text-[11px] text-[var(--gold-300)]">
            {s.allowance_used_pct_str ?? "94.1%"} of allowance used (net −0.576 g below norm)
          </div>
        </div>

        <div className="rounded-[var(--r-md)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
            <Users className="h-3.5 w-3.5 text-[var(--gold-400)]" aria-hidden="true" />
            <span>Disputes & Relationships</span>
          </div>
          <div
            className="font-mono text-sm font-semibold text-[var(--text-primary)]"
            data-testid="passport-disputes-summary"
          >
            {s.disputes_opened} opened · {s.disputes_resolved} resolved in{" "}
            {s.dispute_resolution_minutes} min
          </div>
          <div className="font-mono text-[11px] text-[var(--text-secondary)]">
            {s.jewellers_on_tola} on Tola (Shetty Fine Jewellers) · {s.jewellers_total_declared}{" "}
            declared
          </div>
        </div>
      </div>

      <div className="mt-3 truncate rounded-[var(--r-sm)] bg-[var(--bg-base)] px-2.5 py-1.5 font-mono text-[10px] text-[var(--text-muted)]">
        Karigar Ed25519 Pubkey: {pubkeyHex}
      </div>
    </div>
  );
}
