# Tola demo build
> Project: Tola · Owner: Tech lead (demo track) · Status: Built v0.2 · Last updated: 2026-10-21
> Related: [Project brief](../../docs/00-overview/PROJECT_BRIEF.md) · [Demo spec](./docs/DEMO_SPEC.md) · [Front end](./docs/FRONTEND.md) · [Back end](./docs/BACKEND.md) · [User journeys §6](../../docs/01-product/USER_JOURNEYS.md) · [Architecture](../../docs/03-engineering/ARCHITECTURE.md) · [Scalable build](../scalable/README.md)

**Two signatures on every gram.** This folder holds the **prototype for demonstration**: a polished, no-login web app that walks judges through one scripted week at Shetty Jewellers in about 3 minutes. It covers features **F-01 to F-09, F-13 and F-14**. The production path (OTP auth, Postgres, offline PWA, WhatsApp/IVR, GCP Mumbai) is in [`implementation/scalable`](../scalable/README.md).

## What you will see
One week, one karigar, one disputed gram line (canonical numbers from [PROJECT_BRIEF §2](../../docs/00-overview/PROJECT_BRIEF.md)):

| Day | Moment | Feature |
|---|---|---|
| Mon | Suresh places **40.000 g** of 22K on the scale and issues it to Rafiq for **Order #14** (plain bangle pair, norm **2.50%**). Rafiq's phone reads it back in Bengali, he taps "haan", and two signatures seal the event. | F-01, F-02, F-03 |
| Thu | Rafiq returns the piece (**38.120 g**) and scrap (**0.500 g**) with a Bengali voice note. The intake agent turns it into a structured return. | F-04 |
| Sat | "Run week": the reconciliation agent flags Order #14 at **+0.380 g** over norm (≈ ₹5,188). Rafiq disputes by voice. Both sign a **0.130 g** rework adjustment; **0.250 g** (0.229 g fine) stays on his balance. | F-05, F-06, F-13 |
| Sun | Settlement goes to both: two ticks, then a **simulated** UPI intent for **₹5,040** (₹4,800 labour + ₹240 GST). Rafiq shares his Work Passport; a **mock** lender view opens; the GST job-work **draft** PDF is generated. | F-07, F-08, F-09 |

Full script, clicks and timings: [docs/DEMO_SPEC.md](./docs/DEMO_SPEC.md).

## Quick start
Prerequisites: Node 22.12+, Python 3.12+. Details for Windows, macOS and Linux: [docs/ENVIRONMENT_SETUP.md](./docs/ENVIRONMENT_SETUP.md).

```bash
cp .env.example .env                       # AI_FALLBACK_MODE=cached works with no keys at all
cp .env.example apps/web/.env.local
```

| What | One command (from `implementation/demo`) | URL |
|---|---|---|
| API | `cd services/api && uv run --extra dev tola-seed --reset && uv run uvicorn tola_api.main:app --reload --port 8000` | http://localhost:8000/docs |
| Web | `cd apps/web && npm install && npm run dev` | http://localhost:3000/stage |
| Both, in Docker | `docker compose up --build` | http://localhost:3000/stage |

No `uv`? Use `python -m venv .venv`, activate it, then `pip install -e ".[dev]"`, `tola-seed --reset` and `uvicorn tola_api.main:app --reload --port 8000`.

## Demo mode
- **No login, ever.** `/stage` shows the jeweller's console and Rafiq's phone side by side; the explore pages (`/jeweller`, `/karigar`, `/ledger`, lender view) are one click away in the nav. Nothing is behind an account.
- **Story mode** (`/stage`): a floating story rail with 13 beats grouped by day. **→ / Space** next (performs the beat if it has not happened: Skip), **←** back, **R** replay the beat, **Shift+R** reset the week, `1`–`9` `0` `-` `=` `\` jump, **N** presenter line, **?** what is real vs simulated, **D** theme. The control to press next has a soft indigo cue ring; beats on the same surface flow on by themselves (Capture → Sign → হ্যাঁ).
- **The server owns every number.** Each click calls `POST /v1/demo/steps/{id}/perform`, which runs the same deterministic step functions as `POST /v1/demo/reset`; the UI renders `GET /v1/demo/state`. A live run and a replay produce byte-identical hashes.
- **Live mirror.** Open `http://<laptop-ip>:3000/karigar` on a real phone on the same Wi-Fi: it follows the story within a second (the web app proxies `/v1` to the API, so only port 3000 needs to be reachable).
- **AI fallback.** `AI_FALLBACK_MODE=cached` (the stage default) never touches the network. Agent text comes from the seed and is labelled "Draft by Tola's … agent (Lyzr) · cached".
- **Audio.** `seed/audio/` currently holds placeholder tones (`seed/audio/SOURCE` = `placeholder`), so the phone shows word-by-word Bengali captions and says "Read-back recording pending". Run `python scripts/bake_audio.py --live` with `SARVAM_API_KEY` set to bake real Bulbul read-backs; the phone then plays them. Record the two voice notes (S04, S06) with a Bengali speaker, with consent.

