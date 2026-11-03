# Testing (demo build)
> Project: Tola · Owner: Back-end + crypto lead (pytest) · Front-end lead (Vitest, Playwright) · Status: Draft v0.1 · Last updated: 2026-10-20
> Related: [Demo spec](./DEMO_SPEC.md) · [Back end](./BACKEND.md) · [Front end](./FRONTEND.md) · [CI workflow](../../../.github/workflows/demo-ci.yml) · [Seed](../seed/story.json)

What we must never get wrong on stage: **a gram figure, a hash or a signature.** Testing effort follows that order.

## 1. Pyramid and targets
| Layer | Tool | Scope | Target |
|---|---|---|---|
| Property tests | pytest 9.1.1 + Hypothesis 6.170.5 | `ledger_core` invariants | 500 examples per property in CI (`HYPOTHESIS_PROFILE=ci`), 100 locally |
| Unit (API) | pytest | units, canonical JSON, chain, signing, reconcile, settle, passport, PDF | `ledger_core` line coverage ≥ 95% |
| Story numbers | pytest `-m story` | replays `seed/story.json` through the HTTP API and asserts every `steps[].expected` | 100% of expected values |
| Unit (web) | Vitest 5.0.5 + Testing Library + fast-check | `units.ts`, `crypto.ts`, `parseBalanceLine`, stores, story script (`steps.test.ts`) | `lib/` coverage ≥ 90% |
| E2E | Playwright 1.64.1 (Chromium) | the full 13-step story, stepper replay/skip, a11y | green 3 runs in a row; ≤ 90 s per run |
| Manual | checklist §5 | stage rehearsal with network off | before every rehearsal |

## 2. pytest: ledger_core properties
`services/api/tests/test_ledger_properties.py`:

| # | Property | Hypothesis strategy |
|---|---|---|
| P1 | Conservation: `issued == returned + scrap + dust + allowed + adjustments + carried` for any sealed sequence | random orders 1–200,000 mg, random splits |
| P2 | `fine_mg` is monotonic and `fine_mg(a) + fine_mg(b)` is within 1 mg of `fine_mg(a+b)` | ints 0–10⁹, fineness ∈ {999, 995, 916, 875, 750} |
| P3 | No float accepted: every public function raises `TypeError` on `float` | `st.floats()` |
| P4 | Chain integrity: flipping any single byte of any stored canonical payload makes `verify_chain` return `valid=False, broken_at=<that event>` | random chains of 1–300 events, random byte index |
| P5 | Signatures: a signature by person A never verifies as person B; reordering events breaks the chain | random persona pairs |
| P6 | Canonical JSON is stable: `canon(json.loads(canon(x))) == canon(x)` | dicts of str/int/list |
| P7 | Reconcile is order-independent within a chain window (row set is equal under permutation of input lists) | permutations |
| P8 | `parse_grams("40.000") == 40000` and `format(parse(s)) == s` for 3-decimal strings | `st.from_regex(r"\d{1,6}\.\d{3}")` |

Fixed-value tests (`test_story_numbers.py`) pin the canonical numbers: 40,000 → 36,640 fine; allowed 1,000; loss 1,380; variance +380; fine 348; adjustment 130 → carried 250 / 229 fine; labour 480,000 + GST 24,000 = 504,000 paise; passport 194,000 mg, 13/14, 83.7%.

`test_reset_deterministic.py`: two resets give identical `head_hash` for all chains, and `reset(to_step="S05")` matches a manual replay of S01–S04.

Run them:
```bash
cd services/api
uv run --extra dev pytest -m "not live"                  # everything offline
TOLA_LIVE_TESTS=1 uv run --extra dev pytest -m live      # optional: real Lyzr/Sarvam smoke (spends credits)
```

## 3. Vitest (web)
```bash
cd apps/web && npm test
```
- `units.test.ts`: `formatGrams(40000) === "40.000 g"`, `formatInr(504000) === "₹5,040.00"`; fast-check round trip `parseGramsToMg(formatGrams(n)) === n`.
- `crypto.test.ts`: the browser demo key for `p-rafiq` produces the same public key as the Python fixture `tests/fixtures/demo_pubkeys.json`, and a signature made in the browser verifies in a golden vector exported from PyNaCl.
- `scale.test.ts`: the stability rule (3 readings within 10 mg over ≥ 1.5 s) using fake timers; `parseBalanceLine` accepts `"ST,GS,+  40.000 g"` and rejects `"40.0001 g"`.
- `stepper.test.tsx`: keyboard map (→, ←, R, Shift+R, digits) dispatches the right store actions.
- Environment: `jsdom` 30.1.3, `@vitejs/plugin-react` 6.1.2, `vite-tsconfig-paths` 6.1.1.

