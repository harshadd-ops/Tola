# Project Brief: Tola
> Project: Tola · Owner: Product lead · Status: Draft v0.1 · Last updated: 2026-10-20
> Related: [PRD](../01-product/PRD.md) · [Architecture](../03-engineering/ARCHITECTURE.md) · [Design](../02-design/DESIGN.md) · [Demo build](../../implementation/demo/README.md) · [Scalable build](../../implementation/scalable/README.md)

**This file is the single source of truth.** Every other doc uses the names, IDs, versions, ports and env vars defined here. If a doc disagrees with this file, this file wins. Fix the doc.

---

## 1. Identity
| Item | Value |
|---|---|
| Product name | **Tola** (तोला / তোলা). A *tola* is the traditional South Asian gold-weight unit, about 11.66 g. |
| One-liner | **Two signatures on every gram.** |
| Long one-liner | A gold job-work ledger that jeweller and karigar both sign. The scale captures the weight, the karigar confirms by voice in his own language, an AI agent reconciles it weekly, and the karigar gets a Work Passport that makes him creditworthy. |
| Hackathon | Tech4Bharat · GAVS Hackathon 2026 (JanAI Mass Entrepreneurship challenge), Theme 2 Jeweltech |
| Problem statement | **PS 2.2:** "Gold given to karigars for job-work is tracked on trust, and disputes follow" (track: Agentic AI) |
| Idea type | Doesn't exist (no jewellery ERP gives the karigar his own signed account) |
| Council score | 8.4/10 (pain 8 · novelty 9 · alignment 9 · demo 8 · feasibility 8 · India 9 · business 8 · legal 8 · moonshot 8) |
| Source | `~/hackathons/tech4bharat-gavs-hackathon/ideas.md` → Theme 2, Idea 1; war-room log `war-room/jeweltech.md`; research `research/domains/jeweltech.md` |

## 2. Problem
- **The handover.** Jewellers issue gold by weight to karigars, artisan goldsmiths who often work for several jewellers at once. They get finished pieces back with an agreed wastage allowance: about 2–3% for plain work, 20–30% for studded and about 4% for antique (IIMA/XLRI field study, cited in the domain research [S17]).
- **The record.** Issue, return, wastage, deadlines and payment live in notebooks and slips. Wastage is "agreed verbally" and accounts are squared at month end (PS 2.2 text).
- **The cost.** One karigar typically holds ₹4–5 lakh of someone else's gold [S17]. At about ₹1.49 lakh per 10 g of 24K gold (20 Oct 2026) [S47], a 1 g disagreement costs about ₹13,650 at 22K (≈ ₹15,000 at 24K), roughly a month of a small-town goldsmith's income (₹10–20k/month, Coimbatore survey [S18]).

**Canonical demo numbers** (from [USER_JOURNEYS §6](../01-product/USER_JOURNEYS.md); every doc, the seed and the pitch use these):

| Item | Value |
|---|---|
| Order | Order #14: plain 22K bangles, wastage norm **2.50% of gross issued** |
| Issue | **40.000 g** |
| Return | piece **38.120 g** + scrap **0.500 g** |
| Wastage | allowed **1,000 mg**; actual loss **1,380 mg** |
| Variance flag | **+380 mg** (≈ ₹5,188) |
| Dispute outcome | agreed adjustment **130 mg** → **250 mg gross (229 mg fine)** remains on Rafiq's balance |
| Settlement | labour **₹4,800** (HUNCH) + 5% GST **₹240** → UPI intent **₹5,040** |
- **Who loses.** Disputes sour long relationships, wedding dates slip, and the karigar waits weeks for pay. The karigar has less power, so he usually absorbs the loss.
- **The hint.** PS 2.2's "Following the money" line: *"A karigar with a clean record of work delivered looks very different to anyone deciding whether to trust him."*
- **The rules we must keep** (PS 2.2 *Boundaries*): **"Settlements go to both parties for approval, and each karigar has full access to his own account."**

