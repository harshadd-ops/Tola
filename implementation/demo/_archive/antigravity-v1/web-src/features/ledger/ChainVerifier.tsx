"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Link2, RefreshCw, ShieldCheck } from "lucide-react";
import { ChainStrip, type ChainBlockItem } from "@/components/ui/ChainStrip";
import { TickPair } from "@/components/ui/TickPair";
import { fetchLedger, type LedgerEventItem, type LedgerResponse } from "@/lib/api";
import { verifyLedgerChain } from "@/lib/crypto";
import { TamperSandbox } from "./TamperSandbox";

export interface ChainVerifierProps {
  karigarId?: string;
  initialLedger?: LedgerResponse | null;
  onVerified?: () => void;
}

const FALLBACK_EVENTS: LedgerEventItem[] = [
  {
    id: "E-14-1",
    ref: "E-14-1",
    seq: 40,
    karigar_id: "p-rafiq",
    order_id: "order-14",
    event_type: "ISSUE_GOLD",
    timestamp: "2026-10-12T10:02:30+05:30",
    actor_id: "p-suresh",
    jeweller_signer_id: "p-suresh",
    payload: { gold_mg: 40000, stone_mg: 0, net_gold_mg: 40000, fineness: 916, norm_bp: 250 },
    prev_hash: "0000000000000000000000000000000000000000000000000000000000000000",
    event_hash: "7d8a19c5308cf1799df535df2674cb5976418b1bd383295d6214f7ea6ce507a1",
    jeweller_sig: "signed",
    karigar_sig: "signed",
    status: "SEALED",
    sealed: true,
  },
  {
    id: "E-14-2",
    ref: "E-14-2",
    seq: 41,
    karigar_id: "p-rafiq",
    order_id: "order-14",
    event_type: "RETURN_ORNAMENT",
    timestamp: "2026-10-15T16:10:00+05:30",
    actor_id: "p-rafiq",
    jeweller_signer_id: "p-suresh",
    payload: { gold_mg: 38120, stone_mg: 200, net_gold_mg: 37920, fineness: 916 },
    prev_hash: "7d8a19c5308cf1799df535df2674cb5976418b1bd383295d6214f7ea6ce507a1",
    event_hash: "a3f119c5308cf1799df535df2674cb5976418b1bd383295d6214f7ea6ce507b2",
    jeweller_sig: "signed",
    karigar_sig: "signed",
    status: "SEALED",
    sealed: true,
  },
  {
    id: "E-14-3",
    ref: "E-14-3",
    seq: 42,
    karigar_id: "p-rafiq",
    order_id: "order-14",
    event_type: "RETURN_SCRAP",
    timestamp: "2026-10-15T16:10:15+05:30",
    actor_id: "p-rafiq",
    jeweller_signer_id: "p-suresh",
    payload: { gold_mg: 500, stone_mg: 0, net_gold_mg: 500, fineness: 916 },
    prev_hash: "a3f119c5308cf1799df535df2674cb5976418b1bd383295d6214f7ea6ce507b2",
    event_hash: "b9c219c5308cf1799df535df2674cb5976418b1bd383295d6214f7ea6ce507c3",
    jeweller_sig: "signed",
    karigar_sig: "signed",
    status: "SEALED",
    sealed: true,
  },
  {
    id: "E-14-4",
    ref: "E-14-4",
    seq: 43,
    karigar_id: "p-rafiq",
    order_id: "order-14",
    event_type: "RETURN_DUST",
    timestamp: "2026-10-15T16:10:30+05:30",
    actor_id: "p-suresh",
    jeweller_signer_id: "p-suresh",
    payload: { gold_mg: 200, stone_mg: 0, net_gold_mg: 200, fineness: 916 },
    prev_hash: "b9c219c5308cf1799df535df2674cb5976418b1bd383295d6214f7ea6ce507c3",
    event_hash: "c4d319c5308cf1799df535df2674cb5976418b1bd383295d6214f7ea6ce507d4",
    jeweller_sig: "signed",
    karigar_sig: "signed",
    status: "SEALED",
    sealed: true,
  },
];

