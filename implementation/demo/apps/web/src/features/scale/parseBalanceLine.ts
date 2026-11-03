/**
 * Parse an ASCII frame from a precision balance (or formatted gram string)
 * into integer milligrams without floating-point arithmetic.
 *
 * Accepted examples:
 * - "ST,GS,+  40.000 g" -> 40000
 * - "40.000 g"          -> 40000
 * - "0.500 g"           -> 500
 *
 * Rejected examples (throws RangeError):
 * - "40.0001 g" (more than 3 decimals)
 * - "40.000"    (missing unit 'g')
 * - "-1.000 g"  (negative weight)
 */
const BALANCE_LINE_RE =
  /^(?:[A-Z]{2}\s*,\s*[A-Z]{2}\s*,\s*)?(?:\+\s*)?(\d+)(?:\.(\d+))?\s*g$/i;

export function parseBalanceLine(line: string): number {
  if (typeof line !== "string") {
    throw new TypeError("Balance line must be a string");
  }
  const trimmed = line.trim();
  const match = BALANCE_LINE_RE.exec(trimmed);
  if (!match) {
    throw new RangeError(`Invalid balance line format: "${line}"`);
  }

  const wholeStr = match[1]!;
  const fracStr = match[2] ?? "";

  if (fracStr.length > 3) {
    throw new RangeError(
      `Balance reading supports at most 3 decimal places (got "${line}")`
    );
  }

  const paddedFrac = fracStr.padEnd(3, "0");
  const wholeMg = Number.parseInt(wholeStr, 10) * 1000;
  const fracMg = Number.parseInt(paddedFrac, 10);
  const totalMg = wholeMg + fracMg;

  if (!Number.isSafeInteger(totalMg) || totalMg < 0) {
    throw new RangeError(`Out-of-range milligram value parsed from "${line}"`);
  }

  return totalMg;
}
