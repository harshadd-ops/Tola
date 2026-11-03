# Responsible AI
> Project: Tola · Owner: AI/voice lead (with Product lead) · Status: Draft v0.1 · Last updated: 2026-10-20
> Related: [Project Brief](../00-overview/PROJECT_BRIEF.md) · [Models](MODELS.md) · [Prompts](PROMPTS.md) · [AI Evals](AI_EVALS.md) · [Privacy](../06-security-compliance/PRIVACY.md) · [Compliance](../06-security-compliance/COMPLIANCE.md) · [Threat Model](../06-security-compliance/THREAT_MODEL.md) · [Risk Register](../06-security-compliance/RISK_REGISTER.md)

## 1. The core tension: power asymmetry
The jeweller controls the gold, the work, the pay and often the phone at the counter. The karigar is often a migrant, often reads little, speaks a different language from the shop, and works for several jewellers who all know each other. PS 2.2 says it plainly: *"Settlements go to both parties for approval, and each karigar has full access to his own account."*

Any AI in this loop can tilt further toward the stronger party. Ways it could do that:
- a wording that sounds like an accusation;
- a "haan" captured under pressure;
- a dashboard that turns a ledger into surveillance.

Tola's responsible-AI design is mostly about **not amplifying that asymmetry**:

| Asymmetry | How it could get worse with AI | Design response |
|---|---|---|
| Jeweller holds the record | AI-drafted entries are edited by the shop before the karigar sees them | Agents only **draft**; every event needs the karigar's own signature (F-03); the karigar gets an **uneditable copy** of every signed event (his app or WhatsApp, server-countersigned receipt, PDF export) |
| Language | Explanations written for the jeweller in English, summaries for the karigar in nothing | Read-backs and explanations in the karigar's language (F-02, F-14); **the same neutral explanation text for both parties**, never a jeweller-only version |
| Literacy | A "tap to agree" the karigar did not understand | Every number spoken back in words and shown in digits; 44 px targets; re-listen at any time; read-back audio hash is part of what he signs |
| Bargaining power | A flag reads as "karigar lost gold" and becomes leverage | Flags are "a difference to check", never blame; the explanation validator blocks the blame lexicon ([PROMPTS §5.3](PROMPTS.md)) |
| Exit cost | Disputing is socially costly and slow | **Dispute is always available**, by voice, from any line, any time, with no AI gate; disputed lines stay visible and are never overwritten (F-06) |
| Information | Jewellers compare notes about karigars | No cross-shop view, no karigar ranking, no export of a karigar's data except by the karigar (F-08) |

## 2. Autonomy levels
| Level | Meaning |
|---|---|
| L0 | No AI |
| L1 | **Assist**: AI output shown as evidence or a suggestion; humans enter the decision |
| L2 | **Draft**: AI prepares a draft; a human must review and sign or approve before it has any effect |
| L3 | **Act, notify**: the system acts automatically, and the action is visible to and reversible by humans |
| L4 | **Autonomous**: acts with no human in the loop |

| Component | Max level | Human-in-the-loop point |
|---|---|---|
| M-01 STT transcript | L1 | Transcript is shown with the audio; never the source of a weight |
| M-02 TTS read-back | L1 | The karigar hears it; he can replay or say "na" |
| M-03 IntakeAgent | **L2** | Event draft → read-back → **two signatures** (API-07) |
| M-03 ReconcileAgent | **L2** | Explanation shown identically to both; either can dispute |
| M-03 SettleAgent | **L2** | Statement → **dual approval** (API-13) → only then the UPI intent (API-14) |
| M-04 Display OCR | L1 | Both see the crop and reading; low confidence → both type the number |
| M-05 Variance flags | L3 (notify-only) | A flag is created automatically and visible to both. It has **no consequence** (no pay hold, no score) until humans act |
| Signing, settling, sharing a Passport, paying | **L0** | Human only. **No agent can sign, approve, share or pay.** |

Nothing in Tola runs at L4.