## Real vs mocked
| Part | In this demo | Notes |
|---|---|---|
| Gram arithmetic (balance, wastage, variance, fine gold) | **Real** | `ledger-core`, integer mg, fineness ‰. AI never computes grams. |
| Hash chain (SHA-256) and signatures (Ed25519) | **Real** | The API signs with **demo-derived** persona keys (PyNaCl); `/stage` S13 and `/ledger` re-check every signature and link **in the browser** with `@noble/ed25519`. Demo keys are not secure, and are labelled. |
| Tamper detection | **Real** | `/ledger` edits one stored byte in a sandbox copy; status shows "broken at event R6". |
| Scale capture | **Simulated** widget; optional **real** serial balance via Web Serial (Chrome/Edge) | `source` is recorded (`simulated`, `serial`, `manual_dual`). |
| Voice read-back (TTS) | Sarvam Bulbul v3 baked by `scripts/bake_audio.py --live`; **placeholder until then** (captions only, labelled) | M-02 |
| Voice notes (STT) | **Real** Sarvam Saaras v3 when `live` with the mic; seeded clips and transcripts otherwise | M-01 |
| Agents (intake, reconcile explanation, settlement narrative) | **Real** Lyzr agents when `live`; cached replies, then templates | M-03; human gate before every signature |
| Weekly reconciliation | **Real** computation, button-triggered | Scheduled only in v1 |
| UPI | **Simulated**: real `upi://pay` URI and QR, labelled "Simulated, no money moves"; no PSP call | API-14 |
| Work Passport share link | **Real** token, expiry and revocation | API-15 |
| Lender view | **Mocked** and labelled "Mocked lender view" | No AA/ULI call, no score |
| GST Rule 55 challan / labour invoice | **Real PDF, labelled DRAFT** | The CA files; nothing is filed |
| WhatsApp / IVR | **Simulated** phone frame on screen | F-12 is v1 |
| History before the story week | **Synthetic** (H- orders in the seed) | Real chain and signatures over synthetic data |

## Folder map
```
implementation/demo/
├─ apps/web/            Next.js 16 App Router · HeroUI v3 · Tailwind 4 · Motion   (port 3000)
├─ services/api/        FastAPI · SQLite · ledger-core · Lyzr/Sarvam clients       (port 8000)
├─ seed/                story.json (the scripted week) · audio/ · ai-cache/ · photos/
├─ scripts/             bake_audio.py, bake_ai_cache.py, stage-check.sh
├─ tests/               cross-cutting fixtures (story replay data)
├─ docs/                DEMO_SPEC · FRONTEND · BACKEND · ENVIRONMENT_SETUP · TESTING · DEPLOYMENT · CODING_STANDARDS
├─ docker-compose.yml   web + api on one VM or a stage laptop
└─ .env.example
```

## Docs
- [DEMO_SPEC.md](./docs/DEMO_SPEC.md): the story, routes, role switcher, stepper, seed, fallbacks and 3-minute choreography.
- [FRONTEND.md](./docs/FRONTEND.md): App Router structure, components, Zustand, tokens, springs, scale widget, phone frame and perf budget.
- [BACKEND.md](./docs/BACKEND.md): FastAPI layout, ledger-core, AI clients, endpoints and reset.
- [ENVIRONMENT_SETUP.md](./docs/ENVIRONMENT_SETUP.md) · [TESTING.md](./docs/TESTING.md) · [DEPLOYMENT.md](./docs/DEPLOYMENT.md) · [CODING_STANDARDS.md](./docs/CODING_STANDARDS.md)
- For AI coding agents: [CLAUDE.md](./CLAUDE.md).
