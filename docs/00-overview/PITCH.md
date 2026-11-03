# Pitch
> Project: Tola · Owner: Field + pitch lead (FP) · Status: Draft v0.1 · Last updated: 2026-10-20
> Related: [Project Brief](PROJECT_BRIEF.md) · [Vision](VISION.md) · [Hackathon plan](HACKATHON_PLAN.md) · [Demo spec](../../implementation/demo/docs/DEMO_SPEC.md) · [User journeys §6](../01-product/USER_JOURNEYS.md) · [UI spec](../02-design/UI_SPEC.md) · [Business model](../07-business/BUSINESS_MODEL.md) · [Financials](../07-business/FINANCIALS.md) · [AI evals](../04-ai/AI_EVALS.md)

**Venue:** offline final, **27 Dec 2026, Bangalore Palace** (09:00–18:00). Working demo required.

**Who is in the room** (from the hackathon bible and `research/C-judges.md`; the jury is **not announced**, so these are archetypes):
- **Madan Padaki / JanAI**: high likelihood.
- **CA Dr I S Prasad** (Chief Convener): medium.
- **KAVMS jeweller-traders and co-op bankers** (R P Ravishankar): low–medium.
- **RVCE faculty** (likely idea-round screeners).
- **A Lyzr technologist.**
- **A Startup Conclave investor.**
- **T G Bharath** (Event Chair, AP Industries Minister): low; likely presents awards.

**Canonical numbers.** All demo numbers come from [PROJECT_BRIEF §2](PROJECT_BRIEF.md) / [USER_JOURNEYS §6](../01-product/USER_JOURNEYS.md). **If [DEMO_SPEC.md](../../implementation/demo/docs/DEMO_SPEC.md) and this file disagree on a click or a label, DEMO_SPEC wins** and FP updates this file.

| Item | Value |
|---|---|
| Order | Order #14: plain 22K bangles, norm 2.50% of gross |
| Issue | 40.000 g |
| Return | piece 38.120 g + scrap 0.500 g |
| Wastage | allowed 1,000 mg; actual loss 1,380 mg |
| Variance flag | **+380 mg** (≈ ₹5,188 at 22K) |
| Dispute outcome | agreed adjustment 130 mg → 250 mg gross (229 mg fine) stays on Rafiq's balance |
| Settlement | labour ₹4,800 (HUNCH) + 5% GST ₹240 → UPI **₹5,040** |

---

## 1. The 3-minute pitch (Jobs structure: villain → hero → demo → one more thing)

The timing follows the judge heat-map (`research/C-judges.md` §4): field clip → pain in rupees → live demo with the human approval step → architecture and one eval number → money, jobs and channel.

| Time | Beat | Screen | Words (FP speaks; BE drives the laptop) |
|---|---|---|---|
| 0:00–0:20 | **Field clip (villain, in their voice)** | 15-second consented clip from a field interview: a karigar, in Bengali with English subtitles | *(Clip plays.)* Then: "That's a karigar we met on [date]. He holds gold for three jewellers. Last year he paid for 2 grams he says he never lost." *(Use the real quote collected in field interviews; never script a quote.)* |
| 0:20–0:40 | **The pain in rupees** | One slide: "₹4–5 lakh of someone else's gold. On a notebook line." | "Across India, jewellers hand gold to karigars on trust. A karigar typically holds four to five lakh rupees of someone else's gold. At today's price, one disputed gram is about fifteen thousand rupees, more than a month's income for many goldsmiths. The record is a notebook, and the weaker man pays." |
| 0:40–0:50 | **The hero** | `/stage` hero intro card (stepper step 0): "Two signatures on every gram." Press **Space** to enter S01 | "This is Tola. Two signatures on every gram." |
| 0:50–2:20 | **Live demo (90 s)** | `/stage`, DEMO_SPEC steps S01 → S11 | See §4 (Version A) for the clicks. Spoken track: "Monday: Suresh issues 40 grams for Order 14. The scale writes the number; nobody types it. Rafiq hears it in Bengali, and says haan. Two signatures, one chain. Thursday: the bangles come back with scrap. Saturday: one click runs the week. The agent flags Order 14: 380 milligrams over the agreed wastage. That's five thousand rupees, caught this week, not at month end. Rafiq replies by voice: the solder joint cracked. They agree, and both sign. Nothing was overwritten. Sunday: the settlement goes to both. Two ticks, and his pay opens as UPI: 5,040 rupees. And Rafiq now owns a work record he can show a bank." |
| 2:20–2:40 | **Architecture + one eval number** | Architecture slide: Lyzr Manager → Intake / Reconcile / Settle; Sarvam voice; `ledger-core`; hash chain | "AI never does gram arithmetic. Code computes every milligram. Three Lyzr agents listen, explain and draft, and a human signs every one. On our numeral test set, the spoken-number error rate is [X]% and material-variance recall is [Y]%." *(Fill X, Y from the latest [AI_EVALS](../04-ai/AI_EVALS.md) run; the MVP gate is nWER ≤ 8% clean and recall ≥ 98%. Never quote a number we have not measured.)* |
| 2:40–3:00 | **One more thing: money, jobs, channel** | Slide: three payers + Doot | "The jeweller pays seventy-nine rupees per karigar per month, insurance against a fifteen-thousand-rupee gram. The karigar pays nothing, ever. A JanAI Cafe Doot earns on every verified pair he onboards. And one more thing: every karigar works for several jewellers, so every karigar who joins brings his other jewellers. Tola. Two signatures on every gram." |

