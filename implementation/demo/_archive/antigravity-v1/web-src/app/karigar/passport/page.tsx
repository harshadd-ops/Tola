"use client";

import React from "react";
import { KarigarShell } from "@/components/layout/KarigarShell";
import { PassportSummary } from "@/features/passport/PassportSummary";
import { ShareSheet } from "@/features/passport/ShareSheet";

export default function KarigarPassportPage() {
  return (
    <KarigarShell>
      <div className="space-y-4" data-testid="karigar-passport-page">
        <PassportSummary />
        <ShareSheet />
      </div>
    </KarigarShell>
  );
}
