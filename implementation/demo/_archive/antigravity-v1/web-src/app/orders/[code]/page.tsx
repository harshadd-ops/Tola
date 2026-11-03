"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { JewellerShell } from "@/components/layout/JewellerShell";
import { DualSigChip } from "@/components/ui/DualSigChip";
import { HashBadge } from "@/components/ui/HashBadge";
import { PurityPill } from "@/components/ui/PurityPill";
import { WeightCell } from "@/components/ui/WeightCell";
import { DisputeThread } from "@/features/dispute/DisputeThread";
import { CANONICAL_RECONCILE_ROWS } from "@/features/reconcile/VarianceTable";
import { resolveDispute } from "@/lib/api";

export default function OrderTimelinePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const normalizedCode = decodeURIComponent(code).toLowerCase();
  const orderRow =
    CANONICAL_RECONCILE_ROWS.find(
      (r) =>
        r.order.toLowerCase() === normalizedCode ||
        `order-${r.order.replace("#", "")}`.toLowerCase() === normalizedCode,
    ) ?? CANONICAL_RECONCILE_ROWS[2]!;
  const isOrder14 =
    orderRow.order === "#14" || orderRow.order.toLowerCase() === "order-14";

  const [disputeStatus, setDisputeStatus] = useState<
    "none" | "open" | "proposed" | "resolved"
  >("open");
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
      title={`Order ${orderRow.order} · 22K Custody Timeline`}
      subtitle={`Karigar: Rafiq Sheikh (${orderRow.karigar_id}) · 22K (916) · Wastage norm 2.50% (250 bp)`}
      actions={
        <Link
          href="/jeweller/reconcile"
          className="inline-flex min-h-10 items-center gap-1.5 rounded-[var(--r-md)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3.5 py-2 text-xs font-medium text-[var(--text-primary)] hover:border-[var(--gold-400)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to Reconcile
        </Link>
      }
    >
      <div className="space-y-6" data-testid="order-detail-page">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[var(--r-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Issued Gross (22K)</span>
              <PurityPill fineness={916} />
            </div>
            <div className="mt-2">
              <WeightCell mg={orderRow.issued_mg} size="lg" />
            </div>
          </div>

          <div className="rounded-[var(--r-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
            <div className="text-xs text-[var(--text-muted)]">
              Returned Net + Scrap + Dust
            </div>
            <div className="mt-2">
              <WeightCell
                mg={orderRow.returned_mg + orderRow.scrap_mg + orderRow.dust_mg}
                size="lg"
              />
            </div>
            <div className="mt-1 font-mono text-[11px] text-[var(--text-secondary)]">
              Scrap: {(orderRow.scrap_mg / 1000).toFixed(3)} g · Dust:{" "}
              {(orderRow.dust_mg / 1000).toFixed(3)} g
            </div>
          </div>

          <div className="rounded-[var(--r-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
            <div className="text-xs text-[var(--text-muted)]">
              Allowed Wastage (2.50%)
            </div>
            <div className="mt-2">
              <WeightCell mg={orderRow.allowed_mg} size="lg" />
            </div>
            <div className="mt-1 font-mono text-[11px] text-[var(--text-secondary)]">
              Actual loss: {(orderRow.loss_mg / 1000).toFixed(3)} g
            </div>
          </div>

          <div className="rounded-[var(--r-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
            <div className="text-xs text-[var(--text-muted)]">
              Variance vs Norm
            </div>
            <div className="mt-2">
              <WeightCell
                mg={
                  disputeStatus === "resolved" && isOrder14
                    ? 250
                    : orderRow.variance_mg
                }
                size="lg"
                showSign
              />
            </div>
            <div className="mt-1">
              <DualSigChip count={2} />
            </div>
          </div>
        </div>

        <section className="rounded-[var(--r-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-medium text-[var(--text-primary)]">
              Append-Only Custody Ledger Timeline ({orderRow.order})
            </h2>
            <ShieldCheck className="h-4 w-4 text-[var(--emerald-400)]" aria-hidden="true" />
          </div>

          <ol className="space-y-3">
            <li className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--r-md)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 text-xs">
              <div>
                <div className="font-mono font-semibold text-[var(--text-primary)]">
                  ISSUE_GOLD · {(orderRow.issued_mg / 1000).toFixed(3)} g 22K (916)
                </div>
                <div className="text-[11px] text-[var(--text-secondary)]">
                  Co-signed by Suresh Shetty (p-suresh) & Rafiq Sheikh (p-rafiq)
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DualSigChip count={2} />
                <HashBadge hash="7d8a19c5308cf1799df535df2674cb5976418b1bd383295d6214f7ea6ce507a1" />
              </div>
            </li>

            <li className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--r-md)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 text-xs">
              <div>
                <div className="font-mono font-semibold text-[var(--text-primary)]">
                  RETURN_ORNAMENT · Net {(orderRow.returned_mg / 1000).toFixed(3)} g
                </div>
                <div className="text-[11px] text-[var(--text-secondary)]">
                  Extracted via Multimodal Intake Agent + verified on Sartorius scale
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DualSigChip count={2} />
                <HashBadge hash="a3f119c5308cf1799df535df2674cb5976418b1bd383295d6214f7ea6ce507b2" />
              </div>
            </li>

            <li className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--r-md)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[var(--emerald-400)]" aria-hidden="true" />
                <div>
                  <div className="font-mono font-semibold text-[var(--text-primary)]">
                    RETURN_SCRAP · {(orderRow.scrap_mg / 1000).toFixed(3)} g scrap +{" "}
                    {(orderRow.dust_mg / 1000).toFixed(3)} g dust
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)]">
                    Custody sealed for Saturday Weekly Reconcile
                  </div>
                </div>
              </div>
              <DualSigChip count={2} />
            </li>
          </ol>
        </section>

        {isOrder14 ? (
          <DisputeThread
            status={disputeStatus}
            proposedAllowanceMg={proposedAllowanceMg}
            resolved={disputeStatus === "resolved"}
            onPropose={handlePropose}
          />
        ) : null}
      </div>
    </JewellerShell>
  );
}
