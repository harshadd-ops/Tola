import React from "react";
import { TickPair } from "./TickPair";

export function DualSigChip({ count = 0 }: { count?: number }) {
  return <TickPair count={count} />;
}
