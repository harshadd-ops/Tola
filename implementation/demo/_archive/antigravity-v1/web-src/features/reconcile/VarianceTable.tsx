"use client";

import React from "react";
import * as m from "motion/react-m";
import { GramFigure } from "@/components/ui/GramFigure";
import { Pill } from "@/components/ui/Pill";
import { useReducedMotion } from "@/lib/a11y";
import type { ReconcileRow } from "@/lib/api";
import { pick } from "@/lib/springs";
import { formatFineInrEstimate } from "@/lib/units";

export const CANONICAL_RECONCILE_ROWS: readonly ReconcileRow[] = [
  {
    order: "#12",
    karigar_id: "p-manju",
    issued_mg: 25000,
    returned_mg: 24480,
    scrap_mg: 50,
    dust_mg: 30,
    loss_mg: 520,
    allowed_mg: 625,
    variance_mg: -105,
    variance_fine_mg: -96,
    variance_inr_est: -1431,
    flagged: false,
  },
  {
    order: "#13",
    karigar_id: "p-subrata",
    issued_mg: 30000,
    returned_mg: 28870,
    scrap_mg: 100,
    dust_mg: 120,
    loss_mg: 1130,
    allowed_mg: 1200,
    variance_mg: -70,
    variance_fine_mg: -64,
    variance_inr_est: -954,
    flagged: false,
  },
  {
    order: "#14",
    karigar_id: "p-rafiq",
    issued_mg: 40000,
    returned_mg: 38620,
    scrap_mg: 500,
    dust_mg: 0,
    loss_mg: 1380,
    allowed_mg: 1000,
    variance_mg: 380,
    variance_fine_mg: 348,
    variance_inr_est: 5188,
    flagged: true,
  },
] as const;

const KARIGAR_NAMES: Record<string, string> = {
  "p-manju": "Manjunath Achar",
  "p-subrata": "Subrata Pal",
  "p-rafiq": "Rafiq Sheikh",
};

export function VarianceTable({
  rows = CANONICAL_RECONCILE_ROWS,
  disputeStatus,
}: {
  rows?: readonly ReconcileRow[];
  disputeStatus?: "none" | "open" | "resolved";
}) {
  const reduced = useReducedMotion();

  return (
    <div className="overflow-x-auto" data-testid="variance-table">
      <table className="w-full border-collapse text-left text-xs">
        <thead>
          <tr
            style={{
              borderBottomColor: "var(--hairline)",
              color: "var(--ink-3)",
            }}
            className="border-b uppercase tracking-wider text-[11px]"
          >
            <th className="py-2.5 pr-3">Order</th>
            <th className="py-2.5 px-3">Karigar</th>
            <th className="py-2.5 px-3">Issued</th>
            <th className="py-2.5 px-3">Returned</th>
            <th className="py-2.5 px-3">Loss</th>
            <th className="py-2.5 px-3">Allowed</th>
            <th className="py-2.5 px-3">Variance</th>
            <th className="py-2.5 pl-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const isOrder14 = row.order === "#14";
            const showOpenDispute = isOrder14 && disputeStatus === "open";
            const showResolved = isOrder14 && disputeStatus === "resolved";

            return (
              <m.tr
                key={row.order}
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  ...pick("default", reduced),
                  delay: reduced ? 0 : idx * 0.06,
                }}
                style={{
                  borderBottomColor: "var(--hairline)",
                  background: row.flagged
                    ? "var(--variance-flag-bg)"
                    : "transparent",
                }}
                className="border-b"
              >
                <td
                  style={{ fontFamily: "var(--font-mono)" }}
                  className="py-3 pr-3 font-semibold"
                >
                  {row.order}
                </td>
                <td className="py-3 px-3 font-medium">
                  {KARIGAR_NAMES[row.karigar_id] ?? row.karigar_id}
                </td>
                <td className="py-3 px-3">
                  <GramFigure mg={row.issued_mg} />
                </td>
                <td className="py-3 px-3">
                  <GramFigure mg={row.returned_mg} />
                </td>
                <td className="py-3 px-3">
                  <GramFigure mg={row.loss_mg} />
                </td>
                <td className="py-3 px-3">
                  <GramFigure mg={row.allowed_mg} />
                </td>
                <td className="py-3 px-3">
                  <div className="flex flex-col">
                    <GramFigure
                      mg={row.variance_mg}
                      signed
                      fineness={916}
                      strikeThrough={showResolved}
                    />
                    {row.flagged && (
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          color: "var(--variance-flag)",
                        }}
                        className="text-[11px] font-semibold"
                      >
                        ≈ {formatFineInrEstimate(row.variance_mg)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 pl-3">
                  {showOpenDispute ? (
                    <Pill tone="dispute">Open dispute</Pill>
                  ) : showResolved ? (
                    <Pill tone="sealed">Resolved · Carried 0.250 g</Pill>
                  ) : row.flagged ? (
                    <Pill
                      tone="flag"
                      icon={
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 16 16"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M8 2.5 14 13H2L8 2.5ZM8 6.5v3M8 11.5h.01"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      }
                    >
                      Over norm
                    </Pill>
                  ) : (
                    <Pill tone="sealed">Within norm</Pill>
                  )}
                </td>
              </m.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
