"use client";

import React, { use } from "react";
import { JewellerShell } from "@/components/layout/JewellerShell";
import { SettlementSheet } from "@/features/settlement/SettlementSheet";

export default function SettlementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <JewellerShell
      title={`Weekly Settlement · ${id}`}
      subtitle="Dual-signed Week 2026-W42 settlement sheet, UPI intent payout, and GST ITC-04 Job-Work return draft"
    >
      <div data-testid="settlement-detail-page">
        <SettlementSheet
          settlementId={id}
          showUpiCard={true}
          showGstDraft={true}
        />
      </div>
    </JewellerShell>
  );
}