**Rules for the presenter:**
- Say "**karigar**", not "worker"; say "**seth**" only if the field interviews show karigars use it.
- Always say "**simulated**" when the UPI QR and lender view appear (it is on screen too).
- Never say "credit score", "blockchain", "certified" or "AI calculates".

### 1.1 Judge-specific emphasis (swap one sentence in the last 20 s)
| If the jury leans… | Replace the close with |
|---|---|
| JanAI / Padaki | "A Doot in a JanAI Cafe can onboard a jeweller and his karigars in an afternoon, paid per verified pair. It works on an ₹8,000 phone, in Bengali, Hindi and Kannada." |
| KAVMS / CA | "The numbers reconcile to the milligram; the CA gets a Rule 55 challan draft; and we never file anything ourselves." |
| Investor | "Five lakh jewellers, six million workers, and nobody owns the karigar's side of the ledger." |
| Bharath / government | "PM Vishwakarma lends to goldsmiths. Tola gives a goldsmith the record to borrow against." |

---

## 2. The 30-second explanation (Karp)
> Every jeweller hands gold to artisans on trust and settles the difference in arguments. Tola puts both of them on the same scale. Every gram that goes out and comes back is weighed by the instrument, confirmed by voice in the karigar's own language, and signed by both. An AI agent checks the balance every week, catches gaps while they are small, and prepares a settlement neither side can quietly edit. The jeweller stops losing grams he can't explain. The karigar, for the first time, owns a record that proves he is trustworthy, and that record is his ticket to credit.

---

## 3. Slide outline (8 slides; the demo is the main event)

| # | Title | Content | Time |
|---|---|---|---|
| 1 | *(Video)* | 15-second consented field clip, subtitled | 0:00 |
| 2 | ₹4–5 lakh on a notebook line | Karigar holds ₹4–5 lakh [S17]; 1 g ≈ ₹15,000 [S47]; income ₹10–20k/month [S18]; PS 2.2 boundary quote | 0:20 |
| 3 | Tola: Two signatures on every gram | Logo, ember→gold arc; three verbs: **weigh · hear · sign** | 0:40 |
| 4 | *(Live demo)* | `/stage`, DEMO_SPEC steps S01 → S11 | 0:50 |
| 5 | How it works | Architecture: scale → `ledger-core` (integer mg, SHA-256 chain, Ed25519 × 2) → Lyzr Manager (Intake · Reconcile · Settle) → HITL gate → Sarvam Saaras/Bulbul voice. One eval number | 2:20 |
| 6 | Who pays | Jeweller ₹79–99 per active karigar/month (HUNCH; ₹79 floor per COST.md); lender flat fee per consented pull (v1); refiner dust line (v2); Doot share; karigar free forever | 2:40 |
| 7 | The network | Each karigar works for several jewellers → each karigar pulls in his jewellers. Beachhead: Avenue Road / Chickpet → Zaveri Bazaar, Bowbazar, Coimbatore | 2:50 |
| 8 | Close | "Two signatures on every gram." Pilot shop result (from 16–22 Dec): N dual-signed events, N grams reconciled within 7 days | 3:00 |

**Backup slides (for Q&A only):** B1 reconciliation arithmetic for Order #14 · B2 unit economics ([FINANCIALS §2](../07-business/FINANCIALS.md)) · B3 3-year projection · B4 DPDP consent and Passport revocation · B5 GST job-work draft (Rule 55, 5% labour) · B6 eval table · B7 Lyzr agent graph with traces · B8 risk register top 5 · B9 field-interview summary (3 jewellers, 5 karigars) · B10 what's real vs mocked.

---

## 4. Demo script with exact clicks

**Source of truth:** [DEMO_SPEC.md](../../implementation/demo/docs/DEMO_SPEC.md) §6 (stepper), §9 (fallbacks) and §10 (choreography). The step IDs **S01–S13** below are DEMO_SPEC story steps; they are not the UI_SPEC screen IDs.

**Two versions of the demo:**
- **Version A (default): inside the 3-minute pitch.** The demo gets 90 s (0:50–2:20 in §1), so S04 is auto-performed with **Skip** and the tamper step S13 moves to Q&A.
- **Version B: demo-only slot.** If the organisers give a demo-only slot of 3 minutes, use DEMO_SPEC §10 verbatim.

