import React from "react";

export function ArcLight({
  stage = false,
  className = "",
}: {
  stage?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`arc-light ${stage ? "arc-light--stage" : ""} ${className}`}
    />
  );
}
