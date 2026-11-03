import React from "react";

export type PillTone =
  | "neutral"
  | "sealed"
  | "pending"
  | "flag"
  | "dispute"
  | "simulated"
  | "gold";

export function Pill({
  children,
  tone = "neutral",
  icon,
  className = "",
  title,
}: {
  children: React.ReactNode;
  tone?: PillTone;
  icon?: React.ReactNode;
  className?: string;
  title?: string;
}) {
  const toneStyles: Record<PillTone, React.CSSProperties> = {
    neutral: {
      background: "var(--surface-sunken)",
      color: "var(--ink-2)",
      borderColor: "var(--hairline)",
    },
    sealed: {
      background: "var(--tick-sealed-bg)",
      color: "var(--tick-sealed)",
      borderColor: "var(--tick-sealed)",
    },
    pending: {
      background: "var(--tick-pending-bg)",
      color: "var(--tick-pending)",
      borderColor: "var(--tick-pending)",
    },
    flag: {
      background: "var(--variance-flag-bg)",
      color: "var(--variance-flag)",
      borderColor: "var(--variance-flag)",
    },
    dispute: {
      background: "var(--dispute-open-bg)",
      color: "var(--dispute-open)",
      borderColor: "var(--dispute-open)",
    },
    simulated: {
      background: "var(--simulated-bg)",
      color: "var(--simulated)",
      borderColor: "var(--simulated)",
    },
    gold: {
      background: "var(--gold-tint)",
      color: "var(--gold-deep)",
      borderColor: "var(--gold-line)",
    },
  };

  return (
    <span
      title={title}
      style={toneStyles[tone]}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium leading-5 ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}