**Setup** (DEMO_SPEC §10; done before going on stage, see §5):
- Laptop on HDMI at 1920 × 1080; Chrome full screen (F11); zoom 100%.
- `/stage` open at S01 after **Shift+R** (reset week; `POST /v1/demo/reset`, API-02). Sound at 70%.
- `AI_FALLBACK_MODE=cached` **unless the network is proven good 10 minutes before** (then `live`).
- Presenter A (FP) speaks; driver (FE) clicks. Optional: Presenter B holds a real Android phone on `/karigar?as=rafiq` (the live mirror, which receives the issue within about 1 s).

**Stepper keys:**
- **→ / Space** next · **←** back · **R** replay · **Shift+→** skip (auto-perform) · **Shift+R** reset week.
- Jump keys **1–9, 0, -, =, \** go to S01–S13.
- **?** opens the "Real vs mocked" sheet; **S** toggles simulated ↔ Web Serial scale.

### Version A: 90 seconds inside the pitch
| Time | Step | Day | Exact clicks / keys (FE) | What the audience sees | API | Line (FP) |
|---|---|---|---|---|---|---|
| 0:50–1:00 | S01 | Mon | Click the **gold bar icon** → it drops onto the scale; wait for **"Stable"**; click **Capture** | **40.000 g** appears on the scale; "Simulated scale" label | API-05 | "Monday. Suresh puts 40 grams on the scale. The scale writes the number; nobody types it." |
| 1:00–1:05 | S02 | Mon | Order #14 is pre-selected; click **Sign as Suresh** | Plain bangles, 2.50% norm, Suresh's tick | API-06, API-07 | "Plain bangles, two and a half percent wastage agreed up front. Suresh signs." |
| 1:05–1:17 | S03 | Mon | Bengali read-back plays on the phone frame; click **হ্যাঁ** on the phone | Second tick; the chain grows | API-09, API-07 | "Rafiq hears it in Bengali and says haan. Two signatures, chained." |
| 1:17–1:25 | S04 | Thu | **Shift+→** (skip: auto-performs the return 38.120 g + scrap 0.500 g, both signatures) | Return row appears, dual-signed | API-05, API-10, API-06 | "Thursday: the bangles come back, with scrap, weighed and signed." |
| 1:25–1:40 | S05 | Sat | **→**; click **Run week** | Flag: **Order #14 +0.380 g** over 2.50%, about ₹5,188; "Computed, not AI" | API-11 | "Saturday. One click. Three hundred and eighty milligrams over. Caught this week, not at month end." |
| 1:40–1:50 | S06 | Sat | **→**; click the **mic** on the phone (the dispute clip plays) | Voice bubble with transcript; line stays **Open** | API-12 | "Rafiq replies by voice: the solder joint cracked and he redid it. The line stays open." |
| 1:50–2:00 | S07 | Sat | **→**; click **Accept 0.130 g**; click **হ্যাঁ** on the phone | Resolved; 0.250 g stays on his account | API-12, API-07 | "They agree on 0.13 grams of rework. Both sign. Nothing is overwritten." |
| 2:00–2:12 | S08–S09 | Sun | **→**; click **Approve** (console), **Approve** (phone); the QR appears; click **Mark paid (simulated)** | Two ticks; UPI QR for **₹5,040**; "Simulated, no money moves" | API-13, API-14 | "Sunday. One statement to both. Two ticks, and his pay opens by UPI: five thousand and forty rupees." |
| 2:12–2:20 | S10–S11 | — | **→**; on the phone click **Share passport → Meera → 7 days → Share**; the lender sheet opens | "Mocked lender view": 194 g handled, 92.9% on time, inside the norm | API-15 | "And Rafiq owns his record. He chooses who sees it, and he can take it back." |

**Q&A-only steps:**
- **S12**, GST draft: press **=**. Shows a PDF watermarked "DRAFT, for your CA. Not filed." (API-16).
- **S13**, tamper: press **\**, click **Verify** ("Chain valid"), then **Tamper** (turns red) (API-08).

**If running over time:** Shift+→ through S06, and drop S10–S11 into Q&A.

---

## 5. Fallback plan (if Wi-Fi or an API dies)
Automatic per-call fallbacks are built into the demo (DEMO_SPEC §9):
- **Lyzr** slower than 6 s or erroring: cached reply, else a deterministic template, with a "cached" / "template" pill.
- **Sarvam TTS** slower than 3.5 s: baked audio.
- **Sarvam STT** slower than 5 s, or mic blocked: seeded clip and transcript.

**Always real in every mode:** signatures, the hash chain and the reconciliation arithmetic (R-07).

