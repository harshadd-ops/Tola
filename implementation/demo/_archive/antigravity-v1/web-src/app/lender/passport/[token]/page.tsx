"use client";

import React, { use } from "react";
import { LenderShell } from "@/components/layout/LenderShell";
import { LenderView } from "@/features/passport/LenderView";

export default function LenderPassportTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);

  return (
    <LenderShell token={token}>
      <div data-testid="lender-passport-page">
        <LenderView token={token} />
      </div>
    </LenderShell>
  );
}