## 3. Target users (personas, detailed in PERSONAS.md)
| ID | Persona | Role | Device / language |
|---|---|---|---|
| P-01 | **Suresh Shetty**, 52 | Owner of a 2-counter jewellery shop (Avenue Road, Bengaluru); 8 karigars; 30–60 open custom orders in wedding season | Mid-range Android + shop desktop; Kannada, English |
| P-02 | **Rafiq Sheikh**, 34 | Karigar, Zaveri-Bazaar-style workshop; works for 3 jewellers; holds about 180 g | ₹6–8k Android or a feature phone; Bengali, some Hindi |
| P-03 | **Lakshmi**, 28 | Counter / accounts staff at P-01's shop; issues and receives gold | Shop Android; Kannada, Hindi |
| P-04 | **Branch credit officer**, co-op bank / NBFC | Reads a karigar's consented Work Passport (v1, mocked in MVP) | Desktop browser; English |
| P-05 | **Head karigar / karkhana owner** | Runs a workshop with 5–15 helpers and one shared phone | Shared Android, offline-heavy; Bengali/Marathi |

Composite personas are grounded in cited research; see PERSONAS.md for sources. Names are illustrative, not real people.

## 4. The secret (Thiel)
The karigar's record is worth more to **him** than to the jeweller, because it is the only collateral he has. Make both parties sign every gram and give the karigar an uneditable copy. The ledger then becomes **dispute insurance for the jeweller** and **a credit file for the karigar**. Every existing ERP (Marg, Jwelly, Online Munim, Synergics, SoniERP) is owner-side only [S25–S29].

**Network effect:** each karigar works for several jewellers, so every karigar onboarded pulls in his other jewellers.

## 5. Features (IDs are frozen; MoSCoW for the MVP/demo)
| ID | Feature | MoSCoW | In demo? | In scalable v1? |
|---|---|---|---|---|
| F-01 | **Scale-captured issue.** Weight comes from the balance (Web Serial/BLE, or display OCR); never typed. Photo, order type and the agreed wastage norm are logged. | Must | Yes (simulated scale + optional Web Serial) | Yes |
| F-02 | **Voice read-back and confirm.** The karigar hears the entry in his language (bn/hi/kn/mr/ta) and confirms with a tap or "haan". | Must | Yes (Sarvam TTS, cached-audio fallback) | Yes |
| F-03 | **Dual-signed, hash-chained event log.** Every event is signed by both parties (Ed25519) and SHA-256 chained, append-only. | Must | Yes (real) | Yes |
| F-04 | **Return capture.** Finished piece, scrap and dust are weighed back; a voice note plus a scale reading becomes a structured event (intake agent). | Must | Yes | Yes |
| F-05 | **Weekly reconciliation agent.** Fine-gold balance per karigar and per order; variance against the agreed norm is flagged the same week. | Must | Yes (one-click "run week") | Yes (scheduled) |
| F-06 | **Dispute thread.** A disputed line stays open and visible, never overwritten; the karigar can reply by voice; resolution needs both signatures. | Must | Yes | Yes |
| F-07 | **Two-party settlement and UPI intent.** Statement of gold owed, labour and dust credit goes to both parties; on dual approval a UPI payment intent opens. | Must | Yes (UPI intent link / QR, no real money) | Yes (PSP collect/intent) |
| F-08 | **Work Passport.** The karigar shares a consented summary (grams handled, on-time %, variance vs norm) via a time-boxed link. | Should | Yes (lender view mocked and labelled) | Yes (+ AA/ULI path later) |
| F-09 | **GST job-work draft.** Rule 55 delivery-challan and 5% labour-invoice drafts; the CA files. | Should | Yes (PDF draft, labelled "draft") | Yes |
| F-10 | **Order and deadline tracker.** Wedding-date orders across karigars with late-risk flags. | Could | Light (static list) | Yes |
| F-11 | **Offline-first PWA and sync.** IndexedDB queue; signed events sync later. | Should | No (online demo) | Yes |
| F-12 | **Karigar channel by WhatsApp / IVR.** Confirm and dispute without the app. | Should | Simulated phone frame on screen | Yes (WhatsApp Cloud API + IVR) |
| F-13 | **Jeweller dashboard.** Fine-gold balance by karigar, open orders, flags. | Must | Yes | Yes |
| F-14 | **Language and accessibility layer.** UI in en/hi/kn/bn; numbers always spoken back; 44 px targets. | Must | en/hi/kn/bn UI; bn/hi/kn voice | Yes (+ mr, ta) |

