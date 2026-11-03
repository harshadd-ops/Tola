import React from "react";
import { GramFigure } from "./GramFigure";

export function WeightCell({
  mg,
  size = "md",
  showSign = false,
  fineness,
}: {
  mg: number;
  size?: "sm" | "md" | "lg" | "xl";
  showSign?: boolean;
  fineness?: number;
}) {
  return <GramFigure mg={mg} size={size} signed={showSign} fineness={fineness} />;
}
