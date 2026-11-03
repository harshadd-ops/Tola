"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@heroui/react";
import { Microphone, VolumeFill } from "@gravity-ui/icons";
import { storyApi } from "@/lib/story";

type Phase = "idle" | "playing" | "done";

function Wave({ active }: { active: boolean }) {
  return (
    <span className="inline-flex h-5 items-center gap-[3px] text-[var(--indigo-700)]" aria-hidden="true">
      {[0.5, 0.9, 0.65, 1, 0.55, 0.8, 0.45].map((h, i) => (
        <span
          key={i}
          className={active ? "wave-bar" : "w-[3px] rounded-sm bg-current opacity-30"}
          style={{ height: `${h * 20}px`, animationDelay: `${i * 90}ms` }}
        />
      ))}
    </span>
  );
}

/**
 * Plays the cached clip if the seed has it; otherwise the captions carry the meaning (DEMO_SPEC §9:
 * "Audio output fails → captions on the phone frame carry the meaning"). Words light up as they are "spoken".
 */
function usePlayback(audioFile: string, words: number, audioReady: boolean, onEnded?: () => void) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [spoken, setSpoken] = useState(0);
  const [captionsOnly, setCaptionsOnly] = useState(false);
  const timer = useRef<number | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (timer.current) window.clearInterval(timer.current);
    audio.current?.pause();
  }, []);
  useEffect(() => stop, [stop]);

  const finish = useCallback(() => {
    stop();
    setSpoken(words);
    setPhase("done");
    onEnded?.();
  }, [onEnded, stop, words]);

  const runCaptions = useCallback(
    (msPerWord: number) => {
      let i = 0;
      timer.current = window.setInterval(() => {
        i += 1;
        setSpoken(i);
        if (i >= words) finish();
      }, msPerWord);
    },
    [finish, words],
  );

  const play = useCallback(() => {
    stop();
    setSpoken(0);
    setPhase("playing");
    if (!audioReady) {
      setCaptionsOnly(true);
      runCaptions(300);
      return;
    }
    let started = false;
    let fellBack = false;
    const fallBack = () => {
      if (started || fellBack) return;
      fellBack = true;
      audio.current?.pause();
      setCaptionsOnly(true);
      runCaptions(300);
    };
    const el = new Audio(storyApi.audioUrl(audioFile));
    audio.current = el;
    el.onplaying = () => {
      started = true;
      setCaptionsOnly(false);
      const ms = Number.isFinite(el.duration) && el.duration > 0 ? (el.duration * 1000) / words : 300;
      runCaptions(ms);
    };
    el.onended = finish;
    el.onerror = fallBack;
    el.play().catch(fallBack);
    // An empty or unreachable clip never reaches "playing": captions carry the meaning (DEMO_SPEC §9).
    window.setTimeout(fallBack, 1200);
  }, [audioFile, audioReady, finish, runCaptions, stop, words]);

  return { phase, spoken, captionsOnly, play };
}

export function ReadbackPlayer({
  text,
  en,
  audioFile,
  audioReady,
  audioLabel = "Cached audio",
  onEnded,
  cue = false,
}: {
  text: string;
  en: string;
  audioFile: string;
  /** False while the seed only has placeholder clips: captions only, never a beep pretending to speak. */
  audioReady: boolean;
  /** Where the clip came from, said plainly (see `audioSourceLabel`). */
  audioLabel?: string;
  onEnded?: () => void;
  cue?: boolean;
}) {
  const words = text.split(" ");
  const { phase, spoken, captionsOnly, play } = usePlayback(audioFile, words.length, audioReady, onEnded);
  return (
    <div className="rounded-[20px] bg-[var(--bg-2)] p-4" data-testid="readback">
      <div className="flex items-center justify-between gap-3">
        <Button
          size="sm"
          variant={phase === "idle" ? "primary" : "secondary"}
          onPress={play}
          className={cue && phase === "idle" ? "cue" : ""}
          data-testid="readback-play"
        >
          <VolumeFill />
          {phase === "idle" ? "শুনুন · Listen" : "আবার · Replay"}
        </Button>
        <Wave active={phase === "playing"} />
      </div>
      <p lang="bn" className="mt-3 text-[1.0625rem] leading-relaxed text-[var(--ink)]">
        {words.map((w, i) => (
          <span key={i} className={i < spoken || phase === "idle" ? "" : "text-[var(--ink-3)] opacity-60"}>
            {w}{" "}
          </span>
        ))}
      </p>
      <p className="mt-2 text-[0.8125rem] leading-snug text-[var(--ink-3)]">{en}</p>
      <p className="mt-2 font-mono text-[10px] tracking-wide text-[var(--ink-3)] uppercase">
        {captionsOnly || !audioReady ? "Read-back recording pending · captions shown" : audioLabel}
      </p>
    </div>
  );
}

/** Plain-language label for seed/audio/SOURCE, shown under every read-back. */
export function audioSourceLabel(source: string | undefined): string {
  if (source === "sarvam-bulbul") return "Sarvam Bulbul · cached audio";
  if (source === "gemini-tts") return "Synthetic Bengali voice · cached audio";
  return "Cached audio";
}

/**
 * The karigar's mic. On stage the seeded clip plays when the presenter taps (DEMO_SPEC §3.1 S06);
 * the transcript comes from Saaras (cached).
 */
export function VoiceNoteButton({
  label,
  audioFile,
  audioReady,
  seconds = 2.2,
  onSent,
  cue = false,
  testId,
  disabled = false,
}: {
  label: string;
  audioFile: string;
  audioReady: boolean;
  seconds?: number;
  onSent: () => void;
  cue?: boolean;
  testId?: string;
  disabled?: boolean;
}) {
  const [recording, setRecording] = useState(false);
  const t = useRef<number | null>(null);
  useEffect(() => () => {
    if (t.current) window.clearTimeout(t.current);
  }, []);
  const start = () => {
    if (recording) return;
    setRecording(true);
    let sent = false;
    const send = () => {
      if (sent) return;
      sent = true;
      if (t.current) window.clearTimeout(t.current);
      setRecording(false);
      onSent();
    };
    // With a real clip, "Listening…" lasts as long as the note itself; otherwise a short fixed beat.
    t.current = window.setTimeout(send, seconds * 1000);
    if (audioReady) {
      const el = new Audio(storyApi.audioUrl(audioFile));
      el.onplaying = () => {
        if (t.current) window.clearTimeout(t.current);
      };
      el.onended = send;
      el.onerror = send;
      el.play().catch(send);
    }
  };
  return (
    <Button
      fullWidth
      size="lg"
      variant={recording ? "secondary" : "primary"}
      onPress={start}
      isDisabled={disabled}
      className={`h-14 text-base ${cue && !recording ? "cue" : ""}`}
      data-testid={testId}
    >
      {recording ? <Wave active /> : <Microphone />}
      {recording ? "Listening…" : label}
    </Button>
  );
}
