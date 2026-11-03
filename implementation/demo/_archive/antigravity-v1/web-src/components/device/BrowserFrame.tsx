import React from "react";
import { SimLabel } from "@/components/ui/SimLabel";

export function BrowserFrame({
  url,
  bannerText = "Mocked lender view. Tola does not score or lend.",
  children,
  className = "",
}: {
  url: string;
  bannerText?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        borderColor: "var(--hairline-strong)",
        boxShadow: "var(--shadow-card)",
      }}
      className={`overflow-hidden rounded-3xl border ${className}`}
    >
      {/* Browser chrome top bar */}
      <div
        style={{
          background: "var(--surface-sunken)",
          borderBottomColor: "var(--hairline)",
        }}
        className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5"
      >
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span
            style={{ background: "var(--ink-4)" }}
            className="h-2.5 w-2.5 rounded-full"
          />
          <span
            style={{ background: "var(--ink-4)" }}
            className="h-2.5 w-2.5 rounded-full"
          />
          <span
            style={{ background: "var(--ink-4)" }}
            className="h-2.5 w-2.5 rounded-full"
          />
        </div>
        <div
          style={{
            background: "var(--surface)",
            borderColor: "var(--hairline)",
            color: "var(--ink-2)",
            fontFamily: "var(--font-mono)",
          }}
          className="min-w-0 flex-1 truncate rounded-full border px-3 py-1 text-xs"
        >
          {url}
        </div>
        <SimLabel label="Mocked lender view" tooltip={bannerText} />
      </div>

      {/* Explicit honesty banner */}
      <div
        style={{
          background: "var(--simulated-bg)",
          borderBottomColor: "var(--hairline)",
          color: "var(--simulated)",
        }}
        className="border-b px-4 py-2 text-xs font-medium"
      >
        {bannerText}
      </div>

      <div className="p-5">{children}</div>
    </div>
  );
}
