"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { storyApi, type StepId, type StoryState } from "@/lib/story";
import { useStageLocal } from "@/stores/stage";
import { useStoryStore } from "@/stores/story";
import { STORY_STEPS, getStepByIndex } from "./steps";

export const STORY_KEY = ["story-state"] as const;

/** Stage navigation runs one operation at a time, so a reset can never land on top of a click (SC-6). */
let navChain: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = navChain.then(async () => {
    useStoryStore.getState().setBusy(true);
    try {
      return await fn();
    } finally {
      useStoryStore.getState().setBusy(false);
    }
  });
  navChain = run.catch(() => undefined);
  return run;
}

/** The server snapshot. `poll` keeps a second device (a real phone) in sync within ~1 s (DEMO_SPEC §6). */
export function useStoryState(poll = false) {
  return useQuery({
    queryKey: STORY_KEY,
    queryFn: ({ signal }) => storyApi.state(signal),
    refetchInterval: poll ? 1000 : false,
    staleTime: 500,
  });
}

/** Perform one scripted step. The response is the new snapshot, so the UI updates in one frame. */
export function usePerform() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ step, party }: { step: StepId; party?: "jeweller" | "karigar" }) =>
      storyApi.perform(step, party),
    onSuccess: (data) => qc.setQueryData<StoryState>(STORY_KEY, data),
  });
}

/**
 * Stage navigation. Entering step N puts the server exactly at "everything before N is done",
 * using the same deterministic replay as `POST /v1/demo/reset` (SC-5, SC-6).
 */
export function useStoryNav() {
  const qc = useQueryClient();
  const { mutateAsync: performAsync } = usePerform();
  const setStepIndex = useStoryStore((s) => s.setStepIndex);

  const goTo = useCallback(
    (index: number) =>
      serial(async () => {
        const target = getStepByIndex(index);
        const before = target.index > 0 ? STORY_STEPS[target.index - 1]!.id : null;
        useStageLocal.getState().clear();
        setStepIndex(target.index);
        await qc.cancelQueries({ queryKey: STORY_KEY });
        await storyApi.reset(before);
        await qc.fetchQuery({ queryKey: STORY_KEY, queryFn: ({ signal }) => storyApi.state(signal), staleTime: 0 });
      }),
    [qc, setStepIndex],
  );

  /** Next: if the current beat has not happened yet, perform it (Skip), then move on. */
  const next = useCallback(
    () =>
      serial(async () => {
    const { stepIndex } = useStoryStore.getState();
    const step = getStepByIndex(stepIndex);
    const state = qc.getQueryData<StoryState>(STORY_KEY);
    if (state && !state.done.includes(step.id)) {
      if (step.id === "S08") {
        await performAsync({ step: "S08", party: "jeweller" });
        await performAsync({ step: "S08", party: "karigar" });
      } else {
        await performAsync({ step: step.id });
      }
    }
    if (stepIndex < STORY_STEPS.length - 1) {
      useStageLocal.getState().clear();
      setStepIndex(stepIndex + 1);
    }
      }),
    [performAsync, qc, setStepIndex],
  );

  const back = useCallback(async () => {
    const { stepIndex } = useStoryStore.getState();
    if (stepIndex > 0) await goTo(stepIndex - 1);
  }, [goTo]);

  const replay = useCallback(async () => {
    await goTo(useStoryStore.getState().stepIndex);
  }, [goTo]);

  const resetWeek = useCallback(async () => {
    await goTo(0);
  }, [goTo]);

  return useMemo(() => ({ goTo, next, back, replay, resetWeek }), [goTo, next, back, replay, resetWeek]);
}

/**
 * Auto-advance (DEMO_SPEC §10: Capture → Sign → haan flows without a key press). Reactive, not a timer per
 * click: whenever the beat on screen is done and continues on the same surface, move on after a breath.
 * Results the room should look at (lender view, PDF, chain) have no autoNext and wait for →.
 */
export function useAutoAdvance(state: StoryState | undefined) {
  const stepIndex = useStoryStore((s) => s.stepIndex);
  const ready = useStoryStore((s) => s.ready);
  const busy = useStoryStore((s) => s.busy);
  const setStepIndex = useStoryStore((s) => s.setStepIndex);
  useEffect(() => {
    const current = getStepByIndex(stepIndex);
    if (!state || !ready || busy || !current.autoNext || !state.done.includes(current.id)) return;
    const t = window.setTimeout(() => {
      useStageLocal.getState().clear();
      setStepIndex(stepIndex + 1);
    }, 900);
    return () => window.clearTimeout(t);
  }, [state, stepIndex, ready, busy, setStepIndex]);
}