## 3. Bias and fairness analysis
| Axis | Where bias can enter | Measurement | Mitigation |
|---|---|---|---|
| **Language** | STT quality differs across bn/hi/kn/mr/ta; TTS voices differ in clarity | nWER and NVA **per language**; gate: worst-minus-best ≤ 5 pp (MVP), ≤ 3 pp (v1) ([AI_EVALS §5](AI_EVALS.md)) | Keyterms per language (v4); IndicConformer fallback; scale is truth; tap-only path |
| **Accent / migration** | Bengali migrant karigars in Kannada or Marathi shops; regional Bengali/Hindi varieties | DS-02 stratified by home state; nWER by home-state group | Recruit migrant speakers; language set by the karigar, not the shop |
| **Literacy** | Text-first UI excludes; small fonts | Read-back number recall with low-literacy listeners (DS-06) | Voice-first, icons, IVR (v1), one-tap confirm |
| **Gender** | Women counter staff (P-03) and women karigars; pitch affects STT; TTS voice gender choice | nWER by self-described gender where n ≥ 30 | Balanced recruitment; the karigar chooses the read-back voice |
| **Caste / community** | Goldsmithing is tied to traditional artisan communities; a model or a lender could proxy for community | **No caste or community field is collected.** PM Vishwakarma ID is optional and never used by any model, flag or Passport metric unless the karigar adds it to a share | Data minimisation; Passport fields fixed (grams handled, on-time %, variance vs norm) |
| **Region / device** | Feature phones, 8 kHz IVR audio, patchy data | nWER on 8 kHz copies (v1); offline success rate | IVR channel (F-12); offline PWA (F-11) |
| **Comparison base** | Comparing karigars to each other punishes those given harder designs | M-05 compares a karigar **only to his own history** and to the **pair's signed norm** | No cross-karigar leaderboard anywhere in the product |

## 4. Explainability
- **Every flag is arithmetic a CA can check:** expected mg, actual mg, delta, rule ID, and the event IDs used, each with its scale reading and signatures. The AI text sits on top of that and never replaces it.
- **Numbers in AI text are slots** filled by code, so an explanation can never state a number the ledger does not hold ([PROMPTS §1](PROMPTS.md)).
- **"Why am I seeing this?"** on every AI-assisted screen: which model, which prompt version, live or cached ([DATA_PIPELINE §7](DATA_PIPELINE.md)).
- **What the karigar heard is provable:** the read-back audio hash is inside the signed payload.

## 5. Misuse scenarios
| # | Misuse | Who | Harm | Mitigation | Residual |
|---|---|---|---|---|---|
| MU-01 | **Jeweller surveillance**: using Tola to monitor karigar productivity, location or other employers | Jeweller | Loss of autonomy; leverage in negotiations | No location capture; no microphone use without an explicit press-to-record; no view of a karigar's work for other shops; no productivity ranking; flags compare only to self; ToS bans using Tola data for employment blacklists | A jeweller can still read his own pair's ledger. That is by design and symmetrical |
| MU-02 | **Coerced confirmation**: the karigar is pressured to say "haan" at the counter, or someone else says it | Jeweller / staff | False consent; a signed record against the karigar | Voice "haan" is not a signature; the karigar's own device key + PIN signs; same-device dual signing raises a visible `SIGNED_ON_ONE_DEVICE` warning (v1: OTP to the karigar's phone); the karigar can re-listen privately and **open a dispute on any signed line at any time**; a 24-hour "listen again" nudge after every signature (v1) | Cannot stop physical coercion; can only make it visible and contestable |
| MU-03 | **Blacklisting via shared Passports** | Jeweller groups / lenders | Exclusion from work or credit | Passport is karigar-initiated, time-boxed, scoped and revocable (F-08, E-14); no bulk API; no score; lender ToS forbids resale and onward sharing | A recipient could screenshot; the watermark carries recipient ID and expiry |
| MU-04 | **AI text used as accusation** ("the app says you lost 2 g") | Either party | Social pressure, wage theft | Neutral template language; "not an accusation" sentence in every flag read-back ([PROMPTS §6.5](PROMPTS.md)); blame lexicon blocked | Humans can still misrepresent; dispute path stays open |
| MU-05 | **Credit scoring by the back door** | Lender / Tola growth pressure | CICRA exposure; opaque denial of credit | **No credit score, rating or trust number is computed, displayed or sold** (non-goal, R-06); agents refuse score requests (DS-05 test) | A lender builds its own score from raw consented data. That is the lender's regulated decision |
| MU-06 | **Dispute flooding** to delay payment | Karigar or jeweller | Cash-flow harm | Disputes freeze only the disputed lines; undisputed lines settle (SettleAgent rule 2) | — |
| MU-07 | **Prompt injection by voice** | Anyone near the mic | Corrupted drafts | [PROMPTS §7](PROMPTS.md); red-team gate 0% success | Novel attacks; nightly red-team refresh |
| MU-08 | **Shared karkhana phone** (P-05): the head karigar confirms for helpers | Head karigar | Helpers' records not their own | Per-person keys with PIN (R-09); delegation is explicit and visible (v1) | Helpers without phones depend on the head karigar |

