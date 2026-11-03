import React from "react";
import { Pill } from "./Pill";

export function CachedPill({
  mode = "cached",
  visible = true,
  className = "",
}: {
  mode?: "live" | "cached" | "template";
  visible?: boolean;
  className?: string;
}) {
  if (!visible) return null;
  if (mode === "live") {
    return (
      <Pill tone="sealed" className={className} title="Live AI response">
        live
      </Pill>
    );
  }
  return (
    <Pill
      tone="neutral"
      className={className}
      title={
        mode === "cached"
          ? "Served from deterministic stage cache"
          : "Served from deterministic template fallback"
      }
    >
      {mode}
    </Pill>
  );
}
