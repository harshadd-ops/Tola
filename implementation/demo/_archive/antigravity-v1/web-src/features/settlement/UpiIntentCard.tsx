"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2, QrCode, Smartphone } from "lucide-react";
import { SimLabel } from "@/components/ui/SimLabel";
import { formatPaiseToInr } from "@/lib/units";

export interface UpiIntentCardProps {
  upiUri?: string;
  amountPaise?: number;
  vpa?: string;
  payeeName?: string;
  status?: string;
  loading?: boolean;
  onMarkPaid?: () => void;
}

const DEFAULT_UPI_URI =
  "upi://pay?pa=rafiq.demo@okaxis&pn=Rafiq%20Sheikh&am=31416.00&cu=INR&tn=Tola-SET-2026-W42-RAFIQ";

export function UpiIntentCard({
  upiUri = DEFAULT_UPI_URI,
  amountPaise = 3_141_600,
  vpa = "rafiq.demo@okaxis",
  payeeName = "Rafiq Sheikh",
  status = "PENDING",
  loading = false,
  onMarkPaid,
}: UpiIntentCardProps) {
  const isPaid = status === "PAID_DEMO" || status === "PAID";

  return (
    <div
      className="rounded-[var(--r-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4"
      data-testid="upi-intent-card"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <QrCode className="h-4 w-4 text-[var(--gold-400)]" aria-hidden="true" />
          <h4 className="font-display text-base font-medium text-[var(--text-primary)]">
            UPI Labour Settlement Intent
          </h4>
        </div>
        <SimLabel>SIMULATED · NO REAL DEBIT</SimLabel>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
        <div
          className="flex h-36 w-36 items-center justify-center rounded-[var(--r-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 text-[var(--text-primary)]"
          data-testid="upi-qr-container"
        >
          <QRCodeSVG
            value={upiUri}
            size={120}
            bgColor="transparent"
            fgColor="currentColor"
            level="M"
            title="UPI labour settlement QR code"
            aria-label="UPI labour settlement QR code"
          />
        </div>

        <div className="space-y-2.5">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
              Total Labour Payable (incl. 5% GST)
            </div>
            <div
              className="font-mono text-2xl font-semibold text-[var(--gold-300)]"
              data-testid="upi-amount-inr"
            >
              {formatPaiseToInr(amountPaise)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-[var(--r-sm)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1.5">
              <div className="text-[10px] text-[var(--text-muted)]">Payee</div>
              <div className="font-medium text-[var(--text-primary)]">{payeeName}</div>
            </div>
            <div className="rounded-[var(--r-sm)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1.5">
              <div className="text-[10px] text-[var(--text-muted)]">UPI VPA (Demo)</div>
              <div className="font-mono text-[11px] text-[var(--text-secondary)]">{vpa}</div>
            </div>
          </div>

          <div className="truncate rounded-[var(--r-sm)] bg-[var(--bg-base)] px-2.5 py-1.5 font-mono text-[10px] text-[var(--text-muted)]">
            {upiUri}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {!isPaid ? (
              <button
                type="button"
                id="step-s09-upi-paid"
                data-testid="step-s09-upi-paid"
                disabled={loading}
                onClick={onMarkPaid}
                className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--accent-foreground)] transition-transform active:scale-[0.98] disabled:opacity-50"
              >
                <Smartphone className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{loading ? "Recording UPI intent..." : "Mark paid (demo)"}</span>
              </button>
            ) : (
              <span
                data-testid="upi-paid-badge"
                className="inline-flex items-center gap-1.5 rounded-[var(--r-pill)] border border-[var(--border-gold)] bg-[var(--bg-glass)] px-3 py-1 font-mono text-xs font-semibold text-[var(--ok)]"
              >
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>PAID (DEMO) · UTR-DEMO-428819</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
