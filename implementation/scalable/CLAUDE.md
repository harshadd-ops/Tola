# CLAUDE.md · Scalable track (implementation/scalable)
> Project: Tola · Owner: Tech lead (scalable track) · Status: Draft v0.1 · Last updated: 2026-10-20
> Related: [README](README.md) · [Project brief](../../docs/00-overview/PROJECT_BRIEF.md) · [Backend](docs/BACKEND.md) · [Frontend](docs/FRONTEND.md) · [Coding standards](docs/CODING_STANDARDS.md) · [Testing](docs/TESTING.md)

Instructions for AI coding agents (Claude Code, Codex and similar) working **inside `implementation/scalable/`**. If you are working on the stage demo, stop and read `implementation/demo/CLAUDE.md` instead. The two tracks have different rules.

## 1. Project summary
- **Tola** is a gold job-work ledger: jeweller (P-01/P-03) and karigar (P-02/P-05) **both sign every gram**.
- Events (E-06) are append-only, Ed25519 dual-signed (E-07) and SHA-256 hash-chained per shop–karigar pair.
- A weekly reconciliation (F-05) flags variance against the agreed wastage norm (E-05).
- Settlements (F-07) need both approvals and then open a UPI intent.
- The karigar can share a consented Work Passport (F-08).
- This track is the production path: OTP auth, Postgres 16, offline-first PWA, WhatsApp/IVR, workers, GCP Mumbai.

**The single source of truth for names, IDs, ports and env vars** is [`docs/00-overview/PROJECT_BRIEF.md`](../../docs/00-overview/PROJECT_BRIEF.md). Never invent a new F-, E-, API-, M-, R- or P- ID. If you need one, stop and ask.

## 2. Commands (run from `implementation/scalable/`)
| Task | Command |
|---|---|
| Install | `corepack enable && pnpm install && uv sync --directory services/api` |
| Infra up / down / wipe | `pnpm infra:up` · `pnpm infra:down` · `pnpm infra:reset` |
| Migrate / new migration | `pnpm db:migrate` · `pnpm db:revision "add passport scope"` |
| Seed (synthetic only) | `pnpm seed` |
| Dev servers | `pnpm api:dev` (8000) · `pnpm worker:dev` · `pnpm dev` (3000) |
| Lint / format / types | `pnpm lint` · `pnpm format` · `pnpm typecheck` |
| Unit + integration tests | `pnpm test` |
| Contract tests (API running) | `pnpm test:contract` |
| E2E | `pnpm test:e2e` |
| Load (k6, local only) | `pnpm test:load` |
| AI evals | `uv run --directory services/api python -m tola_api.ai.evals --mode cached` (CI: `evals.yml`) |
| Verify every chain | `uv run --directory services/api tola-verify-chains` |

## 3. Architecture in 10 lines
1. `apps/web` is a Next.js 16.4 PWA. It signs events **on the device** with `@noble/ed25519` and queues them in Dexie.
2. The service worker is Serwist 9.5. The queue flushes to `POST /v1/sync` (API-18) with idempotency keys. Parties sign the **body**; the server assigns the chain position (seq, hash) in arrival order and adds a witness signature.
3. `services/api` is a FastAPI **modular monolith** (`tola_api.<module>`). Modules talk only through their `service.py` public functions.
4. Modules: auth, shops, ledger, voice, agents, reconciliation, disputes, settlements, payments, passport, notifications.
5. `ledger` is the only writer of `ledger_events`. It verifies signatures and the chain using `tola_ledger_core`.
6. Postgres 16 holds the append-only events. Every write that has side effects also inserts an `outbox_jobs` row in the same transaction.
7. The worker relays the outbox to Cloud Tasks (prod) or RQ 2.12 + Redis 7 (local). It runs the weekly reconcile, reminders, the nightly chain verification and retention purges.
8. AI (Lyzr M-03, Sarvam M-01/M-02) **listens, extracts, explains and drafts**. It never computes grams, and its output never gets signed without a human gate.
9. WhatsApp/IVR confirmations arrive at API-19. They are signed with the karigar's KMS-held **custodial** key (`person_keys.key_label = custodial`), which only unlocks with his PIN.
10. Deployment is Cloud Run ×3 (web, api, worker) plus Cloud SQL, GCS and Secret Manager in asia-south1, managed by Terraform in `infra/terraform`.

