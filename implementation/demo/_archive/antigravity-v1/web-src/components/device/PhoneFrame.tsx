"use client";

import React from "react";
import { SimLabel } from "@/components/ui/SimLabel";

function formatClockTime(isoClock: string): string {
  try {
    const match = /T(\d{2}:\d{2})/.exec(isoClock);
    if (match?.[1]) return match[1];
    const dotMatch = /(\d{2}:\d{2})/.exec(isoClock);
    return dotMatch?.[1] ?? "10:02";
  } catch {
    return "10:02";
  }
}

export function PhoneFrame({
  clock,
  personaName = "Rafiq Sheikh · রফিক শেখ",
  subtitle = "KR-01 · Bowbazar Filigree Cluster",
  langTag = "বাংলা · BN",
  showSimLabel = true,
  compact = false,
  children,
  className = "",
}: {
  clock: string;
  personaName?: string;
  subtitle?: string;
  langTag?: string;
  showSimLabel?: boolean;
  compact?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const timeText = formatClockTime(clock);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        data-testid="karigar-phone-frame"
        style={{
          background: "var(--slate-950)",
          borderRadius: "var(--r-device)",
          boxShadow: "var(--shadow-device)",
          borderColor: "var(--slate-800)",
        }}
        className="w-full max-w-[396px] border p-2.5"
      >
        <div
          style={{
            background: "var(--bg)",
            color: "var(--ink)",
            borderRadius: "calc(var(--r-device) - 8px)",
          }}
          className={`relative flex ${compact ? "min-h-[520px]" : "min-h-[660px]"} flex-col overflow-hidden`}
        >
          {/* Status bar + punch-hole camera */}
          <div
            style={{
              borderBottomColor: "var(--hairline)",
              color: "var(--ink-2)",
            }}
            className="flex items-center justify-between border-b px-5 py-2.5 text-xs font-medium"
          >
            <span style={{ fontFamily: "var(--font-mono)" }}>{timeText}</span>
            <span
              aria-hidden="true"
              style={{ background: "var(--slate-950)" }}
              className="h-3.5 w-16 rounded-full"
            />
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px]">
              <span>4G</span>
              <span aria-hidden="true">▮▮▮</span>
            </span>
          </div>

          {/* Karigar app top bar */}
          <div
            style={{
              background: "var(--surface)",
              borderBottomColor: "var(--hairline)",
            }}
            className="flex items-center justify-between gap-2 border-b px-4 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold leading-tight">
                {personaName}
              </p>
              <p
                style={{ color: "var(--ink-3)" }}
                className="truncate text-[11px]"
              >
                {subtitle}
              </p>
            </div>
            <span
              style={{
                background: "var(--gold-tint)",
                color: "var(--gold-deep)",
                borderColor: "var(--gold-line)",
              }}
              className="shrink-0 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold"
            >
              {langTag}
            </span>
          </div>

          {/* Inner phone body */}
          <div className="flex-1 overflow-y-auto p-3.5">{children}</div>
        </div>
      </div>

      {showSimLabel && (
        <div className="mt-2.5 flex items-center gap-2">
          <SimLabel
            label="Simulated phone"
            tooltip="Renders the real KarigarApp component sharing the live query cache"
          />
        </div>
      )}
    </div>
  );
}

