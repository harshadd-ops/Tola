"use client";

import React from "react";
import { TickPair } from "./TickPair";

export interface ChainBlockItem {
  id: string;
  ref?: string;
  type: string;
  hash: string;
  prevHash: string;
  sigCount: number;
  broken?: boolean;
}

export function ChainStrip({
  blocks,
  brokenAt,
  className = "",
}: {
  blocks: readonly ChainBlockItem[];
  brokenAt?: string | null;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-2 py-2 ${className}`}
      role="list"
      aria-label="Hash chain blocks"
    >
      {blocks.map((block, idx) => {
        const isBroken =
          Boolean(block.broken) ||
          (brokenAt != null &&
            (block.ref === brokenAt || block.id === brokenAt));
        return (
          <React.Fragment key={block.id}>
            {idx > 0 && (
              <span
                aria-hidden="true"
                style={{
                  color: isBroken ? "var(--chain-broken)" : "var(--ink-3)",
                }}
                className="font-mono text-xs select-none"
              >
                {isBroken ? "✕" : "→"}
              </span>
            )}
            <div
              role="listitem"
              style={{
                background: isBroken
                  ? "var(--chain-broken-bg)"
                  : "var(--surface)",
                borderColor: isBroken
                  ? "var(--chain-broken)"
                  : "var(--hairline-strong)",
                color: isBroken ? "var(--chain-broken)" : "var(--ink)",
              }}
              className="flex shrink-0 items-center gap-2 rounded-xl border px-3 py-1.5 text-xs shadow-xs"
            >
              <span
                style={{ fontFamily: "var(--font-mono)" }}
                className="font-semibold"
              >
                {block.ref ?? `#${idx + 1}`}
              </span>
              <span
                style={{ color: "var(--ink-2)" }}
                className="text-[11px] uppercase tracking-wider"
              >
                {block.type}
              </span>
              <code
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--ink-2)",
                }}
                className="text-[11px]"
                title={`SHA-256: ${block.hash}`}
              >
                {block.hash.slice(0, 8)}…
              </code>
              <TickPair count={block.sigCount} />
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
