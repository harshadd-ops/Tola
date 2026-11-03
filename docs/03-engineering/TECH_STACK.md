# Tech Stack
> Project: Tola · Owner: Tech lead · Status: Draft v0.1 · Last updated: 2026-10-20
> Related: [Project brief §10](../00-overview/PROJECT_BRIEF.md) · [Architecture](ARCHITECTURE.md) · [ADRs](ARCHITECTURE.md#13-adr-index) · [Integrations](INTEGRATIONS.md) · [AI models](../04-ai/MODELS.md) · [CI/CD](../../implementation/scalable/docs/CICD.md)

Versions come from the brief (checked 2026-10-20 via npm/PyPI). Packages that this doc adds beyond the brief were checked on the same date with `npm view` / `pip index versions` and are marked †. **MVP (hackathon)** = `implementation/demo`. **v1 (production)** = `implementation/scalable`.

## 1. Stack table

| Layer | MVP (demo) | v1 (scalable) | Why (Karpathy: simplest thing that works) | Alternatives rejected | Licence |
|---|---|---|---|---|---|
| Web framework | **Next.js 16.4** (App Router), **React 19.3**, **TypeScript 5.9** | Same + PWA service worker | One codebase for the jeweller desktop, the karigar phone and the lender view; RSC for fast first paint on cheap phones | Remix (smaller ecosystem for HeroUI v3), Flutter (a second language, no web-first lender view), native Android (too slow to build in 3 weeks) | MIT |
| UI kit | **HeroUI v3.2** (`@heroui/react`, `@heroui/styles`) | Same, in `packages/ui` | React Aria accessibility (44 px targets, screen readers), compound components, Tailwind 4 native | shadcn/ui (more hand assembly), MUI (heavy, Material look clashes with the Sarvam style) | MIT |
| Styling | **Tailwind CSS 4.3** with Vakyam/Sarvam tokens (`docs/02-design/reference/vakyam-tokens.css`) | Same | Tokens as CSS variables; no runtime CSS-in-JS | CSS Modules (slower iteration), Emotion (runtime cost) | MIT |
| Motion | **Motion 14.4** (`motion/react`) springs | Same | Apple-style interruptible springs, `useReducedMotion` | GSAP (licence/complexity), React Spring (smaller community now) | MIT |
| Fonts | Fraunces Variable, Figtree Variable, DM Mono, Mukta, Noto Sans Bengali / Kannada via Fontsource (self-hosted) | Same | No third-party font CDN (privacy, offline); DM Mono for every gram figure | Sarvam's Matter / Season Mix (proprietary, not used) | OFL-1.1 |
| Client state / data | Zustand 5, TanStack Query 5, Zod 4 | Same + **Dexie 4.4** (IndexedDB outbox) | Small, typed; Zod mirrors the Pydantic schemas | Redux (boilerplate), RxDB (heavier than needed) | MIT / Apache-2.0 |
| i18n | `next-intl` 4.14: en, hi, kn, bn | + mr, ta | App Router support, ICU plurals, number formatting in Indian grouping | i18next (more glue for RSC) | MIT |
| Client crypto | `@noble/ed25519` 3.2; WebCrypto SHA-256; `canonicalize` 5.1.0† (RFC 8785) | Same; keys wrapped by a PIN (WebCrypto AES-GCM); WebAuthn/passkey ES256 (v1.1) via `@simplewebauthn/browser` 14.0.0† | Audited, dependency-free Ed25519; runs on old Android Chrome | TweetNaCl-js (older), libsodium.js (large WASM) | MIT |
| API | **FastAPI 0.153**, **Pydantic 2.14**, **Uvicorn 0.54**, Python **3.12+** | Same, modular monolith | Typed contract → OpenAPI 3.1; the team's AI/voice code is Python | Node/Nest (would split AI code from the API), Django (heavier) | MIT / BSD |
| Server crypto | **PyNaCl 1.6** (Ed25519), `hashlib` SHA-256, `rfc8785` 0.1.4† | Same + `webauthn` 3.0.1† / `cryptography` 50.0.2† for ES256 passkey signatures; server key in Secret Manager; custodial keys in Cloud KMS | libsodium bindings, constant-time | `cryptography` (fine; PyNaCl is closer to noble's API) | Apache-2.0 |
| Domain core | `ledger_core` Python module inside the API | `packages/ledger-core` (Python package + TS port for client verify) | Pure integer functions, golden vectors shared ([ADR-0006](adr/ADR-0006-integer-mg-deterministic-ledger-core.md)) | Doing the arithmetic in SQL or an LLM | Apache-2.0 (ours) |
| IDs | UUIDv7 (`uuid6` 2025.0.1† in Python, `uuidv7` 1.2.1† in TS) plus human ids (`ORD-0014`) | Same | Time-ordered, offline-generatable | ULID (fine, but less standard) | MIT |
| Database | **SQLite** file via **SQLAlchemy 2.1** | **PostgreSQL 16** (Cloud SQL) via SQLAlchemy 2.1 + **Alembic 1.20** | Zero-ops demo; Postgres for concurrency, row locks and PITR ([ADR-0004](adr/ADR-0004-sqlite-demo-postgres-scalable.md)) | MongoDB (weak multi-row transactions for chain appends), Firestore (no `FOR UPDATE`) | Public domain / PostgreSQL / MIT |
| Cache / queue | None (inline jobs) | **Redis 7** (Memorystore) + **RQ** 2.12.0† workers; **Cloud Tasks**; **Cloud Scheduler** | The demo's "Run week" button is synchronous; v1 needs retries and a schedule | Celery (heavier config), Pub/Sub (over-kill for the pilot) | BSD / Apache-2.0 |
| PDF (GST drafts) | ReportLab 5.0.1† | Same | Pure Python, no system libraries (WeasyPrint needs Pango, which is painful on Render) | WeasyPrint 70.0 (rejected for system dependencies) | BSD |
| QR (UPI) | `qrcode` 8.2† (server PNG/SVG) | Same | Standard, tiny | Client-side QR libraries (fine; server keeps the PDF consistent) | BSD |
| Scale I/O | Web Serial API (Chrome/Edge desktop + Android Chrome) + simulated widget | + Web Bluetooth (BLE); display OCR with OpenCV `opencv-python-headless` 5.0.0.93† server-side or a WASM template matcher | No driver install; see [HARDWARE.md](HARDWARE.md) | Native USB driver app | — |
| AI agents | `lyzr-adk` **0.1.12** (Lyzr Agent Studio), provider `gpt-4o-mini` | Same; Gemini Flash via Lyzr as fallback | Sponsor AI Partner; governed agents with traces ([ADR-0007](adr/ADR-0007-lyzr-agents-sarvam-speech-fallback.md)) | Raw OpenAI SDK (loses sponsor alignment and traces), Lyzr Automata (experimental) | Proprietary SaaS |
| Speech | `sarvamai` **0.1.37**: Saaras `saaras:v3` STT, Bulbul v3 TTS; real-time clips ≤ 30 s | `saaras:v4` STT (Sarvam's current default), Bulbul v3; audio > 30 s via Sarvam batch; IndicConformer / IndicF5 self-host as fallback | Best Indic quality per rupee; ₹30/hr STT | Bhashini (proof-of-concept use only for prototypes; kept as the sovereign v1 option), Google STT (weaker on code-mixed Bengali; cost) | Proprietary SaaS |
| Payments | UPI intent link `upi://pay` + QR (**simulated**, no money moves) | PSP: Razorpay / Cashfree / PhonePe PG intent/collect + webhook | No licence needed for the demo; v1 uses a regulated PSP | Holding funds ourselves (needs a PA licence: non-goal) | — |
| Messaging | Simulated phone frame | Meta WhatsApp Cloud API; IVR via Exotel or Sarvam Voice Agents; OTP SMS provider (`OTP_PROVIDER_KEY`) | Karigars live in WhatsApp; IVR for feature phones | SMS-only (no rich confirm) | — |
| Auth | None: role switcher + `X-Tola-Persona` header ([ADR-0008](adr/ADR-0008-no-login-demo-role-switcher.md)) | Phone OTP → short-lived JWT (15 min) + refresh (30 d), device-bound Ed25519 key | Low literacy: phone number only, no passwords, no Aadhaar | Aadhaar e-KYC (needs AUA licence), email/password | — |
| Hosting | Web on **Vercel**, API on **Render**; or one **Docker Compose** | **GCP asia-south1**: Cloud Run (web, api, worker), Cloud SQL, Cloud Storage, Secret Manager, Memorystore; **Terraform** ([ADR-0009](adr/ADR-0009-gcp-asia-south1-hosting.md)) | Free/cheap demo hosting; India data residency for v1 | AWS ap-south-1 (equally valid; team GCP credits and Cloud Run simplicity decided it) | — |
| Observability | Uvicorn logs + `/v1/health` | OpenTelemetry → Cloud Trace/Logging (`OTEL_EXPORTER_OTLP_ENDPOINT`), Sentry (optional) | PII-redacted structured logs | Datadog (cost) | — |
| Tests | **Vitest 5**, **Playwright 1.64**, **pytest 9** | + Schemathesis contract tests, **k6** load | Golden chain vectors shared by Python and TS | Jest (slower with ESM) | MIT |
| CI | GitHub Actions `demo-ci.yml` | `scalable-ci.yml`, `scalable-deploy.yml`, `evals.yml` (path-filtered) | Free for public repos | — | — |
| Containers | Docker, `docker-compose.yml` (web, api) | Docker images → Artifact Registry (asia-south1) | Same image runs locally and on Cloud Run | — | — |

## 2. Sponsor and India technology used
| Technology | Where | Visible in the demo |
|---|---|---|
| **Lyzr Agent Studio** (AI Partner) | M-03: Manager → IntakeAgent, ReconcileAgent, SettleAgent | Yes: an agent trace panel in the jeweller view, plus the Lyzr Studio graph on a slide |
| **Sarvam AI** | M-01 Saaras STT, M-02 Bulbul TTS | Yes: the Bengali read-back and "haan" confirm |
| **UPI** (NPCI) | F-07 intent link and QR | Yes, labelled "simulated" |
| **GST Rule 55** job-work challan | F-09 PDF draft | Yes, watermarked "DRAFT" |
| **PM Vishwakarma** | Optional ID on E-03 | Field only |
| Bhashini (MeitY) | v1 sovereign fallback for ASR/TTS (not verified 2026-10-20 for production terms) | No |

## 3. Runtime ports and environment
Fixed by the brief: web `3000`, api `8000`.

```dotenv
# --- web (both tracks) ---
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_DEMO_MODE=true            # true only in implementation/demo
# --- api (both tracks) ---
DATABASE_URL=sqlite:///./data/tola.db # v1: postgresql+psycopg://tola:***@/tola?host=/cloudsql/<conn>
LYZR_API_KEY=
LYZR_AGENT_ID_MANAGER=
LYZR_AGENT_ID_INTAKE=
LYZR_AGENT_ID_RECONCILE=
LYZR_AGENT_ID_SETTLE=
SARVAM_API_KEY=
TOLA_SERVER_SIGNING_KEY=              # base64 32-byte Ed25519 seed; v1 from Secret Manager
TOLA_UPI_VPA=tola-demo@upi            # demo payee shown in intents (simulated)
TOLA_UPI_PAYEE_NAME=Tola Demo
AI_FALLBACK_MODE=live                 # live | cached | off
DEMO_RESET_TOKEN=change-me            # demo only: required header X-Demo-Reset-Token on POST /v1/demo/reset (API-02)
# --- scalable only ---
REDIS_URL=redis://10.0.0.3:6379/0
OTP_PROVIDER_KEY=
WHATSAPP_TOKEN=
WHATSAPP_PHONE_ID=
IVR_PROVIDER_KEY=
PSP_KEY_ID=
PSP_KEY_SECRET=
GCS_BUCKET=tola-media-prod
OTEL_EXPORTER_OTLP_ENDPOINT=
```

## 4. Upgrade and pinning policy
- Pin exact versions in `package-lock.json` / `uv.lock`. Renovate runs weekly, and only for the scalable track.
- **Freeze the demo track on 20 Dec 2026** (one week before the 27 Dec finale). After that, only fixes go in.
- Models are pinned explicitly in every call: demo `saaras:v3` + `bulbul:v3`; scalable `saaras:v4` + `bulbul:v3` (brief M-01). Sarvam's docs (fetched 2026-10-20) say `saaras:v4` is now the STT default and recommend `bulbul:v4-flash` for new TTS integrations. Evaluate `bulbul:v4-flash` in [AI_EVALS](../04-ai/AI_EVALS.md) before switching. Owner: AI/voice lead, by 15 Nov 2026.