| Level | Trigger | Action | Who | Time to switch |
|---|---|---|---|---|
| **L0 Live** | Network proven good 10 min before the slot | `AI_FALLBACK_MODE=live`; per-call fallbacks still active | AI watches the pills | — |
| **L1 Cached (stage default)** | Any doubt about the venue network | `AI_FALLBACK_MODE=cached`: never calls the network; baked Bengali audio, stored transcripts, cached Lyzr replies | AI | Set before going on stage |
| **L2 Offline laptop** | `navigator.onLine` false, API health fails, or the hosted URL is cold (> 2 s health) | Laptop-only stack: `docker compose up` (web :3000, api :8000, SQLite seed) with `AI_FALLBACK_MODE=cached`; switch the browser to `localhost:3000/stage`; press the step number to resume | BE | ≤ 15 s (tab already open) |
| **L3 Backup laptop** | Stage laptop crashes | Identical stack on the second laptop (same commit); HDMI adapter ready | BE | ≤ 45 s |
| **L4 Video** | Both laptops fail | 3-minute backup video from USB (TOLA-154); FP narrates live | FP | ≤ 30 s |
| Audio | Venue PA silent | Captions on the phone frame carry the meaning; say "he hears it in Bengali" | FP | 0 s |
| Tab crash | — | Story state persists in `localStorage`; reload and press the step number | FE | ≤ 10 s |

**Pre-flight checklist (T−30 min; DEMO_SPEC §11):**
- [ ] `scripts/stage-check.sh` passes: API health, reset ≤ 1 s, cached audio present, fonts self-hosted.
- [ ] All 13 steps pass with Wi-Fi off (one silent run).
- [ ] Figures on screen match the canonical numbers (40.000 / 38.120 / 0.500 / +0.380 / 0.130 / 0.250 / ₹5,040).
- [ ] Labels visible: "Simulated, no money moves", "Mocked lender view", "DRAFT, for your CA", "Demo keys".
- [ ] Bengali read-back audible through the venue speaker; captions on.
- [ ] Light theme for the projector unless the room is dark.
- [ ] Backup laptop on the same commit (`git rev-parse HEAD` matches); USB with video; phone hotspot.
- [ ] Optional real balance: toggle **S** only if Web Serial was tested at the venue (R-03). Otherwise say "simulated scale; in a shop it's the shop's own verified balance" (R-04).

---

## 6. Judge Q&A bank

Answers are short on purpose: one sentence, then stop. Owner = who answers on stage (FP by default; BE for engineering; AI for models).

### 6.1 Madan Padaki / JanAI (field, voice, jobs, Doots, rural)
| # | Question | Answer |
|---|---|---|
| 1 | Which jeweller and karigar did you actually talk to? | "[N] jewellers on Avenue Road and [N] karigars; here's the clip and the field notes in our deck appendix B9." (Fill from field interviews; never invent.) |
| 2 | Can a JanAI Cafe Doot sell this? | "Yes: the outcome is a verified active pair, one jeweller and one karigar with four signed events in 30 days; the Doot earns ₹150 per pair plus 10% for a year (HUNCH)." |
| 3 | Does it work on an ₹8,000 phone? | "The karigar screen is one number, one voice clip and two buttons, built for a ₹6–8k Android; v1 adds WhatsApp and a plain phone call." |
| 4 | What if the karigar can't read? | "He doesn't need to: he hears the weight in his language and says haan; numbers are always spoken back." |
| 5 | Which languages? | "Bengali, Hindi and Kannada voice in the demo; Marathi and Tamil in v1, since that's where karigar clusters are." |
| 6 | How many jobs does this create? | "Doots: about one per 30 shops (HUNCH), so 50 Doot livelihoods at 1,500 shops; plus it protects the income of karigars who absorb disputed grams today." |
| 7 | Does it replace anyone's livelihood? | "No. It replaces a notebook, not a person; the karigar keeps his work and gains a record." |
| 8 | Why would the karigar trust a tool the jeweller pays for? | "He holds an uneditable copy, he signs every gram, disputes are never overwritten, and it's free for him forever." |
| 9 | What about women? | "Counter staff who issue gold are often women (P-03), and we target at least a quarter of Doots being women; on the bench itself our sources show mostly men, so we don't overclaim." |
| 10 | Is it voice-first or app-first? | "Voice-first for the karigar; the jeweller gets a screen because he already uses one." |
| 11 | Does it plug into JanAI Bazaar? | "It's designed as a Bazaar provider paid per completed, consented outcome; we'd like the sandbox details at the AMA." |
| 12 | Where's consent? | "Notice in his language at onboarding; the Work Passport is shared only by him, to a named recipient, with an expiry and one-tap revoke." |
| 13 | What happens with no network in a karkhana? | "v1 is offline-first: signed events queue on the phone and sync later; the demo also runs fully offline." |
| 14 | Shared phone in a workshop? | "Per-person keys with a PIN, and head-karigar delegation in v1." |
| 15 | How would this reach a small town, not just Bengaluru? | "Through Doots and co-op banks: Mysuru is our first Doot pilot, then karigar clusters." |
| 16 | Who are your first 10 customers? | "Avenue Road and Chickpet jewellers via KAVMS introductions, starting with our pilot shop." |
| 17 | What did the field interviews change? | "[Fill from interviews: e.g. the wastage norm per order type, or whether karigars prefer WhatsApp vs a call.]" |
| 18 | Isn't this just digitising a register? | "The register exists; what's new is the karigar's signature and his own copy, which turns a register into evidence." |
| 19 | What does the AI really do? | "It listens, extracts, explains and drafts in his language; code does every gram; a human signs." |
| 20 | Migrant karigars who go home? | "His Passport goes with him: a new jeweller or a bank in West Bengal can read it with his consent." |
| 21 | Is the karigar forced to share data with lenders? | "Never; only he can share, and he can revoke." |

