"use client";

import React, { useState } from "react";
import { JewellerShell } from "@/components/layout/JewellerShell";
import { ReturnIntakeCard } from "@/features/returns/ReturnIntakeCard";
import { createLedgerEvent, postVoiceNote } from "@/lib/api";

export default function JewellerReturnsPage() {
  const [voiceCaptured, setVoiceCaptured] = useState(false);
  const [sigCount, setSigCount] = useState(0);

  const handleTriggerVoice = async () => {
    await postVoiceNote({
      step_id: "S04",
      lang: "bn",
      piece_gross_mg: 38_120,
      scrap_mg: 500,
      dust_mg: 0,
    }).catch(() => null);
    setVoiceCaptured(true);
  };

  const handleSignReturn = async () => {
    try {
      await createLedgerEvent({
        event_type: "RETURN_ORNAMENT",
        karigar_id: "p-rafiq",
        order_id: "order-14",
        actor_id: "p-rafiq",
        gold_mg: 38_120,
        stone_mg: 200,
        net_gold_mg: 37_920,
        fineness: 916,
        timestamp: "2026-10-15T16:10:00+05:30",
        auto_sign_karigar: true,
      });
      await createLedgerEvent({
        event_type: "RETURN_SCRAP",
        karigar_id: "p-rafiq",
        order_id: "order-14",
        actor_id: "p-rafiq",
        gold_mg: 500,
        stone_mg: 0,
        net_gold_mg: 500,
        fineness: 916,
        timestamp: "2026-10-15T16:10:15+05:30",
        auto_sign_karigar: true,
      });
    } catch {
      // Fallback
    }
    setVoiceCaptured(true);
    setSigCount(2);
  };

  return (
    <JewellerShell
      title="Return Intake · Order #14 (Meenakari Necklace)"
      subtitle="Multimodal Bengali voice + tray photo extraction with KDM stone deduction & scrap return"
    >
      <div className="space-y-5" data-testid="jeweller-returns-page">
        <ReturnIntakeCard
          voiceCaptured={voiceCaptured}
          sigCount={sigCount}
          onTriggerVoiceIntake={handleTriggerVoice}
          onSignReturn={handleSignReturn}
        />
      </div>
    </JewellerShell>
  );
}
