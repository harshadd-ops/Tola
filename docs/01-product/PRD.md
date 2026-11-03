# Product Requirements Document (PRD)
> Project: Tola · Owner: Product lead · Status: Draft v0.1 · Last updated: 2026-10-20
> Related: [Project Brief](../00-overview/PROJECT_BRIEF.md) · [Personas](./PERSONAS.md) · [User Journeys](./USER_JOURNEYS.md) · [User Stories](./USER_STORIES.md) · [Features](./FEATURES.md) · [Roadmap](./ROADMAP.md) · [Metrics](./METRICS.md) · [Competitive Analysis](./COMPETITIVE_ANALYSIS.md) · [Architecture](../03-engineering/ARCHITECTURE.md) · [Data Model](../03-engineering/DATA_MODEL.md) · [Design](../02-design/DESIGN.md) · [Demo build](../../implementation/demo/README.md) · [Scalable build](../../implementation/scalable/README.md)

**Tola: two signatures on every gram.** Tola is a gold job-work ledger that the jeweller and the karigar both sign. The weight comes from the scale, the karigar confirms by voice in his own language, an AI agent reconciles the account every week, and the karigar gets a Work Passport that makes him creditworthy.

> **Scope convention used in every product doc**
> - **MVP (hackathon)** is built in [`implementation/demo/`](../../implementation/demo/README.md): no login, role switcher (Jeweller · Karigar · Lender), guided story mode through one scripted week, seeded data, real hash chain and signatures, real reconciliation arithmetic, Lyzr/Sarvam live with cached fallback, UPI simulated.
> - **v1 (production)** is built in [`implementation/scalable/`](../../implementation/scalable/README.md): OTP auth, Postgres, offline-first PWA, WhatsApp/IVR, workers, GCP Mumbai, observability, compliance.
> - **v2** is the post-pilot expansion (lender rails, refiner line, order agent, more languages and regions).

---

## 1. Background and problem

### 1.1 The handover nobody can prove
A jeweller issues gold by weight to a karigar (artisan goldsmith). The karigar returns the finished piece plus scrap, and keeps an agreed wastage allowance. The field norms are about **2–3% for plain work, 20–30% for studded work and 4% for antique work** [S17]. Karigars are paid largely through that wastage ("100% variable compensation") and settled "every week or twice a month" from a paper register [S17]. PS 2.2 states the outcome: wastage is agreed verbally, accounts are squared at month end, and the result is "unexplained gold losses, disputes that sour long relationships, missed wedding dates and artisans waiting weeks to be paid" [S1].

### 1.2 Data
| Fact | Number | Source |
|---|---|---|
| Gold inventory held by one karigar | ₹4–5 lakh (prices at study time, about 2022) | [S17] |
| Gold dust in one workshop | ₹20–25 lakh | [S17] |
| 24K retail price, 20 Oct 2026 | ₹1,49,041 per 10 g, which is about ₹14,904/g | [S47] |
| Value of a 1 g disagreement (22K, fineness 916) | about ₹13,650 (0.916 × ₹14,904, our arithmetic) | [S47] |
| Small-town goldsmith income | ₹10,000–20,000 per month; 80% save under ₹5,000/month | [S18] |
| Goldsmiths naming bank credit as top problem | 16.6% of 120 respondents (Coimbatore) | [S18] |
| Gold given to a new karigar before trust exists | 100–250 g | [S17] |
| Gems and jewellery workforce | about 6.1 million | [S17] |
| Mumbai karigars | about 2.2 lakh, mostly Bengali-speaking | [S20] |
| BIS-registered jewellers | 2,36,624 (15 Oct 2026) | [S2] |
| Jewellery ERP price band | ₹12k–₹2L per year; karigar modules are owner-side | [S25][S26][S28] |
| Vendor view of current practice | wastage "is often averaged monthly, so losses can't be traced to a specific karigar or item" | [S28] |

So one disputed gram is worth roughly a month of a small-town goldsmith's income, and the karigar, who has less power, usually absorbs it. In the field study, "the head karigar has to pay for gold loss" [S17].

