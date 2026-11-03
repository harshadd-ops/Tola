"use client";

import React, { useState } from "react";
import { KarigarShell } from "@/components/layout/KarigarShell";
import { KarigarApp } from "@/features/karigar/KarigarApp";

export default function KarigarPage() {
  const [confirmed, setConfirmed] = useState(false);
  const [disputeOpened, setDisputeOpened] = useState(false);

  return (
    <KarigarShell>
      <KarigarApp
        order14Issued={true}
        order14KarigarSigned={confirmed}
        disputeOpened={disputeOpened}
        disputeResolved={false}
        onKarigarConfirmedOrder14={() => setConfirmed(true)}
        onDisputeOpened={() => setDisputeOpened(true)}
      />
    </KarigarShell>
  );
}
