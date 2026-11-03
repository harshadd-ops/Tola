"use client";

import React from "react";
import { ArcLight } from "@/components/brand/ArcLight";
import { BrowserFrame } from "@/components/device/BrowserFrame";
import { Section } from "./Section";

export function LenderShell({
  token,
  children,
}: {
  token: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[calc(100vh-65px)] overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)]">
      <ArcLight stage />
      <div className="relative z-10">
        <Section
          title="Partner NBFC Verification · Karigar Score Passport"
          eyebrow={`Scoped Share Token · ${token}`}
        >
          <BrowserFrame url={`https://verify.pragati-mfi.demo/passport/${token}`}>
            {children}
          </BrowserFrame>
        </Section>
      </div>
    </div>
  );
}

