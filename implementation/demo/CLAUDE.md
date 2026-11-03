# CLAUDE.md: Tola demo build
> Project: Tola · Owner: Tech lead (demo track) · Status: Draft v0.1 · Last updated: 2026-10-20
> Related: [Project brief](../../docs/00-overview/PROJECT_BRIEF.md) · [Demo spec](./docs/DEMO_SPEC.md) · [Front end](./docs/FRONTEND.md) · [Back end](./docs/BACKEND.md) · [Coding standards](./docs/CODING_STANDARDS.md)

Instructions for AI coding agents working inside `implementation/demo/`. Read this whole file before the first edit.

## 1. What this track is
A **stage prototype**: one scripted week at Shetty Jewellers, shown in 3 minutes, smooth enough to look like a product. It is not the production app. Scope is frozen to **F-01..F-09, F-13, F-14** (IDs in [PROJECT_BRIEF §5](../../docs/00-overview/PROJECT_BRIEF.md)). F-10 is a static list only. F-11 and F-12 are out of scope, except for the on-screen simulated phone frame.

The **source of truth** is `docs/00-overview/PROJECT_BRIEF.md`: names, IDs, versions, ports, env vars and the canonical demo numbers (Order #14, 40.000 g, 38.120 g, 0.500 g, 2.50%, +380 mg, 130 mg, 250 mg / 229 mg fine, ₹4,800 + ₹240 = ₹5,040). The seed `seed/story.json` encodes them. If the code disagrees with the brief, the code is wrong.

## 2. Commands
Run these from `implementation/demo` unless a path says otherwise.

| Task | Command |
|---|---|
| API dev | `cd services/api && uv run uvicorn tola_api.main:app --reload --port 8000` |
| Reset seed | `cd services/api && uv run tola-seed --reset` (or `curl -X POST localhost:8000/v1/demo/reset`) |
| API tests | `cd services/api && uv run --extra dev pytest -m "not live"` |
| API lint | `cd services/api && uv run --extra dev ruff check . && uv run --extra dev ruff format --check .` |
| Web dev | `cd apps/web && npm run dev` (port 3000) |
| Web checks | `cd apps/web && npm run lint && npm run typecheck && npm test` |
| Story e2e | `cd apps/web && npm run e2e` (API must be running with `AI_FALLBACK_MODE=cached`) |
| Whole stack | `docker compose up --build` |
| Rebake AI cache | `uv run python scripts/bake_ai_cache.py` and `uv run python scripts/bake_audio.py` (need live keys) |

Before you say a task is done, run the web checks and the API tests and make sure they pass.

## 3. Folder rules
- `apps/web/src/app/**`: routes only (thin `page.tsx` and `layout.tsx`). Put logic in `src/features/<feature>/`.
- `apps/web/src/components/tola/**`: generic, stateless primitives on top of HeroUI v3 (Gram, Ticks, SimChip, HashChip, AgentNote, PhoneFrame, LinkButton). Nothing that knows about orders. Use HeroUI components and `@gravity-ui/icons`; never hand-roll a button.
- The stage is server-driven: actions call `POST /v1/demo/steps/{id}/perform` and render `GET /v1/demo/state`. Never compute or hard-code a gram or rupee figure in the UI.
- `apps/web/src/features/<name>/**`: one folder per feature: `issue`, `returns`, `reconcile`, `dispute`, `settlement`, `passport`, `ledger`, `story`.
- `apps/web/src/lib/**`: `api.ts` (typed fetch + Zod), `crypto.ts` (noble), `units.ts` (mg formatting only), `springs.ts`.
- `apps/web/src/styles/tokens.css` is the **only** place colours, radii and fonts are defined. Components use tokens and Tailwind utilities that map to tokens. No hex values in TSX.
- `services/api/tola_api/ledger_core/**` is **pure Python**: no FastAPI, no SQLAlchemy, no network, no floats. Everything else may import it; it imports nothing from the app.
- `services/api/tola_api/ai/**` holds the only code allowed to call Lyzr or Sarvam.
- `seed/**` is data. Change `story.json` only together with `docs/DEMO_SPEC.md` and the expected values in tests.
- Never write outside `implementation/demo/` except `.github/workflows/demo-ci.yml`.

## 4. Do
- Store and compute every weight as an **integer in milligrams**. Purity is fineness in ‰ (916 for 22K). Fine mg = `(mg * fineness + 500) // 1000`. Money is integer **paise**.
- Format grams only at the edge (`formatGrams(mg) → "40.000 g"`) and always in **DM Mono** with tabular numerals.
- Keep **AI out of arithmetic**. Agents receive numbers computed by `ledger_core` and only explain or extract them. Weights always come from the scale reading, never from a transcript (EC-4).
- Put a **human gate** before every signature: the person taps to sign; agents only draft.
- Use HeroUI v3 compound components (`Card`, `Card.Header`, `Card.Content`…), with no Provider. Theme through CSS variables in `tokens.css`.
- Animate with springs from `src/lib/springs.ts` (`spring.default` unless the gesture had momentum). Give press feedback on pointer-down. Honour `prefers-reduced-motion`, `prefers-reduced-transparency` and `prefers-contrast`.
- Label everything simulated or mocked on screen: UPI ("Simulated, no money moves"), lender view ("Mocked lender view"), GST ("DRAFT, for your CA"), keys ("Demo keys").
- Make every AI call go through the fallback chain `live → cache → template` with the timeouts in `seed/story.json` (`fallback.timeouts_ms`).
- Keep the story deterministic: the same reset must produce the same hashes. Use `occurred_at` from the story clock, never `now()`, for story events.
- Use 44 px minimum targets (56 px in the karigar phone frame). UI strings live in `messages/{en,hi,kn,bn}.json`.

## 5. Don't
- **No auth code.** No login page, no OTP, no sessions, no JWT, no middleware/`proxy.ts` that gates routes, no user table with passwords. The persona switcher is a view setting. API-17 to API-20 are scalable-only and must not exist here.
- No feature outside F-01..F-09, F-13, F-14 (plus the static F-10 list and the F-12 phone frame). If asked, point to `implementation/scalable`.
- No floats for grams or rupees anywhere: Python, TypeScript, SQL or JSON.
- No real money, no PSP SDK, no real AA/ULI call, no credit score, no "approved/declined" language in the lender view.
- No blockchain, no tokens, no wallet libraries.
- Don't edit or delete ledger rows. Corrections are new `ADJUSTMENT` events. The tamper demo works on a sandbox copy.
- Don't add new IDs (F-, E-, API-, M-, R-, P-) or env var names. If you need one, stop and flag it for the brief owner.
- Don't use Sarvam's proprietary fonts (Matter, Season Mix) or its logo. Don't add network fonts: Fontsource only, so the offline stage works.
- Don't use CSS `@keyframes` for anything the user can grab (sheets, the scale needle, cards). Use springs.
- Don't commit `.env`, `.env.local`, `*.db` or real API keys.

## 6. Definition of done for a story step
1. The step works in `/stage` with `AI_FALLBACK_MODE=cached` and with the network unplugged.
2. Its numbers match `seed/story.json` → `steps[].expected`, and a pytest asserts them.
3. The Playwright story spec covers it, and it is skippable and replayable from the stepper.
4. It reads correctly in English and Bengali, in light and dark mode, and with reduced motion.
5. Interaction to visual response is ≤ 100 ms; no layout shift (CLS 0) when the step's card appears.

## 7. Branches and commits
Branch: `demo/TOLA-xxx-slug` (for example `demo/TOLA-012-scale-widget`). Conventional commits (`feat(web): …`, `fix(api): …`). CI: `.github/workflows/demo-ci.yml`, path-filtered to `implementation/demo/**`.
