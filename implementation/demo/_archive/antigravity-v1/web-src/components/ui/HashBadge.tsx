import React from "react";

export function HashBadge({ hash }: { hash: string }) {
  const short = hash.length > 14 ? `${hash.slice(0, 8)}…${hash.slice(-4)}` : hash;
  return (
    <span
      title={hash}
      className="inline-flex items-center rounded-[var(--r-sm)] border border-[var(--border-subtle)] bg-[var(--bg-base)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-secondary)]"
    >
      {short}
    </span>
  );
}