**Demo rule:** the demo has **no login**. A **role switcher** (Jeweller · Karigar · Lender) and a **guided story mode** walk through one scripted week. Seeded data, real crypto and real arithmetic.

## 6. Core entities (detailed in DATA_MODEL.md)
| ID | Entity | Notes |
|---|---|---|
| E-01 | `Shop` | Jeweller business (GSTIN optional, BIS registration no. optional) |
| E-02 | `Person` | Any human user (jeweller staff, karigar, lender officer); holds a public key |
| E-03 | `KarigarProfile` | Languages, PM Vishwakarma ID (optional), linked shops |
| E-04 | `Order` | Custom/job order: design, type (plain/studded/antique), due date, customer occasion date |
| E-05 | `WastageNorm` | Agreed % per order type per shop–karigar pair; versioned and signed |
| E-06 | `LedgerEvent` | `ISSUE` · `RETURN` · `SCRAP_RETURN` · `DUST_CREDIT` · `ADJUSTMENT` · `SETTLEMENT` · `DISPUTE_OPEN` · `DISPUTE_RESOLVE`. Append-only; `prev_hash`, `hash` |
| E-07 | `Signature` | Ed25519 signature per party per event |
| E-08 | `ScaleReading` | grams (to 0.01), source (`serial`, `ble`, `display_ocr`, `simulated`, `manual_dual`; the last is the M-04 fallback where both parties enter the same number), device id, photo |
| E-09 | `VoiceNote` | Audio ref, language, transcript, extracted fields, confidence |
| E-10 | `ReconciliationRun` + `VarianceFlag` | Weekly run; flag per order/karigar with expected vs actual |
| E-11 | `Dispute` | Linked to events; messages (text/voice); status |
| E-12 | `Settlement` | Period statement: gold balance, labour ₹, dust credit, signatures, UPI ref |
| E-13 | `PaymentIntent` | UPI deep link / QR; status (demo: `simulated`) |
| E-14 | `PassportShare` | Consent artefact: scope, recipient, expiry, revocation |
| E-15 | `ConsentRecord` | DPDP notice version, language, purpose, timestamp, withdrawal |
| E-16 | `Delegation` | Head karigar / karkhana owner signs on behalf of helpers (v1) |
| E-17 | `Checkpoint` | Daily signed chain checkpoint (stops server-side history rewrites) |
| E-18 | `ScaleDevice` | Registered balance: make/model, verification certificate ref (Legal Metrology), last calibration |

**Signature details (E-07):** fields `alg` (`ed25519`, or `es256` for passkeys), `key_id`, `assurance_tier` (`device_key` · `channel_whatsapp_ivr` · `witnessed_in_person`) and nullable WebAuthn fields. Verification accepts both algorithms.

**Ledger rules:** disputes may be opened up to **14 days** after signing; voice audio is kept **90 days**; a newly registered device waits **72 h** before it can sign settlements.

**Units:** all weights are stored as **integer milligrams**, so there is no float arithmetic on gold. Purity is stored as fineness in parts per thousand (e.g. 916 for 22K). Fine gold = weight × fineness / 1000.

## 7. API surface (names only; detailed in API_SPEC.md and `api/openapi.yaml`)
Base path `/v1`. JSON. The demo implements all endpoints marked ✓.