### 6.2 CA Dr I S Prasad (numbers, compliance, liability, unit economics)
| # | Question | Answer |
|---|---|---|
| 1 | Show me the Order #14 arithmetic. | "Allowed 40,000 mg × 2.50% = 1,000 mg; loss 40,000 − (38,120 + 500) = 1,380 mg; variance +380 mg; at 22K, 0.380 × 0.916 × ₹14,904 ≈ ₹5,188." (Backup slide B1.) |
| 2 | Why integer milligrams? | "No float errors on gold: every weight is stored as integer mg and fineness in parts per thousand." |
| 3 | Does the AI compute any number? | "No. `ledger-core` computes; the AI only explains numbers it is given, and an eval checks every explanation matches the numbers exactly." |
| 4 | What GST applies? | "Job-work labour at 5%, with a Rule 55 delivery challan when gold goes to the job worker; we draft both, the CA files [S24]." |
| 5 | Who is liable if a draft is wrong? | "The filer, as today: every draft is labelled draft, carries the signed events behind it, and is reviewed by the CA." |
| 6 | Do you file GST? | "No. Drafts only. Filing stays with the CA." |
| 7 | Is the weight legally valid? | "Real transactions use the shop's own verified balance under the Legal Metrology Act; Tola records the reading, it doesn't replace the instrument." |
| 8 | Can the jeweller edit an entry after signing? | "No. Events are append-only and hash-chained; a correction is a new ADJUSTMENT both must sign." |
| 9 | Is this an audit trail an auditor can use? | "Yes: each event has two Ed25519 signatures and a SHA-256 link to the previous one; one changed byte breaks the chain at that event." |
| 10 | Unit economics? | "₹89 blended per active karigar per month at Year 3 (HUNCH; ₹79 floor), variable cost ₹41.50 (₹46 fully loaded at 10k karigars), gross margin about 49%, CAC ₹3,200 per shop, payback about 10 months, LTV:CAC about 3.8." |
| 11 | What's the biggest cost risk? | "AI design: a Manager agent on every voice note would cost ₹398 per karigar per month; our optimised design costs ₹38, and CI fails any build above ₹40." |
| 12 | Break-even? | "About 27,100 paid active pairs (about 3,900 shops), around 2031 on our plan; at ₹99 it is about 22,300 pairs." |
| 13 | How do you handle TDS on labour payments? | "Not in scope for the MVP; v1 shows the labour amount for the CA to apply any TDS. We haven't verified a threshold, so we don't automate it." |
| 14 | Dust and scrap: how are they valued? | "As grams at declared fineness, credited as a DUST_CREDIT event both sign; rupees only at settlement." |
| 15 | What gold rate do you use? | "The rate is entered and signed at settlement; the demo uses ₹1,49,041 per 10 g 24K from 20 Oct 2026." |
| 16 | What if the scale is wrong? | "Both parties see the same reading; the shop's balance must be verified; disputes stay open until both sign." |
| 17 | Is the revenue projection realistic? | "It's conservative and every assumption is listed in FINANCIALS §1; the price is our biggest unknown, so we test it first." |
| 18 | How do you hold the money? | "We don't. Payment goes PSP to bank via UPI; the demo is simulated." |
| 19 | Do you hold the gold? | "No custody of gold or money, ever." |
| 20 | What data do you keep, and for how long? | "Ledger events for the statutory record period the CA needs; personal data minimised and retained per our DPDP notice; details in PRIVACY.md." |
| 21 | Can a settlement be reopened? | "A new dispute can be opened on a settled line; the original settlement stays in the chain." |

