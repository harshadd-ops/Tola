/**
 * Integer milligram and paise formatting & parsing.
 *
 * House rule (CLAUDE.md §5 / FRONTEND.md §4):
 * - Grams are stored and transported as integer milligrams (`mg`).
 * - Never divide by 1000 or use float arithmetic for display or parsing; use string slicing.
 */

export function assertIntMg(mg: number): void {
  if (typeof mg !== "number" || !Number.isInteger(mg) || Number.isNaN(mg)) {
    throw new TypeError(`Expected integer milligrams, got ${String(mg)}`);
  }
}

export function assertNonNegativeIntMg(mg: number): void {
  assertIntMg(mg);
  if (mg < 0) {
    throw new RangeError(`Expected non-negative integer milligrams, got ${mg}`);
  }
}

/**
 * Format integer milligrams to a 3-decimal gram string by string slicing.
 * Example: `formatGrams(40000)` -> `"40.000 g"`, `formatGrams(40000, false)` -> `"40.000"`.
 */
export function formatGrams(mg: number, includeUnit = true): string {
  assertIntMg(mg);
  const sign = mg < 0 ? "−" : "";
  const abs = Math.abs(mg);
  const padded = String(abs).padStart(4, "0");
  const whole = padded.slice(0, -3);
  const frac = padded.slice(-3);
  return includeUnit ? `${sign}${whole}.${frac} g` : `${sign}${whole}.${frac}`;
}

/**
 * Format signed variance in milligrams (`+0.380 g`, `−0.105 g`, `0.000 g`).
 */
export function formatSignedGrams(mg: number, includeUnit = true): string {
  assertIntMg(mg);
  if (mg === 0) {
    return includeUnit ? "0.000 g" : "0.000";
  }
  const prefix = mg > 0 ? "+" : "−";
  const body = formatGrams(Math.abs(mg), includeUnit);
  return `${prefix}${body}`;
}

/**
 * Compute integer fine-gold milligrams: `floor((grossMg * fineness + 500) / 1000)`.
 */
export function fineMg(grossMg: number, fineness = 916): number {
  assertIntMg(grossMg);
  if (!Number.isInteger(fineness) || fineness <= 0 || fineness > 1000) {
    throw new RangeError(`Invalid fineness: ${fineness}`);
  }
  const sign = grossMg < 0 ? -1 : 1;
  const abs = Math.abs(grossMg);
  return sign * Math.floor((abs * fineness + 500) / 1000);
}

/**
 * Format fine gold in milligrams (`36.640 g fine`).
 */
export function formatFine(grossOrFineMg: number, fineness?: number): string {
  assertIntMg(grossOrFineMg);
  const targetMg = fineness !== undefined ? fineMg(grossOrFineMg, fineness) : grossOrFineMg;
  return `${formatGrams(targetMg, false)} g fine`;
}

/**
 * Format gross variance in INR display estimate (₹14,904/g 24K, fineness 916‰).
 * Formula: `(abs(varianceMg) * fineness * rate24kPerGramInr + 500_000) // 1_000_000`.
 * Returns whole-rupee display string like `"₹5,188"` for `380 mg`.
 */
export function formatFineInrEstimate(
  varianceMg: number,
  rate24kPerGramInr = 14904,
  fineness = 916,
): string {
  assertIntMg(varianceMg);
  const absMg = Math.abs(varianceMg);
  const rupees = Math.floor((absMg * fineness * rate24kPerGramInr + 500_000) / 1_000_000);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    numberingSystem: "latn",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rupees);
}

/**
 * Format integer paise as Indian Rupees (`formatInr(504000)` -> `"₹5,040.00"`).
 */
export function formatInr(paise: number, withDecimals = true): string {
  if (typeof paise !== "number" || !Number.isInteger(paise) || Number.isNaN(paise)) {
    throw new TypeError(`Expected integer paise, got ${String(paise)}`);
  }
  const sign = paise < 0 ? "−" : "";
  const abs = Math.abs(paise);
  const rupees = Math.floor(abs / 100);
  const remPaise = abs % 100;
  const formattedRupees = new Intl.NumberFormat("en-IN", {
    numberingSystem: "latn",
    maximumFractionDigits: 0,
  }).format(rupees);
  if (!withDecimals) {
    return `${sign}₹${formattedRupees}`;
  }
  return `${sign}₹${formattedRupees}.${String(remPaise).padStart(2, "0")}`;
}

/**
 * Parse a gram string (`"40.000"`, `"40.000 g"`, `"0.500g"`, `"40"`) to integer milligrams
 * using string slicing only (no `parseFloat`). Rejects >3 decimal places.
 */
export function parseGramsToMg(input: string): number {
  if (typeof input !== "string") {
    throw new TypeError("Expected string input");
  }
  const trimmed = input.trim().replace(/\s*g$/i, "").trim();
  const match = /^([+\-−])?(\d+)(?:\.(\d{1,3}))?$/.exec(trimmed);
  if (!match) {
    throw new ValueError(`Invalid gram string: "${input}"`);
  }
  const signChar = match[1];
  const wholeStr = match[2] ?? "0";
  const fracStr = (match[3] ?? "").padEnd(3, "0");
  const sign = signChar === "-" || signChar === "−" ? -1 : 1;
  const mg = Number(wholeStr) * 1000 + Number(fracStr);
  if (!Number.isSafeInteger(mg)) {
    throw new RangeError(`Gram value out of safe integer range: "${input}"`);
  }
  return sign === -1 && mg === 0 ? 0 : sign * mg;
}

export class ValueError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValueError";
  }
}

/**
 * Accessible spoken label for screen readers (F-14).
 */
export function spokenGrams(mg: number): string {
  assertIntMg(mg);
  return `${formatGrams(mg, false)} grams`;
}

export const formatMgToGrams = formatGrams;
export const formatPaiseToInr = formatInr;
