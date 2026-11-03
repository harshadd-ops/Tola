"use client";

import React from "react";
import { ArcLight } from "@/components/brand/ArcLight";
import { PhoneFrame } from "@/components/device/PhoneFrame";
import { Section } from "./Section";

export function KarigarShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[calc(100vh-65px)] overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)]">
      <ArcLight stage />
      <div className="relative z-10">
        <Section
          title="Karigar Mobile View · Rafiq Sheikh (রফিক শেখ)"
          eyebrow="Bowbazar Karigar Cluster · Bengali Voice + One-Tap Custody"
        >
          <div className="mx-auto max-w-[420px]">
            <PhoneFrame
              clock="Sat 17 Oct · 18:15"
              personaName="Rafiq Sheikh · রফিক শেখ"
              langTag="বাংলা · BN"
            >
              {children}
            </PhoneFrame>
          </div>
        </Section>
      </div>
    </div>
  );
}