## 4. Playwright: the story e2e
`apps/web/e2e/story.spec.ts` drives `/stage` exactly as the choreography in [DEMO_SPEC §10](./DEMO_SPEC.md#10-three-minute-stage-choreography) does, against a real API on `:8000` with `AI_FALLBACK_MODE=cached`:
1. `POST /v1/demo/reset`, then open `/stage`.
2. S01: drop the bar on the scale; wait for `getByText("Stable")`; expect `40.000 g`.
3. S02–S03: Sign as Suresh; click হ্যাঁ in the phone frame; expect the tick pair to read "2 of 2".
4. S04: mic → expect the intake card `38.120 g` and `0.500 g`; sign both.
5. S05: Run week; expect 3 rows and one flag reading `+0.380 g`.
6. S06–S07: mic on the phone; Accept 0.130 g; হ্যাঁ; expect "Carried 0.250 g (0.229 g fine)".
7. S08–S09: two approvals; expect `₹5,040.00`, the QR, and the label "Simulated, no money moves".
8. S10–S11: share the passport; expect the lender page to show "194.000 g", "13 of 14" and "Mocked lender view".
9. S12: the GST draft response has `content-type: application/pdf`.
10. S13: expect "Chain valid"; Tamper → expect "broken at event R6".

Also included:
- `stepper.spec.ts`: Replay S05 twice and assert the same flag; Skip from S01 to S13 in ≤ 15 s; reload mid-story resumes at the stored step.
- `a11y.spec.ts`: axe on `/`, `/stage`, `/karigar` and `/lender/passport/<token>`, with 0 serious or critical violations; one run with `reducedMotion: 'reduce'`.
- `no-network.spec.ts`: blocks every request not going to `localhost` and runs S01–S05 (proves fonts and AI are local).
- CLS observer: a `PerformanceObserver('layout-shift')` sum must stay 0 across the story.

`playwright.config.ts`: `webServer` runs `npm run start` on 3000 (it reuses an existing server locally), `use: { viewport: { width: 1920, height: 1080 }, trace: 'retain-on-failure', video: 'retain-on-failure' }`, Chromium only, `retries: 1` in CI.

## 5. Manual demo test script (before every rehearsal, about 8 minutes)
| # | Check | Pass when |
|---|---|---|
| 1 | `scripts/stage-check.sh` | prints `OK` for health, reset ≤ 1 s, 5 audio files, 0 external requests |
| 2 | Turn Wi-Fi **off**; run the whole story with keys only (→ and clicks) | all 13 steps complete; no spinner over 1 s |
| 3 | Listen to S03 on the venue speakers | Bengali is audible; captions are visible |
| 4 | Read every figure aloud against [DEMO_SPEC §8](./DEMO_SPEC.md#8-seed-data-spec) | all match |
| 5 | Press **R** on S05 and S07 | same results, under 1 s |
| 6 | Press **L** to Bengali on the console, then back | no layout break; numbers stay in DM Mono |
| 7 | Toggle **D** dark, then light | no flash; contrast fine on the projector |
| 8 | Unplug and replug HDMI; reload the tab | resumes at the same step |
| 9 | Time 3 consecutive runs | each 2:50–3:00 |

Owner: Field + pitch lead runs it; front-end lead fixes. Log results in `docs/08-project` rehearsal notes.

## 6. CI
[`demo-ci.yml`](../../../.github/workflows/demo-ci.yml) is path-filtered to `implementation/demo/**`:
- **web**: lint → typecheck → Vitest → build → bundle budget;
- **api**: ruff → pytest (not live);
- **e2e**: seeded API + built web → Playwright story.

There are no secrets in CI, and AI is always `cached`.

## 7. MVP (hackathon) vs v1 (production)
| Area | MVP (this build) | v1 ([scalable](../../scalable/README.md)) |
|---|---|---|
| Contract tests | none (single client) | Schemathesis against `openapi.yaml` |
| Load | none | k6 |
| AI evals | cached replies are reviewed by hand | `evals.yml`: numeral WER, flag recall (see MODELS.md) |
