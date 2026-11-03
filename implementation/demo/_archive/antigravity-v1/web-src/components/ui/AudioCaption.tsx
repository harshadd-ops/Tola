"use client";

import React, { useRef, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { CachedPill } from "./CachedPill";

export function AudioCaption({
  nativeText,
  nativeLang = "bn",
  englishCaption,
  audioPath,
  sourceMode = "cached",
  autoPlay = false,
  className = "",
}: {
  nativeText: string;
  nativeLang?: "bn" | "kn" | "hi" | "en";
  englishCaption: string;
  audioPath?: string;
  sourceMode?: "live" | "cached" | "template";
  autoPlay?: boolean;
  className?: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const resolvedSrc = audioPath
    ? audioPath.startsWith("http") || audioPath.startsWith("data:")
      ? audioPath
      : `${API_BASE_URL}${audioPath.startsWith("/") ? "" : "/"}${audioPath}`
    : undefined;

  const handlePlay = async () => {
    if (!audioRef.current) {
      setPlaying(true);
      setTimeout(() => setPlaying(false), 900);
      return;
    }
    try {
      setPlaying(true);
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
    } catch {
      setTimeout(() => setPlaying(false), 900);
    }
  };

  return (
    <div
      style={{
        background: "var(--surface-sunken)",
        borderColor: "var(--hairline)",
      }}
      className={`rounded-xl border p-3 ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          lang={nativeLang}
          style={{ color: "var(--ink)" }}
          className="text-sm font-medium leading-relaxed"
        >
          {nativeText}
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          <CachedPill mode={sourceMode} />
          <button
            type="button"
            onClick={handlePlay}
            aria-label={playing ? "Playing voice read-back" : "Play voice read-back"}
            style={{
              background: "var(--surface)",
              borderColor: "var(--hairline-strong)",
              color: "var(--ink)",
            }}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border px-2.5 text-xs font-medium transition-transform active:scale-97"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 6.5v3h2.5L9 12.5v-9L5.5 6.5H3Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M11.5 5.5a3.5 3.5 0 0 1 0 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
      <p
        style={{ color: "var(--ink-3)" }}
        className="mt-1.5 text-xs leading-normal"
      >
        {englishCaption}
      </p>
      {resolvedSrc && (
        <audio
          ref={audioRef}
          src={resolvedSrc}
          autoPlay={autoPlay}
          onEnded={() => setPlaying(false)}
          onPause={() => setPlaying(false)}
          preload="none"
        />
      )}
    </div>
  );
}
