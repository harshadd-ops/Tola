/**
 * Apple-style spring presets for motion/react (Motion 14.4).
 *
 * Apple tunes springs with two numbers: damping ratio (1.0 = no overshoot) and response (seconds to
 * reach the target; NOT a duration). Motion's `bounce` + `visualDuration` pair maps onto them closely:
 *   bounce ~= 1 - dampingRatio      (0 = critically damped)
 *   visualDuration ~= response      (time until the value visually arrives; the tail settles after)
 *
 * House rules (see docs/FRONTEND.md, "Motion"):
 *  1. Default everything to `spring.default` (damping 1.0). No overshoot on things that merely appear.
 *  2. Bounce only when the user's gesture carried momentum (sheet flick, card throw): `spring.momentum`.
 *  3. Springs, not CSS keyframes, for anything a finger can grab: springs re-target from the live value.
 *  4. Pass the release velocity into the spring (`velocity` option) so drag and animation have no seam.
 *  5. Reduced motion: `MotionConfig reducedMotion="user"` plus `pick()` below swaps in a short fade.
 */
import type { Transition } from "motion/react";

/** Narrow, explicit shape; assignable to Motion's `Transition`. */
type Spring = {
  type: "spring";
  bounce: number;
  visualDuration: number;
};

const make = (dampingRatio: number, response: number): Spring => ({
  type: "spring",
  bounce: Math.max(0, Math.min(1, 1 - dampingRatio)),
  visualDuration: response,
});

export const spring = {
  /** Default UI move / reposition (Apple: damping 1.0, response 0.4). Cards, layout shifts, chips. */
  default: make(1.0, 0.4),
  /** Snappy feedback for small things: toggles, ticks, segmented control thumb. */
  snappy: make(1.0, 0.25),
  /** Press release: scale back from 0.97 after pointer-up. */
  press: make(1.0, 0.18),
  /** Sheets and drawers (Apple: damping 0.8, response 0.3). Use only after a drag/flick release. */
  sheet: make(0.8, 0.3),
  /** Momentum interactions (thrown card, flicked carousel). */
  momentum: make(0.8, 0.4),
  /** Rotation (Apple: damping 0.8, response 0.4), e.g. the scale needle. */
  rotate: make(0.8, 0.4),
  /** Large surfaces arriving (phone frame, story stepper, settlement card). Calm, no overshoot. */
  gentle: make(1.0, 0.6),
  /** Gram counter roll on the scale display. Critically damped so digits never overshoot a weight. */
  counter: make(1.0, 0.5),
} as const satisfies Record<string, Spring>;

export type SpringName = keyof typeof spring;

/** Reduced-motion stand-in: a short cross-fade, no transform, no overshoot. */
export const reducedFade: Transition = { duration: 0.2, ease: "easeOut" };

/** Choose a spring, or the cross-fade when the user asked for reduced motion. */
export function pick(name: SpringName, reducedMotion: boolean | null | undefined): Transition {
  return reducedMotion ? reducedFade : spring[name];
}

/** Press feedback on pointer-down (Apple: respond on touch-down, not touch-up). Spread onto `m.button`. */
export const pressable = {
  whileTap: { scale: 0.97 },
  transition: spring.press,
} as const;

/**
 * Momentum projection (Apple, "Designing Fluid Interfaces"): where would a flick come to rest?
 * velocity in px/s; decelerationRate 0.998 = normal scroll feel, 0.99 = snappier.
 */
export function project(velocity: number, decelerationRate = 0.998): number {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** Pick the snap point nearest the projected resting position. */
export function nearestSnap(current: number, velocity: number, snapPoints: readonly number[]): number {
  const projected = current + project(velocity);
  return snapPoints.reduce((best, p) => (Math.abs(p - projected) < Math.abs(best - projected) ? p : best));
}

/** Rubber-band past a boundary: progressive resistance instead of a hard stop. */
export function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}
