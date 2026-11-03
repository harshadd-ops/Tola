# User Journeys
> Project: Tola · Owner: Product lead · Status: Draft v0.1 · Last updated: 2026-10-20
> Related: [PRD](./PRD.md) · [Personas](./PERSONAS.md) · [User Stories](./USER_STORIES.md) · [Features](./FEATURES.md) · [UI Spec](../02-design/UI_SPEC.md) · [Demo build](../../implementation/demo/README.md) · [Scalable build](../../implementation/scalable/README.md)

Each persona gets a current-state journey (today, on paper and trust) and a future-state journey (with Tola). Mermaid `journey` scores run from 1 (very bad) to 5 (very good). They are our reading of the cited research and are to be validated in field interviews by 15 Nov 2026 (owner: Field/Pitch).

Where it matters, steps are tagged **MVP** (`implementation/demo`) or **v1** (`implementation/scalable`).

---

## 1. P-02 Rafiq (karigar)

### 1.1 Current state
```mermaid
journey
  title Rafiq today: one month with one jeweller
  section Issue
    Collects 40 g at the counter: 3: Rafiq
    Entry goes in the jeweller's book, not his: 2: Rafiq
    Writes his own slip, maybe: 2: Rafiq
  section Work
    Makes the piece, solder joint cracks, redoes it: 3: Rafiq
    Extra filing loss is not recorded anywhere: 2: Rafiq
  section Return
    Returns piece and scrap, weights noted in the book: 3: Rafiq
  section Month end
    Book says he owes 2.1 g more than his slip: 1: Rafiq
    Cannot prove it, absorbs the loss: 1: Rafiq
    Waits weeks for labour money: 1: Rafiq
```
Sources: wastage-based pay and registers [S17]; "artisans waiting weeks to be paid" [S1]; the 2.1 g composite is from the ideas file.

### 1.2 Future state (Tola)
```mermaid
journey
  title Rafiq with Tola: the same month
  section Issue
    Scale number appears on his phone: 4: Rafiq
    Hears it in Bengali and says haan: 5: Rafiq
    Holds a signed copy he can replay: 5: Rafiq
  section Return
    Piece and scrap weighed, voice note explains rework: 4: Rafiq
  section Weekly check
    Agent flags 0.38 g over norm the same week: 3: Rafiq
    Replies by voice, dispute stays open and visible: 4: Rafiq
  section Settle
    Same statement on both phones, two ticks: 5: Rafiq
    Paid by UPI on approval: 5: Rafiq
  section Later
    Shares a Work Passport with a co-op bank: 5: Rafiq
```

### 1.3 Emotional curve
```mermaid
xychart-beta
  title "Rafiq: feeling at each step (1 to 5)"
  x-axis ["Issue", "Work", "Return", "Variance found", "Dispute", "Settle", "Paid", "Passport"]
  y-axis "Feeling" 1 --> 5
  line "Today" [3, 3, 3, 1, 1, 1, 1, 1]
  line "With Tola" [5, 3, 4, 3, 4, 5, 5, 5]
```

### 1.4 Moments of truth
1. **The first read-back.** If the number he hears is not the number he saw on the scale, trust is gone. The scale is the source of truth, and the number is always spoken in full (F-01, F-02; R-02).
2. **The first flag against him.** He must be able to reply, and the line must stay open, not be silently corrected (F-06).
3. **The first payment.** If dual approval does not lead to faster pay, the app is just more work for him (F-07).

---

## 2. P-01 Suresh (jeweller)

### 2.1 Current state
```mermaid
journey
  title Suresh today: wedding season
  section Issue
    Lakshmi weighs gold, notes it in the register: 3: Suresh, Lakshmi
    Wastage agreed verbally: 2: Suresh
  section Tracking
    30 to 60 open orders across 8 karigars: 2: Suresh
    No idea which order is late until the customer calls: 1: Suresh
  section Month end
    Totals do not match karigar slips: 1: Suresh
    One hour argument per karigar: 1: Suresh
    Loss averaged, cannot trace to item: 1: Suresh
```
Sources: "agreed verbally", missed wedding dates [S1]; "averaged monthly … can't be traced" [S28].

### 2.2 Future state (Tola)
```mermaid
journey
  title Suresh with Tola
  section Issue
    Weight from the balance, photo, norm 2.50 pct picked: 4: Suresh, Lakshmi
    Karigar confirms in under 20 s: 5: Suresh
  section Weekly
    Run week shows one flag with grams and rupees: 4: Suresh
    Agent explains the flag in Kannada: 4: Suresh
  section Dispute
    Reads the karigar's reply, agrees an adjustment: 4: Suresh
  section Settle
    Approves the statement, UPI intent opens: 5: Suresh
    GST challan and invoice drafts ready for the CA: 4: Suresh
```

