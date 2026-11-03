import React from "react";
import { Pill } from "./Pill";

export function PurityPill({ fineness = 916 }: { fineness?: number }) {
  const label =
    fineness === 999
      ? "24K · 999"
      : fineness === 995
        ? "24K · 995"
        : fineness === 916
          ? "22K · 916"
          : fineness === 750
            ? "18K · 750"
            : `${fineness}‰`;

  return <Pill tone="gold">{label}</Pill>;
}
