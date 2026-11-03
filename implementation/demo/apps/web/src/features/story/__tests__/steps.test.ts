import { beforeEach, describe, expect, it } from "vitest";
import { useStoryStore } from "@/stores/story";
import { CHAPTERS, STORY_STEPS, mapKeyToStepIndex } from "../steps";

describe("story script (DEMO_SPEC §3)", () => {
  it("has 13 beats, S01..S13, in order, each in a known chapter", () => {
    expect(STORY_STEPS.map((s) => s.id)).toEqual(Array.from({ length: 13 }, (_, i) => `S${String(i + 1).padStart(2, "0")}`));
    STORY_STEPS.forEach((s, i) => expect(s.index).toBe(i));
    const chapters = new Set(CHAPTERS.map((c) => c.id));
    expect(CHAPTERS).toHaveLength(5);
    STORY_STEPS.forEach((s) => expect(chapters.has(s.chapter)).toBe(true));
  });

  it("auto-advances only into a beat of the same chapter", () => {
    STORY_STEPS.forEach((s, i) => {
      if (s.autoNext) expect(STORY_STEPS[i + 1]?.chapter).toBe(s.chapter);
    });
  });

  it("never auto-advances away from a result the room should look at", () => {
    for (const id of ["S03", "S04", "S07", "S09", "S11", "S12", "S13"]) {
      expect(STORY_STEPS.find((s) => s.id === id)?.autoNext).toBeFalsy();
    }
  });

  it("maps the jump keys 1–9, 0, -, =, \\ to S01..S13", () => {
    const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "\\"];
    expect(keys.map(mapKeyToStepIndex)).toEqual(STORY_STEPS.map((s) => s.index));
    expect(mapKeyToStepIndex("x")).toBeNull();
  });
});

describe("stage pointer", () => {
  beforeEach(() => useStoryStore.getState().setStepIndex(0));

  it("clamps next and back to the week", () => {
    const st = useStoryStore.getState();
    st.prev();
    expect(useStoryStore.getState().stepIndex).toBe(0);
    st.setStepIndex(12);
    useStoryStore.getState().next();
    expect(useStoryStore.getState().stepIndex).toBe(12);
  });
});
