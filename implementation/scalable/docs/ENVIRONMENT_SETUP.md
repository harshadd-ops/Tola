# Environment setup · Scalable track
> Project: Tola · Owner: Platform engineer · Status: Draft v0.1 · Last updated: 2026-10-20
> Related: [README](../README.md) · [CLAUDE.md](../CLAUDE.md) · [Backend](BACKEND.md) · [Testing](TESTING.md) · [Infrastructure](INFRASTRUCTURE.md) · [Deployment](DEPLOYMENT.md)

This doc sets up **v1 (production) code** for local development: Postgres 16 + Redis 7 in Docker, with the API, worker and web app on the host.

For the **MVP (hackathon)** demo you only need Node + Python. It uses SQLite and needs no Docker; see `implementation/demo/README.md`.

---

## 1. Prerequisites
| Tool | Version | Check | Notes |
|---|---|---|---|
| Git | ≥ 2.45 | `git --version` | `core.autocrlf=input` (Windows, see §3) |
| Node.js | **22 LTS** (≥ 22.12) | `node -v` | 22.19 was checked on the team machine, 2026-10-20 |
| pnpm | **12.14** via Corepack | `pnpm -v` | Pinned in `package.json` → `packageManager` |
| Python | **3.12** (3.13 allowed) | `python --version` | `requires-python >=3.12,<3.14` |
| uv | **0.13.x** | `uv --version` | Manages the venv + lockfile for `services/api` |
| Docker | Engine **29.x** / Docker Desktop with Compose v2 | `docker compose version` | Runs `postgres:16-alpine` and `redis:7-alpine` |
| Chrome | stable | — | Web Serial / Web Bluetooth (F-01) and PWA install testing |
| Optional: k6 | via Docker `grafana/k6` | — | Load tests ([TESTING §6](TESTING.md#6-load-tests-k6)) |
| Optional: gcloud + Terraform | latest | — | Only for `infra/terraform`; not needed for local dev |

Hardware: 8 GB RAM minimum (16 GB recommended with Docker Desktop) and 10 GB free disk.

## 2. Setup steps (all OSes)
```bash
git clone <repo-url> tola && cd tola/implementation/scalable

# 1. Env
cp .env.example .env
#    Local defaults need no external keys:
#    AI_FALLBACK_MODE=cached, OTP_DELIVERY=console, TOLA_ENV=local
#    Generate the three local secrets:
python -c "import secrets,base64;print('TOLA_SESSION_SECRET='+base64.b64encode(secrets.token_bytes(32)).decode())" >> .env
python -c "import secrets,base64;print('TOLA_PII_HASH_KEY='+base64.b64encode(secrets.token_bytes(32)).decode())" >> .env
#    TOLA_SERVER_SIGNING_KEY: run after step 3 (needs PyNaCl):
#    uv run --directory services/api python -c "import nacl.signing,base64;print(base64.b64encode(bytes(nacl.signing.SigningKey.generate())).decode())"
#    Later lines in .env win, so the appended values override the empty placeholders.

# 2. JS workspace
corepack enable
pnpm install

# 3. Python (API + worker + ledger-core editable)
uv sync --directory services/api

# 4. Infra: Postgres 16 + Redis 7
pnpm infra:up
docker compose -f infra/docker/docker-compose.yml ps   # both "healthy"

# 5. Schema + synthetic seed
pnpm db:migrate
pnpm seed            # prints seeded phone numbers (fake +91 70000 0xxxx range)

# 6. Run (three terminals)
pnpm api:dev         # http://localhost:8000/v1/health → {"status":"ok"}
pnpm worker:dev      # RQ worker + local scheduler
pnpm dev             # http://localhost:3000
```
**Log in.**
1. Open `http://localhost:3000/en/login`.
2. Enter a seeded number.
3. Copy the OTP from the API terminal. It is logged only because `OTP_DELIVERY=console`.
4. Set a PIN.

**Full containerised stack.** Run `pnpm stack:up` (Compose profile `app`: migrate, api, worker, web). It needs `services/api/Dockerfile`, `services/worker/Dockerfile` and `apps/web/Dockerfile`, which are backlog items under "Scalable skeleton". Owner: back-end lead. Due: 2027-01-15.

### Seed data
- `pnpm seed` runs `python -m tola_api.scripts.seed --synthetic --shops 3 --karigars-per-shop 8`.
- It creates 3 shops, 24 karigars, wastage norms, orders and about 2,000 dual-signed events over 8 weeks with valid chains, plus 3 open disputes and 1 settlement awaiting approval.
- Everything is fictional: Faker `en_IN`/`hi_IN` with a fixed RNG seed. Signing keys are generated per seeded person and printed only in `TOLA_ENV=local`.
- The seed refuses to run when `TOLA_ENV` is `staging` or `prod`.
- **Reset:** `pnpm infra:reset && pnpm infra:up && pnpm db:migrate && pnpm seed`.

### Test database
- Integration tests start their own Postgres 16 / Redis 7 through `testcontainers`. They do not touch your dev DB.
- To reuse the Compose services instead, set `TOLA_TEST_DATABASE_URL=postgresql+asyncpg://tola:tola_local_only@localhost:5432/tola_test` and create the DB first with `docker compose -f infra/docker/docker-compose.yml exec postgres createdb -U tola tola_test`. `TOLA_TEST_DATABASE_URL` is test-only and not app config.

## 3. Per-OS notes
### Windows 11
- **Recommended: WSL2 (Ubuntu 24.04)** with Docker Desktop's WSL integration. Clone the repo **inside the WSL filesystem** (`~/code/tola`), not under `/mnt/c`. File watching and IndexedDB-heavy test runs are several times faster there.
- **Native Windows also works** (PowerShell 5.1/7 or Git Bash):
  - Install Python 3.12 from python.org and tick "Add to PATH".
  - Install uv with `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"`.
  - Install Node 22 LTS with the official installer or `winget install OpenJS.NodeJS.LTS`.
  - `cp` → `Copy-Item .env.example .env` in PowerShell.
  - The `test:load` script uses `$PWD` and needs Git Bash or WSL.
- **Line endings:**
  - run `git config --global core.autocrlf input`;
  - the repo's `.gitattributes` sets `* text=auto eol=lf`;
  - CRLF in `docker-entrypoint` scripts or `.sh` files breaks the containers.
- **Port conflicts.** A local PostgreSQL service on 5432 conflicts with Compose. Stop it (`Stop-Service postgresql*`) or change the host port in Compose to `"5433:5432"` and update `DATABASE_URL`.
- **Web Serial** works in desktop Chrome on Windows. Install the balance's USB-serial driver (CH340/FTDI) first.

### macOS (Apple silicon or Intel)
- `brew install node@22 uv git` and `brew install --cask docker` (or OrbStack).
- Both images (`postgres:16-alpine`, `redis:7-alpine`) are multi-arch, so no Rosetta is needed.
- If `pnpm install` fails building `sharp`, run `xcode-select --install`.

### Linux (Ubuntu 22.04/24.04, Fedora 40+)
- Node 22 via NodeSource or `fnm`; uv via `curl -LsSf https://astral.sh/uv/install.sh | sh`.
- Docker Engine + the compose plugin from Docker's apt/dnf repo. Add your user to the `docker` group.
- **Web Serial / BLE on Linux:** add your user to `dialout` for USB-serial balances. BlueZ ≥ 5.66 is needed for Web Bluetooth (not verified 2026-10-20).

## 4. Environment variables
The full list, with comments, is in [`.env.example`](../.env.example).

The names from the brief (PROJECT_BRIEF §10):
- `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_DEMO_MODE`, `DATABASE_URL`;
- `LYZR_API_KEY`, `LYZR_AGENT_ID_MANAGER`, `LYZR_AGENT_ID_INTAKE`, `LYZR_AGENT_ID_RECONCILE`, `LYZR_AGENT_ID_SETTLE`;
- `SARVAM_API_KEY`, `TOLA_SERVER_SIGNING_KEY`, `TOLA_UPI_VPA`, `TOLA_UPI_PAYEE_NAME`, `AI_FALLBACK_MODE`;
- scalable additions: `REDIS_URL`, `OTP_PROVIDER_KEY`, `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `IVR_PROVIDER_KEY`, `PSP_KEY_ID`, `PSP_KEY_SECRET`, `GCS_BUCKET`, `OTEL_EXPORTER_OTLP_ENDPOINT`.

**Additional variables this track needs** are marked `[SCALABLE-EXTRA]` in `.env.example`. They were reported to the brief owner for adoption.

| Var | Why |
|---|---|
| `TOLA_ENV` | local / test / staging / prod guards: console OTP, simulated scale, seed refusal |
| `TOLA_CORS_ORIGINS` | Allowed web origins |
| `LOG_LEVEL` | Log verbosity |
| `TOLA_SESSION_SECRET` | Signs session JWTs (API-17) |
| `TOLA_PII_HASH_KEY` | HMAC for `phone_h` pseudonyms in logs |
| `TOLA_CUSTODIAL_KEY_KMS` | Cloud KMS key holding the custodial WhatsApp/IVR keys (`person_keys.key_label = custodial`, F-12) |
| `TOLA_JOB_BACKEND` | `rq` (local, Compose) or `cloudtasks` (GCP) for outbox dispatch |
| `OTP_DELIVERY` | `console` (local) or `sms` |
| `PSP_WEBHOOK_SECRET` | Verifies API-20 webhooks |
| `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN` | Verifies and handshakes API-19 webhooks |

The test-only variables `TOLA_TEST_TOKEN` and `TOLA_TEST_DATABASE_URL` are never read by the app in `staging` or `prod`.

## 5. Troubleshooting
| Symptom | Cause | Fix |
|---|---|---|
| `connection refused :5432` | Postgres not healthy yet, or a local PG service is on the port | `docker compose … ps`; wait for healthy; stop the local service or remap the port |
| `asyncpg.InvalidPasswordError` | Old volume created with a different password | `pnpm infra:reset` (wipes local data), then migrate + seed |
| `ERROR: ledger is append-only` during a script | A script tried to UPDATE/DELETE events | Expected. Write an `ADJUSTMENT` event instead ([BACKEND §3](BACKEND.md#3-ledger-write-path)) |
| `POSSIBLE_DOUBLE_COUNT` warning in local testing | Two browser profiles recorded the same weighing offline | Expected (F-11). Resolve with a dispute or a signed ADJUSTMENT from the card on `/sync` |
| Web app shows the old UI after a change | Service worker cached the shell | DevTools → Application → Service Workers → "Update on reload", or run `pnpm dev`, which disables the SW in dev |
| `OTP not received` | `OTP_DELIVERY=console` | Read it from the API log; `sms` needs `OTP_PROVIDER_KEY` + a DLT template |
| AI features return template text | `AI_FALLBACK_MODE=cached` (default) | Set `live` + `LYZR_*` + `SARVAM_API_KEY` to call real services |
| `pnpm: command not found` | Corepack not enabled | `corepack enable` (in an admin shell on Windows) |
| `uv sync` cannot find `tola-ledger-core` | The `packages/ledger-core/py` package is not created yet | It is part of the "Scalable skeleton" epic; until then comment out the dependency in `pyproject.toml` |
| Hypothesis tests slow locally | `ci` profile active | `HYPOTHESIS_PROFILE=dev pnpm api:test` |
| IndexedDB quota errors in tests | Old `fake-indexeddb` state | Tests call `indexedDB.deleteDatabase("tola")` in `beforeEach`; clear site data in the browser |
