# Risk Register
> Project: Tola · Owner: Product lead · Status: Draft v0.1 · Last updated: 2026-10-20
> Related: [Project Brief §15](../00-overview/PROJECT_BRIEF.md#15-top-risks-detailed-in-risk_registermd) · [Threat Model](THREAT_MODEL.md) · [Security Architecture](SECURITY_ARCHITECTURE.md) · [Privacy](PRIVACY.md) · [Compliance](COMPLIANCE.md) · [Hackathon Plan](../00-overview/HACKATHON_PLAN.md) · [Business Model](../07-business/BUSINESS_MODEL.md) · [Responsible AI](../04-ai/RESPONSIBLE_AI.md)

**Source:** Munger's pre-mortem (§1). R-01 to R-10 are frozen in the brief and expanded here. R-11 onwards are new in this doc and cross-referenced from the [THREAT_MODEL](THREAT_MODEL.md).

**Scales**
- **Likelihood (L):** 1 rare · 2 possible · 3 likely · 4 almost certain.
- **Impact (I):** 1 minor · 2 moderate · 3 major · 4 fatal to the product or the pitch.
- **Score** = L × I. **≥ 9 is red**, 5–8 amber, ≤ 4 green.

**Owners** (team roles, brief §13):
- Product lead;
- Backend lead (back end + crypto);
- AI lead (AI/voice);
- Frontend lead (front end + design);
- Field & pitch lead.

**Status:** `Open` (not yet mitigated) · `Mitigating` (work in progress) · `Mitigated` (control in place, monitored) · `Accepted`.

**Track:**
- **MVP**: `implementation/demo`, through the 27 Dec 2026 final.
- **v1**: `implementation/scalable`, pilot and production.

---

## 1. Munger pre-mortem: "It is March 2027 and Tola is dead. Why?"

> *"Invert, always invert. Tell me how this dies and we'll avoid going there."*

1. **The demo died on stage.** Venue Wi-Fi dropped, the Sarvam call hung, and the judges watched a spinner during the "haan" moment. *(R-07, R-25)*
2. **The judges didn't believe the gold numbers.** A CA on the jury spotted a rounding error in fine-gold arithmetic. *(R-02, R-28; brief: integer milligrams, `ledger-core`)*
3. **No jeweller would install it.** Opacity is profitable. Transparency was pitched as a cost, not as insurance. *(R-01)*
4. **The karigar got hurt by the very record meant to protect him.** He was coerced into "haan". His record was used to deny him a loan or handed to authorities. A rival shop saw his volumes. *(R-11, R-12, R-17)*
5. **A regulator called it something it isn't**: a credit bureau, a lending service provider, a weighing device or a hallmark "certificate". *(R-04, R-06, R-21)*
6. **One forged or rewritten entry went viral on a jewellers' WhatsApp group.** Trust in "two signatures" collapsed overnight. *(R-16, R-20)*
7. **Low-literacy karigars couldn't use it**, so the jeweller "helped", which meant the jeweller signed. *(R-08, R-11)*
8. **The four-person team ran out of time**, and the crypto lived in one person's head. *(R-10, R-32)*

Every item maps to a risk below with an owner and a dated action.

---

## 2. Heat map (current scores)

| Impact ↓ / Likelihood → | 1 Rare | 2 Possible | 3 Likely | 4 Almost certain |
|---|---|---|---|---|
| **4 Fatal** | R-16, R-21 | R-06, R-07, R-17 | R-01, **R-11** | |
| **3 Major** | R-23, R-27 | R-02, R-04, R-05, R-12, R-13, R-15, R-20, R-25, R-29, R-30, R-32 | R-08, R-10 | |
| **2 Moderate** | R-18, R-22 | R-14, R-19, R-24, R-26, R-28, R-31 | R-03, R-09 | |
| **1 Minor** | | | | |

---

## 3. Register

### 3.1 Frozen risks from the brief (R-01 to R-10), expanded

| ID | Risk | Category | L | I | Score | Mitigation (MVP / v1) | Early-warning indicator | Owner | Status |
|---|---|---|---|---|---|---|---|---|---|
| R-01 | **Jewellers refuse transparency.** Opacity on wastage is profitable. | Market | 3 | 4 | 12 🔴 | *MVP:* pitch as **dispute insurance** (AC-10 in the [THREAT_MODEL](THREAT_MODEL.md)); show the cost: ≈ ₹13,650 per gram at 22K, and the Order #14 +380 mg flag ≈ ₹5,188 (brief §2). *v1:* target shops already losing grams; karigar-network pull (each karigar brings his other jewellers); free karigar side; KAVMS endorsement. | < 3 of 10 interviewed jewellers would try it free for one month | Field & pitch lead | Mitigating |
| R-02 | **Misheard spoken numbers** ("chaubis" vs "chabbis"; "twenty-four point one three" split up) | Tech | 2 | 3 | 6 🟠 | Scale is the source of truth (F-01); voice numbers are never authoritative; read-back always speaks digits; two-party confirm; STT number-accuracy eval in [AI_EVALS](../04-ai/AI_EVALS.md) | Intake number mismatch rate > 5% in evals | AI lead | Mitigating |
| R-03 | **No serial-capable balance for the demo** | Ops | 3 | 2 | 6 🟠 | Simulated scale widget + display OCR (M-04); bench HX711 rig labelled "not for trade"; borrow a balance from a Bengaluru jeweller (Field & pitch lead, by **10 Dec 2026**) | No balance confirmed by 10 Dec | Field & pitch lead | Open |
| R-04 | **Legal Metrology:** trade weighing needs a verified instrument | Legal | 2 | 3 | 6 🟠 | Tola records the shop's **own verified balance**; verification cert no. recorded and expiry warnings shown ([COMPLIANCE §3](COMPLIANCE.md#3-legal-metrology-act-2009-and-the-legal-metrology-general-rules-2011)); never "Tola weighed" | A judge or partner asks "is your device approved?" and we have no crisp answer | Product lead | Mitigated (design) |
| R-05 | **DPDP consent and karigar data misuse** | Legal / Ethical | 2 | 3 | 6 🟠 | Spoken notice in his language; separate consents C1–C4; karigar-controlled sharing; revocation; DPIA ([PRIVACY](PRIVACY.md)) | Native-speaker review not done by 10 Dec 2026 | Product lead | Mitigating |
| R-06 | **Read as a credit bureau (CICRA)** | Legal | 2 | 4 | 8 🟠 | No score, rank or grade; raw consented record only; no lender query API; no CIC feeds ([COMPLIANCE §6](COMPLIANCE.md#6-credit-information-companies-regulation-act-2005-cicra)) | Any feature request for a "karigar score" | Product lead | Mitigated (design) |
| R-07 | **Lyzr/Sarvam outage on stage** | Tech | 2 | 4 | 8 🟠 | `AI_FALLBACK_MODE=cached`; pre-generated audio; full offline Docker Compose path on a laptop with a local SQLite; a video backup of the walkthrough | Any live-call p95 > 3 s in the 26 Dec rehearsal | AI lead | Mitigating |
| R-08 | **Low literacy blocks UI use** | Market / Ethical | 3 | 3 | 9 🔴 | Voice-first; icon-led; 1-tap confirm; numbers always spoken; IVR channel (F-12); test with 3 real karigars before the final | A karigar can't complete the confirm flow unaided in a field test | Frontend lead | Open |
| R-09 | **Key loss / shared phone in the karkhana** | Tech / Ops | 3 | 2 | 6 🟠 | Per-person key + PIN on shared phones; head-karigar delegation with scope and expiry (v1); OTP re-enrolment + 72-h cooling-off; old signatures stay valid ([SECURITY_ARCHITECTURE §3.3](SECURITY_ARCHITECTURE.md#33-device-bound-signing-keys)) | Key-reset requests > 5% of active karigars per month | Backend lead | Open (v1) |
| R-10 | **Team runs out of time** | Ops | 3 | 3 | 9 🔴 | Cut list in [HACKATHON_PLAN](../00-overview/HACKATHON_PLAN.md); demo scope F-01–F-09 + F-13–F-14; daily stand-up; feature freeze **20 Dec 2026** | A critical-path item slips > 2 days | Product lead | Mitigating |

### 3.2 New risks (R-11 onwards)

| ID | Risk | Category | L | I | Score | Mitigation (MVP / v1) | Early-warning indicator | Owner | Status |
|---|---|---|---|---|---|---|---|---|---|
| R-11 | **Coerced or forged karigar confirmation** (AC-01, AC-02) | Ethical / Tech | 3 | 4 | 12 🔴 | Key only on the karigar's device; channel confirm from his own number; assurance tiers; out-of-band read-back ≤ 5 min; 14-day dispute window; private "signed under pressure" flag; norm-drift alerts. The pitch says honestly that we make coercion visible, not impossible. | Disputes opened within 48 h of signing > 10% at a shop | Product lead | Mitigating |
| R-12 | **Cross-shop data leakage**: jeweller A sees the karigar's work with B (AC-08) | Security / Market | 2 | 3 | 6 🟠 | RBAC + Postgres RLS; server ignores client `shopId`; 100% isolation tests in CI | Any isolation test failure | Backend lead | Open (v1) |
| R-13 | **LLM cross-border transfer / processor breach** | Legal / Security | 2 | 3 | 6 🟠 | Pseudonymise before Lyzr; integers only from `ledger-core`; no audio to the LLM; DPAs; India-hosted M-03 decision by 31 Mar 2027 ([PRIVACY §6](PRIVACY.md#6-residency-and-cross-border-transfer)) | Lyzr/LLM provider region unconfirmed by 28 Feb 2027 | AI lead | Open |
| R-14 | **Work Passport link leakage** (AC-07) | Security / Privacy | 2 | 2 | 4 🟢 | 128-bit token; 7-day expiry; 5-view cap; recipient OTP binding (v1); watermark; `no-referrer`; access log visible to the karigar; one-tap revoke | Views from > 1 organisation domain per share | Backend lead | Open (v1) |
| R-15 | **Fake karigars / passport farming** (AC-11) | Fraud | 2 | 3 | 6 🟠 | One phone, one person; passport shows months active and distinct shops; single-shop passports labelled; "Not KYC" label; device/IP velocity rules | > 5 karigars enrolled from one device in 24 h | Backend lead | Open (v1) |
| R-16 | **Ledger integrity compromise**: insider rewrite, signature replay, server signing-key theft (AC-03, AC-09) | Security | 1 | 4 | 4 🟢 | Append-only with DB-level revokes; domain-separated signed payload with `prev_hash` + nonce; daily signed Merkle checkpoints sent to parties; signing key in KMS/`signer` service; 2-person break-glass | Any chain-verify failure (SEV-1) | Backend lead | Mitigating |
| R-17 | **The record is used against the karigar**: lawful-access demands, tax scrutiny, a hostile climate for Bengali migrant workers [S23], a lender using it to deny credit | Ethical / Legal | 2 | 4 | 8 🟠 | Minimum data (no Aadhaar, no location); karigar-only sharing; transparency report on legal requests; notify the user unless the law prohibits it; legal-request playbook requiring a written order; erasure via crypto-shredding | First legal request received | Product lead | Open |
| R-18 | **Child labour exposure**: a minor helper ends up in the record | Ethical / Legal | 1 | 2 | 2 🟢 | 18+ attestation; no minor delegation; Doot training to refuse; erase if discovered ([PRIVACY §8](PRIVACY.md#8-childrens-data)) | Any report of a minor user | Field & pitch lead | Mitigated (design) |
| R-19 | **SIM-swap / OTP abuse / SMS pumping** (AC-12) | Security / Cost | 2 | 2 | 4 🟢 | OTP only logs in; signing needs device key + PIN; 72-h cooling-off on new devices; OTP rate limits; spend alarm | OTP sends > 3× the 7-day baseline | Backend lead | Open (v1) |
| R-20 | **Scale spoofing or tampered balance** (AC-04) | Fraud / Tech | 2 | 3 | 6 🟠 | Registered devices with verification cert no.; reading-stability fingerprint; display photo hash + OCR cross-check; same balance for issue and return; asymmetry flags | OCR vs serial mismatch > 1% of readings at a shop | Backend lead | Open (v1) |
| R-21 | **Regulatory reclassification as LSP or Payment Aggregator** through lender fees or payment flows | Legal | 1 | 4 | 4 🟢 | Flat per-pull data fee not tied to the loan; no lead routing; PSP holds all funds; legal opinion by 31 Jan 2027 ([COMPLIANCE §7](COMPLIANCE.md#7-rbi-digital-lending-directions-payment-aggregators-pss-act-2007-account-aggregator)) | A lender proposes a success fee | Product lead | Open |
| R-22 | **Supply-chain compromise** of an npm/PyPI dependency or AI SDK | Security | 1 | 2 | 2 🟢 | Lockfiles with hashes; Dependabot; `pip-audit`, `npm audit`, OSV-Scanner; SBOM; Trivy; pinned `lyzr-adk` 0.1.12, `sarvamai` 0.1.37 | A Critical advisory on a direct dependency | Backend lead | Mitigating |
| R-23 | **Voice deepfake confirmation** (AC-05) | Security | 1 | 3 | 3 🟢 | Voice is never an authentication factor; IVR call is outbound to the registered number + DTMF PIN; WhatsApp needs a text code | Any disputed IVR confirmation alleging impersonation | AI lead | Mitigated (design) |
| R-24 | **Prompt injection via voice note** (AC-06) | Security / AI | 2 | 2 | 4 🟢 | Transcript as quoted data; strict JSON schema; scale authoritative; read-only agent tools; ≥ 50-case multilingual red-team set in `evals.yml`, 100% gate | Any red-team case alters a field | AI lead | Mitigating |
| R-25 | **Demo vandalised or venue network fails** during judging | Ops | 2 | 3 | 6 🟠 | Token-gated reset; rate limits; offline laptop path; phone hotspot; recorded backup video | Venue Wi-Fi not tested on AMA day (24 Dec) | Frontend lead | Open |
| R-26 | **Sponsor credits run out or pricing changes** (Sarvam ₹100 free credit; Lyzr build tier) | Cost / Ops | 2 | 2 | 4 🟢 | Cache all read-back audio for the story; count calls per rehearsal; budget alarm; deterministic template fallback | Sarvam balance < ₹30 before 20 Dec | AI lead | Open |
| R-27 | **Data loss / no disaster recovery** (v1) | Ops | 1 | 3 | 3 🟢 | Cloud SQL PITR (7 days) + daily exports (CMEK); monthly restore drill; RPO 15 min, RTO 4 h (see [RUNBOOK](../../implementation/scalable/docs/RUNBOOK.md)); karigars hold device copies | A restore drill fails | Backend lead | Open (v1) |
| R-28 | **GST rule or rate changes make drafts wrong** (5% job-work rate not re-verified after the 2025 rationalisation) | Legal | 2 | 2 | 4 🟢 | Rate kept in config; "Draft for your CA" watermark; quarterly CA review ([COMPLIANCE §4](COMPLIANCE.md#4-gst-job-work-cgst-act-s143-cgst-rules-45-46-55)) | A CA flags any draft | Product lead | Open |
| R-29 | **Tola shuts down and karigars lose their record** | Market / Ethical | 2 | 3 | 6 🟠 | Signed JSON + PDF export in his language at any time; open, documented event format; the verification tool is open-sourced; device-held copies | Runway < 6 months | Product lead | Open |
| R-30 | **The AI explanation defames the karigar** ("stole 380 mg" on the Order #14 flag) | AI / Ethical | 2 | 3 | 6 🟠 | `ReconcileAgent` cites only `ledger-core` numbers; banned-accusation filter in bn/hi/kn/en; "AI explanation, check the numbers" label; human review before it is sent | Any accusatory phrase in eval outputs | AI lead | Mitigating |
| R-31 | **Misreading DPDP Rules timelines** (the primary Gazette text isn't fetched yet) | Legal | 2 | 2 | 4 🟢 | Comply with the full Act from v1 day one regardless; re-verify by 30 Nov 2026 | Conflicting dates found | Product lead | Open |
| R-32 | **Crypto knowledge sits with one team member** (bus factor 1) | Ops | 2 | 3 | 6 🟠 | Pair on `ledger-core` and signing; a written spec of the signed payload ([SECURITY_ARCHITECTURE §3.4](SECURITY_ARCHITECTURE.md#34-what-exactly-is-signed)); test vectors in the repo; a second person demos the tamper check | Only one person has run the chain-verify demo by 15 Dec | Backend lead | Open |

---

## 4. Top 5 to watch through the final (MVP)
| Rank | Risk | Next action | Due | Owner |
|---|---|---|---|---|
| 1 | R-10 Time | Lock the cut list; feature freeze | 20 Dec 2026 | Product lead |
| 2 | R-07 / R-25 Stage failure | Full offline rehearsal with the network unplugged | 26 Dec 2026 | AI lead + Frontend lead |
| 3 | R-08 Low literacy | 3 karigars complete the confirm flow on video | 15 Dec 2026 | Field & pitch lead |
| 4 | R-11 Coercion | Prepare a 20-second honest answer for the jury, with the dispute-window demo | 20 Dec 2026 | Field & pitch lead |
| 5 | R-01 Jeweller adoption | One letter of interest from a shop or co-op bank (HUNCH: via KAVMS) | 15 Dec 2026 | Field & pitch lead |

---

## 5. Review cadence
- **MVP:** reviewed at the daily stand-up from 23 Nov to 27 Dec 2026. Scores updated weekly in this file.
- **v1:** monthly risk review (Product lead chairs). Any new 🔴 risk goes to the founders the same day. Security risks are re-scored after each pen-test phase.

## 6. Closed / retired risks
None yet.

## 7. Notes for the brief owner
These items were added in the 06-security-compliance docs, or found inconsistent. Fold them into [PROJECT_BRIEF](../00-overview/PROJECT_BRIEF.md) or reject them.
1. **New risk IDs R-11 to R-32** (this file). Brief §15 lists only R-01 to R-10.
2. **`Signature` (E-07) needs extra fields:** `alg`, `key_id`, `assurance_tier` (`device_key` \| `channel_attested` \| `in_person_witnessed`), and WebAuthn `authenticator_data` + `client_data_json`. Brief §10 says "keys in Android Keystore via WebAuthn/passkey (v1.1)" together with Ed25519. Android passkeys typically sign with **ES256 (P-256)**; Ed25519 passkey support is not verified 2026-10-20. So v1.1 signatures may not be Ed25519, and `ledger-core` verification must be algorithm-agile.
3. **Proposed new entities:** `ConsentRecord` (notice version, language, hash, channel, timestamp), `Delegation` (head karigar, R-09), `Checkpoint` (daily signed Merkle root), `ScaleDevice` (registered balance with its verification cert no.). Suggested IDs: E-15 to E-18.
4. **New demo env var `DEMO_RESET_TOKEN`** (guards `POST /v1/demo/reset` on stage). Not in brief §10.
5. **Brief §14, "Lenders pay per consented Work Passport pull":** keep this as a flat data-access fee, not tied to loan sanction, to stay outside the RBI LSP perimeter (R-21).
6. The brief lists `docs/05-ops` content in the catalog, but ops docs live under `implementation/scalable/docs/` (RUNBOOK, OBSERVABILITY). Links here point there.
