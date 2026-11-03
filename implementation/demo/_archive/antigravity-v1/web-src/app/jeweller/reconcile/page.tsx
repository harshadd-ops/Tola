"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JewellerShell } from "@/components/layout/JewellerShell";
import { DisputeThread } from "@/features/dispute/DisputeThread";
import {
  AgentExplanation,
  DEFAULT_RECONCILE_EXPLANATION,
} from "@/features/reconcile/AgentExplanation";
import { RunWeekButton } from "@/features/reconcile/RunWeekButton";
import {
  CANONICAL_RECONCILE_ROWS,
  VarianceTable,
} from "@/features/reconcile/VarianceTable";
import {
  resolveDispute,
  runWeeklyReconcile,
  type ReconcileRow,
} from "@/lib/api";

export default function JewellerReconcileIndexPage() {
  const [ran, setRan] = useState(true);
  const [rows, setRows] = useState<readonly ReconcileRow[]>(
    CANONICAL_RECONCILE_ROWS,
  );
  const [explanation, setExplanation] = useState<string>(
    DEFAULT_RECONCILE_EXPLANATION,
  );
  const [disputeStatus, setDisputeStatus] = useState<
    "none" | "open" | "proposed" | "resolved"
  >("open");
  const [proposedAllowanceMg, setProposedAllowanceMg] = useState<number | null>(
    null,
  );

  const handleRunWeek = async () => {
    try {
      const res = await runWeeklyReconcile();
      if (res.rows?.length) setRows(res.rows);
      if (res.explanation) setExplanation(res.explanation);
    } catch {
      // Fallback
    }
    setRan(true);
  };

  const handlePropose = async (allowanceMg: number) => {
    setProposedAllowanceMg(allowanceMg);
    try {
      await resolveDispute("D-14", allowanceMg);
    } catch {
      // Fallback
    }
    setDisputeStatus("resolved");
  };

  return (
    <JewellerShell
      title="Saturday Weekly Reconciliation · Week 2026-W42"
      subtitle="Karigar: Rafiq Sheikh (p-rafiq) · Orders #12, #13, #14 · Integer milligram audit"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <RunWeekButton ran={ran} onRun={handleRunWeek} />
          <Link
            href="/jeweller/reconcile/RUN-2026-W42"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-[var(--r-md)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3.5 py-2 text-xs font-medium text-[var(--text-primary)] hover:border-[var(--gold-400)]"
          >
            Run Detail (RUN-2026-W42)
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      }
    >
      <div className="space-y-5" data-testid="jeweller-reconcile-page">
        <AgentExplanation explanation={explanation} sourceMode="cached" />
        <div className="rounded-[var(--r-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
          <VarianceTable
            rows={rows}
            disputeStatus={
              disputeStatus === "resolved"
                ? "resolved"
                : disputeStatus === "open"
                  ? "open"
                  : "none"
            }
          />
        </div>
        <DisputeThread
          status={disputeStatus}
          proposedAllowanceMg={proposedAllowanceMg}
          resolved={disputeStatus === "resolved"}
          onPropose={handlePropose}
        />
      </div>
    </JewellerShell>
  );
}
