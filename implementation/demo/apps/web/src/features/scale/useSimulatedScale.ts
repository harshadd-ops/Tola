"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { S01_JITTER_MG } from "@/features/story/steps";
import { useScaleStore } from "@/stores/scale";

export function useSimulatedScale(defaultTargetMg = 40000) {
  const pushReading = useScaleStore((s) => s.pushReading);
  const resetScale = useScaleStore((s) => s.resetScale);
  const [running, setRunning] = useState(false);
  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const clearTimers = useCallback(() => {
    for (const t of timersRef.current) {
      clearTimeout(t);
    }
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const dropOnPan = useCallback(
    (targetMg = defaultTargetMg, customSequence?: readonly number[]) => {
      clearTimers();
      resetScale();
      setRunning(true);

      const baseSeq =
        customSequence ??
        (targetMg === 40000
          ? [...S01_JITTER_MG, 40000, 40000]
          : [
              targetMg + 90,
              targetMg - 30,
              targetMg + 10,
              targetMg,
              targetMg,
              targetMg,
              targetMg,
              targetMg,
              targetMg,
            ]);

      const startAt = Date.now();
      baseSeq.forEach((mg, idx) => {
        const delayMs = idx * 200;
        const timer = setTimeout(() => {
          pushReading(mg, startAt + delayMs);
          if (idx === baseSeq.length - 1) {
            setRunning(false);
          }
        }, delayMs);
        timersRef.current.push(timer);
      });
    },
    [clearTimers, defaultTargetMg, pushReading, resetScale]
  );

  const settleImmediately = useCallback(
    (targetMg = defaultTargetMg) => {
      clearTimers();
      resetScale();
      const base = Date.now() - 1600;
      pushReading(targetMg, base);
      pushReading(targetMg, base + 800);
      pushReading(targetMg, base + 1600);
      setRunning(false);
    },
    [clearTimers, defaultTargetMg, pushReading, resetScale]
  );

  return {
    running,
    dropOnPan,
    settleImmediately,
  };
}