### 6.3 KAVMS jeweller (would my shop pay, trust, operations)
| # | Question | Answer |
|---|---|---|
| 1 | Would I pay for this? | "₹79 per karigar per month: one avoided disputed gram pays for about 190 karigar-months." |
| 2 | Why should my karigars see my books? | "They don't see your books, only their own account, which the problem statement requires; and a shared number ends the month-end argument." |
| 3 | My karigars will refuse. | "It's free for them, it's their copy, and it speeds their pay; that's why they ask their other jewellers to join." |
| 4 | I already use Marg / Jwelly. | "Keep it; Tola is the signed job-work layer next to it, and v1 exports to Tally." |
| 5 | How long does an issue take? | "Put the gold on the scale and tap once; the karigar confirms in seconds." |
| 6 | What about studded and antique work? | "Norms are agreed per order type and signed up front: field norms are 2–3% plain, 20–30% studded, about 4% antique [S17]." |
| 7 | What if a karigar runs away with gold? | "You'll have a signed, timestamped record of exactly what he holds, which today's notebook doesn't give you or the police." |
| 8 | Can my staff use it? | "Yes: counter staff issue and receive; the scale writes the number so they never type a weight." |
| 9 | Does it work with my scale? | "If your balance has a serial or Bluetooth output, yes; otherwise v1 reads the display with the camera." |
| 10 | What if the internet is down at the shop? | "v1 works offline and syncs later." |
| 11 | Who else sees my data? | "Nobody without consent; the karigar shares only his own record." |
| 12 | Will my competitor see my karigar's work for me? | "A Passport shows totals and on-time %, not your designs, customers or prices." |
| 13 | What does the weekly flag give me? | "The gap on the specific order, the same week, while both of you remember what happened." |
| 14 | Can I set different norms per karigar? | "Yes, per shop–karigar pair, versioned and signed by both." |
| 15 | Will it help with wedding deadlines? | "v1 tracks orders against occasion dates across karigars and flags late risk." |
| 16 | What languages for me? | "Kannada and English for the shop; the karigar hears his own language." |
| 17 | How do I pay the karigar? | "On dual approval a UPI intent opens; money goes from your bank to his." |
| 18 | Is my data safe? | "Stored in India (GCP Mumbai in v1), encrypted, and every change is tamper-evident." |
| 19 | What happens if you shut down? | "You can export every signed event, and the karigar keeps his copy." |
| 20 | Have any jewellers used it? | "One pilot shop with three karigars in the week of 16–22 Dec; here's what it caught." (Fill from pilot.) |
| 21 | Will my karigars demand more money once they see the numbers? | "They already know their numbers; what changes is that both of you now agree on them." |

### 6.4 RVCE faculty (engineering rigour, what you built)
| # | Question | Answer |
|---|---|---|
| 1 | What did you build vs call through an API? | "We built the ledger core, hash chain, signatures, reconciliation, dispute and settlement logic, the web app and the agent graph; we call Sarvam for speech and Lyzr for agent hosting." |
| 2 | Why a hash chain, not a blockchain? | "Two parties, one log: SHA-256 chaining plus two Ed25519 signatures gives tamper evidence without tokens, miners or gas." |
| 3 | Where are the private keys? | "Client-side per persona in the demo (`@noble/ed25519`); in v1 on the device behind a PIN or passkey; the server verifies with PyNaCl." |
| 4 | How do you prevent a replayed signature? | "Each signature covers the canonical event payload including its `prev_hash` and id, so it's valid for exactly one position in one chain." |
| 5 | What if both sides collude to falsify? | "Then both signed it; Tola proves agreement, not truth, which is why the weight comes from the instrument." |
| 6 | How do you handle concurrent events? | "Events are appended per chain under a transaction; the API rejects a stale `prev_hash`." |
| 7 | Test strategy? | "Unit tests on ledger-core arithmetic, contract tests on the OpenAPI spec, Playwright for the story, and an AI eval suite gated in CI." |
| 8 | How do you evaluate speech on numbers? | "A code-mixed numeral test set in bn/hi/kn; the MVP gate is numeral WER ≤ 8% clean and ≤ 15% noisy." |
| 9 | Precision/recall of flags? | "On a synthetic month with injected errors, the gate is ≥ 98% recall on material variance and ≥ 85% precision." |
| 10 | What happens on low STT confidence? | "It never auto-signs; it asks again or falls back to the Haan/Na tap." |
| 11 | Prompt injection via a voice note? | "Agents never get tools that sign or move money; outputs are drafts behind a human gate; red-team tests in CI must have 0% success." |
| 12 | Latency targets? | "p95 STT ≤ 2.5 s, TTS ≤ 1.5 s, agent ≤ 6 s." |
| 13 | Why FastAPI + SQLite for the demo? | "Fast to build, file-based seed, zero ops; v1 moves to Postgres 16 with Alembic migrations." |
| 14 | How does it scale? | "Stateless Cloud Run services, Postgres, a worker for weekly reconciliation; the ledger is per pair, so it partitions naturally." |
| 15 | How does offline sync avoid conflicts? | "Events are signed on-device and appended on sync; a conflicting `prev_hash` is re-based only with fresh signatures." |
| 16 | What's novel here? | "No jewellery ERP gives the karigar his own signed account; the two-signature, voice-confirmed job-work ledger doesn't exist." |
| 17 | How do you read a scale without an interface? | "Web Serial for serial balances; v1 adds BLE and seven-segment OCR, with a two-person confirm as the fallback." |
| 18 | What's mocked? | "UPI money movement, the lender view and GST filing; all labelled on screen." |
| 19 | Accessibility? | "48 px targets on the karigar screen, numbers spoken, reduced-motion support, four UI languages." |
| 20 | Show me the code. | "Repo link on the last slide; CI is green; the eval report is in the README." |
| 21 | How do you version wastage norms? | "A WastageNorm is itself signed by both and versioned; reconciliation uses the version in force at issue." |