### 1.3 The PS boundary (non-negotiable)
> "Settlements go to both parties for approval, and each karigar has full access to his own account." [S1]

> "Accuracy has to hold at the level of weight, the audit trail has to be one both parties accept, and fairness matters most to the artisan, who has less power." [S1]

Every requirement below is checked against these two sentences. A jeweller-only ledger fails the PS.

### 1.4 Why now
- Gold is at record prices (Q1 2026 domestic average ₹1,51,108/10 g, +81% y/y) [S6], so every milligram matters.
- On 8 Jun 2026 BIS moved hallmarking to **automatic weight capture with manual keyboard entry disabled** [S2]. The regulator has set the norm that a weight must come from the instrument. Tola applies the same rule at the karigar bench.
- Migrant-karigar churn in 2026 (SIR stress, a reported workshop exodus) means a karigar's work history is either portable or lost [S22][S23].

---

## 2. Goals and non-goals

### 2.1 Goals
| ID | Goal | Measure (see [METRICS.md](./METRICS.md)) | MVP (hackathon) target | v1 (production) target |
|---|---|---|---|---|
| G-1 | Every gram that moves is weighed by an instrument and signed by both parties | % of ledger events with a scale reading and two valid signatures | 100% of seeded and live demo events | ≥ 98% of events within 24 h of creation |
| G-2 | Variance is caught the same week, not at month end | Median days from the event that causes a variance to the flag | ≤ 7 days (one "run week" click) | ≤ 7 days, scheduled weekly |
| G-3 | Disputes are visible and resolved jointly, never overwritten | % of disputes closed with two signatures; 0 edited events | 1 dispute opened and resolved on stage | ≥ 80% of disputes resolved within 14 days |
| G-4 | Karigars are paid faster | Days from settlement approval to payment | Simulated UPI intent within 5 s of dual approval | Median ≤ 2 days (PS asks "how long does a karigar wait") |
| G-5 | The karigar owns a portable, shareable record | Work Passport shares created by karigars | 1 share viewed in the mocked lender view | ≥ 20% of karigars with 8+ weeks history create a share |
| G-6 | Usable by low-literacy users on cheap phones | Task success without help (issue confirm, dispute reply) | Demo flow fully voice/tap; 44 px targets | ≥ 85% unassisted task success in pilot usability tests |

### 2.2 Non-goals (from the brief, §12)
- No purity testing or karat claims. We record weights and declared fineness only (PS 2.1 territory).
- No credit score computed or sold by Tola. The karigar shares his own record and the lender decides (R-06).
- No blockchain. A hash chain plus two Ed25519 signatures gives tamper evidence.
- No GST filing. Tola drafts the Rule 55 challan and labour invoice and the CA files [S24].
- No custody of money or gold. Payments go PSP → bank; gold stays with the parties.
- Not a full jewellery ERP (billing, retail POS, hallmark inventory).

---

## 3. Success metrics (summary)
The full taxonomy is in [METRICS.md](./METRICS.md).
- **North star: dual-signed fine-gold grams per week.** This is the fine gold carried in ledger events that both parties signed during the week.
- **Input metrics:**
  - active jeweller–karigar pairs;
  - median time from issue to karigar confirmation;
  - % of events captured from the scale (not the manual two-person fallback);
  - variance flags per 100 events;
  - dispute resolution time;
  - days to pay.
- **Hackathon success:**
  - the 3-minute stage walkthrough runs end to end with `AI_FALLBACK_MODE=live` **and** with `cached`;
  - the chain verifies;
  - the numbers reconcile to the milligram in front of CA Dr I S Prasad's lens [brief §13].

---

## 4. Personas summary
Full detail and sources are in [PERSONAS.md](./PERSONAS.md).

