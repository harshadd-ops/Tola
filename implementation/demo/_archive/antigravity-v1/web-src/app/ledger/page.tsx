"use client";

import React from "react";
import { JewellerShell } from "@/components/layout/JewellerShell";
import { ChainVerifier } from "@/features/ledger/ChainVerifier";

export default function LedgerPage() {
  return (
    <JewellerShell
      title="Cryptographic Custody Ledger & Tamper Sandbox"
      subtitle="Append-only SHA-256 hash chain + Ed25519 co-signature verification across Week 2026-W42"
    >
      <div data-testid="ledger-page">
        <ChainVerifier karigarId="p-rafiq" />
      </div>
    </JewellerShell>
  );
}
