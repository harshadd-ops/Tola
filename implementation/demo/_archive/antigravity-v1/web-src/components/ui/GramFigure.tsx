import React from "react";
import {
  formatFine,
  formatGrams,
  formatSignedGrams,
  spokenGrams,
} from "@/lib/units";

export function GramFigure({
  mg,
  signed = false,
  fineness,
  showFine,
  size = "md",
  strikeThrough = false,
  className = "",
}: {
  mg: number;
  signed?: boolean;
  fineness?: number;
  showFine?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  strikeThrough?: boolean;
  className?: string;
}) {
  void showFine;
  const formatted = signed ? formatSignedGrams(mg) : formatGrams(mg);
  const sizeClass =
    size === "xl"
      ? "text-3xl font-medium tracking-tight"
      : size === "lg"
        ? "text-xl font-medium"
        : size === "sm"
          ? "text-xs"
          : "text-sm font-medium";

  return (
    <span className={`inline-flex flex-col ${className}`}>
      <span
        aria-label={spokenGrams(mg)}
        title="Computed, not AI"
        style={{
          fontFamily: "var(--font-mono)",
          fontVariantNumeric: "tabular-nums",
        }}
        className={`mono-figure ${sizeClass} ${strikeThrough ? "line-through opacity-65" : ""}`}
      >
        {formatted}
      </span>
      {fineness !== undefined && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontVariantNumeric: "tabular-nums",
            color: "var(--ink-3)",
          }}
          className="text-xs"
        >
          ({formatFine(mg, fineness)})
        </span>
      )}
    </span>
  );
}
