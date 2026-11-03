"use client";

import React from "react";
import { ArcLight } from "@/components/brand/ArcLight";
import { Section } from "./Section";

export interface JewellerShellProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function JewellerShell({
  title,
  subtitle,
  actions,
  children,
}: JewellerShellProps) {
  return (
    <div className="relative min-h-[calc(100vh-65px)] overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)]">
      <ArcLight stage />
      <div className="relative z-10">
        <Section title={title} eyebrow={subtitle} rightSlot={actions}>
          {children}
        </Section>
      </div>
    </div>
  );
}

