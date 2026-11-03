"use client";

import { useEffect } from "react";
import { useSessionStore } from "@/stores/session";
import { useStoryStore } from "@/stores/story";
import { STORY_STEPS, mapKeyToStepIndex } from "./steps";
import { useStoryNav } from "./useStory";

/**
 * Stage keyboard (DEMO_SPEC §6): → / Space next · ← back · R replay · ⇧R reset week ·
 * 1–9, 0, -, =, \ jump · N presenter line · ? real vs mocked · D theme.
 */
export function useStoryKeys() {
  const nav = useStoryNav();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))) return;
      if (el?.closest("[role=dialog],[role=menu]")) return;

      const story = useStoryStore.getState();
      if (!story.ready) return;
      if (e.key === "ArrowRight" || (e.key === " " && el?.tagName !== "BUTTON")) {
        e.preventDefault();
        // On the last beat, → does what "Finish" does: perform it if needed, then show the closing card.
        const last = story.stepIndex === STORY_STEPS.length - 1;
        void nav.next().then(() => last && story.setShowClosing(true));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        void nav.back();
      } else if (e.key === "R") {
        void nav.resetWeek();
      } else if (e.key === "r") {
        void nav.replay();
      } else if (e.key === "n" || e.key === "N") {
        story.toggleLine();
      } else if (e.key === "?") {
        story.setShowRealVsMocked(!story.showRealVsMocked);
      } else if (e.key === "d" || e.key === "D") {
        useSessionStore.getState().toggleTheme();
      } else {
        const idx = mapKeyToStepIndex(e.key);
        if (idx !== null) void nav.goTo(idx);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nav]);
}