| ID | Persona | Primary job | Uses Tola for |
|---|---|---|---|
| P-01 | Suresh Shetty, 52, jeweller (2 counters, 8 karigars) | Get gold back with explained wastage, deliver wedding orders | F-01, F-05, F-06, F-07, F-09, F-10, F-13 |
| P-02 | Rafiq Sheikh, 34, karigar for 3 jewellers, holds about 180 g | Prove what he returned, get paid fast, build credit | F-02, F-04, F-06, F-07, F-08, F-12, F-14 |
| P-03 | Lakshmi, 28, counter and accounts staff | Issue and receive gold quickly and correctly | F-01, F-04, F-13 |
| P-04 | Branch credit officer, co-op bank or NBFC | Judge a karigar with no formal credit file | F-08 (mocked in MVP) |
| P-05 | Head karigar / karkhana owner, 5–15 helpers, one shared phone | Answer for the whole workshop's gold | F-04, F-05, F-11, F-12 (v1) |

---

## 5. Scope

```mermaid
flowchart LR
  subgraph MVP["MVP (hackathon) → implementation/demo"]
    A1[F-01 Scale issue: simulated + Web Serial]
    A2[F-02 Voice read-back bn/hi/kn]
    A3[F-03 Dual-signed hash chain]
    A4[F-04 Return capture + intake agent]
    A5[F-05 Run-week reconciliation]
    A6[F-06 Dispute thread]
    A7[F-07 Settlement + simulated UPI]
    A8[F-08 Work Passport, lender mocked]
    A9[F-09 GST draft PDF]
    A10[F-13 Dashboard]
    A11[F-14 en/hi/kn/bn UI]
    A12[F-10 light, F-12 simulated phone]
  end
  subgraph V1["v1 (production) → implementation/scalable"]
    B1[OTP auth API-17]
    B2[F-11 Offline PWA + sync API-18]
    B3[F-12 WhatsApp + IVR API-19]
    B4[F-07 PSP intent/collect API-20]
    B5[F-05 Scheduled weekly runs]
    B6[F-10 Full order tracker]
    B7[F-14 + mr, ta]
    B8[BLE + display OCR M-04]
  end
  subgraph V2["v2 (post-pilot)"]
    C1[F-08 AA / ULI lender path]
    C2[Refiner dust and scrap line]
    C3[Head-karigar delegation at scale]
    C4[Order-lateness agent on ledger history]
    C5[Tally / CA export]
  end
  MVP --> V1 --> V2
```

| Capability | MVP (hackathon) · `implementation/demo` | v1 (production) · `implementation/scalable` | v2 |
|---|---|---|---|
| Identity | No login; role switcher; seeded people with demo keys (API-02) | Phone OTP (API-17); per-person device keys with PIN | Passkeys in Android Keystore (brief §10, v1.1) |
| Weight capture | Simulated scale widget + optional Web Serial balance (Chrome) | Web Serial, BLE, display OCR (M-04) | Certified-balance partner integrations (not verified) |
| Karigar channel | Karigar view in the web app + an on-screen simulated phone | WhatsApp Cloud API + IVR (Exotel or Sarvam Voice Agents) | Feature-phone-only karigars via IVR |
| Ledger | Real Ed25519 + SHA-256 chain in SQLite | Same in Postgres 16 (Cloud SQL); offline sync | Third-party chain anchoring (optional, not blockchain) |
| Reconciliation | One-click "run week" (inline) | Scheduled weekly job (Cloud Tasks / RQ) | Cross-jeweller view for the karigar |
| Payment | UPI intent link + QR, labelled "simulated", no money moves | PSP intent/collect + webhook (API-20) | Auto-payout rules |
| Work Passport | Share link + mocked, labelled lender view | Real share link, revocation, audit | AA / ULI FIU path [S42] |
| GST | Rule 55 challan / labour invoice PDF labelled "draft" | Same + CA export | Tally export |
| Languages | UI en/hi/kn/bn; voice bn/hi/kn | + mr, ta | More via Bhashini/AI4Bharat |
| Hosting | Vercel (web) + Render (API), or one Docker Compose | GCP asia-south1 (Mumbai) | Multi-region DR |

