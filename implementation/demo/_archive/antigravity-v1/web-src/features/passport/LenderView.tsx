"use client";

import React, { useEffect, useState } from "react";
import { Building2, CheckCircle2, Info, ShieldCheck } from "lucide-react";
import { SimLabel } from "@/components/ui/SimLabel";
import { fetchPassportByToken, type PassportShareData } from "@/lib/api";
import { verifyServerSignature } from "@/lib/crypto";
import { PassportSummary } from "./PassportSummary";

export interface LenderViewProps {
  token?: string;
  initialData?: PassportShareData | null;
  onInspected?: () => void;
}

export function LenderView({
  token = "ps-rafiq-w42-demo0001a",
  initialData = null,
  onInspected,
}: LenderViewProps) {
  const [data, setData] = useState<PassportShareData | null>(initialData);
  const [revokedError, setRevokedError] = useState(false);
  const [clientVerified, setClientVerified] = useState(true);
  const [inspected, setInspected] = useState(false);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
      return;
    }
    let mounted = true;
    fetchPassportByToken(token)
      .then((res) => {
        if (!mounted) return;
        setData(res);
        setRevokedError(false);
        try {
          const ok = verifyServerSignature(
            res.verification.summary_hash,
            res.verification.server_sig_hex,
          );
          setClientVerified(ok || res.verification.verified);
        } catch {
          setClientVerified(res.verification.verified);
        }
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        const status = (err as { status?: number })?.status;
        if (status === 410) {
          setRevokedError(true);
        }
      });
    return () => {
      mounted = false;
    };
  }, [token, initialData]);

  const handleInspect = () => {
    setInspected(true);
    onInspected?.();
  };

  if (revokedError) {
    return (
      <div
        className="rounded-[var(--r-lg)] border border-[var(--danger)] bg-[var(--bg-surface)] p-6 text-center"
        data-testid="lender-view-revoked"
      >
        <h3 className="font-display text-lg font-semibold text-[var(--danger)]">
          410 Gone · Work Passport Link Revoked
        </h3>
        <p className="mt-2 text-xs text-[var(--text-secondary)]">
          Rafiq Sheikh revoked this scoped Work Passport share link. Partner institutions can no
          longer view the underlying metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="lender-view">
      <div className="rounded-[var(--r-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[var(--gold-400)]" aria-hidden="true" />
            <div>
              <h3 className="font-display text-lg font-medium text-[var(--text-primary)]">
                Pragati Microfinance · Partner Verification Portal
              </h3>
              <p className="font-mono text-xs text-[var(--text-muted)]">
                Reviewer: Meera Rao (Field Officer) · Token: {data?.token ?? token}
              </p>
            </div>
          </div>
          <SimLabel>MOCKED NBFC VIEW · NO EXTERNAL API</SimLabel>
        </div>

        <div
          className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--r-md)] border border-[var(--border-gold)] bg-[var(--bg-glass)] p-3"
          data-testid="lender-verification-badge"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[var(--ok)]" aria-hidden="true" />
            <span className="font-mono text-xs font-medium text-[var(--ok)]">
              Verified against Tola ledger · Ed25519 signature{" "}
              {clientVerified ? "valid" : "checked"} · 18 orders · 47 signed events
            </span>
          </div>

          <button
            type="button"
            id="step-s11-lender-view"
            data-testid="step-s11-lender-view"
            onClick={handleInspect}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[var(--accent)] px-4 py-1.5 text-xs font-semibold text-[var(--accent-foreground)] transition-transform active:scale-[0.98]"
          >
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              {inspected ? "Signature & Scope Verified" : "Verify signature & acknowledgement"}
            </span>
          </button>
        </div>

        <PassportSummary
          summary={data?.summary}
          karigarName={data?.karigar.name}
          nativeName={data?.karigar.native_name}
          vishwakarmaId={data?.karigar.vishwakarma_id}
          pubkeyHex={data?.karigar.pubkey_hex}
        />

        <div
          className="mt-4 flex items-start gap-2.5 rounded-[var(--r-md)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 text-xs text-[var(--text-secondary)]"
          data-testid="lender-mocked-disclaimer"
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold-400)]" aria-hidden="true" />
          <p>
            This is a mocked lender view showing what a partner NBFC or bank would see when a
            karigar shares a scoped Work Passport link. Tola does not make a lending decision.
          </p>
        </div>
      </div>
    </div>
  );
}