### 6.5 Lyzr technologist (agent design, guardrails, traces)
| # | Question | Answer |
|---|---|---|
| 1 | Where is Lyzr in the stack? | "A Manager agent routes to IntakeAgent, ReconcileAgent and SettleAgent on Lyzr Agent Studio via `lyzr-adk` 0.1.12." |
| 2 | Why multi-agent, not one prompt? | "Each agent has one job, its own guardrails and its own eval; the manager only routes." |
| 3 | What tools can agents call? | "Read-only ledger lookups and draft creation; no agent can sign, approve or move money." |
| 4 | Where's the human in the loop? | "Every draft passes a human gate; nothing enters the ledger without two signatures." |
| 5 | Show me a trace. | "Backup slide B7: voice note → intake draft → human edit → signed event." |
| 6 | Which LLM? | "`gpt-4o-mini` via Lyzr, with Gemini Flash as fallback, and a deterministic template if Lyzr is unreachable." |
| 7 | How do you stop hallucinated numbers? | "The ReconcileAgent receives the numbers from ledger-core and an automated check rejects any explanation whose numbers differ." |
| 8 | How do you handle Indic speech if Lyzr doesn't? | "Speech runs on Sarvam Saaras and Bulbul; Lyzr gets text, which also keeps voice-minute costs off the agent." |
| 9 | Cost per active karigar? | "AI ≈ ₹38 per karigar per month in the optimised design (deterministic parser first, one reconcile run per shop-week, no Manager on the hot path), gated at ≤ ₹40; the naïve design would be ₹398." |
| 10 | How do you eval agents? | "Offline eval sets per agent with thresholds in `thresholds.yaml`, gated in CI; live evals before release." |
| 11 | What's your memory or state model? | "State lives in the ledger, not the agent; agents are stateless per call with the relevant events passed in." |
| 12 | What if the manager misroutes? | "Routing accuracy is evaluated (gate ≥ 95%), and disputes have a 100% recall gate." |
| 13 | Would you use Lyzr in production? | "Yes, as long as AI stays under ₹40 per karigar per month against a ₹79 price; that's a conversation we want with you." |
| 14 | Do you use Lyzr's RAG? | "Only for GST job-work rule snippets in the SettleAgent's drafts; ledger facts are passed directly." |
| 15 | Responsible-AI controls? | "No scoring of people, no accusatory wording (gated at 0), bias checks across languages." |
| 16 | How do you handle prompt injection in transcripts? | "Transcripts are data in a delimited field; injection detection is evaluated; agents have no dangerous tools anyway." |
| 17 | Why is this agentic, not a CRUD app? | "The agents turn messy voice and scale input into structured events, explain variance and draft settlements for two parties: real work, gated by humans." |
| 18 | Latency budget per agent? | "p95 ≤ 6 s; cached mode serves stored outputs on stage if live calls slow down." |
| 19 | What's the BFSI angle for Lyzr? | "The Work Passport is a consented artisan credit file: a lender-side agent use-case." |
| 20 | Could Lyzr Voice Agents replace Sarvam? | "If Indic voice support is documented; today we keep speech on an Indian stack." |
| 21 | How do you version prompts? | "Prompts are files in the repo, versioned, with the eval report attached to each change." |

### 6.6 Investor (market, GTM, moat, team)
| # | Question | Answer |
|---|---|---|
| 1 | How big is this? | "About 5 lakh jewellers [S16] and 6.1 million workers in gems and jewellery [S17]; our serviceable market is about ₹1,070 crore a year at ₹89 per pair (HUNCH)." |
| 2 | Who pays? | "The jeweller, per active karigar; later, lenders per consented pull and refiners on the dust line." |
| 3 | What's the moat? | "The karigar network: each karigar works for several jewellers, and his signed history only grows on Tola." |
| 4 | Why won't Marg or Jwelly copy you? | "Their customer is the jeweller; building the karigar's side means earning the trust of the other party." |
| 5 | CAC and payback? | "₹3,200 per shop, payback about 10 months, LTV:CAC about 3.8 (assumptions in FINANCIALS)." |
| 6 | What's the beachhead? | "Avenue Road and Chickpet jewellers in Bengaluru, then Zaveri Bazaar, Bowbazar and Coimbatore." |
| 7 | Traction? | "One pilot shop and three karigars in December; target 10 paying shops by March 2027." |
| 8 | How much are you raising? | "₹25–40 lakh pre-seed, mostly non-dilutive (SISFS grant up to ₹20 lakh), then about ₹2.5 crore seed in 2028." |
| 9 | Biggest risk? | "Jewellers refusing transparency; we sell to shops already losing grams, as dispute insurance." |
| 10 | Why now? | "Gold is near ₹1.5 lakh per 10 g, BIS made instrument-captured weight the norm in 2026, and Indic voice AI is cheap." |
| 11 | Why you? | "We did the field work: [N] interviews; and we built a working ledger with real crypto and voice in three weeks." |
| 12 | Is the team staying on it? | "[Answer honestly per team decision by 20 Dec.]" |
| 13 | What's the 10-year vision? | "The fine-gold ledger of India's informal jewellery manufacturing: bench to refinery to buyer." |
| 14 | Network effect, quantified? | "Target 0.3 new jewellers per onboarded karigar within 60 days (HUNCH, to measure)." |
| 15 | Churn? | "Assumed 2.5% per month at scale; the signed history makes leaving costly." |
| 16 | Can it go beyond gold? | "Any informal handover of value: silver, textiles, piece-rate work." |
| 17 | Regulatory risk? | "We avoid lending, scoring and custody; DPDP consent is built in; GST is draft-only." |
| 18 | Why would lenders pay? | "A tamper-evident, counter-signed work history is rare evidence for thin-file artisans, and PM Vishwakarma lenders need it." |
| 19 | Exit? | "Acquirers include jewellery ERPs, gold-loan fintechs and payments companies." |
| 20 | What would make you fail? | "If jewellers won't pay ₹79, or if AI cost creeps above ₹40 per karigar; price is our first field test and AI cost is gated in CI." |
| 21 | Gross margin? | "About 48% at Year 3 after speech, agents, messaging and Doot share; it depends on keeping AI under ₹40 per karigar." |

