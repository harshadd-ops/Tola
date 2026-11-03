import { create } from "zustand";
import { STORY_STEPS, getStepByIndex } from "@/features/story/steps";

/**
 * The stage pointer: which beat of the week the presenter is on.
 * What has actually happened lives on the server (`GET /v1/demo/state`); this store only says
 * where we are looking. Persisted so a crashed tab reloads onto the same beat (DEMO_SPEC §9).
 */
const STORAGE_KEY = "tola-stage-step";

export interface StoryStore {
  stepIndex: number;
  showLine: boolean;
  showRealVsMocked: boolean;
  showClosing: boolean;
  setShowClosing: (open: boolean) => void;
  /** The server has been lined up with the beat on screen (initial sync done). */
  ready: boolean;
  /** A jump or Next is in flight; auto-advance waits. */
  busy: boolean;
  setReady: (ready: boolean) => void;
  setBusy: (busy: boolean) => void;
  setStepIndex: (index: number) => void;
  next: () => void;
  prev: () => void;
  toggleLine: () => void;
  setShowRealVsMocked: (open: boolean) => void;
  hydrate: () => void;
}

function persist(stepIndex: number) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(stepIndex));
  } catch {
    // storage can be blocked; the stage still works
  }
}

export const useStoryStore = create<StoryStore>((set, get) => ({
  stepIndex: 0,
  showLine: false,
  showRealVsMocked: false,
  showClosing: false,
  setShowClosing: (showClosing) => set({ showClosing }),
  ready: false,
  busy: false,
  setReady: (ready) => set({ ready }),
  setBusy: (busy) => set({ busy }),
  setStepIndex: (index) => {
    const step = getStepByIndex(index);
    persist(step.index);
    set({ stepIndex: step.index });
  },
  next: () => get().setStepIndex(Math.min(STORY_STEPS.length - 1, get().stepIndex + 1)),
  prev: () => get().setStepIndex(Math.max(0, get().stepIndex - 1)),
  toggleLine: () => set({ showLine: !get().showLine }),
  setShowRealVsMocked: (showRealVsMocked) => set({ showRealVsMocked }),
  hydrate: () => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw !== null && /^\d+$/.test(raw)) set({ stepIndex: getStepByIndex(Number(raw)).index });
    } catch {
      // ignore
    }
  },
}));
