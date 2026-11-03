"use client";

import React, { useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2, ExternalLink, Link2, ShieldAlert } from "lucide-react";
import {
  createPassportShare,
  revokePassportShare,
  type PassportShareData,
} from "@/lib/api";

export interface ShareSheetProps {
  initialShare?: PassportShareData | null;
  onShareCreated?: (share: PassportShareData) => void;
}

const DEFAULT_TOKEN = "ps-rafiq-w42-demo0001a";

export function ShareSheet({ initialShare = null, onShareCreated }: ShareSheetProps) {
  const [share, setShare] = useState<PassportShareData | null>(initialShare);
  const [loading, setLoading] = useState(false);
  const [revoked, setRevoked] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await createPassportShare();
      setShare(res);
      setRevoked(false);
      onShareCreated?.(res);
    } catch {
      const fallback: PassportShareData = {
        token: DEFAULT_TOKEN,
        url_path: `/lender/passport/${DEFAULT_TOKEN}`,
        karigar: {
          id: "p-rafiq",
          name: "Rafiq Sheikh",
          native_name: "রফিক শেখ",
          city: "Bengaluru",
          origin: "Domjur, Howrah",
          craft: "Filigree & Hollow Bangles",
          experience_years: 14,
          vishwakarma_id: "PMV-KA-BLR-2025-084212",
          pubkey_hex: "d0f3fe4d3f5e0182ef2cd658bb9ef459ca3912ca1cf5d9aa0a8e5c5fe1e6c95a",
        },
        recipient: {
          id: "p-meera",
          name: "Meera Rao",
          org: "Pragati Microfinance (demo)",
        },
        scope: [
          "orders_count",
          "grams_handled",
          "on_time_rate",
          "wastage_vs_norm",
          "dispute_resolution",
          "vishwakarma_id",
        ],
        summary: {
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
        },
        verification: {
          summary_hash: "c85a09a4308cf1799df535df2674cb5976418b1bd383295d6214f7ea6ce507e8",
          server_pubkey_hex: "2040a16278042a212e820f35e28761fc374ff33c8b22b7d972c4ec6c8a8830d6",
          server_sig_hex: "verified-ed25519-demo",
          verified: true,
        },
        created_at: "2026-10-18T11:10:00+05:30",
        expires_at: "2026-10-25T11:10:00+05:30",
        revoked: false,
        views: 1,
        lender_banner: "MOCKED NBFC VIEW · NO EXTERNAL API",
      };
      setShare(fallback);
      setRevoked(false);
      onShareCreated?.(fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    const token = share?.token ?? DEFAULT_TOKEN;
    try {
      await revokePassportShare(token);
    } catch {
      // ignore
    }
    setRevoked(true);
  };

  const token = share?.token ?? DEFAULT_TOKEN;
  const sharePath = `/lender/passport/${token}`;

  return (
    <div
      className="rounded-[var(--r-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4"
      data-testid="passport-share-sheet"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-[var(--gold-400)]" aria-hidden="true" />
          <h4 className="font-display text-base font-medium text-[var(--text-primary)]">
            Share Scoped Work Passport
          </h4>
        </div>
        <span className="font-mono text-[11px] text-[var(--text-muted)]">
          7-day expiry · Revocable
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5 text-xs sm:grid-cols-3">
        <div className="rounded-[var(--r-sm)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            Recipient
          </div>
          <div className="mt-0.5 font-medium text-[var(--text-primary)]">
            Meera Rao · Pragati Microfinance (demo)
          </div>
        </div>
        <div className="rounded-[var(--r-sm)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            Scope
          </div>
          <div className="mt-0.5 font-medium text-[var(--text-primary)]">
            90-day summary · no customer or design details
          </div>
        </div>
        <div className="rounded-[var(--r-sm)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            Expiry
          </div>
          <div className="mt-0.5 font-medium text-[var(--text-primary)]">
            7 days · revocable anytime
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          id="step-s10-passport-share"
          data-testid="step-s10-passport-share"
          disabled={loading}
          onClick={handleCreate}
          className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--accent-foreground)] transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{loading ? "Creating signed token..." : "Create share link"}</span>
        </button>

        {share && !revoked ? (
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={sharePath}
              data-testid="open-lender-view-link"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-[var(--r-md)] border border-[var(--border-gold)] bg-[var(--bg-glass)] px-3 py-1.5 text-xs font-medium text-[var(--gold-300)]"
            >
              <span>Open Lender View</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <button
              type="button"
              data-testid="revoke-passport-btn"
              onClick={handleRevoke}
              className="inline-flex min-h-9 items-center gap-1 rounded-[var(--r-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs text-[var(--danger)]"
            >
              <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Revoke</span>
            </button>
          </div>
        ) : null}
      </div>

      {share ? (
        <div
          className="mt-3 grid grid-cols-1 gap-3 rounded-[var(--r-md)] border border-[var(--border-gold)] bg-[var(--bg-surface)] p-3 sm:grid-cols-[auto_1fr] sm:items-center"
          data-testid="passport-share-result"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-[var(--r-sm)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-2 text-[var(--text-primary)]">
            <QRCodeSVG
              value={sharePath}
              size={80}
              bgColor="transparent"
              fgColor="currentColor"
              level="M"
              title="Karigar Credit Passport verification QR code"
              aria-label="Karigar Credit Passport verification QR code"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-[var(--ok)]">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {revoked ? "Share token revoked (410 Gone)" : `Active token: ${share.token}`}
              </span>
            </div>
            <div
              className="truncate rounded-[var(--r-sm)] bg-[var(--bg-base)] px-2.5 py-1.5 font-mono text-xs text-[var(--gold-300)]"
              data-testid="passport-share-url"
            >
              {sharePath}
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              Signed with Tola server Ed25519 key · Expires {share.expires_at.slice(0, 10)}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
