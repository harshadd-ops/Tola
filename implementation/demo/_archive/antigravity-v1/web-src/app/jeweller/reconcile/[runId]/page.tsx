"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JewellerShell } from "@/components/layout/JewellerShell";
import { DisputeThread } from "@/features/dispute/DisputeThread";
import {
  AgentExplanation,
  DEFAULT_RECONCILE_EXPLANATION,
} from "@/features/reconcile/AgentExplanation";
import {
  CANONICAL_RECONCILE_ROWS,
  VarianceTable,
} from "@/features/reconcile/VarianceTable";
import { resolveDispute } from "@/lib/api";

export default function ReconcileRunDetailPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = use(params);
  const [disputeStatus, setDisputeStatus] = useState<
    "none" | "open" | "proposed" | "resolved"
  >("resolved");
  const [proposedAllowanceMg, setProposedAllowanceMg] = useState<number | null>(
    130,
  );

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
      title={`Reconciliation Run · ${runId}`}
      subtitle="Week 2026-W42 · Rafiq Sheikh (p-rafiq) · Orders #12, #13, #14"
      actions={
        <Link
          href="/settlements/SET-2026-W42-RAFIQ"
          className="inline-flex min-h-10 items-center gap-1.5 rounded-[var(--r-md)] bg-[var(--gold-500)] px-3.5 py-2 text-xs font-semibold text-[var(--text-on-gold)] shadow-[var(--shadow-gold)] hover:bg-[var(--gold-400)]"
        >
          Proceed to Settlement Sheet
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      }
    >
      <div className="space-y-5" data-testid="reconcile-run-detail-page">
        <AgentExplanation
          explanation={DEFAULT_RECONCILE_EXPLANATION}
          sourceMode="cached"
        />
        <div className="rounded-[var(--r-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
          <VarianceTable
            rows={CANONICAL_RECONCILE_ROWS}
            disputeStatus={disputeStatus === "resolved" ? "resolved" : "open"}
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