### 6.7 T G Bharath (scale, state, industry)
| # | Question | Answer |
|---|---|---|
| 1 | Can this scale across Andhra Pradesh? | "Yes: wherever jewellers use karigars; we'd start with one jewellery cluster and a co-op bank partner." |
| 2 | What do you need from government? | "An introduction to the PM Vishwakarma lending banks and the MSME department to pilot the Passport." |
| 3 | How many jobs? | "Doot livelihoods per district plus protecting karigar income; we measure both." |
| 4 | Does it help MSMEs formalise? | "Yes: signed job-work records and GST challan drafts are formalisation without paperwork." |
| 5 | Is the data in India? | "Yes, GCP Mumbai in production." |
| 6 | Can it serve Telugu-speaking karigars? | "Adding a language is a read-back template and a voice; Telugu can follow Marathi and Tamil." |
| 7 | How does it help exports? | "The same ledger reconciles export job-work wastage, 4–6 g per kg [S17]." |
| 8 | What does it cost the state? | "Nothing to start; jewellers pay." |
| 9 | Will it work in small towns? | "Through Doots in cafes and plain phone calls for karigars without smartphones." |
| 10 | How long to pilot in a district? | "About 90 days for 10 shops, as in our Bengaluru plan." |
| 11 | Is it compliant with Indian law? | "DPDP consent, Legal Metrology via the shop's verified scale, GST drafts only." |
| 12 | Does it involve Aadhaar? | "Not required; PM Vishwakarma ID is optional for karigars who have it." |
| 13 | What about industry beyond jewellery? | "Any trade where material is issued on trust to artisans: textiles, brass, silver." |
| 14 | What makes this different from other apps? | "The weaker party signs and owns a copy." |
| 15 | How does it help women? | "Women counter staff and women Doots; we track and report the share." |
| 16 | Is AI replacing people here? | "No; AI listens and explains, people sign." |
| 17 | Where are you incorporated? | "Bengaluru, planned January 2027." |
| 18 | Would you relocate a pilot to AP? | "Happy to run a second cluster pilot with a partner in AP." |
| 19 | What about gold smuggling or fraud? | "We record only what the parties weigh and sign; we never hold gold or certify purity." |
| 20 | One sentence for the press? | "Two signatures on every gram, so no karigar pays for gold he didn't lose." |

---

## 7. Sponsor-prize angle (Lyzr)
- **What to show:** the Manager → Intake / Reconcile / Settle graph on slide 5, a Lyzr call in step S04 (intake from voice; the Skip key still makes the same API calls) and S05 (flag explanation), and trace slide B7.
- **Story for Lyzr:** a governed, human-gated agent workflow with a BFSI outcome (a consented artisan credit file). This matches Lyzr's customer base, which is about 70% BFSI [B §1].
- **Honesty line:** "Speech runs on Sarvam, an Indian stack; Lyzr runs the agents." Lyzr documents no Indic voice support [B §1].
- **Ask:** startup or customer-VPC pricing that keeps AI under ₹40 per karigar per month against a ₹79 price ([FINANCIALS §2.1](../07-business/FINANCIALS.md)).
- Whether a Lyzr-specific prize exists: UNKNOWN. Ask at the 24 Dec AMA ([HACKATHON_PLAN §9](HACKATHON_PLAN.md)).

## 8. MVP (hackathon) vs v1 (production) in the pitch
- **Say it's real:** scale capture (simulated or Web Serial), Bengali read-back, signatures, hash chain, reconciliation arithmetic, intake and explanation agents, settlement and the GST draft.
- **Say it's mocked:** UPI money movement, the lender view, GST filing, WhatsApp/IVR (shown as an on-screen phone).
- **v1 (`implementation/scalable`):** OTP login, Postgres, offline PWA, WhatsApp/IVR, PSP payments, GCP Mumbai.
