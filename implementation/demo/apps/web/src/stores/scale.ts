import { create } from "zustand";

export type ScaleSource = "simulated" | "serial" | "manual_dual";

export interface ScaleSample {
  mg: number;
  atMs: number;
}

export const STABILITY_MAX_SPAN_MG = 10;
export const STABILITY_MIN_WINDOW_MS = 1500;
export const STABILITY_MIN_SAMPLES = 3;

/**
 * EC-2 stability check:
 * Requires at least 3 consecutive readings whose max-min span <= 10 mg,
 * covering at least 1,500 ms across the weighing stream.
 */
export function checkScaleStability(samples: readonly ScaleSample[]): boolean {
  if (samples.length < STABILITY_MIN_SAMPLES) {
    return false;
  }
  const lastThree = samples.slice(-STABILITY_MIN_SAMPLES);
  const mgs = lastThree.map((s) => s.mg);
  const maxMg = Math.max(...mgs);
  const minMg = Math.min(...mgs);
  if (maxMg - minMg > STABILITY_MAX_SPAN_MG) {
    return false;
  }
  const firstSample = samples[0]!;
  const latestSample = samples[samples.length - 1]!;
  return latestSample.atMs - firstSample.atMs >= STABILITY_MIN_WINDOW_MS;
}

export interface ScaleState {
  source: ScaleSource;
  samples: ScaleSample[];
  readingsMg: number[];
  currentMg: number;
  stable: boolean;
  capturedMg: number | null;
  port?: string;
  setSource: (source: ScaleSource, port?: string) => void;
  toggleSerialSimulated: () => ScaleSource;
  pushReading: (mg: number, atMs?: number) => void;
  captureCurrent: () => number | null;
  setManualDualReading: (jewellerMg: number, karigarMg: number) => boolean;
  setStableReading: (mg: number, source?: ScaleSource) => void;
  resetScale: () => void;
  reset: () => void;
}

export const useScaleStore = create<ScaleState>((set, get) => ({
  source: "simulated",
  samples: [],
  readingsMg: [],
  currentMg: 0,
  stable: false,
  capturedMg: null,
  port: undefined,

  setSource: (source, port) => {
    set({
      source,
      port,
      samples: [],
      readingsMg: [],
      currentMg: 0,
      stable: false,
      capturedMg: null,
    });
  },

  toggleSerialSimulated: () => {
    const next: ScaleSource = get().source === "simulated" ? "serial" : "simulated";
    get().setSource(next);
    return next;
  },

  pushReading: (mg, atMs = Date.now()) => {
    if (!Number.isInteger(mg) || mg < 0) {
      throw new TypeError(`Scale reading must be a non-negative integer in mg, got ${mg}`);
    }
    const samples = [...get().samples, { mg, atMs }];
    const readingsMg = samples.map((s) => s.mg);
    const stable = checkScaleStability(samples);
    set({
      samples,
      readingsMg,
      currentMg: mg,
      stable,
    });
  },

  captureCurrent: () => {
    const { stable, currentMg } = get();
    if (!stable || currentMg <= 0) return null;
    set({ capturedMg: currentMg });
    return currentMg;
  },

  setManualDualReading: (jewellerMg, karigarMg) => {
    if (
      !Number.isInteger(jewellerMg) ||
      !Number.isInteger(karigarMg) ||
      jewellerMg <= 0 ||
      jewellerMg !== karigarMg
    ) {
      set({ stable: false, capturedMg: null });
      return false;
    }
    const now = Date.now();
    const samples: ScaleSample[] = [
      { mg: jewellerMg, atMs: now - 1600 },
      { mg: jewellerMg, atMs: now - 800 },
      { mg: jewellerMg, atMs: now },
    ];
    set({
      source: "manual_dual",
      samples,
      readingsMg: [jewellerMg, jewellerMg, jewellerMg],
      currentMg: jewellerMg,
      stable: true,
      capturedMg: jewellerMg,
    });
    return true;
  },

  resetScale: () => {
    set({
      samples: [],
      readingsMg: [],
      currentMg: 0,
      stable: false,
      capturedMg: null,
    });
  },

  reset: () => {
    get().resetScale();
  },

  setStableReading: (mg, source = "simulated") => {
    const now = Date.now();
    const samples: ScaleSample[] = [
      { mg, atMs: now - 1600 },
      { mg, atMs: now - 800 },
      { mg, atMs: now },
    ];
    set({
      source,
      samples,
      readingsMg: [mg, mg, mg],
      currentMg: mg,
      stable: true,
      capturedMg: mg,
    });
  },
}));