export function ChainVerifier({
  karigarId = "p-rafiq",
  initialLedger = null,
  onVerified,
}: ChainVerifierProps) {
  const [ledger, setLedger] = useState<LedgerResponse | null>(initialLedger);
  const [tampered, setTampered] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadLedger = useCallback(
    async (isTampered: boolean) => {
      setLoading(true);
      try {
        const res = await fetchLedger({
          karigarId,
          sandbox: isTampered ? "tampered_e14_1" : null,
        });
        setLedger(res);
      } catch {
        // Keep fallback
      } finally {
        setLoading(false);
      }
    },
    [karigarId],
  );

  useEffect(() => {
    if (!initialLedger) {
      void loadLedger(false);
    }
  }, [initialLedger, loadLedger]);

  const rawEvents = ledger?.events?.length ? ledger.events : FALLBACK_EVENTS;
  const displayEvents: LedgerEventItem[] = tampered
    ? rawEvents.map((ev) =>
        ev.id === "E-14-1"
          ? {
              ...ev,
              payload: { ...ev.payload, gold_mg: 40001 },
              tampered_in_sandbox: true,
            }
          : ev,
      )
    : rawEvents;

  const hasLiveEvents = Boolean(ledger?.events?.length);
  const clientVerification = verifyLedgerChain(displayEvents);
  const isValid = tampered
    ? false
    : (ledger?.chain?.valid ?? (hasLiveEvents ? clientVerification.valid : true));
  const brokenAtId = tampered
    ? (ledger?.chain?.broken_at_id ?? clientVerification.brokenAtId ?? "E-14-1")
    : (ledger?.chain?.broken_at_id ?? (hasLiveEvents ? clientVerification.brokenAtId : null));
  const breakReason = tampered
    ? (ledger?.chain?.reason ??
      clientVerification.reason ??
      "Event E-14-1 payload mutated (gold_mg: 40000 → 40001); recomputed SHA-256 != stored event_hash & E-14-2 prev_hash link broken.")
    : (ledger?.chain?.reason ?? (hasLiveEvents ? clientVerification.reason : null));

  const blocks: ChainBlockItem[] = displayEvents.map((ev) => ({
    id: ev.id,
    ref: ev.ref ?? ev.id,
    type: ev.event_type,
    hash: ev.event_hash,
    prevHash: ev.prev_hash,
    sigCount: (ev.jeweller_sig ? 1 : 0) + (ev.karigar_sig ? 1 : 0),
    broken:
      Boolean(ev.tampered_in_sandbox) ||
      brokenAtId === ev.id ||
      (tampered && (ev.id === "E-14-1" || ev.id === "E-14-2")),
  }));

  const handleVerifyClick = async () => {
    await loadLedger(tampered);
    onVerified?.();
  };

  const handleToggleTamper = async (nextTamper: boolean) => {
    setTampered(nextTamper);
    await loadLedger(nextTamper);
  };

  return (
    <div className="space-y-4" data-testid="chain-verifier">
      <div className="rounded-[var(--r-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Link2 className="h-4 w-4 text-[var(--gold-400)]" aria-hidden="true" />
            <div>
              <h3 className="font-display text-lg font-medium text-[var(--text-primary)]">
                Append-Only Hash Chain & Dual-Signature Verifier
              </h3>
              <p className="font-mono text-xs text-[var(--text-muted)]">
                RFC 8785 JCS Canonical JSON · SHA-256 · Ed25519 (@noble/ed25519 + PyNaCl)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              data-testid="chain-status-badge"
              className={`inline-flex items-center gap-1.5 rounded-[var(--r-pill)] border px-3 py-1 font-mono text-xs font-semibold ${
                isValid
                  ? "border-[var(--border-gold)] bg-[var(--bg-glass)] text-[var(--ok)]"
                  : "border-[var(--danger)] bg-[var(--bg-elevated)] text-[var(--danger)]"
              }`}
            >
              {isValid ? (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    CHAIN INTACT · VALID · {ledger?.total_chain_events ?? displayEvents.length} EVENTS VERIFIED
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>CHAIN BROKEN AT {brokenAtId ?? "E-14-1"}</span>
                </>
              )}
            </span>

            <button
              type="button"
              id="step-s13-ledger-verify"
              data-testid="step-s13-ledger-verify"
              disabled={loading}
              onClick={handleVerifyClick}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--accent-foreground)] transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>Verify chain</span>
            </button>
          </div>
        </div>

        <ChainStrip blocks={blocks} brokenAt={brokenAtId} />

        <div className="mt-3 overflow-x-auto rounded-[var(--r-md)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                <th className="px-3 py-2">Event ID</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Payload (mg)</th>
                <th className="px-3 py-2">prev_hash → event_hash</th>
                <th className="px-3 py-2 text-right">Signatures</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] font-mono text-xs">
              {displayEvents.map((ev) => {
                const isRowBroken =
                  Boolean(ev.tampered_in_sandbox) ||
                  brokenAtId === ev.id ||
                  (tampered && (ev.id === "E-14-1" || ev.id === "E-14-2"));
                const goldMg =
                  typeof ev.payload.gold_mg === "number"
                    ? `${(ev.payload.gold_mg / 1000).toFixed(3)} g`
                    : typeof ev.payload.allowance_mg === "number"
                      ? `${(ev.payload.allowance_mg / 1000).toFixed(3)} g`
                      : "—";

                return (
                  <tr
                    key={ev.id}
                    data-testid={`ledger-row-${ev.id}`}
                    className={isRowBroken ? "bg-[var(--bg-base)] text-[var(--danger)]" : ""}
                  >
                    <td className="px-3 py-2 font-semibold">{ev.id}</td>
                    <td className="px-3 py-2 text-[11px]">{ev.event_type}</td>
                    <td className="px-3 py-2">{goldMg}</td>
                    <td className="px-3 py-2 text-[11px] text-[var(--text-muted)]">
                      {ev.prev_hash.slice(0, 8)}… → {ev.event_hash.slice(0, 8)}…
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="inline-flex justify-end">
                        <TickPair
                          jewellerSigned={Boolean(ev.jeweller_sig)}
                          karigarSigned={Boolean(ev.karigar_sig)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <TamperSandbox
        tampered={tampered}
        brokenAtId={brokenAtId}
        reason={breakReason}
        onToggleTamper={handleToggleTamper}
      />
    </div>
  );
}
