"use client";

import React from "react";
import * as m from "motion/react-m";
import { pick } from "@/lib/springs";
import { useReducedMotion } from "@/lib/a11y";

export function NotificationBanner({
  title,
  subtitle,
  visible = true,
}: {
  title: string;
  subtitle?: string;
  visible?: boolean;
}) {
  const reduced = useReducedMotion();
  if (!visible) return null;

  return (
    <m.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={pick("gentle", reduced)}
      style={{
        background: "var(--surface-raised)",
        borderColor: "var(--hairline-strong)",
        color: "var(--ink)",
      }}
      className="mb-3 flex items-start gap-2.5 rounded-2xl border p-3 shadow-sm"
    >
      <span
        style={{
          background: "var(--tick-pending-bg)",
          color: "var(--tick-pending)",
        }}
        className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
        aria-hidden="true"
      >
        ●
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold leading-snug">{title}</p>
        {subtitle && (
          <p
            style={{ color: "var(--ink-3)" }}
            className="mt-0.5 text-[11px] leading-snug"
          >
            {subtitle}
          </p>
        )}
      </div>
    </m.div>
  );
}
