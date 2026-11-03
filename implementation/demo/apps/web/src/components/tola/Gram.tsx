import { fineMg, formatGrams, formatSignedGrams } from "@/lib/units";

type Size = "sm" | "md" | "lg" | "xl" | "phone";

const SIZE: Record<Size, string> = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-[1.75rem]",
  xl: "text-[clamp(2.5rem,4vw,3.5rem)]",
  phone: "text-[2.75rem]",
};

/**
 * A gram figure (DESIGN §7): DM Mono, tabular, three decimals from integer milligrams.
 * "Computed, not AI": every figure comes from ledger-core on the server.
 */
export function Gram({
  mg,
  size = "md",
  signed = false,
  fine,
  tone,
  strike = false,
  className = "",
}: {
  mg: number;
  size?: Size;
  signed?: boolean;
  /** Show the fine-gold line under the figure, from this fineness (‰). */
  fine?: number;
  tone?: "flag" | "ok" | "muted";
  /** Superseded figure: kept visible, struck through, never deleted (F-06). */
  strike?: boolean;
  className?: string;
}) {
  const color =
    tone === "flag"
      ? "text-[var(--variance-flag)]"
      : tone === "ok"
        ? "text-[var(--variance-ok)]"
        : tone === "muted"
          ? "text-[var(--ink-3)]"
          : "text-[var(--ink)]";
  const text = signed ? formatSignedGrams(mg, false) : formatGrams(mg, false);
  return (
    <span className={`inline-flex flex-col ${className}`}>
      <span
        className={`t-metric whitespace-nowrap ${SIZE[size]} ${color} ${strike ? "line-through decoration-1 opacity-60" : ""}`}
        title="Computed by ledger-core, not AI"
      >
        {text}
        <span className="ml-[0.18em] text-[0.6em] text-[var(--ink-3)]">g</span>
      </span>
      {fine !== undefined && (
        <span className="mt-1 font-mono text-xs text-[var(--gold-deep,#7a5300)]">
          {formatGrams(fineMg(mg, fine), false)} g fine
        </span>
      )}
    </span>
  );
}
