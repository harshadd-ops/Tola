"use client";

import React, { useState } from "react";
import { Download, FileCheck2, FileText } from "lucide-react";
import { getGstDraftPdfUrl } from "@/lib/api";
import { formatMgToGrams, formatPaiseToInr } from "@/lib/units";

export interface GstDraftViewerProps {
  settlementId?: string;
  onViewed?: () => void;
}

export function GstDraftViewer({
  settlementId = "SET-2026-W42-RAFIQ",
  onViewed,
}: GstDraftViewerProps) {
  const [downloaded, setDownloaded] = useState(false);
  const pdfUrl = getGstDraftPdfUrl(settlementId);

  const handleOpenPdf = () => {
    setDownloaded(true);
    onViewed?.();
  };

  return (
    <div
      className="rounded-[var(--r-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4"
      data-testid="gst-draft-viewer"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[var(--gold-400)]" aria-hidden="true" />
          <div>
            <h4 className="font-display text-base font-medium text-[var(--text-primary)]">
              GST Job-Work Draft · Section 143 CGST Act
            </h4>
            <p className="font-mono text-[11px] text-[var(--text-muted)]">
              SAC 9988 (Manufacturing services on physical inputs owned by others) · HSN 7113
            </p>
          </div>
        </div>

        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          id="step-s12-gst-draft"
          data-testid="step-s12-gst-draft"
          onClick={handleOpenPdf}
          className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--accent-foreground)] transition-transform active:scale-[0.98]"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Download GST Draft PDF</span>
        </a>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-[var(--r-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 text-xs">
          <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            Principal (Jeweller)
          </div>
          <div className="font-medium text-[var(--text-primary)]">
            Shetty Fine Jewellers, Chickpet
          </div>
          <div className="font-mono text-[11px] text-[var(--text-secondary)]">
            GSTIN: 29AABCS1429B1Z5 · State Code 29 (Karnataka)
          </div>
        </div>

        <div className="rounded-[var(--r-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 text-xs">
          <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            Job-Worker (Karigar)
          </div>
          <div className="font-medium text-[var(--text-primary)]">
            Rafiq Sheikh (রফিক শেখ) · KR-01
          </div>
          <div className="font-mono text-[11px] text-[var(--text-secondary)]">
            PM Vishwakarma ID: PMV-KA-BLR-2025-084212
          </div>
        </div>
      </div>

      <div className="mt-3 overflow-x-auto rounded-[var(--r-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              <th className="px-3 py-2">Schedule Line</th>
              <th className="px-3 py-2">HSN / SAC</th>
              <th className="px-3 py-2 text-right">22K Gross / Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)] font-mono text-xs">
            <tr>
              <td className="px-3 py-2 font-sans text-[var(--text-secondary)]">
                Delivery Challan (Orders #12, #13, #14 issued)
              </td>
              <td className="px-3 py-2 text-[var(--text-muted)]">HSN 7113</td>
              <td className="px-3 py-2 text-right text-[var(--text-primary)]">
                {formatMgToGrams(93_500)}
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 font-sans text-[var(--text-secondary)]">
                Job-Work Return (Ornament net + scrap + dust)
              </td>
              <td className="px-3 py-2 text-[var(--text-muted)]">HSN 7113</td>
              <td className="px-3 py-2 text-right text-[var(--text-primary)]">
                {formatMgToGrams(91_040)}
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 font-sans text-[var(--text-secondary)]">
                Agreed Wastage + Signed Allowance (D-14)
              </td>
              <td className="px-3 py-2 text-[var(--text-muted)]">HSN 7113</td>
              <td className="px-3 py-2 text-right text-[var(--text-primary)]">
                {formatMgToGrams(2_210)}
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 font-sans text-[var(--text-secondary)]">
                Closing Balance Carried with Job-Worker (ITC-04)
              </td>
              <td className="px-3 py-2 text-[var(--text-muted)]">HSN 7113</td>
              <td className="px-3 py-2 text-right text-[var(--gold-300)]">
                {formatMgToGrams(250)}
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 font-sans text-[var(--text-secondary)]">
                Taxable Making Charges (93.500 g × ₹320/g)
              </td>
              <td className="px-3 py-2 text-[var(--text-muted)]">SAC 9988</td>
              <td className="px-3 py-2 text-right text-[var(--text-primary)]">
                {formatPaiseToInr(2_992_000)}
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 font-sans text-[var(--text-secondary)]">
                CGST @ 2.5% + SGST @ 2.5% (Total 5% Job-Work GST)
              </td>
              <td className="px-3 py-2 text-[var(--text-muted)]">SAC 9988</td>
              <td className="px-3 py-2 text-right text-[var(--text-primary)]">
                {formatPaiseToInr(149_600)}
              </td>
            </tr>
            <tr className="bg-[var(--bg-elevated)] font-semibold">
              <td className="px-3 py-2.5 font-sans text-[var(--text-primary)]">
                Total Invoice Payable
              </td>
              <td className="px-3 py-2.5 text-[var(--gold-400)]">SAC 9988</td>
              <td
                className="px-3 py-2.5 text-right text-[var(--gold-300)]"
                data-testid="gst-total-payable"
              >
                {formatPaiseToInr(3_141_600)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {downloaded ? (
        <div
          className="mt-3 flex items-center gap-2 rounded-[var(--r-sm)] border border-[var(--border-gold)] bg-[var(--bg-glass)] px-3 py-1.5 font-mono text-xs text-[var(--ok)]"
          data-testid="gst-draft-downloaded"
        >
          <FileCheck2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span>PDF opened · 1,400+ bytes · deterministic ReportLab build</span>
        </div>
      ) : null}
    </div>
  );
}
