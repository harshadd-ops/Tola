# ADR-0006: Integer milligrams and a deterministic `ledger-core`; AI never does arithmetic
> Project: Tola · Owner: Back end + crypto lead · Status: Accepted · Last updated: 2026-10-20
> Related: [Data model §1](../DATA_MODEL.md) · [Architecture §1, §9](../ARCHITECTURE.md) · [AI models](../../04-ai/MODELS.md) · [PRD open question Q-1](../../01-product/PRD.md)

## Context and problem statement
A 1 g disagreement costs about ₹13,650 at 22K (Oct 2026). Floats drift, LLMs mis-add, and a CA on the jury will check that the numbers reconcile. How do we represent and compute gold and money?

## Decision drivers
- Exact, reproducible results on every platform (Python server, TS browser verifier).
- Numbers that a CA can recompute by hand.
- No AI on the arithmetic path (brief §8 principle).

## Considered options
1. **Integers everywhere: mg, fineness ‰, basis points, paise; one pure `ledger-core` library with golden vectors.**
2. `Decimal` grams with 3 decimal places.
3. Floats with rounding at display time.
4. Let the LLM agent compute balances and explain them.

## Decision outcome
Chosen option: **1**, with these normative rules (they answer PRD Q-1):

| Quantity | Rule |
|---|---|
| Fine gold | `fine_mg = floor(weight_mg × fineness_ppt / 1000)`. 40,000 mg × 916 → 36,640; 250 mg × 916 → 229 |
| Wastage allowance | On **gross issued**: `allowed_mg = floor(issued_mg × norm_bps / 10000)`. 40,000 × 250 → 1,000 |
| Loss / variance | `loss_mg = issued − (piece + scrap + dust)`; `variance_mg = loss_mg − allowed_mg`. Canonical demo: 40,000 − 38,620 = 1,380; variance **+380 mg** |
| Money | Paise, round half up: `(x × bps + 5000) div 10000`. Labour ₹4,800 + 5% GST ₹240 = ₹5,040 |
| Negative adjustments | Floor toward −∞ (Python `//`; TS `Math.floor` on BigInt-safe integers) |

**Why floor:** it is deterministic and identical in Python and TS. It never credits a fractional mg that does not exist, and the maximum error is < 1 mg per conversion, which is below the balance resolution of 10 mg.

- `ledger_core` lives in `implementation/demo/services/api/app/ledger_core` (demo) and `implementation/scalable/packages/ledger-core` (Python + a TS port for the browser verifier).
- AI agents receive numbers as **read-only facts**. A validator rejects any agent output containing a number that is not in the `ledger_core` fact set (FM-04).

### Consequences
- Good: reconciles to the milligram; trivially testable; the CA can audit it.
- Bad: display formatting needs care (`40000` → "40.000 g"), done with string arithmetic only.
- Neutral: interest or rate maths (₹ per g) also stays in integers (paise per g).

### Confirmation
100% branch coverage on `ledger_core`. Property tests (Hypothesis / fast-check) check that the sum of fine_mg conversions never exceeds the fine_mg of the sum. The golden vector file includes the canonical demo week. Review on 16 Dec 2026.
