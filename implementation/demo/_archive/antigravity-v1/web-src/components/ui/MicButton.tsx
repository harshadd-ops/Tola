"use client";

import React, { useState } from "react";
import * as m from "motion/react-m";
import { useReducedMotion } from "@/lib/a11y";
import { pick } from "@/lib/springs";

export function MicButton({
  id,
  label = "Hold or tap to speak in Bengali",
  activeLabel = "Recording voice note…",
  onCapture,
  disabled = false,
  className = "",
}: {
  id?: string;
  label?: string;
  activeLabel?: string;
  onCapture: () => void | Promise<void>;
  disabled?: boolean;
  className?: string;
}) {
  const [recording, setRecording] = useState(false);
  const reduced = useReducedMotion();

  const triggerCapture = async () => {
    if (disabled || recording) return;
    setRecording(true);
    try {
      await onCapture();
    } finally {
      setRecording(false);
    }
  };

  return (
    <m.button
      id={id}
      type="button"
      disabled={disabled}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      transition={pick("press", reduced)}
      onClick={triggerCapture}
      aria-label={recording ? activeLabel : label}
      style={{
        background: recording ? "var(--tick-pending)" : "var(--accent)",
        color: "var(--accent-foreground)",
      }}
      className={`inline-flex min-h-[56px] w-full items-center justify-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm disabled:opacity-50 ${className}`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="7"
          y="2.5"
          width="6"
          height="9.5"
          rx="3"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <path
          d="M4.5 9.5a5.5 5.5 0 0 0 11 0M10 15v2.5M7 17.5h6"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
      <span>{recording ? activeLabel : label}</span>
      <span
        aria-hidden="true"
        className="ml-1 inline-flex items-end gap-0.5 h-3.5"
      >
        {[6, 12, 9, 14, 7].map((h, i) => (
          <span
            key={i}
            style={{
              height: `${h}px`,
              background: "currentColor",
              opacity: recording ? 1 : 0.55,
            }}
            className="w-0.5 rounded-full"
          />
        ))}
      </span>
    </m.button>
  );
}
