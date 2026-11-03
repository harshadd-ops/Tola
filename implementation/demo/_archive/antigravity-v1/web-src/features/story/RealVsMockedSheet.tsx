"use client";

import React from "react";
import { CheckCircle2, Info } from "lucide-react";
import { Sheet } from "@/components/layout/Sheet";
import { SimLabel } from "@/components/ui/SimLabel";
import { useStoryStore } from "@/stores/story";

const REAL_ROWS = [
  {
    capability: "Precision gram & fine-gold math",
    implementation:
      "All gold weights stored and computed as integer milligrams (mg = g × 1000); purity in parts-per-thousand (916, 750, 999); wastage norms in basis points (250 bp = 2.50%). Zero floating-point arithmetic.",
  },
  {
    capability: "Hash-chained, dual-signed event log",
    implementation:
      "Every event serialized to RFC 8785 canonical JSON, hashed with SHA-256 over prev_hash || canonical_payload, and signed with real Ed25519 keys (@noble/ed25519 in browser + PyNaCl in FastAPI).",
  },
  {
    capability: "Client-side chain verifier & tamper sandbox",
    implementation:
      "Browser re-computes every SHA-256 link and verifies every Ed25519 signature. The tamper sandbox mutates 1 byte in memory and shows the exact broken link and invalid signature.",
  },
  {
    capability: "Scale integration",
    implementation:
      "Real Web Serial API (navigator.serial) parser for Mettler-Toledo SICS and Sartorius SBI ASCII frames, plus a deterministic simulated scale stream (SIMULATED SCALE) with stability detection.",
  },
  {
    capability: "Voice read-back & voice-note intake",
    implementation:
      "Real FastAPI adapter calling Sarvam AI (Saarika v2 STT + Bulbul v2 TTS) when SARVAM_API_KEY is set, backed by pre-baked Bengali & Kannada audio files in seed/audio/.",
  },
  {
    capability: "Variance reconciliation & agent explanation",
    implementation:
      "Deterministic per-order and per-week reconciliation engine with robust z-score context, paired with a Claude tool-use explanation (live when ANTHROPIC_API_KEY is set, cached fallback otherwise).",
  },
  {
    capability: "Dispute & resolution workflow",
    implementation:
      "Real state machine (OPEN -> PROPOSED -> RESOLVED) appending signed DISPUTE_OPEN, ADJUSTMENT_SIGNED, and DISPUTE_RESOLVE events.",
  },
  {
    capability: "Weekly settlement & GST job-work draft",
    implementation:
      "Real settlement calculation (opening gold, issued, returned, scrap, dust credit, allowed wastage, signed adjustments, closing balance, labour + 5% GST on SAC 9988) and ReportLab PDF generation.",
  },
  {
    capability: "Karigar Work Passport & scoped share link",
    implementation:
      "Computed live from the verified event log over a 90-day window; share link is a signed, expiring, revocable token.",
  },
] as const;

const MOCKED_ROWS = [
  {
    surface: "Physical bullion / jewelry hardware",
    reason: "Judges do not carry a ₹60,000 analytical balance or physical 22K gold.",
    label: "SIMULATED SCALE pill on the scale widget (unless a USB serial scale is connected).",
  },
  {
    surface: "Live bank / UPI payout rails",
    reason: "Moving real money in a hackathon demo is unsafe and requires regulated PSP onboarding.",
    label: "SIMULATED · NO REAL DEBIT pill on the UPI intent card.",
  },
  {
    surface: "NBFC / bank loan underwriting API",
    reason: "No live core-banking integration in the demo track.",
    label: "MOCKED NBFC VIEW · NO EXTERNAL API banner on the lender view.",
  },
  {
    surface: "PM Vishwakarma / Aadhaar eKYC verification",
    reason: "Government identity APIs require licensed KUA/AUA access.",
    label: "DEMO ID · UNVERIFIED badge next to the Vishwakarma ID.",
  },
  {
    surface: "Multi-tenant auth, OTP login, RBAC",
    reason: "Replaced by the instant top-bar Persona Switcher so judges never type a password.",
    label: "Persona bar labelled Demo Personas.",
  },
] as const;

export function RealVsMockedSheet({
  open: propOpen,
  onClose: propOnClose,
}: {
  open?: boolean;
  onClose?: () => void;
} = {}) {
  const storeOpen = useStoryStore((s) => s.showRealVsMocked);
  const setStoreOpen = useStoryStore((s) => s.setShowRealVsMocked);

  const isOpen = propOpen !== undefined ? propOpen : storeOpen;
  const handleClose = () => {
    setStoreOpen(false);
    propOnClose?.();
  };

  return (
    <Sheet
      open={isOpen}
      onClose={handleClose}
      title="What's Real vs What's Simulated"
      subtitle="Transparent breakdown of genuine cryptographic & integer-mg subsystems vs labelled demo simulations."
    >
      <div className="space-y-6" data-testid="real-vs-mocked-sheet">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[var(--ok)]" aria-hidden="true" />
            <h3 className="font-display text-base font-semibold text-[var(--text-primary)]">
              1. Genuinely Real in This Demo
            </h3>
          </div>
          <div className="overflow-x-auto rounded-[var(--r-md)] border border-[var(--border-subtle)]">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                  <th className="px-3 py-2">Capability</th>
                  <th className="px-3 py-2">Implementation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {REAL_ROWS.map((row) => (
                  <tr key={row.capability}>
                    <td className="px-3 py-2 font-medium text-[var(--gold-300)]">
                      {row.capability}
                    </td>
                    <td className="px-3 py-2 text-[var(--text-secondary)]">{row.implementation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-[var(--gold-400)]" aria-hidden="true" />
              <h3 className="font-display text-base font-semibold text-[var(--text-primary)]">
                2. Simulated or Mocked (Explicitly Labelled in UI)
              </h3>
            </div>
            <SimLabel>SIMULATED SURFACE</SimLabel>
          </div>
          <div className="overflow-x-auto rounded-[var(--r-md)] border border-[var(--border-subtle)]">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                  <th className="px-3 py-2">Surface</th>
                  <th className="px-3 py-2">Why It Is Simulated</th>
                  <th className="px-3 py-2">How It Is Labelled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {MOCKED_ROWS.map((row) => (
                  <tr key={row.surface}>
                    <td className="px-3 py-2 font-medium text-[var(--text-primary)]">
                      {row.surface}
                    </td>
                    <td className="px-3 py-2 text-[var(--text-secondary)]">{row.reason}</td>
                    <td className="px-3 py-2 font-mono text-[11px] text-[var(--gold-300)]">
                      {row.label}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Sheet>
  );
}
