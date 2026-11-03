"use client";

import React, { useState } from "react";
import { JewellerShell } from "@/components/layout/JewellerShell";
import { IssueCard } from "@/features/issue/IssueCard";
import { ScaleWidget } from "@/features/scale/ScaleWidget";
import { createLedgerEvent } from "@/lib/api";

export default function JewellerIssuePage() {
  const [sigCount, setSigCount] = useState<number>(0);

  const handleSignJeweller = async () => {
    try {
      await createLedgerEvent({
        event_type: "ISSUE_GOLD",
        karigar_id: "p-rafiq",
        order_id: "order-14",
        actor_id: "p-suresh",
        gold_mg: 40_000,
        stone_mg: 0,
        net_gold_mg: 40_000,
        fineness: 916,
        norm_bp: 250,
        timestamp: "2026-10-12T10:02:30+05:30",
        auto_sign_karigar: false,
      });
    } catch {
      // Fallback
    }
    setSigCount(1);
  };

  return (
    <JewellerShell
      title="Issue Gold · Order #14 (Plain 22K bangle pair)"
      subtitle="Weigh 40.000 g 22K (916) gold on Sartorius balance and sign custody issue to Rafiq Sheikh"
    >
      <div className="space-y-5" data-testid="jeweller-issue-page">
        <ScaleWidget targetMg={40_000} orderId="order-14" />
        <IssueCard
          goldMg={40_000}
          sigCount={sigCount}
          onSignJeweller={handleSignJeweller}
        />
      </div>
    </JewellerShell>
  );
}
