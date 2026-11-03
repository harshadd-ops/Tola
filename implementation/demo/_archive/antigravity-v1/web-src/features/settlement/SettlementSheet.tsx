"use client";

import React, { useEffect, useState } from "react";
import { ScrollText, Sparkles } from "lucide-react";
import { CachedPill } from "@/components/ui/CachedPill";
import { GramFigure } from "@/components/ui/GramFigure";
import {
  approveSettlement,
  createOrFetchSettlement,
  createPaymentIntent,
  type SettlementItem,
} from "@/lib/api";
import { formatMgToGrams, formatPaiseToInr } from "@/lib/units";
import { ApprovePair } from "./ApprovePair";
import { GstDraftViewer } from "./GstDraftViewer";
import { UpiIntentCard } from "./UpiIntentCard";

export interface SettlementSheetProps {
  settlementId?: string;
  initialSettlement?: SettlementItem | null;
  showUpiCard?: boolean;
  showGstDraft?: boolean;
  onSealed?: (settlement: SettlementItem) => void;
  onPaid?: () => void;
  onGstViewed?: () => void;
}

const DEFAULT_NARRATIVE =
  "Over 12 Oct – 18 Oct 2026, Shetty Fine Jewellers issued 93.500 g of 22K gold across Orders #12, #13, and #14 to Rafiq Sheikh. After accounting for 89.370 g net ornament returns, 1.520 g scrap, 0.150 g sweepings credit, 2.080 g agreed wastage on settled orders, and the dual-signed 0.130 g rework allowance (D-14), Rafiq carries 0.250 g (0.229 g fine) into Week 43. Making charges of ₹29,920.00 plus 5% job-work GST (₹1,496.00) yield ₹31,416.00 payable.";

