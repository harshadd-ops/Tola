"use client";

import React from "react";
import { AlertOctagon, RotateCcw, ShieldCheck, Wrench } from "lucide-react";

export interface TamperSandboxProps {
  tampered: boolean;
  brokenAtId?: string | null;
  reason?: string | null;
  onToggleTamper: (tamper: boolean) => void;
}

export function TamperSandbox({
  tampered,
  brokenAtId,
  reason,
  onToggleTamper,
}: TamperSandboxProps) {
  return (
    <div
      className={`rounded-[var(--r-lg)] border p-4 transition-colors ${
        tampered
          ? "border-[var(--danger)] bg-[var(--bg-elevated)]"
          : "border-[var(--border-subtle)] bg-[var(--bg-elevated)]"
      }`}
      data-testid="tamper-sandbox"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          {tampered ? (
            <AlertOctagon className="mt-0.5 h-5 w-5 text-[var(--danger)]" aria-hidden="true" />
          ) : (
            <Wrench className="mt-0.5 h-5 w-5 text-[var(--gold-400)]" aria-hidden="true" />
          )}
          <div>
            <h4 className="font-display text-base font-medium text-[var(--text-primary)]">
              In-Memory Tamper Sandbox (Non-Destructive)
            </h4>
            <p className="text-xs text-[var(--text-secondary)]">
              {tampered
                ? "Simulated 1-byte mutation in E-14-1 (gold_mg: 40000 → 40001) without touching SQLite."
                : "Test cryptographic immutability: mutate 1 byte in E-14-1 and watch Ed25519 + SHA-256 catch it."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!tampered ? (
            <button
              type="button"
              data-testid="tamper-sandbox-toggle"
              onClick={() => onToggleTamper(true)}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--danger)] bg-[var(--bg-surface)] px-4 py-2 text-xs font-semibold text-[var(--danger)] transition-colors hover:bg-[var(--bg-glass)]"
            >
              <AlertOctagon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Tamper 1 byte in E-14-1 (sandbox)</span>
            </button>
          ) : (
            <button
              type="button"
              data-testid="tamper-sandbox-restore"
              onClick={() => onToggleTamper(false)}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--accent-foreground)] transition-transform active:scale-[0.98]"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Restore original</span>
            </button>
          )}
        </div>
      </div>

      {tampered ? (
        <div
          className="mt-3 rounded-[var(--r-md)] border border-[var(--danger)] bg-[var(--bg-surface)] p-3 font-mono text-xs text-[var(--danger)]"
          data-testid="tamper-break-alert"
        >
          <div className="font-semibold">
            CHAIN BROKEN AT {brokenAtId ?? "E-14-1"} · CRYPTOGRAPHIC MISMATCH DETECTED
          </div>
          <div className="mt-1 text-[11px] text-[var(--text-secondary)]">
            {reason ??
              "E-14-1 recomputed SHA-256 hash does not match stored event_hash; Ed25519 signatures invalid; E-14-2 prev_hash link broken."}
          </div>
        </div>
      ) : (
        <div
          className="mt-3 flex items-center gap-2 font-mono text-[11px] text-[var(--ok)]"
          data-testid="tamper-intact-status"
        >
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Sandbox idle · All canonical RFC 8785 JSON hashes & Ed25519 signatures intact</span>
        </div>
      )}
    </div>
  );
}