**Demo rule:** the MVP has **no login**. A role switcher and a guided story mode walk through one scripted week ([USER_JOURNEYS.md §6](./USER_JOURNEYS.md#6-the-scripted-demo-week-mvp)). Data is seeded; crypto and arithmetic are real.

---

## 6. Functional requirements
Priority is MoSCoW for the MVP. Story IDs are in [USER_STORIES.md](./USER_STORIES.md). Acceptance criteria here are the release-level summary; the Gherkin is in the stories.

**Ledger arithmetic rule (applies to F-01, F-04, F-05, F-07):**
- weights are integer milligrams;
- fineness is parts per thousand;
- fine gold (mg) = gross mg × fineness / 1000, computed by `ledger-core`, never by an LLM (brief §8);
- the agreed wastage norm is applied to the **gross weight issued**, as the field study states norms (e.g. "2% to 3% for plain jewellery") [S17]. Balances are shown in fine gold.
- The rounding rule for fine-gold conversion is owned by BE/Crypto and defined in [DATA_MODEL.md](../03-engineering/DATA_MODEL.md).

```
allowed_wastage_mg = issued_gross_mg × norm_pct / 100
actual_loss_mg     = issued_gross_mg − (returned_piece_mg + scrap_mg + dust_credit_mg)
variance_mg        = actual_loss_mg − allowed_wastage_mg     (flag if variance_mg > tolerance)
```

### F-01 Scale-captured issue · Must
- **Description:** the jeweller or counter staff places gold on the balance. The weight arrives from the instrument (Web Serial/BLE/display OCR, or the simulated widget in the demo) and is never typed. The entry logs a photo, order (E-04), order type, declared fineness and the agreed wastage norm (E-05). API-05, API-06.
- **Stories:** US-01, US-02, US-03, US-04.
- **Acceptance:**
  - the weight field has no keyboard input;
  - a `ScaleReading` (E-08) with `source` is stored;
  - a reading must be stable for ≥ 1.5 s before it can be captured;
  - if no instrument is available, the fallback is the M-04 path or a two-person manual confirm, where both parties enter the same number (R-02, R-03).
- **Legal note:** real transactions use the shop's own verified balance (Legal Metrology Act 2009 [S52]; R-04). The demo's bench rig is labelled "not for trade".

### F-02 Voice read-back and confirm · Must
- **Description:** the karigar hears the event in his language (bn/hi/kn in MVP; + mr/ta in v1) through Sarvam Bulbul (M-02) and confirms with a tap or "haan" (M-01). API-09.
- **Stories:** US-05, US-06, US-07.
- **Acceptance:**
  - numbers are always spoken, including the decimal part ("chalish point shunyo gram");
  - confirmation requires an explicit tap or a recognised "haan/ha/howa";
  - a "na" or silence for 30 s leaves the event unsigned by the karigar;
  - cached audio plays when `AI_FALLBACK_MODE=cached`.

### F-03 Dual-signed, hash-chained event log · Must
- **Description:** every `LedgerEvent` (E-06) is signed by both parties (E-07, Ed25519 via `@noble/ed25519` 3.2 client, PyNaCl 1.6 verify) and chained by SHA-256 (`prev_hash`, `hash`). Append-only. API-06, API-07, API-08.
- **Stories:** US-08, US-09, US-10.
- **Acceptance:**
  - no update or delete path exists on events;
  - corrections are new `ADJUSTMENT` events;
  - an event is "settled-eligible" only with both signatures;
  - API-08 returns `chain_status: verified|broken` and the first broken index;
  - tampering with any stored byte breaks verification (shown live in the demo).

### F-04 Return capture · Must
- **Description:** the finished piece, scrap and dust are weighed back. A voice note plus a scale reading becomes a structured `RETURN` / `SCRAP_RETURN` / `DUST_CREDIT` draft through the IntakeAgent (M-01 + M-03). A human reviews it before signing. API-10.
- **Stories:** US-11, US-12, US-13.
- **Acceptance:**
  - the agent may fill order id, piece description and type, but **the weight always comes from the scale reading**, never from the transcript;
  - extraction confidence is shown;
  - fields below 0.8 confidence are highlighted for the human (threshold owned by AI/Voice; see [MODELS.md](../04-ai/MODELS.md)).

### F-05 Weekly reconciliation agent · Must
- **Description:** `ledger-core` computes the fine-gold balance per karigar and per order and the variance against the agreed norm. M-05 scores anomalies. The ReconcileAgent explains each flag in plain language in both parties' languages. API-11, E-10.
- **Stories:** US-14, US-15, US-16.
- **Acceptance:**
  - the same input always gives the same flags (deterministic);
  - every flag shows expected, actual and variance in mg and ₹ at the day's rate;
  - the explanation text never contains a number that `ledger-core` did not produce (checked by a guard);
  - MVP has a one-click "run week"; v1 runs on schedule.

### F-06 Dispute thread · Must
- **Description:** either party can open a dispute (E-11) on any event or flag. The disputed line stays open and visible, and is never overwritten. The karigar can reply by voice. Resolution is a `DISPUTE_RESOLVE` event that needs both signatures. API-12.
- **Stories:** US-17, US-18, US-19.
- **Acceptance:**
  - an open dispute blocks settlement approval for the affected lines only;
  - voice replies are stored with transcript and language;
  - the resolution may create an `ADJUSTMENT` event, signed by both.

### F-07 Two-party settlement and UPI intent · Must
- **Description:** the SettleAgent drafts a statement (E-12) covering gold balance, labour ₹ and dust credit. It goes to both parties. On dual approval a UPI intent (E-13) opens. API-13, API-14.
- **Stories:** US-20, US-21, US-22.
- **Acceptance:**
  - the settlement cannot be paid with one approval;
  - the karigar sees exactly the same statement as the jeweller;
  - MVP produces a `upi://pay?...` link + QR with `status=simulated` and the label "Simulated, no money moves";
  - v1 uses PSP intent/collect + webhook (API-20).

### F-08 Work Passport · Should
- **Description:** the karigar shares a consented summary (grams handled, on-time %, variance vs norm, months of history, number of jewellers) via a time-boxed link (E-14). No score. API-15.
- **Stories:** US-23, US-24, US-25.
- **Acceptance:**
  - the karigar chooses scope, recipient and expiry (default 7 days);
  - he can revoke the link and the revocation takes effect at once;
  - the lender view in the MVP is labelled "Mocked lender view";
  - a "Tola does not score or lend" notice is shown (R-06).

### F-09 GST job-work draft · Should
- **Description:** a Rule 55 delivery-challan draft for gold sent to the job worker, and a labour-invoice draft at 5% GST [S24]. API-16.
- **Stories:** US-26.
- **Acceptance:**
  - every PDF page carries "DRAFT, not filed";
  - values tie to the settlement to the paisa and the milligram;
  - the CA files.

### F-10 Order and deadline tracker · Could
- **Description:** wedding-date orders across karigars with late-risk flags (E-04).
- **Stories:** US-27.
- **Acceptance:**
  - MVP is a static seeded list sorted by occasion date;
  - v1 flags orders whose due date is within 7 days and that have no `RETURN` event.

### F-11 Offline-first PWA and sync · Should (v1)
- **Description:** IndexedDB (Dexie 4.4) queue; signed events sync later through API-18.
- **Stories:** US-28.
- **Acceptance:**
  - an event created offline is signed locally and syncs in order;
  - the server sets chain order by arrival, so a fork cannot occur (parties sign the event body, not the chain position; see [ARCHITECTURE §9–10](../03-engineering/ARCHITECTURE.md)). Duplicates get a `POSSIBLE_DOUBLE_COUNT` warning, which is shown to both parties.
- Not in MVP (online demo).

### F-12 Karigar channel by WhatsApp / IVR · Should
- **Description:** confirm and dispute without the app.
- **Stories:** US-29.
- **Scope:**
  - MVP: a simulated phone frame on screen;
  - v1: Meta WhatsApp Cloud API + IVR (API-19).
- **Acceptance:**
  - a confirmation over WhatsApp or IVR produces a karigar signature made with a server-held delegated key. That key is only valid with the karigar's PIN (design owned by BE/Crypto; see [SECURITY_ARCHITECTURE.md](../06-security-compliance/SECURITY_ARCHITECTURE.md)).

### F-13 Jeweller dashboard · Must
- **Description:** fine-gold balance by karigar, open orders, flags, open disputes, settlements awaiting approval.
- **Stories:** US-30, US-31.
- **Acceptance:**
  - balances equal the sum of signed events to the mg;
  - every tile links to its events;
  - first paint ≤ 2.5 s on a mid-range Android over 4G (v1).

### F-14 Language and accessibility layer · Must
- **Description:** UI in en/hi/kn/bn via `next-intl` 4.14. Numbers are always spoken back. 44 px targets. Icon-led actions.
- **Stories:** US-32, US-33.
- **Acceptance:**
  - every karigar screen works with tap + voice only;
  - contrast is WCAG 2.2 AA;
  - `prefers-reduced-motion` is honoured;
  - gram figures use DM Mono.

### Demo harness (no F-ID; demo only) · Must for MVP
- **Description:** role switcher, story mode, seed reset (API-02).
- **Stories:** US-34, US-35.
- **Acceptance:**
  - `POST /v1/demo/reset` restores the seed in < 2 s;
  - story mode can be advanced with one key or click and can be interrupted at any step.

---

## 7. Non-functional requirements
| Area | MVP (hackathon) · `implementation/demo` | v1 (production) · `implementation/scalable` |
|---|---|---|
| **Performance** | Scale reading on both role views ≤ 1 s after capture. Read-back audio starts ≤ 3 s live, ≤ 300 ms cached. "Run week" over the seed (about 60 events) ≤ 1 s. Chain verify of 500 events ≤ 500 ms. | API p95 ≤ 400 ms (non-AI endpoints); TTS p95 ≤ 2.5 s; weekly run for 1,000 karigars ≤ 10 min |
| **Availability** | Runs fully offline from the laptop with `AI_FALLBACK_MODE=cached` (R-07) | 99.5% monthly for the API; no data loss on a region outage (Cloud SQL backups, PITR) |
| **Offline** | Not required (online demo); cached AI path required | F-11: create, sign and queue events offline; sync on reconnect; tested at 0 bars for 72 h |
| **Languages** | UI en/hi/kn/bn; voice bn/hi/kn | + mr, ta UI and voice |
| **Accessibility** | 44 px targets; tap + voice; reduced motion; AA contrast | Plus IVR channel; usability tested with ≥ 5 low-literacy karigars per release |
| **Devices** | Chrome desktop for the stage; Android Chrome for the karigar view | ₹6–8k Android (2 GB RAM); JS bundle ≤ 250 KB gzipped on karigar routes; feature phone via IVR |
| **Security** | Real Ed25519 keys (demo keys, clearly seeded); no secrets in the repo; CORS restricted to the web origin | OTP auth, per-device keys, TLS 1.2+, encryption at rest, Secret Manager, audit log; see [SECURITY_ARCHITECTURE.md](../06-security-compliance/SECURITY_ARCHITECTURE.md) |
| **Privacy (DPDP Act 2023 [S53])** | Seeded fictional people only; notice screen in the karigar's language | Notice + consent in the user's language; karigar-controlled passport sharing; revocation; data in asia-south1; see [PRIVACY.md](../06-security-compliance/PRIVACY.md) |
| **Integrity** | 0 mutable event rows; chain verified on every ledger read | Same + nightly full-chain verification job with alerting |
| **Auditability** | Every agent output stored with its input, model and fallback mode | Plus OpenTelemetry traces (`OTEL_EXPORTER_OTLP_ENDPOINT`) and Lyzr traces |

---

## 8. Assumptions
| # | Assumption | How we validate | Owner · date |
|---|---|---|---|
| A-1 | Jewellers who already lose unexplained grams will accept transparency if it is framed as dispute insurance (R-01) | 3 jeweller interviews before idea submission | Field/Pitch · 15 Nov 2026 |
| A-2 | Karigars will tap or say "haan" for each issue and return (one action per event) | 5 karigar interviews + a paper prototype test | Field/Pitch · 15 Nov 2026 |
| A-3 | A 0.01 g balance with serial output is obtainable for ≤ ₹3,000 (model and price UNKNOWN [domain research §5]) | Market check at a local scale dealer | BE/Crypto · 30 Nov 2026 |
| A-4 | Sarvam Bulbul/Saaras handle code-mixed Bengali/Hindi numerals well enough for a read-back (the scale stays the source of truth) | 50-utterance numeral eval set (see [AI_EVALS.md](../04-ai/AI_EVALS.md)) | AI/Voice · 5 Dec 2026 |
| A-5 | Wastage norms are agreed per order type per shop–karigar pair and can be written down up front | Interviews (PS field question 2) | Field/Pitch · 15 Nov 2026 |
| A-6 | Co-op banks and NBFCs will look at a karigar's consented record (R-06) | 1 letter of interest via the KAVMS network (HUNCH) | Field/Pitch · 20 Dec 2026 |

## 9. Dependencies
| Dependency | Used by | MVP | v1 | Fallback |
|---|---|---|---|---|
| Lyzr Agent Studio (`lyzr-adk` 0.1.12) | F-04, F-05, F-07 (M-03) | Live, free build tier | Live | Deterministic templates (`AI_FALLBACK_MODE`) |
| Sarvam AI (`sarvamai` 0.1.37: Saaras STT, Bulbul TTS) | F-02, F-04, F-06 | Live, ₹100 free credits | Paid | Pre-generated audio, pre-recorded transcripts |
| Jewellery balance with serial/BLE | F-01 | Optional Web Serial | Required in pilot shops | Simulated widget; M-04 display OCR; two-person manual |
| UPI / PSP | F-07 | Intent link only, simulated | Razorpay/Cashfree/PhonePe PG (choice: BE/Crypto, 15 Jan 2027) | QR with manual reference |
| Meta WhatsApp Cloud API, Exotel / Sarvam Voice Agents | F-12 | Simulated phone | Live | In-app karigar view |
| GST rules (Rule 55, 5% labour) [S24] | F-09 | Draft PDF | Draft PDF + export | — |
| AA / ULI [S42] | F-08 | Mocked | Mocked | Share link only |

## 10. Open questions
| # | Question | Owner | Decide by |
|---|---|---|---|
| Q-1 | Is the wastage norm applied to gross issued weight in every cluster, or to fine weight in some (e.g. Coimbatore vs Kolkata)? | Field/Pitch | 15 Nov 2026 |
| Q-2 | What variance tolerance stops a flag on scale noise (proposal: 10 mg per event, or 0.05% of issued, whichever is larger)? | BE/Crypto | 30 Nov 2026 |
| Q-3 | How does a karigar on a shared karkhana phone (P-05) sign without exposing his key to helpers? | BE/Crypto | 30 Nov 2026 (MVP: per-person PIN); v1 design by 31 Jan 2027 |
| Q-4 | Team size: official rules say 4, HackCulture says 1–4. Confirm with tech4bharath@rvce.edu.in | Field/Pitch | 1 Nov 2026 |
| Q-5 | Which karigars are GST-registered job workers (affects the F-09 invoice draft)? Threshold rules not verified 2026-10-20 | Field/Pitch + CA mentor | 15 Dec 2026 |
| Q-6 | Can a WhatsApp/IVR confirmation count as a legally meaningful signature, or only as evidence? | Field/Pitch (legal mentor) | 31 Jan 2027 |

## 11. Release criteria

### MVP (hackathon): ready for the 27 Dec 2026 final
- [ ] Story mode runs the scripted week end to end in ≤ 3 min, three times in a row without a reset failure.
- [ ] Same run with `AI_FALLBACK_MODE=cached` and Wi-Fi off.
- [ ] Chain verification shows "verified"; a live tamper demo shows "broken at event N".
- [ ] Reconciliation numbers for the seed match a hand calculation in the pitch appendix to the mg.
- [ ] Every simulated or mocked element carries a visible label: scale (if simulated), UPI, lender view, GST draft.
- [ ] Karigar view usable in bn with tap + voice only.
- [ ] Lighthouse accessibility ≥ 95 on the three karigar screens.
- [ ] All F-01–F-09, F-13, F-14 Must/Should stories for the MVP pass in Playwright (`demo-ci.yml` green).

### v1 (production): ready for the first paid pilot
- [ ] OTP auth, per-device keys, offline sync tested for 72 h offline.
- [ ] WhatsApp + IVR confirm and dispute live in bn and hi.
- [ ] PSP intent with webhook reconciliation; 0 unmatched payments in a 2-week pilot.
- [ ] DPDP notice and consent in 6 languages; passport revocation in ≤ 60 s end to end.
- [ ] Nightly chain verification alerts on any break; restore drill passed.
- [ ] Pilot: 1 jeweller, ≥ 3 karigars, ≥ 4 weeks, ≥ 95% of events dual-signed.

---

## Sources
[S#] numbers refer to `~/hackathons/tech4bharat-gavs-hackathon/research/domains/jeweltech.md`. [S52] and [S53] are listed in `war-room/jeweltech.md` (extra sources fetched in that session).
- [S1] PS 2.1 / 2.2 text, HackCulture PDFs.
- [S2] BIS, *Brief on Hallmarking Scheme*, updated 1 Oct 2026: https://www.bis.gov.in/wp-content/uploads/2020/12/brief-on-Hallmarking.pdf
- [S6] World Gold Council, *Gold Demand Trends: India Focus Q1 2026*: https://www.gold.org/goldhub/research/gold-demand-trends/gold-demand-trends-india-focus-q1-2026
- [S17] Varkkey & Jha (IIMA/XLRI), *HRM Practices … Indian Gold Jewellery Manufacturing Sector*, IGPC, June 2023: https://www.iima.ac.in/sites/default/files/2024-04/IGPC%20funded%20project%20BVIIMAJKJXLRI-%20Final%20Report%20June2023%20(1).pdf
- [S18] Sivasankaran & Pavithra, *Problems faced by goldsmiths, Coimbatore*, IJCRT 10(6), 2022: https://ijcrt.org/papers/IJCRT22A6838.pdf
- [S20] NewsClick (2020), via search snippet: https://www.newsclick.in/Lakhs-Jewellery-Artisans-Return-Bengal-Owners-Face-Tough-Times-Ahead
- [S22] Prem Soni, X post (about Apr 2026, via snippet): https://x.com/ValueWithPrem/status/2045169738679259551
- [S23] Newslaundry (17 Apr 2026): https://www.newslaundry.com/2026/04/17/bengals-migrant-workers-caught-between-ghuspaithiya-politics-and-sir-deletions
- [S24] GJC, *GST FAQs for Gem & Jewellery Industry*: https://www.gjc.org.in/pdf/gst/FAQs_GJI_updated_GJF.pdf
- [S25] Codingclave, *Best Jewelry Shop Software India 2026* (vendor-authored): https://codingclave.com/guides/best-jewelry-shop-software-india-2026
- [S26] Online Munim: https://omunim.com/
- [S28] Synergics karigar software blog: https://www.synergicssolutions.com/the-jewellery-karigar-software-revolution-mastering-the-art-of-job-work-management-for-the-modern-era
- [S42] Wikipedia, *Unified Lending Interface*: https://en.wikipedia.org/wiki/Unified_Lending_Interface
- [S47] Gold price 20 Oct 2026 (Zee Business citing All India Bullion): https://www.zeebiz.com/markets/commodities/news-gold-silver-price-today-yellow-metal-at-rs-147-lakh-silver-near-rs-210-lakh-check-city-wise-rates-404186
- [S52] Wikipedia, *Legal Metrology Act, 2009* (war-room log).
- [S53] Wikipedia, *Digital Personal Data Protection Act, 2023* (war-room log).