export function SettlementSheet({
  settlementId = "SET-2026-W42-RAFIQ",
  initialSettlement = null,
  showUpiCard = true,
  showGstDraft = true,
  onSealed,
  onPaid,
  onGstViewed,
}: SettlementSheetProps) {
  const [settlement, setSettlement] = useState<SettlementItem | null>(initialSettlement);
  const [loading, setLoading] = useState(false);
  const [upiLoading, setUpiLoading] = useState(false);
  const [upiStatus, setUpiStatus] = useState<string>(
    initialSettlement?.payment_intent?.status ?? "PENDING",
  );

  useEffect(() => {
    if (initialSettlement) {
      setSettlement(initialSettlement);
      if (initialSettlement.payment_intent?.status) {
        setUpiStatus(initialSettlement.payment_intent.status);
      }
      return;
    }
    let mounted = true;
    createOrFetchSettlement(settlementId)
      .then((res) => {
        if (mounted) {
          setSettlement({
            ...res,
            jeweller_approved: false,
            karigar_approved: false,
            sealed: false,
          });
        }
      })
      .catch(() => {
        // Fallback uses deterministic local numbers
      });
    return () => {
      mounted = false;
    };
  }, [settlementId, initialSettlement]);

  const summary = settlement?.summary ?? {
    opening_gold_with_karigar_mg: 0,
    issued_mg: 93_500,
    returned_net_gold_mg: 89_370,
    scrap_mg: 1_520,
    dust_credit_mg: 150,
    allowed_wastage_mg: 2_338,
    approved_adjustment_mg: 130,
    carried_shortfall_mg: 250,
    carried_shortfall_fine_mg: 229,
    closing_gold_with_karigar_mg: 250,
    closing_fine_mg: 229,
    labour_paise: 2_992_000,
    gst_paise: 149_600,
    payable_paise: 3_141_600,
  };

  const jewellerApproved = settlement?.jeweller_approved ?? false;
  const karigarApproved = settlement?.karigar_approved ?? false;
  const sealed = settlement?.sealed ?? false;

  const handleApproveBoth = async () => {
    setLoading(true);
    try {
      await approveSettlement(settlementId, "p-suresh", "jeweller");
      const finalRes = await approveSettlement(settlementId, "p-rafiq", "karigar");
      setSettlement(finalRes);
      onSealed?.(finalRes);
    } catch {
      const fallback: SettlementItem = {
        id: settlementId,
        shop_id: "shop-shetty",
        karigar_id: "p-rafiq",
        period_start: "2026-10-12",
        period_end: "2026-10-18",
        summary,
        narrative: settlement?.narrative ?? DEFAULT_NARRATIVE,
        jeweller_approved: true,
        karigar_approved: true,
        sealed: true,
        status: "SEALED",
        source: "cached",
      };
      setSettlement(fallback);
      onSealed?.(fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    setUpiLoading(true);
    try {
      await createPaymentIntent(settlementId);
      setUpiStatus("PAID_DEMO");
      onPaid?.();
    } catch {
      setUpiStatus("PAID_DEMO");
      onPaid?.();
    } finally {
      setUpiLoading(false);
    }
  };

  return (
    <div className="space-y-4" data-testid="settlement-sheet">
      <div className="rounded-[var(--r-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ScrollText className="h-4 w-4 text-[var(--gold-400)]" aria-hidden="true" />
            <div>
              <h3 className="font-display text-lg font-medium text-[var(--text-primary)]">
                Weekly Settlement · {settlementId}
              </h3>
              <p className="font-mono text-xs text-[var(--text-muted)]">
                Rafiq Sheikh (রফিক শেখ) · Week of Oct 12 – Oct 18, 2026
              </p>
            </div>
          </div>
          <CachedPill visible={settlement?.source === "cached"} />
        </div>

        <div className="mb-4 rounded-[var(--r-md)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3">
          <div className="mb-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--gold-300)]">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            <span>Settlement Narrative</span>
          </div>
          <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
            {settlement?.narrative ?? DEFAULT_NARRATIVE}
          </p>
        </div>

        <div className="overflow-x-auto rounded-[var(--r-md)] border border-[var(--border-subtle)]">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                <th className="px-3 py-2">Line Item</th>
                <th className="px-3 py-2 text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] font-mono">
              <tr>
                <td className="px-3 py-2 font-sans text-[var(--text-secondary)]">
                  Opening gold with Rafiq
                </td>
                <td className="px-3 py-2 text-right">
                  <GramFigure mg={summary.opening_gold_with_karigar_mg} size="sm" />
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-sans text-[var(--text-secondary)]">
                  Issued this week (3 orders: #12, #13, #14)
                </td>
                <td className="px-3 py-2 text-right" data-testid="settlement-issued-mg">
                  <GramFigure mg={summary.issued_mg} size="sm" />
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-sans text-[var(--text-secondary)]">
                  Returned (finished pieces, net of stone)
                </td>
                <td className="px-3 py-2 text-right">
                  <GramFigure mg={summary.returned_net_gold_mg} size="sm" />
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-sans text-[var(--text-secondary)]">
                  Scrap returned
                </td>
                <td className="px-3 py-2 text-right">
                  <GramFigure mg={summary.scrap_mg} size="sm" />
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-sans text-[var(--text-secondary)]">
                  Dust credit (sweepings)
                </td>
                <td className="px-3 py-2 text-right">
                  <GramFigure mg={summary.dust_credit_mg} size="sm" />
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-sans text-[var(--text-secondary)]">
                  Allowed wastage (2.50% × 93.500 g)
                </td>
                <td className="px-3 py-2 text-right">
                  <GramFigure mg={summary.allowed_wastage_mg} size="sm" />
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-sans text-[var(--text-secondary)]">
                  Approved adjustment (D-14)
                </td>
                <td className="px-3 py-2 text-right text-[var(--ok)]">
                  <GramFigure mg={summary.approved_adjustment_mg} size="sm" />
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-sans text-[var(--text-secondary)]">
                  Carried shortfall (Order #14)
                </td>
                <td
                  className="px-3 py-2 text-right text-[var(--gold-300)]"
                  data-testid="settlement-carried-shortfall"
                >
                  +{formatMgToGrams(summary.carried_shortfall_mg)} (22K) /{" "}
                  {formatMgToGrams(summary.carried_shortfall_fine_mg)} fine
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-sans text-[var(--text-secondary)]">
                  Closing gold with Rafiq
                </td>
                <td
                  className="px-3 py-2 text-right font-semibold text-[var(--text-primary)]"
                  data-testid="settlement-closing-gold"
                >
                  {formatMgToGrams(summary.closing_gold_with_karigar_mg)} (22K) /{" "}
                  {formatMgToGrams(summary.closing_fine_mg)} fine
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-sans text-[var(--text-secondary)]">
                  Making charges (labour)
                </td>
                <td className="px-3 py-2 text-right text-[var(--text-primary)]">
                  {formatPaiseToInr(summary.labour_paise)}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-sans text-[var(--text-secondary)]">
                  GST @ 5% on job-work (SAC 9988)
                </td>
                <td className="px-3 py-2 text-right text-[var(--text-primary)]">
                  {formatPaiseToInr(summary.gst_paise)}
                </td>
              </tr>
              <tr className="bg-[var(--bg-elevated)] font-semibold">
                <td className="px-3 py-2.5 font-sans text-[var(--text-primary)]">
                  Total labour payable
                </td>
                <td
                  className="px-3 py-2.5 text-right text-sm text-[var(--gold-300)]"
                  data-testid="settlement-payable-inr"
                >
                  {formatPaiseToInr(summary.payable_paise)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <ApprovePair
            jewellerApproved={jewellerApproved}
            karigarApproved={karigarApproved}
            sealed={sealed}
            loading={loading}
            onApproveBoth={handleApproveBoth}
          />
        </div>
      </div>

      {showUpiCard ? (
        <UpiIntentCard
          upiUri={settlement?.payment_intent?.upi_uri}
          amountPaise={summary.payable_paise}
          status={upiStatus}
          loading={upiLoading}
          onMarkPaid={handleMarkPaid}
        />
      ) : null}

      {showGstDraft ? (
        <GstDraftViewer settlementId={settlementId} onViewed={onGstViewed} />
      ) : null}
    </div>
  );
}
