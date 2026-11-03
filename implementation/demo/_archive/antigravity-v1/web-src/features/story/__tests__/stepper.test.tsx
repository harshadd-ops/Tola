import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Stepper } from "../Stepper";
import { STORY_STEPS } from "../steps";
import { useSessionStore } from "@/stores/session";
import { useStoryStore } from "@/stores/story";

describe("Stepper & Story State Machine", () => {
  beforeEach(() => {
    useStoryStore.getState().resetStoryState();
    useSessionStore.getState().setPersona("p-suresh");
  });

  afterEach(() => {
    cleanup();
  });

  it("renders all 13 story step pills S01..S13", () => {
    render(<Stepper />);
    for (const step of STORY_STEPS) {
      expect(screen.getByTestId(`stepper-pill-${step.id}`)).toBeInTheDocument();
    }
  });

  it("advances and goes back via Next/Prev buttons and syncs persona", () => {
    render(<Stepper />);
    expect(useStoryStore.getState().stepIndex).toBe(0);
    expect(useSessionStore.getState().personaId).toBe("p-suresh");

    const nextBtn = screen.getByTestId("stepper-next");
    fireEvent.click(nextBtn);
    expect(useStoryStore.getState().stepIndex).toBe(1);

    fireEvent.click(nextBtn);
    expect(useStoryStore.getState().stepIndex).toBe(2);
    // S03 is p-rafiq
    expect(useSessionStore.getState().personaId).toBe("p-rafiq");

    const prevBtn = screen.getByTestId("stepper-prev");
    fireEvent.click(prevBtn);
    expect(useStoryStore.getState().stepIndex).toBe(1);
    expect(useSessionStore.getState().personaId).toBe("p-suresh");
  });

  it("jumps directly to any step via pill click or keyboard shortcut and resets on R", () => {
    const onReset = vi.fn();
    render(<Stepper onResetDemo={onReset} />);

    // Click S11 (Lender view -> p-meera)
    fireEvent.click(screen.getByTestId("stepper-pill-S11"));
    expect(useStoryStore.getState().stepIndex).toBe(10);
    expect(useSessionStore.getState().personaId).toBe("p-meera");

    // Keyboard shortcut '5' -> index 4 (S05)
    fireEvent.keyDown(window, { key: "5" });
    expect(useStoryStore.getState().stepIndex).toBe(4);
    expect(useSessionStore.getState().personaId).toBe("p-suresh");

    // Keyboard shortcut 'm' -> toggle mode
    expect(useStoryStore.getState().mode).toBe("story");
    fireEvent.keyDown(window, { key: "m" });
    expect(useStoryStore.getState().mode).toBe("explore");

    // Keyboard shortcut '?' -> toggle RealVsMocked sheet
    expect(useStoryStore.getState().showRealVsMocked).toBe(false);
    fireEvent.keyDown(window, { key: "?" });
    expect(useStoryStore.getState().showRealVsMocked).toBe(true);

    // Keyboard shortcut 'r' -> reset demo
    fireEvent.keyDown(window, { key: "r" });
    expect(useStoryStore.getState().stepIndex).toBe(0);
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