### 2.3 Moments of truth
1. **The first issue at rush hour.** It must be as fast as the notebook (target: ≤ 20 s including the karigar's confirm).
2. **The first flag is right.** If a flag comes from scale noise, he stops trusting the agent. Tolerance is open question Q-2 in the [PRD](./PRD.md#10-open-questions).
3. **The first month end that takes 5 minutes, not 5 hours.**

---

## 3. P-03 Lakshmi (counter staff)

### 3.1 Current vs future (flow)
```mermaid
flowchart LR
  subgraph Today
    T1[Weigh] --> T2[Read display] --> T3[Write in register] --> T4[Karigar signs slip, sometimes] --> T5[Month end: retype into statement]
  end
  subgraph Tola
    N1[Weigh] --> N2[Tap Capture: reading arrives from balance] --> N3[Photo + order + norm] --> N4[Karigar confirms on his phone] --> N5[Statement drafts itself]
  end
```

### 3.2 Moments of truth
- **The scale does not connect at 11 a.m. on a Saturday.**
  - Fallback 1 (v1): M-04 display OCR.
  - Fallback 2: two-person manual confirm, where both type the same number. The event is marked `source=manual_dual`; this source value needs adding to E-08 in [DATA_MODEL.md](../03-engineering/DATA_MODEL.md).
  - MVP: the simulated widget.
- **The first time the owner asks "who entered this?"** The answer is in the signatures, not in her memory.

---

## 4. P-04 Credit officer (lender)

### 4.1 Current vs future
```mermaid
journey
  title Credit officer: a karigar asks for a ₹50,000 working-capital loan
  section Today
    No ITR, no bureau file: 1: Officer
    Calls a jeweller for a reference: 2: Officer
    Declines or asks for a guarantor: 2: Officer
  section With Tola (MVP mocked, v1 real link, v2 AA/ULI)
    Opens the karigar's passport link: 4: Officer
    Sees 26 weeks, 4.2 kg handled, 96 pct on time, verified chain: 5: Officer
    Decides on the bank's own policy, Tola gives no score: 4: Officer
```
The numbers in the passport (26 weeks, 4.2 kg, 96%) are demo seed values, not research data.

### 4.2 Moments of truth
- **"Can I verify this?"** The page shows `chain_status: verified`, the number of counter-signing jewellers and the share expiry.
- **"Is this a score?"** No. The page says "Tola does not score or lend" (R-06).

---

## 5. P-05 Head karigar (v1)

```mermaid
flowchart TD
  A[Jeweller issues 120 g to the karkhana] -->|head karigar signs| B[Workshop balance]
  B --> C1[Helper 1: 40 g, PIN-signed on the shared phone]
  B --> C2[Helper 2: 50 g]
  B --> C3[Helper 3: 30 g]
  C1 & C2 & C3 --> D[Returns + scrap + dust weighed]
  D --> E[Offline queue F-11]
  E -->|sync when online| F[Jeweller ledger + workshop sub-ledger]
  F --> G[Weekly run: per helper and per jeweller]
```
The helper sub-ledger and delegation are v1+ design (R-09; Q-3 in the [PRD](./PRD.md#10-open-questions)). Not in MVP.

**Moment of truth:** a helper leaves with gold. The head karigar can show exactly which signed issues were outstanding, and from which jeweller.

---

## 6. The scripted demo week (MVP)
This is the story mode in `implementation/demo`. It uses seeded people (P-01 Suresh, P-02 Rafiq, P-04 lender) and real arithmetic. All weights are integer milligrams. The rate is ₹14,904/g 24K (₹1,49,041/10 g, 20 Oct 2026 [S47]) and fineness is 916.

| Step | Day | Role on screen | What happens | Feature · API | Numbers |
|---|---|---|---|---|---|
| 1 | Mon | Jeweller | Issue to Rafiq for **Order #14** (plain 22K bangle pair); norm **2.50%** | F-01 · API-05, API-06 | 40.000 g gross (36.640 g fine) |
| 2 | Mon | Karigar (phone frame) | Bengali read-back; Rafiq taps "haan"; both signatures appear; chain grows | F-02, F-03 · API-09, API-07 | — |
| 3 | Thu | Jeweller + Karigar | Return: piece **38.120 g**, scrap **0.500 g**. Rafiq's voice note: "the solder joint cracked, I redid it" | F-04 · API-10 | Returned 38.620 g |
| 4 | Sat | Jeweller | "Run week". Flag: Order #14 is **0.380 g above** the agreed wastage | F-05 · API-11 | Loss 1.380 g, allowed 1.000 g, variance +0.380 g ≈ ₹5,188 at 22K |
| 5 | Sat | Karigar | Rafiq opens a dispute and replies by voice | F-06 · API-12 | — |
| 6 | Sat | Jeweller + Karigar | Both agree to accept 0.130 g as rework wastage. An `ADJUSTMENT` is signed by both; **0.250 g** stays on Rafiq's balance | F-06, F-03 | 0.250 g gross = 0.229 g fine |
| 7 | Sun | Both | Settlement draft: gold carried forward 0.229 g fine; labour ₹4,800 (seed value, HUNCH); GST 5% ₹240 on the labour-invoice draft | F-07, F-09 · API-13, API-16 | Payable ₹5,040 |
| 8 | Sun | Both | Two ticks, then a UPI intent and QR labelled "Simulated, no money moves" | F-07 · API-14 | ₹5,040 |
| 9 | — | Karigar → Lender | Rafiq shares a 7-day Work Passport; lender view labelled "Mocked lender view" | F-08 · API-15 | Seeded history |
| 10 | — | Jeweller | Tamper demo: one stored byte is edited and chain status shows "broken at event N" | F-03 · API-08 | — |

**Arithmetic check (for the CA judge):**
- allowed = 40,000 mg × 2.50% = **1,000 mg**;
- loss = 40,000 − (38,120 + 500) = **1,380 mg**;
- variance = **+380 mg**;
- ₹ at 22K = 0.380 × 0.916 × ₹14,904 = **₹5,188** (rounded).
- After the 130 mg adjustment, the balance owed is 250 mg gross = 229 mg fine.

The seed values here (Order #14, 40.000 g, 38.120 g, 0.500 g, 2.50%, ₹4,800 labour) are the reference for `implementation/demo` seeds and the pitch script. If they change, update this table first.

---

## 7. Edge cases (all journeys)
| # | Edge case | Expected behaviour | Feature | MVP / v1 |
|---|---|---|---|---|
| EC-1 | Karigar says "na" or does not respond within 30 s on a read-back | Event stays with one signature, marked "awaiting karigar"; not settlement-eligible | F-02, F-03 | Both |
| EC-2 | Scale reading unstable (changes > 10 mg within 1.5 s) | Capture button disabled until stable | F-01 | Both |
| EC-3 | Scale disconnected mid-issue | Fallback order: display OCR (M-04), then two-person manual confirm | F-01 | Simulated in MVP; real in v1 |
| EC-4 | STT mishears "12.45" as "12.54" | No effect on the weight; only the scale reading is stored. Transcript shown for the note text only | F-04 | Both |
| EC-5 | Duplicate slip / same return entered twice | IntakeAgent warns on same order + weight within 10 min; human chooses | F-04 | Both |
| EC-6 | Lyzr or Sarvam unreachable on stage | `AI_FALLBACK_MODE=cached` serves deterministic text and pre-generated audio; banner shows "cached" | F-02, F-05, F-07 | MVP |
| EC-7 | Dispute open at settlement time | Disputed lines are excluded and carried over; undisputed lines can settle | F-06, F-07 | Both |
| EC-8 | Karigar revokes a passport while a lender has it open | Next request returns 410 Gone; page shows "revoked by the karigar" | F-08 | Both |
| EC-9 | Karigar changes phone / loses key | v1: re-enrol by OTP; old key revoked by a signed key-rotation event; history kept | F-03 | v1 |
| EC-10 | Offline for 3 days in a karkhana | Events signed and queued locally; on sync a chain fork is shown to both parties | F-11 | v1 |
| EC-11 | Wastage norm changed mid-order | Norms are versioned (E-05); the order keeps the version signed at issue | F-01, F-05 | Both |
| EC-12 | Gold price moves between flag and settlement | ₹ figures are informational at the day's rate; gold balances are settled in grams | F-05, F-07 | Both |
| EC-13 | Karigar cannot read at all | Every screen has a speaker button; confirm by voice; IVR in v1 | F-14, F-12 | Both |

## Sources
- [S1] PS 2.2 text.
- [S17] IIMA/XLRI IGPC report, 2023.
- [S28] Synergics blog.
- [S47] Zee Business gold rate, 20 Oct 2026.

URLs are in [PRD.md § Sources](./PRD.md#sources).