| ID | Method · Path | Purpose | Demo |
|---|---|---|---|
| API-01 | `GET /v1/health` | Liveness | ✓ |
| API-02 | `GET /v1/demo/personas` · `POST /v1/demo/reset` | Demo-only role list and seed reset | ✓ (demo only) |
| API-03 | `GET/POST /v1/shops/{shopId}/karigars` | List/add karigars | ✓ |
| API-04 | `GET/POST /v1/orders` · `GET /v1/orders/{id}` | Orders | ✓ |
| API-05 | `POST /v1/scale/readings` | Ingest a scale reading (serial/BLE/OCR/simulated) | ✓ |
| API-06 | `POST /v1/events` | Create a ledger event (issue/return/scrap/dust/adjust) and return the unsigned payload to sign | ✓ |
| API-07 | `POST /v1/events/{id}/signatures` | Add a party signature | ✓ |
| API-08 | `GET /v1/ledger?karigarId=&shopId=` | Event stream + verified chain status | ✓ |
| API-09 | `POST /v1/voice/readback` | TTS read-back of an event in a language (M-02) | ✓ |
| API-10 | `POST /v1/voice/intake` | Voice note → transcript → structured fields (M-01 + M-03) | ✓ |
| API-11 | `POST /v1/reconciliation/runs` · `GET /v1/reconciliation/runs/{id}` | Run the weekly reconciliation; flags | ✓ |
| API-12 | `POST /v1/disputes` · `POST /v1/disputes/{id}/messages` · `POST /v1/disputes/{id}/resolve` | Disputes | ✓ |
| API-13 | `POST /v1/settlements` · `POST /v1/settlements/{id}/approve` | Draft and dual-approve a settlement | ✓ |
| API-14 | `POST /v1/settlements/{id}/payment-intent` | UPI intent / QR | ✓ (simulated) |
| API-15 | `POST /v1/passport/shares` · `GET /v1/passport/{token}` · `DELETE /v1/passport/shares/{id}` | Work Passport share, view, revoke | ✓ |
| API-16 | `GET /v1/settlements/{id}/gst-draft` | Rule 55 challan / labour invoice PDF draft | ✓ |
| API-17 | `POST /v1/auth/otp/request` · `POST /v1/auth/otp/verify` | Phone OTP login | ✗ (scalable only) |
| API-18 | `POST /v1/sync` | Offline batch sync of signed events | ✗ (scalable only) |
| API-19 | `POST /v1/webhooks/whatsapp` · `POST /v1/webhooks/ivr` | Inbound karigar confirmations | ✗ (scalable only) |
| API-20 | `POST /v1/webhooks/psp` | UPI payment status | ✗ (scalable only) |
| API-21 | `GET /v1/me` | Current user, roles, feature flags | ✗ (scalable only) |
| API-22 | `POST /v1/telemetry` | Client analytics and performance beacons (PII-free) | ✗ (scalable only) |
| API-23 | `POST /v1/pairs/{pairId}/norms` · `POST /v1/norms/{id}/signatures` | Propose a wastage-norm version (E-05) and have both parties sign it | ✗ (scalable only; the demo seeds signed norms) |

**Contract tags:** `x-tola-track: both | demo-only | scalable-only`.

**Rounding (ledger-core):**
- `fine_mg = floor(mg × fineness / 1000)`
- `allowed_mg = floor(issued_mg × norm_bps / 10000)`
- money is held in paise, rounded half up.

**What parties sign:** the event body plus `readback_sha256` (the audio each signer heard), not the chain position.

## 8. AI models (detailed in MODELS.md)
**Principle: AI never does gram arithmetic.** All weights, balances and variances are computed by deterministic code in `ledger-core`. AI only listens, extracts, explains and drafts, and a human signs.

| ID | Task | Primary | Fallback |
|---|---|---|---|
| M-01 | Speech-to-text (karigar voice notes, "haan/na"). Real-time input ≤ **30 s** per clip; longer clips use the Batch API | Sarvam **Saaras** STT via `sarvamai` 0.1.37: `saaras:v3` in the demo, **`saaras:v4`** in the scalable build (keyterm prompting for trade words) | AI4Bharat IndicConformer-600M (self-host); demo: pre-recorded transcripts |
| M-02 | Text-to-speech read-back | Sarvam **Bulbul** v3 | Pre-generated audio clips (demo); AI4Bharat IndicF5 |
| M-03 | Agent LLM (intake extraction, reconciliation explanation, settlement narrative) | **Lyzr Agent Studio** (`lyzr-adk` 0.1.12) with `gpt-4o-mini` as provider | Gemini Flash via Lyzr; deterministic template if Lyzr is unreachable |
| M-04 | Scale display reader (seven-segment OCR) | Small on-device CNN / template matching (OpenCV) | Manual 2-person confirm (both type the same number) |
| M-05 | Variance anomaly scoring | Deterministic rules + robust z-score over the karigar's own history | — |

