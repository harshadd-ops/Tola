# CLAUDE.md: instructions for AI coding agents

## Project summary
**Tola** is a gold job-work ledger that both the jeweller and the karigar sign.
- Weight comes from the scale.
- The karigar confirms by voice in his own language.
- Events are dual-signed (Ed25519) and SHA-256 hash-chained.
- Lyzr agents draft intake, reconciliation and settlement, and humans sign.
- The karigar can share a Work Passport.

Hackathon: Tech4Bharat · GAVS 2026, PS 2.2. **Source of truth: [docs/00-overview/PROJECT_BRIEF.md](docs/00-overview/PROJECT_BRIEF.md).**

## Which track are you in?
- `implementation/demo/` is the **stage prototype**. Read [implementation/demo/CLAUDE.md](implementation/demo/CLAUDE.md). No auth, seeded story, SQLite.
- `implementation/scalable/` is the **production path**. Read [implementation/scalable/CLAUDE.md](implementation/scalable/CLAUDE.md).
- `docs/` and `api/openapi.yaml` are shared. Change them only together with the brief.

## Commands
| Task | Demo | Scalable |
|---|---|---|
| Install | `cd implementation/demo/apps/web && npm i` · `cd ../../services/api && pip install -e .[dev]` | `cd implementation/scalable && pnpm i` · `cd services/api && pip install -e .[dev]` |
| Dev | `docker compose up` (in `implementation/demo`) or `npm run dev` + `uvicorn app.main:app --reload --port 8000` | `docker compose -f infra/docker/docker-compose.yml up` |
| Test | `npm test` · `npm run e2e` · `pytest` | `pnpm test` · `pytest` |
| Lint | `npm run lint` · `ruff check .` | `pnpm lint` · `ruff check . && mypy .` |
| Build | `npm run build` | `pnpm build` |
| Evals | `python -m evals.run` (scalable `ai/evals`) | same |

Ports are fixed: web **3000**, api **8000**.

## Architecture in 10 lines
1. Next.js 16 web app (HeroUI v3, Tailwind 4, Motion) talks to FastAPI at `/v1`.
2. `ledger-core` (Python) owns all arithmetic: integer milligrams, fineness per mille, balances, variance.
3. Events (E-06) are append-only; each stores `prev_hash` and `hash` = SHA-256(canonical JSON).
4. Each event needs two Ed25519 signatures (E-07): issuer and karigar.
5. Scale readings (E-08) come from Web Serial, BLE, display OCR or the simulator, never from typing.
6. Voice: Sarvam Saaras (STT, M-01) and Bulbul (TTS, M-02); cached fallback via `AI_FALLBACK_MODE`.
7. Lyzr Manager → Intake / Reconcile / Settle agents (M-03) **draft only**; a human approves every draft.
8. Weekly reconciliation (API-11) produces variance flags; disputes (API-12) never overwrite events.
9. Settlement (API-13) needs both approvals, then a UPI intent (API-14; simulated in the demo).
10. Work Passport (API-15) is a consented, expiring, revocable share link.

## Code conventions
- TypeScript strict; Python 3.12 with type hints; ruff + mypy; eslint + prettier.
- Conventional Commits; branches `<type>/<track>-<area>-<short-desc>` with the TOLA ticket ID in the PR title. See [CONTRIBUTING.md](CONTRIBUTING.md).
- Use the IDs from the brief (F-, E-, API-, M-) in code comments and test names where useful.

## Do / don't
- ✅ Store grams as **integer milligrams**. ✅ Read every number back to the user. ✅ Keep the karigar's copy uneditable.
- ✅ Use design tokens from `docs/02-design/DESIGN.md`. Springs: damping 1.0 by default.
- ❌ Never let an LLM compute or "correct" a weight, balance or rupee amount.
- ❌ Never claim gold purity from a photo. ❌ No blockchain. ❌ Never file GST; drafts only.
- ❌ Never add login to the demo. ❌ Never use Sarvam's proprietary fonts or logo.

## Security rules
- No secrets in code. Use `.env` (see `.env.example`).
- Demo uses **synthetic data only**.
- PII (names, phones, voice) is redacted in logs.
- Never log audio or full transcripts in production.

## Key docs
[PRD](docs/01-product/PRD.md) · [DESIGN](docs/02-design/DESIGN.md) · [UI_SPEC](docs/02-design/UI_SPEC.md) · [ARCHITECTURE](docs/03-engineering/ARCHITECTURE.md) · [DATA_MODEL](docs/03-engineering/DATA_MODEL.md) · [API_SPEC](docs/03-engineering/API_SPEC.md) · [PROMPTS](docs/04-ai/PROMPTS.md) · [DEMO_SPEC](implementation/demo/docs/DEMO_SPEC.md) · [MAP](MAP.md)
