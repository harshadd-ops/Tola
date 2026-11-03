import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fc from "fast-check";
import { parseBalanceLine } from "@/features/scale/parseBalanceLine";
import { formatGrams } from "@/lib/units";
import { useScaleStore } from "@/stores/scale";
import { S01_JITTER_MG } from "@/features/story/steps";

describe("scale.test.ts", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-12T10:02:00+05:30"));
    useScaleStore.getState().resetScale();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("parseBalanceLine accepts 'ST,GS,+  40.000 g' and rejects '40.0001 g'", () => {
    expect(parseBalanceLine("ST,GS,+  40.000 g")).toBe(40000);
    expect(parseBalanceLine("38.120 g")).toBe(38120);
    expect(parseBalanceLine("0.500 g")).toBe(500);
    expect(() => parseBalanceLine("40.0001 g")).toThrow(RangeError);
    expect(() => parseBalanceLine("40.000")).toThrow(RangeError);
  });

  it("property: parseBalanceLine(formatGrams(mg)) === mg for 0..1,000,000 mg", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1_000_000 }), (mg) => {
        expect(parseBalanceLine(formatGrams(mg))).toBe(mg);
      })
    );
  });

  it("enforces the stability rule: 3 readings within 10 mg over >= 1.5 s using fake timers", () => {
    const store = useScaleStore.getState();

    // Reading 1 at t = 0 ms
    store.pushReading(40000, Date.now());
    expect(useScaleStore.getState().stable).toBe(false);

    // Reading 2 at t = 500 ms (within 10 mg, but only 2 readings & 500 ms)
    vi.advanceTimersByTime(500);
    store.pushReading(40004, Date.now());
    expect(useScaleStore.getState().stable).toBe(false);

    // Reading 3 at t = 1000 ms (3 readings within 10 mg, but only 1.0 s < 1.5 s)
    vi.advanceTimersByTime(500);
    store.pushReading(39998, Date.now());
    expect(useScaleStore.getState().stable).toBe(false);

    // Reading 4 at t = 1500 ms (last 3 within 10 mg AND >= 1.5 s elapsed)
    vi.advanceTimersByTime(500);
    store.pushReading(40000, Date.now());
    expect(useScaleStore.getState().stable).toBe(true);
    expect(useScaleStore.getState().captureCurrent()).toBe(40000);
  });

  it("simulates the S01 jitter sequence and locks stable at 40,000 mg after 1.5 s", () => {
    const store = useScaleStore.getState();
    const sequence = [...S01_JITTER_MG, 40000, 40000];
    sequence.forEach((mg, idx) => {
      if (idx > 0) {
        vi.advanceTimersByTime(200);
      }
      store.pushReading(mg, Date.now());
    });
    expect(useScaleStore.getState().stable).toBe(true);
    expect(useScaleStore.getState().currentMg).toBe(40000);
  });
});