## 6. Alignment with India's AI Governance Guidelines (MeitY)
**Verified 2026-10-20** from the official PDF "India AI Governance Guidelines: Enabling Safe and Trusted AI Innovation" (hosted on static.pib.gov.in; PDF metadata dated 4 Nov 2025; drafting committee constituted by MeitY in July 2025). The guidelines set out **seven sutras**, adapted from the RBI FREE-AI Committee report (Aug 2025):

| Sutra (verbatim names) | What it asks (guidelines' wording, condensed) | How Tola complies |
|---|---|---|
| **Trust is the Foundation** | "Without trust, innovation and adoption will stagnate." | The product *is* trust infrastructure: dual signatures, hash chain, uneditable karigar copy |
| **People First** | "Human-centric design, human oversight, and human empowerment." | Max autonomy L2; humans sign everything; the karigar owns his record and its sharing |
| **Innovation over Restraint** | Responsible innovation prioritised over cautionary restraint | Ship voice-first AI for an excluded workforce, with guardrails instead of avoidance |
| **Fairness & Equity** | "Promote inclusive development and avoid discrimination." | Per-language parity gates; no caste/community data; self-only comparison (§3) |
| **Accountability** | "Clear allocation of responsibility and enforcement of regulations." | Lineage per signed line; named owners; grievance channel (below) |
| **Understandable by Design** | "Disclosures and explanations that can be understood by the intended user and regulators." | Read-backs in the karigar's language; CA-checkable arithmetic; "why am I seeing this" |
| **Safety, Resilience & Sustainability** | "Safe, secure, and robust systems … able to withstand systemic shocks and … environmentally sustainable." | Fallback ladder (`AI_FALLBACK_MODE`); no AI on the arithmetic path; small models, cheap single-agent runs |

Part 4 of the guidelines asks industry to comply with Indian laws, adopt voluntary frameworks, **publish transparency reports**, **provide grievance redressal** and use techno-legal risk mitigation. Tola commits to:
- **Grievance redressal** in the user's language (WhatsApp/IVR in v1), shared with the DPDP grievance process in [PRIVACY.md](../06-security-compliance/PRIVACY.md); acknowledgement ≤ 48 h (target).
- **A public AI transparency note** every 6 months from the v1 pilot: eval results per language, dispute rates on AI-drafted lines, incidents. First due: 30 Jun 2027. Owner: Product lead.
- **Techno-legal measures:** signatures, hash chain and consent artefacts are the "techno" half of compliance.

The guidelines say a separate AI law is not needed at this stage and that existing laws apply. For Tola those are DPDP, IT Act, Legal Metrology, GST and CICRA ([COMPLIANCE.md](../06-security-compliance/COMPLIANCE.md)).

**EU AI Act:** Tola is India-only. For reference, creditworthiness evaluation of natural persons is a high-risk use under the EU AI Act (Annex III) (**not verified 2026-10-20**). Tola's no-score stance would keep the Passport outside that use if it ever went to the EU.

## 7. Red lines (product-level, not configurable)
1. No credit score, trust score or rating of any person.
2. No AI signs, approves, shares or pays.
3. No gram, rupee or percentage produced by a model.
4. No cross-shop visibility of a karigar without his explicit, revocable share.
5. No location tracking, ambient recording or biometric identification.
6. No dispute is blocked, delayed or discouraged by AI.

Changing any red line needs a written ADR signed off by the Product lead and the AI/voice lead, and a karigar-side review (≥ 5 pilot karigars consulted).

## 8. MVP vs v1
| | MVP (hackathon) → `implementation/demo` | v1 (production) → `implementation/scalable` |
|---|---|---|
| Autonomy | L2 max; demo shows the HITL gates explicitly in story mode | Same |
| Fairness evidence | Per-language nWER on 240 clips; caveat on small n | 2,000 clips; gender and home-state slices |
| Coercion controls | Own-key signing on the karigar device in the role switcher | + same-device warning, OTP, 24 h re-listen nudge, IVR PIN |
| Transparency | "AI-assisted / cached" chips; lender view labelled "mocked" | Six-monthly transparency note; grievance SLA |
