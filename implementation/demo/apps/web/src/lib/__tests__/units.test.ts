import { describe, expect, it } from "vitest";
import fc from "fast-check";
import {
  fineMg,
  formatFine,
  formatFineInrEstimate,
  formatGrams,
  formatInr,
  formatSignedGrams,
  parseGramsToMg,
  spokenGrams,
} from "../units";

describe("units.ts", () => {
  it("formats canonical story gram and INR figures accurately", () => {
    expect(formatGrams(40000)).toBe("40.000 g");
    expect(formatGrams(38120)).toBe("38.120 g");
    expect(formatGrams(500)).toBe("0.500 g");
    expect(formatGrams(0)).toBe("0.000 g");
    expect(formatSignedGrams(380)).toBe("+0.380 g");
    expect(formatSignedGrams(-105)).toBe("−0.105 g");
    expect(fineMg(40000, 916)).toBe(36640);
    expect(fineMg(380, 916)).toBe(348);
    expect(fineMg(250, 916)).toBe(229);
    expect(formatFine(40000, 916)).toBe("36.640 g fine");
    expect(formatFineInrEstimate(380, 14904, 916)).toBe("₹5,188");
    expect(formatInr(504000)).toBe("₹5,040.00");
    expect(formatInr(480000)).toBe("₹4,800.00");
    expect(formatInr(24000)).toBe("₹240.00");
    expect(spokenGrams(40000)).toBe("40.000 grams");
  });

  it("rejects non-integer inputs for mg and paise", () => {
    expect(() => formatGrams(40.5)).toThrow(TypeError);
    expect(() => fineMg(40.123, 916)).toThrow(TypeError);
    expect(() => formatInr(5040.5)).toThrow(TypeError);
  });

  it("round-trips parseGramsToMg(formatGrams(n)) === n across 0..1,000,000 mg", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1_000_000 }), (n) => {
        expect(parseGramsToMg(formatGrams(n))).toBe(n);
      })
    );
  });
});