**AI cost gate:** AI must cost **≤ ₹40 per active karigar per month**.
- An all-Manager design costs about ₹398, against a price of ₹49–99.
- The optimised design in [MODELS §5.1](../04-ai/MODELS.md) gets to about ₹38:
  - routine calls skip the Manager;
  - reconciliation runs once per shop per week;
  - numbers are parsed deterministically before any LLM call.

**Traceability:** every AI output is stored in **E-19 `AiTrace`**: model, prompt version, input hash, output, latency, cost and the human decision.

**Flag codes (M-05):** `OVER_NORM` · `OPEN_BALANCE` · `DUPLICATE` · `UNSIGNED` · `UNUSUAL_FOR_KARIGAR`. Warning codes: `SIGNED_ON_ONE_DEVICE`, `POSSIBLE_DOUBLE_COUNT` (offline duplicate).

**Lyzr agent graph:** `Manager` → `IntakeAgent` (voice/scale → event draft) · `ReconcileAgent` (explains flags computed by ledger-core) · `SettleAgent` (drafts statement and GST draft). Every agent output passes a **human-in-the-loop gate** before any signature.

## 9. Integrations
| System | MVP / demo | Scalable v1 |
|---|---|---|
| Lyzr Agent Studio (AI Partner) | Real (free build tier); deterministic fallback | Real |
| Sarvam AI (STT/TTS) | Real with ₹100 free credits; cached audio fallback | Real (paid) |
| Jewellery balance (0.01 g) | Simulated scale widget + optional **Web Serial** (Chrome) for a real serial balance | Web Serial / BLE / display OCR |
| UPI | Intent deep link `upi://pay?...` + QR, **no money moves**, labelled "simulated" | PSP (Razorpay/Cashfree/PhonePe PG) intent/collect + webhook |
| WhatsApp / IVR | On-screen simulated phone | Meta WhatsApp Cloud API; IVR via Exotel or Sarvam Voice Agents |
| GST | Rule 55 challan / invoice PDF **draft** | Same + export to Tally/CA |
| Account Aggregator / ULI | Mocked lender view, labelled | Partner FIU path (post-pilot) |
| PM Vishwakarma | Optional ID field only | Same |
| BIS HUID / BIS Care | Not used (PS 2.2 is job-work, not hallmarking) | Optional HUID field on finished pieces |

