"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Coins,
  Scale,
  ShieldCheck,
  Sparkles,
  Volume2,
} from "lucide-react";
import { JewellerShell } from "@/components/layout/JewellerShell";
import { DualSigChip } from "@/components/ui/DualSigChip";
import { PurityPill } from "@/components/ui/PurityPill";
import { WeightCell } from "@/components/ui/WeightCell";
import { CANONICAL_RECONCILE_ROWS } from "@/features/reconcile/VarianceTable";

export default function JewellerOverviewPage() {
  return (
    <JewellerShell
      title="Jeweller Console · Shetty Fine Jewellers"
      subtitle="Suresh Shetty · Karigar: Rafiq Sheikh (p-rafiq) · Week 2026-W42"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/jeweller/issue"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--accent-foreground)] transition-transform hover:-translate-y-px active:scale-[0.98]"
          >
            <Scale className="h-3.5 w-3.5" aria-hidden="true" />
            Issue Gold
          </Link>
          <Link
            href="/jeweller/reconcile"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[var(--hairline-strong)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--accent)]"
          >
            <Sparkles className="h-3.5 w-3.5 text-[var(--gold-400)]" aria-hidden="true" />
            Saturday Reconcile
          </Link>
        </div>
      }
    >
      <div className="space-y-6" data-testid="jeweller-overview-page">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="surface-elevated rounded-[var(--r-lg)] p-4">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Week 42 Issued (Gross 22K)</span>
              <PurityPill fineness={916} />
            </div>
            <div className="mt-2">
              <WeightCell mg={93_500} size="lg" />
            </div>
            <div className="mt-1 text-[11px] text-[var(--text-secondary)]">
              3 active orders (#12, #13, #14)
            </div>
          </div>

          <div className="surface-elevated rounded-[var(--r-lg)] p-4">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Returned + Scrap + Dust</span>
              <CheckCircle2 className="h-4 w-4 text-[var(--emerald-400)]" aria-hidden="true" />
            </div>
            <div className="mt-2">
              <WeightCell mg={91_040} size="lg" />
            </div>
            <div className="mt-1 text-[11px] text-[var(--text-secondary)]">
              89.370 g net ornament + 1.670 g scrap/dust
            </div>
          </div>

          <div className="surface-elevated rounded-[var(--r-lg)] p-4">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Carried Shortfall (Order #14)</span>
              <span className="font-mono text-[11px] text-[var(--emerald-400)]">
                0.229 g fine
              </span>
            </div>
            <div className="mt-2">
              <WeightCell mg={250} size="lg" showSign />
            </div>
            <div className="mt-1 text-[11px] text-[var(--text-secondary)]">
              After +0.130 g rework allowance (D-14)
            </div>
          </div>

          <div className="surface-elevated rounded-[var(--r-lg)] p-4">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Week 42 Settlement</span>
              <Coins className="h-4 w-4 text-[var(--gold-400)]" aria-hidden="true" />
            </div>
            <div className="mt-2 font-mono text-2xl font-semibold tabular-nums text-[var(--gold-400)]">
              ₹31,416.00
            </div>
            <div className="mt-1 text-[11px] text-[var(--text-secondary)]">
              Order #14: ₹5,040.00 · GST ITC-04 ready
            </div>
          </div>
        </div>

        <section className="surface-elevated rounded-[var(--r-lg)] p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-lg font-medium text-[var(--text-primary)]">
                Week 2026-W42 Karigar Custody Orders · Rafiq Sheikh
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Every issue and return is Ed25519 co-signed and chained in integer milligrams
              </p>
            </div>
            <Link
              href="/ledger"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--gold-400)] hover:underline"
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Verify Hash Chain
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                  <th className="py-2.5 pr-3">Order</th>
                  <th className="px-3 py-2.5">Issued</th>
                  <th className="px-3 py-2.5">Returned Net + Scrap</th>
                  <th className="px-3 py-2.5">Allowed Wastage</th>
                  <th className="px-3 py-2.5">Custody Status</th>
                  <th className="py-2.5 pl-3 text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {CANONICAL_RECONCILE_ROWS.map((row) => (
                  <tr key={row.order} className="hover:bg-[var(--bg-elevated)]/50">
                    <td className="py-3 pr-3">
                      <div className="font-mono font-semibold text-[var(--text-primary)]">
                        {row.order}
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)]">
                        Karigar: {row.karigar_id} · 22K (916)
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <WeightCell mg={row.issued_mg} size="sm" />
                    </td>
                    <td className="px-3 py-3">
                      <WeightCell
                        mg={row.returned_mg + row.scrap_mg + row.dust_mg}
                        size="sm"
                      />
                    </td>
                    <td className="px-3 py-3 font-mono text-[var(--text-secondary)]">
                      {(row.allowed_mg / 1000).toFixed(3)} g (2.50%)
                    </td>
                    <td className="px-3 py-3">
                      <DualSigChip count={2} />
                    </td>
                    <td className="py-3 pl-3 text-right">
                      <Link
                        href={`/orders/order-${row.order.replace("#", "")}`}
                        className="inline-flex items-center gap-1 rounded-[var(--r-sm)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-primary)] hover:border-[var(--gold-400)]"
                      >
                        Inspect
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link
            href="/jeweller/returns"
            className="group rounded-[var(--r-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 transition-colors hover:border-[var(--gold-400)]"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--gold-400)]">
                Step S04 · Multimodal AI
              </span>
              <Volume2 className="h-4 w-4 text-[var(--gold-400)]" aria-hidden="true" />
            </div>
            <h3 className="mt-1.5 font-display text-base font-medium text-[var(--text-primary)]">
              Return Intake & Bengali Voice Note
            </h3>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Extract gross weight, stone deduction, and KDM solder scrap from Rafiq&apos;s voice
              and tray photo.
            </p>
          </Link>

          <Link
            href="/settlements/SET-2026-W42-RAFIQ"
            className="group rounded-[var(--r-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 transition-colors hover:border-[var(--gold-400)]"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--emerald-400)]">
                Steps S08–S09, S12
              </span>
              <Coins className="h-4 w-4 text-[var(--emerald-400)]" aria-hidden="true" />
            </div>
            <h3 className="mt-1.5 font-display text-base font-medium text-[var(--text-primary)]">
              Settlement Sheet, UPI & GST ITC-04
            </h3>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Dual-sign Week 42 settlement, trigger UPI payout, and export HSN 711319 Job-Work
              return PDF.
            </p>
          </Link>

          <Link
            href="/lender/passport/ps-rafiq-w42-demo0001a"
            className="group rounded-[var(--r-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 transition-colors hover:border-[var(--gold-400)]"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--gold-400)]">
                Step S11 · Formal Credit
              </span>
              <ShieldCheck className="h-4 w-4 text-[var(--gold-400)]" aria-hidden="true" />
            </div>
            <h3 className="mt-1.5 font-display text-base font-medium text-[var(--text-primary)]">
              Lender Work Passport View
            </h3>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Inspect Meera Rao&apos;s NBFC verification view with live Ed25519 signature
              verification.
            </p>
          </Link>
        </div>
      </div>
    </JewellerShell>
  );
}
