# Glossary
> Project: Tola · Owner: Field+Pitch lead · Status: Draft v0.1 · Last updated: 2026-10-20
> Related: [Project Brief](../00-overview/PROJECT_BRIEF.md) · [PRD](../01-product/PRD.md) · [Personas](../01-product/PERSONAS.md) · [Compliance](../06-security-compliance/COMPLIANCE.md) · [Models](../04-ai/MODELS.md) · [Backlog](BACKLOG.md) · [Team](TEAM.md)

These terms are used across the Tola docs and code. Trade terms vary by region and language; the meanings below are the ones Tola uses. Where a figure or legal detail could not be checked on 2026-10-20, the entry says "(not verified 2026-10-20)". [S#] refers to the source list named in brief section 17.

Code identifiers are in `monospace`.

---

## 1. Jewellery trade terms

| Term | Meaning in Tola | Where it shows up |
|---|---|---|
| **Karigar** (कारीगर) | An artisan; here, a goldsmith who makes jewellery from gold issued by a jeweller. He is usually paid per piece or in wastage, and often works for several jewellers at once (P-02). | Karigar role, E-03 `KarigarProfile` |
| **Head karigar** | A senior karigar who takes gold from the jeweller and shares the work among helpers. He carries the loss if gold goes missing [S17] (P-05). | Delegation (TOLA-036) |
| **Karkhana** (कारख़ाना) | A workshop where a head karigar and 5–15 helpers work, often with one shared phone. | P-05, offline sync (F-11) |
| **Sunar / sonar** | Traditional name for a goldsmith (trade and community). Tola uses "karigar" in the product. | Copy |
| **Tola** (तोला) | Traditional South Asian unit of gold weight, about **11.66 g**. It is also the product name. Tola stores weights in milligrams, never in tolas. | Product name |
| **Job-work** | Work done by one person on goods that belong to another. Here: a karigar turns a jeweller's gold into jewellery and returns it. Under GST it has its own rules (see Rule 55). | PS 2.2, F-09 |
| **Issue** | Handing gold to a karigar, by weight. | `ISSUE` event (E-06) |
| **Return** | The karigar handing back the finished piece. Scrap and dust are weighed back separately. | `RETURN`, `SCRAP_RETURN`, `DUST_CREDIT` |
| **Wastage** | The gold allowed to be lost while making a piece (filing, polishing, soldering). It is agreed as a % of issued weight and differs by work type: about 2–3% plain, 20–30% studded, about 4% antique [S17]. In the informal sector it is also how the karigar is paid [S17]. | E-05 `WastageNorm`, F-05 |
| **Ghat / ghatt** (घट) | Hindi for shortfall or loss; used in the trade for the wastage or loss on a job. Spelling and use vary by region (not verified 2026-10-20 across all regions). | Voice copy (hi) |
| **Wastage norm** | The agreed wastage % for one shop–karigar pair and one order type. It is versioned and signed by both. | E-05 |
| **Variance** | Actual loss minus allowed wastage, in fine-gold milligrams. A positive variance above the norm becomes a flag. | E-10 `VarianceFlag` |
| **Scrap** | Usable offcuts and filings returned by the karigar. | `SCRAP_RETURN` |
| **Dust** (gold dust) | Fine gold particles from filing and polishing, collected and later refined. Floor dust in a workshop can be worth ₹20–25 lakh at study-time prices [S17]. | `DUST_CREDIT` |
| **Refiner** | A firm that recovers gold from dust and scrap. Specialised agencies collect workshop floor dust about once a year [S17]. | Business model (v2) |
| **Touch** | Trade word for purity, said as a percentage: "92 touch" means about 92% gold. Usage varies by region. Tola records fineness, not touch. | Copy, voice intake |
| **Fineness** | Purity in parts per thousand. 999 or 995 = 24K; **916** = 22K; 750 = 18K; 585 = 14K. | `fineness` field |
| **916** | Short for 22-karat gold at 91.6% purity; the most common jewellery standard in India. | Seed data |
| **Karat (K)** | Purity in 24ths: 22K = 22/24 ≈ 91.67% gold. | UI labels |
| **Fine gold** | The pure gold content of a weight: `weight_mg × fineness / 1000`. All balances in Tola are in fine-gold milligrams. | `ledger_core` |
| **Making charges / labour (mazdoori)** | The fee for making a piece, separate from the gold. In Tola it is the labour ₹ in a settlement. | E-12 `Settlement` |
| **Bahi-khata** | The traditional bound account book. The paper ledger Tola replaces. | Pitch |
| **Girvi** | A gold loan against pledged jewellery. Some jewellery ERPs (e.g. Online Munim) have a girvi module; Tola does not. | Competitive analysis |
| **Bhav** | Rate (the gold price per gram on the day). | Settlement narrative |
| **IBJA rate** | Daily gold and silver reference rates published by the India Bullion and Jewellers Association. Not used in MVP. | v2 |
| **Hallmark** | A BIS mark certifying purity, applied at an AHC. | Non-goal for PS 2.2 |
| **AHC** | Assaying and Hallmarking Centre, licensed by BIS. | Glossary only |
| **HUID** | Hallmark Unique ID: a 6-character alphanumeric code laser-marked on each hallmarked piece since 1 Jul 2021 [S2]. Over 65 crore gold articles carry one [S2]. Optional field on finished pieces in v1. | Brief section 9 |
| **BIS** | Bureau of Indian Standards, the national standards body. It runs hallmarking. | — |
| **BIS Care** | BIS's consumer app to verify a HUID (purity, jeweller registration, AHC, date; photo and weight since Jun 2026) [S5]. No public API was found [S2]. | Not used |
| **Karat meter / XRF** | A machine that reads surface purity by X-ray fluorescence; ₹1.5–18 lakh [S31]. PS 2.1 territory, not Tola. | Non-goal |

## 2. Indian government, law and finance

| Term | Meaning | Tola's position |
|---|---|---|
| **GST** | Goods and Services Tax. Gold is taxed at 3%; job-work labour on jewellery at 5% [S24]. | F-09 drafts only |
| **Rule 55 challan** | The delivery challan required under Rule 55 of the CGST Rules, 2017 when goods are sent without a sale, e.g. gold sent to a job worker [S24]. | TOLA-090 produces a draft |
| **Rule 46 invoice** | The tax invoice a job worker raises for labour [S24]. | Labour-invoice draft |
| **GSTIN** | GST registration number (15 characters). Optional on E-01 `Shop`. | Optional field |
| **CA** | Chartered Accountant. The CA files GST; Tola never does. | TOLA-091 review |
| **PM Vishwakarma** | Central scheme (MSME ministry) for traditional artisans in 18 trades, goldsmith included. Enrolment is via CSCs with Aadhaar biometrics; it offers recognition, skilling, toolkit support and concessional credit [S41]. About 26.87 lakh registrations as of Jan 2025 [S41]; around 30 lakh by its third anniversary (hackathon bible, ref 46). Loan amounts and rates: see the scheme guidelines (not verified 2026-10-20). | Optional ID on E-03 |
| **CSC** | Common Service Centre, a government-backed village service point. | PM Vishwakarma enrolment |
| **Udyam** | MSME registration (Udyam Registration Certificate). | Possible shop field (v1) |
| **Legal Metrology** | The Legal Metrology Act, 2009 [S52] and rules. Weighing instruments used in trade must be verified and stamped. Tola records the shop's own verified balance; it is not a weighing instrument (R-04). | TOLA-016 |
| **DPDP** | The Digital Personal Data Protection Act, 2023 [S53] and its Rules. It requires notice, consent, purpose limits, data-principal rights and breach notice. Commencement dates of each part: see [PRIVACY](../06-security-compliance/PRIVACY.md) (not verified 2026-10-20). | R-05, TOLA-175 |
| **Data Principal / Data Fiduciary** | DPDP terms: the person the data is about (here, the karigar or jeweller), and the entity that decides why and how it is processed (Tola, then the lender for a pulled passport). | PRIVACY |
| **CERT-In** | Indian Computer Emergency Response Team. Its directions of 28 Apr 2022 require reporting listed cyber incidents within 6 hours and keeping ICT logs for 180 days in India. | TOLA-176 |
| **CICRA** | Credit Information Companies (Regulation) Act, 2005. Only licensed credit bureaus may run credit-information businesses, so Tola computes no credit score (R-06). | Non-goal |
| **RBI** | Reserve Bank of India. | AA, ULI, UPI oversight |
| **NBFC** | Non-Banking Financial Company, a lender regulated by RBI. | P-04 |
| **Co-op bank** | A cooperative bank; a likely first lender for karigars. | P-04 |
| **UPI** | Unified Payments Interface, run by NPCI. | F-07 |
| **NPCI** | National Payments Corporation of India. | — |
| **VPA** | Virtual Payment Address, e.g. `name@bank`. Demo uses `TOLA_UPI_VPA`. | TOLA-072 |
| **UPI intent** | A `upi://pay?pa=…&pn=…&am=…&cu=INR&tn=…` deep link (or QR code) that opens any UPI app with the payee and amount filled in. The payer still approves in the app. In the demo no money moves. | API-14 |
| **PSP** | Payment Service Provider / payment gateway (e.g. Razorpay, Cashfree, PhonePe PG) that confirms UPI payments by webhook. | API-20 (v1) |
| **AA** | Account Aggregator: RBI-licensed NBFC-AA that moves financial data from an FIP to an FIU only with the user's consent artefact. | F-08 path (v1+) |
| **FIP / FIU** | Financial Information Provider (holds data) / Financial Information User (e.g. a lender that reads it). | TOLA-083 |
| **ULI** | Unified Lending Interface: RBI (RBI Innovation Hub) open-API lending rail, in pilot, that connects Aadhaar e-KYC, land records, PAN and AA data for lenders [S42]. | Post-pilot |
| **Aadhaar e-KYC** | Identity check via UIDAI. Not used by Tola. | Non-goal (MVP) |
| **OTP** | One-time password by SMS; v1 login. | API-17 |
| **JanAI** | The organiser's rural voice-first AI platform (Asha assistant, JanAI Bazaar, JanAI Cafes). | Pitch |
| **JanAI Bazaar** | JanAI's marketplace where providers pay a share of revenue only on a completed, consented outcome. | Business model |
| **JanAI Cafe / Doot** | A local cafe and its ambassador ("Doot", messenger) who help people in person and earn a share of each verified outcome. 10 cafes live (Mysuru, Prayagraj) per JanAI's site. In Tola's GTM, a Doot onboards jewellers and karigars and earns per verified active pair. | GTM |
| **KAVMS** | Karnataka Arya Vysya Mahasabha, a 118-year-old trading-community body that hosts GAVS (the hackathon's parent event); its president and the GAVS chief convener (CA Dr I S Prasad) are a likely jury lens (HUNCH, brief section 13). | Pitch prep |
| **GAVS** | Global Accelerator Vision Summit, hosted by KAVMS at Bangalore Palace; the Tech4Bharat final runs as part of it (hackathon bible). | Pitch prep |
| **Bhashini** | The Government of India's language-AI platform; free for proof-of-concept use. A backup for Indic speech. | MODELS fallback |

## 3. Product and Tola-specific terms

| Term | Meaning |
|---|---|
| **Two signatures on every gram** | The one-liner: each ledger event is signed by both the jeweller side and the karigar. |
| **Work Passport** | A karigar-controlled summary of his signed work record (grams handled, on-time %, variance vs norm), shared by a time-boxed link (F-08, E-14). It is not a score. |
| **Story mode** | The guided, scripted week used for the 3-minute stage demo (TOLA-151). |
| **Role switcher** | The no-login control that switches between Jeweller, Karigar and Lender in the demo (TOLA-150). |
| **Run week** | The button that triggers the weekly reconciliation in the demo (API-11). |
| **Read-back** | The system speaking an entry back to the karigar in his language before he confirms (F-02). |
| **Haan / Na** | Hindi "yes" / "no"; the two confirm buttons and voice words on the karigar screen. |
| **`ledger_core`** | The deterministic Python module that does all gram arithmetic. AI never does. |
| **Demo track / scalable track** | `implementation/demo` (MVP, hackathon) vs `implementation/scalable` (v1, production). GitHub labels `track:demo` and `track:scalable`. |
| **`AI_FALLBACK_MODE`** | `live` (call Lyzr and Sarvam), `cached` (replay fixtures and audio), `off` (templates only). |
| **Simulated** | Any part that looks real but is not: scale widget, UPI payment, lender view, WhatsApp/IVR frame. Always labelled on screen. |

## 4. Cryptography and data

| Term | Meaning |
|---|---|
| **Ed25519** | A public-key signature scheme (EdDSA over Curve25519, RFC 8032). Each person has a key pair; Tola uses `@noble/ed25519` 3.2 in the browser and PyNaCl 1.6 on the server. |
| **Signature** | Proof that the holder of a private key approved exact bytes. Stored as E-07. |
| **SHA-256** | A cryptographic hash function producing a 32-byte digest. |
| **Hash chain** | Each event stores the hash of the previous event (`prev_hash`) and its own hash. Changing any old event breaks every later link, so tampering is evident without a blockchain. |
| **Canonical JSON** | One exact byte form of an event (sorted keys, no spaces, UTF-8), so that Python and TypeScript hash and sign the same bytes. |
| **Append-only** | Rows are only ever added; corrections are new `ADJUSTMENT` events. |
| **Genesis** | The fixed first `prev_hash` value of a chain. |
| **Integer milligrams** | All weights are stored as whole milligrams to avoid floating-point errors. |
| **Passkey / WebAuthn** | Device-bound login and key storage standard (v1.1 key custody). |
| **IndexedDB / Dexie** | The browser database and its wrapper library (Dexie 4.4) used for the offline queue (F-11). |
| **PWA** | Progressive Web App: a website that installs and works offline via a service worker. |
| **Web Serial / BLE** | Browser APIs to read a USB-serial device or a Bluetooth Low Energy device; how Tola reads a balance. |
| **Seven-segment OCR** | Reading the digits on a balance display from a camera photo (M-04). |
| **PII** | Personally identifiable information. Redacted from logs. |

## 5. AI and voice

| Term | Meaning |
|---|---|
| **Agentic AI** | Software where LLM-driven agents plan and call tools. PS 2.2's track. |
| **Lyzr Agent Studio** | Lyzr's platform for building and hosting agents; the hackathon's AI Partner. Tola uses it via `lyzr-adk` 0.1.12 with `gpt-4o-mini`. Building is free; production is billed per run. |
| **Lyzr Manager Agent** | A Lyzr agent that orchestrates other agents. Tola's `Manager` routes to `IntakeAgent`, `ReconcileAgent` and `SettleAgent`. Listed at $0.18 per run vs $0.06 for a single agent, so it is used for one visible step only. |
| **IntakeAgent / ReconcileAgent / SettleAgent** | Tola's three specialist agents: voice/scale → event draft; explain computed flags; draft statement and GST draft (M-03). |
| **HITL** | Human-in-the-loop: every AI output is reviewed by a person before any signature. |
| **STT** | Speech-to-text (M-01). |
| **TTS** | Text-to-speech (M-02). |
| **Sarvam Saaras** | Sarvam AI's Indic speech-to-text model; Tola uses `saaras:v3` via `sarvamai` 0.1.37. A `saaras:v4` was released in Jul 2026 per sponsor research. |
| **Sarvam Bulbul** | Sarvam AI's Indic text-to-speech model; Tola uses Bulbul v3. |
| **AI4Bharat** | IIT Madras research lab publishing open Indic models: IndicConformer (STT), IndicF5 (TTS), IndicTrans2 (translation). Self-host fallbacks. |
| **LLM** | Large language model. |
| **Prompt injection** | Text (or speech) that tries to make an agent ignore its instructions. Voice notes are treated as untrusted input. |
| **Number guard** | Tola's check that rejects any AI explanation containing a number not supplied by `ledger_core` (TOLA-052). |
| **Robust z-score** | An outlier score using median and MAD instead of mean and standard deviation (M-05). |
| **Eval** | A fixed test set and metric used to measure an AI step (see [AI_EVALS](../04-ai/AI_EVALS.md)). |

## 6. Engineering and project terms

| Term | Meaning |
|---|---|
| **MVP (hackathon) / v1 (production)** | The two scopes kept separate in every doc; they map to the demo and scalable tracks. |
| **F-, E-, API-, M-, R-, P-** | Frozen IDs for features, entities, endpoints, models, risks and personas (brief). |
| **TOLA-xxx / EP-xx** | Backlog ticket and epic IDs ([BACKLOG](BACKLOG.md)). |
| **ADR / MADR** | Architecture Decision Record, in the Markdown ADR template. |
| **RACI** | Responsible, Accountable, Consulted, Informed ([TEAM](TEAM.md)). |
| **MoSCoW** | Must, Should, Could, Won't prioritisation. |
| **Definition of Done** | The checks a ticket must pass before it is closed ([BACKLOG](BACKLOG.md) section 1). |
| **Cut list** | The pre-agreed order in which features are dropped if the team falls behind. |
| **Cloud Run / Cloud SQL / asia-south1** | Google Cloud's container service, managed Postgres and Mumbai region (scalable hosting). |
| **OpenTelemetry (OTel)** | Open standard for traces, metrics and logs. |
| **IVR** | Interactive Voice Response: a phone call where the caller presses keys or speaks. |
| **WhatsApp Cloud API** | Meta's hosted API for WhatsApp Business messaging. |
| **Exotel** | An Indian cloud telephony provider, one IVR option. |
