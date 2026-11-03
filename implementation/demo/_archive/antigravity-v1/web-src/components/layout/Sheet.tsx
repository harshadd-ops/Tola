"use client";

import React from "react";
import * as m from "motion/react-m";
import { nearestSnap, pick } from "@/lib/springs";
import { useReducedMotion } from "@/lib/a11y";

export function Sheet({
  open,
  onClose,
  title,
  subtitle,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      data-testid="real-vs-mocked-dialog"
      className="fixed inset-0 z-50 flex items-end justify-center p-2 sm:p-6"
      style={{ background: "var(--scrim)" }}
    >
      <m.div
        drag={reduced ? false : "y"}
        dragConstraints={{ top: 0, bottom: 320 }}
        dragElastic={0.18}
        onDragEnd={(_, info) => {
          const snap = nearestSnap(info.offset.y, info.velocity.y, [0, 260]);
          if (snap > 0) onClose();
        }}
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 48 }}
        animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={pick("gentle", reduced)}
        style={{
          background: "var(--surface)",
          borderColor: "var(--hairline-strong)",
          boxShadow: "var(--shadow-sheet)",
          color: "var(--ink)",
        }}
        className="max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-3xl border p-5 sm:p-7"
      >
        <div
          aria-hidden="true"
          style={{ background: "var(--hairline-strong)" }}
          className="mx-auto mb-4 h-1.5 w-12 rounded-full"
        />
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2
              style={{ fontFamily: "var(--font-display)" }}
              className="text-xl font-medium sm:text-2xl"
            >
              {title}
            </h2>
            {subtitle && (
              <p style={{ color: "var(--ink-3)" }} className="mt-1 text-xs">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sheet"
            data-testid="close-real-vs-mocked"
            style={{
              background: "var(--surface-sunken)",
              borderColor: "var(--hairline)",
              color: "var(--ink)",
            }}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border px-3 text-xs font-medium"
          >
            Close
          </button>
        </div>
        {children}
      </m.div>
    </div>
  );
}
