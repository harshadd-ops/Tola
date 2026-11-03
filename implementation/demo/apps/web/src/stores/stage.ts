import { create } from "zustand";

/**
 * UI-only moments inside a beat, before the server step fires (e.g. Rafiq's voice note has arrived but
 * Lakshmi has not signed yet). Cleared whenever the presenter moves to another beat.
 */
export interface StageLocal {
  returnVoiceSent: boolean;
  pieceMg: number | null;
  scrapMg: number | null;
  proposalSent: boolean;
  readbackHeard: boolean;
  set: (patch: Partial<Omit<StageLocal, "set" | "clear">>) => void;
  clear: () => void;
}

const EMPTY = {
  returnVoiceSent: false,
  pieceMg: null,
  scrapMg: null,
  proposalSent: false,
  readbackHeard: false,
};

export const useStageLocal = create<StageLocal>((set) => ({
  ...EMPTY,
  set: (patch) => set(patch),
  clear: () => set(EMPTY),
}));
