import React from "react";
import { Pill } from "./Pill";

export function SimLabel({
  label,
  children,
  tooltip,
  className = "",
}: {
  label?: string;
  children?: React.ReactNode;
  tooltip?: string;
  className?: string;
}) {
  const display = children ?? label ?? "SIMULATED";
  const titleText =
    tooltip ?? (typeof display === "string" ? display : (label ?? "Simulated"));
  return (
    <Pill
      tone="simulated"
      title={titleText}
      className={className}
      icon={
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="8"
            cy="8"
            r="6.25"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M8 7v4M8 5h.01"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      }
    >
      {display}
    </Pill>
  );
}