## 10. Stack (versions checked 2026-10-20 via npm/PyPI)
| Layer | Demo (`implementation/demo`) | Scalable (`implementation/scalable`) |
|---|---|---|
| Web app | **Next.js 16.4** (App Router), **React 19.3**, **TypeScript 5.9** | Same + PWA (service worker), **Dexie 4.4** (IndexedDB) |
| UI kit | **HeroUI v3.2** (`@heroui/react`, `@heroui/styles`), **Tailwind CSS 4.3**, **Motion 14.4** (`motion/react`) | Same, extracted to `packages/ui` |
| Fonts | Fraunces Variable (display), Figtree Variable (text), DM Mono (numbers/labels), Mukta (Devanagari), Noto Sans Bengali / Kannada, all via Fontsource (self-hosted) | Same |
| Client state / data | Zustand 5, TanStack Query 5, Zod 4 | Same |
| UI extras | `@gravity-ui/icons` 2.22.0 (icons, HeroUI's set), `qrcode.react` 4.2.0 (UPI QR) | Same |
| PDF (GST draft, F-09) | ReportLab (Python; pin at install) | Same |
| Number formatting | All grams and ₹ are formatted with **`en-IN` and Latin digits** (ICU drops lakh grouping for kn/mr; bn/mr default to native digits). The surrounding UI copy is localised. | Same |
| i18n | `next-intl` 4.14 (en, hi, kn, bn) | + mr, ta |
| Crypto | `@noble/ed25519` 3.2 (client keys), PyNaCl 1.6 (server verify) | Same; keys in Android Keystore via WebAuthn/passkey (v1.1) |
| API | **FastAPI 0.153**, Pydantic 2.14, Uvicorn 0.54, Python 3.12+ | Same, modular monolith |
| DB | **SQLite** (file, seeded) via SQLAlchemy 2.1 | **PostgreSQL 16** (Cloud SQL), SQLAlchemy 2.1 + Alembic 1.20 |
| Jobs | Inline (button-triggered) | Cloud Tasks / RQ + Redis 7 (weekly reconcile, notifications) |
| AI | `lyzr-adk` 0.1.12, `sarvamai` 0.1.37 | Same |
| Tests | Vitest 5, Playwright 1.64, pytest 9 | + contract tests (Schemathesis), k6 load |
| Hosting | Web on **Vercel**, API on **Render** (free/starter), or one Docker Compose on any VM | **GCP asia-south1 (Mumbai)**: Cloud Run (web, api, worker), Cloud SQL, Cloud Storage, Secret Manager; Terraform |
| CI | GitHub Actions `demo-ci.yml` | GitHub Actions `scalable-ci.yml`, `scalable-deploy.yml`, `evals.yml` |

**Ports and env (fixed):** web `3000`, api `8000`. Env names: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_DEMO_MODE`, `DATABASE_URL`, `LYZR_API_KEY`, `LYZR_AGENT_ID_MANAGER`, `LYZR_AGENT_ID_INTAKE`, `LYZR_AGENT_ID_RECONCILE`, `LYZR_AGENT_ID_SETTLE`, `SARVAM_API_KEY`, `TOLA_SERVER_SIGNING_KEY`, `TOLA_UPI_VPA`, `TOLA_UPI_PAYEE_NAME`, `AI_FALLBACK_MODE` (`live`|`cached`|`off`), `DEMO_RESET_TOKEN` (demo only; guards API-02 reset). Scalable adds: `REDIS_URL`, `OTP_PROVIDER_KEY`, `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `IVR_PROVIDER_KEY`, `PSP_KEY_ID`, `PSP_KEY_SECRET`, `GCS_BUCKET`, `OTEL_EXPORTER_OTLP_ENDPOINT`, `LOG_PEPPER` (log pseudonymisation).

**Runtimes:** the demo uses Node 22 LTS; the scalable build uses Node 24 in CI and containers. Python 3.12+ for both. Placeholder production domain: `tola.in` (owner: founder; confirm by 15 Nov 2026).

**Pricing:** COST.md recommends **≥ ₹79 per active karigar per month**. At ₹49 the margin is only 6–13% until Lyzr runs in our own cloud.

## 11. Design direction (detailed in `docs/02-design/DESIGN.md`)
The design follows the Sarvam design language as already adapted in the team's Vakyam site (`docs/02-design/reference/`):
- warm off-white canvas `#fcfcfc`, white cards with 1px hairlines instead of shadows;
- **colour as light**: Tola uses a blurred **ember → amber → gold → periwinkle** arc;
- indigo working accent; slate pill buttons; Fraunces display with Figtree text and DM Mono for every gram figure.

Apple fluid-interface rules apply:
- springs (damping 1.0 by default);
- press feedback on pointer-down;
- interruptible sheets;
- translucent nav;
- full `prefers-reduced-motion` support.

Sarvam's proprietary fonts (Matter, Season Mix) and its logo are **not** used.

## 12. Non-goals
- No purity testing or karat claims (PS 2.1 territory). We record weights and declared fineness only.
- No credit score computed or sold by Tola. The karigar shares his own record; the lender decides.
- No blockchain. A hash chain plus two signatures gives tamper evidence without a token.
- No GST filing. We produce drafts and the CA files.
- No custody of money or gold. Payments go PSP → bank; gold stays with the parties.
- Not a full jewellery ERP (billing, retail POS, hallmark inventory).

## 13. Hackathon constraints
- **Team:** 4 STEM students (official rules say 4; HackCulture says 1–4; confirm with tech4bharath@rvce.edu.in). Suggested roles: front end + design, back end + crypto, AI/voice, field + pitch.
- **Timeline:**
  - idea submission **15 Nov 2026**;
  - prototype round **23 Nov – 15 Dec 2026**;
  - AMA 24 Dec;
  - **offline final 27 Dec 2026, Bangalore Palace** (working demo required).
- **Judging:**
  - *technical merit*: architecture, AI quality, working prototype, innovation;
  - *entrepreneurial potential*: relevance, market, business model, scalability, **job creation**;
  - must work for **low literacy, limited connectivity, low-cost phones**.
- **Likely jury lens** (hunch, from the hackathon bible): Madan Padaki (JanAI: voice-first, village entrepreneurs, outcome-paid), CA Dr I S Prasad (numbers must reconcile), the jeweller/trader community of KAVMS, RVCE faculty (engineering rigour), Lyzr (agent design).
- **Sponsor tech:** Lyzr (AI Partner; credits) used visibly. Indic speech via Sarvam.

## 14. Business model (summary; detailed in BUSINESS_MODEL.md)
- **The jeweller pays per active karigar** (**₹79 floor** "Shop", ₹99 "Shop Pro"; HUNCH, see [BUSINESS_MODEL](../07-business/BUSINESS_MODEL.md); benchmark: ERP spend ₹12k–2L/yr [S25]).
- **Lenders pay per consented Work Passport pull** (v1+).
- **Refiners pay** via the dust/scrap line (v2).
- **JanAI Bazaar fit:** a JanAI Cafe "Doot" onboards jewellers and karigars and earns a share per verified active pair.
- **Karigar access is free forever.**

## 15. Top risks (detailed in RISK_REGISTER.md)
| ID | Risk | Mitigation |
|---|---|---|
| R-01 | Jewellers refuse transparency | Sell as dispute insurance to shops already losing grams; karigar-network pull |
| R-02 | Misheard spoken numbers | Scale is the source of truth; numbers always read back; two-party confirm |
| R-03 | No serial-capable balance available for the demo | Simulated scale + display OCR; a bench HX711 rig labelled "not for trade" |
| R-04 | Legal Metrology: trade weighing needs a verified instrument | Real transactions use the shop's own verified balance; Tola only records it |
| R-05 | DPDP consent and karigar data misuse | Notice in the karigar's language; karigar-controlled sharing; revocation |
| R-06 | Being read as a credit bureau (CICRA) | No score; raw consented record only |
| R-07 | Lyzr/Sarvam outage on stage | `AI_FALLBACK_MODE=cached`; fully offline demo path |
| R-08 | Low literacy blocks UI use | Voice-first, icon-led, 1-tap confirm, IVR channel |
| R-09 | Key loss / shared phone in karkhana | Per-person keys with PIN; head-karigar delegation (v1) |
| R-10 | Team runs out of time | Cut list in HACKATHON_PLAN; demo build is scoped to F-01–F-09 + F-13–F-14 |

R-11 to R-32 are in [RISK_REGISTER](../06-security-compliance/RISK_REGISTER.md). Lender revenue is a **flat per-pull data fee, never linked to a loan**, which keeps Tola outside the RBI lending-service-provider rules (R-21).

## 16. Repository layout (decided)
```
TECH4BHARAT_GAVS_TOLA/
├─ docs/                  common to both builds: overview, product, design, engineering core, AI, security, business, project
├─ api/openapi.yaml       one contract; the demo implements the ✓ subset
├─ implementation/
│  ├─ demo/               prototype: no login, role switcher, seeded story; Next.js + FastAPI + SQLite
│  └─ scalable/           production path: OTP auth, Postgres, offline PWA, WhatsApp/IVR, GCP Mumbai
└─ .github/workflows/     demo-ci.yml, scalable-ci.yml, scalable-deploy.yml, evals.yml (path-filtered)
```

## 17. Source references
[S#] numbers refer to `~/hackathons/tech4bharat-gavs-hackathon/research/domains/jeweltech.md` (sources list) and the Jeweltech section of `ideas.md`. Key ones:
- [S1] PS 2.2 text
- [S17] IIMA/XLRI karigar field study
- [S18] Coimbatore goldsmith survey
- [S24] GST job-work / Rule 55
- [S25]–[S29] jewellery ERPs
- [S41] PM Vishwakarma
- [S47] gold price 20 Oct 2026
- [S52] Legal Metrology Act 2009
- [S53] DPDP Act

[S51]–[S53] were fetched in the war-room session. They are listed in the Sources of the Jeweltech section of `ideas.md`, not in the domain research file.