## 4. Folder rules
- **Gold maths lives only in `packages/ledger-core`.**
  - The `ts/` and `py/` implementations must pass the same `tests/vectors/chain_v1.json` (spec: [ARCHITECTURE §9](../../docs/03-engineering/ARCHITECTURE.md#9-hash-chain-and-signature-specification)).
  - If you change one, change the other and add a vector in the same PR.
- **Inside `services/api/src/tola_api/<module>/`:**
  - `router.py` holds HTTP only;
  - `service.py` holds use cases and is the public API of the module;
  - `repo.py` is SQL;
  - `models.py` holds the SQLAlchemy models;
  - `schemas.py` holds the Pydantic models;
  - `jobs.py` holds the RQ jobs.
  - Never import another module's `repo` or `models`.
- **Migrations** live in `services/api/migrations/versions/`.
  - One migration per PR. Never edit a merged migration.
  - Never `UPDATE` or `DELETE` rows in `ledger_events` or `signatures`. A DB trigger rejects it anyway.
- **UI components** live in `packages/ui`. App-specific composition goes in `apps/web/src/features/<feature>/`.
- **Prompts** live in `ai/prompts/<agent>/<version>.md`. Bump the version on every change; never edit a released version in place.
- **The API contract** is `../../api/openapi.yaml` (shared with the demo).
  - Change the contract **first** in its own commit, scoped `openapi`.
  - Then implement it, and the Schemathesis tests must pass.
- **This folder** must not import anything from `implementation/demo/`, and the demo must not import from here.

## 5. Do / Don't
**Do**
- Store weights as **integer milligrams** (`weight_mg`) and fineness as parts per thousand (`fineness_ppt`). Fine gold = `floor(weight_mg × fineness_ppt / 1000)`; wastage allowed = `floor(issued_mg × norm_bps / 10000)`. Always via `ledger-core`.
- Use UTC `timestamptz` everywhere. Convert to IST (Asia/Kolkata) only at the display edge.
- Give every mutating endpoint an `Idempotency-Key`. Clients generate event IDs as UUIDv7.
- Return errors as RFC 9457 `application/problem+json` with a stable `UPPER_SNAKE` code from API_SPEC (see [BACKEND.md §8](docs/BACKEND.md#8-error-model)).
- Read every number back to the user (F-02). Gram figures use DM Mono.
- Keep karigar routes inside the JS budget: **≤ 250 KB gzipped** (PRD). Check with `pnpm --filter @tola/web analyze`.
- Write tests first for anything in `ledger`, `reconciliation`, `settlements` or `ledger-core`. Property tests are mandatory there.

**Don't**
- Don't use `float`/`Number` arithmetic for grams or rupees. Rupees are integer **paise**.
- Don't let an LLM output a number that goes into a ledger event without a scale reading or a human-typed confirmation. AI output is a *draft*.
- Don't add new third-party scripts, analytics or trackers to the web app.
- Don't compute or display a "credit score". The passport is a raw consented record only (R-06).
- Don't add blockchain or token dependencies (non-goal).
- Don't call real Lyzr/Sarvam/PSP/WhatsApp in tests. Use `respx` mocks or `AI_FALLBACK_MODE=cached`.

## 6. Security and PII rules
- **No secrets in code, fixtures or commits.** Everything comes from env, which in GCP is Secret Manager. `.env` is git-ignored; `gitleaks` runs in CI.
- **PII fields** are phone, name, voice audio, transcripts, photos, PM Vishwakarma ID, GSTIN and UPI VPA.
  - Never log them. Use `get_logger()`, which applies the redaction processor.
  - Phones appear in logs only as `phone_h` (an HMAC computed with `TOLA_PII_HASH_KEY`).
- **Test data is synthetic only.** Use the Faker `en_IN`/`hi_IN` locales and the seed script. Never paste a real karigar's details into a fixture, prompt, issue or eval.
- **Private keys never leave the device** unencrypted. Server code must never accept, log or store a user's private key. The only exception is the custodial WhatsApp/IVR key, which is KMS-held.
- **Authorisation** is checked in `service.py` via `authz.require(...)`, not only in the router. Postgres RLS (`app.current_person_id`) is the second line of defence.
- **AI calls** send the minimum fields needed. Pseudonymise person names to `K1`/`J1` in prompts.

## 7. Evals
- Datasets live in `ai/evals/datasets/`. They are synthetic and versioned.
- Before merging any change to `ai/` or to `tola_api/agents`, run the evals locally with `--mode cached` (deterministic replay).
- `evals.yml` runs `--mode live` nightly and on PRs labelled `ai-live`.
- Thresholds are defined in [`docs/04-ai/AI_EVALS.md`](../../docs/04-ai/AI_EVALS.md).

## 8. Key docs
[Architecture](../../docs/03-engineering/ARCHITECTURE.md) · [Data model](../../docs/03-engineering/DATA_MODEL.md) · [API spec](../../docs/03-engineering/API_SPEC.md) · [Security architecture](../../docs/06-security-compliance/SECURITY_ARCHITECTURE.md) · [Privacy](../../docs/06-security-compliance/PRIVACY.md) · [Models](../../docs/04-ai/MODELS.md) · [Frontend](docs/FRONTEND.md) · [Backend](docs/BACKEND.md) · [Testing](docs/TESTING.md) · [Performance](docs/PERFORMANCE.md) · [Git workflow](docs/GIT_WORKFLOW.md)
