/**
 * Accessibility helpers and reduced-motion hook re-export (F-14).
 */
import { useReducedMotion } from "motion/react";

export { useReducedMotion };

/**
 * Trigger a 12 ms tactile vibration on mobile browsers when both signatures land.
 * Safe no-op on desktop or when reduced motion is enabled.
 */
export function vibrateOnSeal(reducedMotion?: boolean | null): void {
  if (reducedMotion) return;
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(12);
    } catch {
      // Ignore on unsupported devices
    }
  }
}

/**
 * Move keyboard focus to a target selector or element ID without scrolling abruptly.
 */
export function focusElementById(id: string): void {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (el && typeof el.focus === "function") {
    el.focus({ preventScroll: true });
  }
}
