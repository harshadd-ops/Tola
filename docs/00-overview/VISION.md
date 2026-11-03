# Vision
> Project: Tola · Owner: Product lead · Status: Draft v0.1 · Last updated: 2026-10-20
> Related: [Project Brief](PROJECT_BRIEF.md) · [Pitch](PITCH.md) · [PRD](../01-product/PRD.md) · [Roadmap](../01-product/ROADMAP.md) · [Business model](../07-business/BUSINESS_MODEL.md) · [Impact](../07-business/IMPACT.md)

## Vision
**Every gram of gold that changes hands in India's workshops carries two signatures.** No karigar pays for a loss he didn't cause, and no jeweller loses a gram he can't explain.

## Mission
Give the jeweller and the karigar **one number they both signed**. The number is captured by the scale, spoken back in the karigar's language and checked every week. Then let the karigar carry that record wherever trust is needed: to a new jeweller, to a bank, back home.

## North-star metric
> **Grams reconciled within 7 days with two signatures.**

**Definition.** For a period, sum the grams of gold issued (ISSUE events, E-06) whose matching returns, scrap, dust credit and any variance reach a **dual-signed reconciled state** (both parties' E-07 signatures on the reconciliation result or the dispute resolution) **within 7 days of the RETURN event**. Report it as grams and as a percentage of grams returned.

**Why this metric:**
- It moves only if **both** sides use Tola. A jeweller-only tool can't move it.
- It rewards **speed** (7 days, not month end), which is when disputes are still small.
- It is measured in **grams**, the unit everyone in the trade already trusts.
- It is computed from the signed ledger, so it can't be gamed with vanity sign-ups.

| Horizon | Target |
|---|---|
| Pilot week (16–22 Dec 2026) | ≥ 90% of grams returned in the week, for 1 jeweller and 3 karigars |
| 31 Dec 2027 | ≥ 85% across 600 active pairs; ≥ 50 kg reconciled per month (HUNCH) |
| 31 Dec 2029 | ≥ 90% across 10,500 active pairs; ≥ 1 tonne reconciled per year (HUNCH) |

**How it relates to DSG/week.** [METRICS.md §1](../01-product/METRICS.md) tracks *dual-signed fine-gold grams per week* (DSG/week). DSG/week measures **volume**: how much gold moves through Tola with two signatures. This north star measures **closure**: how much of that gold is reconciled and agreed by both parties within 7 days. Read them together.

Input metrics and impact metrics: [IMPACT.md §3](../07-business/IMPACT.md), [METRICS.md](../01-product/METRICS.md).

---

## The 1 / 5 / 10-year picture (Musk)

### Year 1 (end of 2027): one street, then one city
- Avenue Road and Chickpet in Bengaluru: **100 jewellers, 600 active jeweller–karigar pairs**.
- Weekly reconciliation is the norm in those shops. The month-end argument is gone.
- Karigars confirm in Bengali, Hindi and Kannada, by app, WhatsApp or a plain phone call (F-02, F-12).
- One co-op bank reads Work Passports in a pilot.
- First JanAI Cafe Doot onboarding pairs in Mysuru.

### Year 5 (2031): the karigar's record is normal
- The three big clusters (Zaveri Bazaar, Bowbazar, Coimbatore) plus Bengaluru, Thrissur and Rajkot (HUNCH) are on Tola.
- **Hundreds of thousands of karigars** hold a signed work history they own. A new jeweller asks to see the Passport instead of starting him at 100–250 g [S17].
- Lenders, including PM Vishwakarma lending banks, accept consented Passports as standard evidence, through Account Aggregator / ULI rails.
- Refiners book dust and scrap collection through the ledger. Dust credits flow back to the bench.
- GST job-work challans and labour invoices are drafted from signed events for the CA in every Tola shop.

### Year 10 (2036): the fine-gold ledger of informal manufacturing
- Every gram is traceable from bullion to bench to buyer: issue, return, wastage, dust, refinery, hallmark.
- Export job-work wastage (4–6 g per kg [S17]) is reconciled on the same rails.
- A karigar moving from Mumbai back to West Bengal, or to a new city, carries his reputation with him.
- India exports the pattern: two-signature records for any informal handover of value (silver, textiles, piece-rate work), on India's public digital rails.

---

## Principles
1. **The scale is the source of truth.** Weights come from the instrument, never typed and never heard (F-01, R-02). Voice confirms; it doesn't measure.
2. **AI never does gram arithmetic.** `ledger-core` computes; AI listens, extracts, explains and drafts. A human signs.
3. **Two signatures or it didn't happen.** Every event, every settlement and every resolution needs both parties.
4. **Disputes are never overwritten.** An open line stays open and visible until both sign its resolution.
5. **The karigar owns his copy and his data.** Free forever; shared only by him, to a named recipient, with an expiry; revocable (E-14).
6. **Voice-first, in his language.** Bengali, Hindi, Kannada first; numbers always spoken back; a ₹6–8k phone or a plain phone call is enough.
7. **No score, no blockchain, no custody.** We record; lenders decide; money moves PSP to bank; gold stays with the parties.
8. **Honest labels.** Anything simulated (UPI, lender view, scale in the demo) is labelled on screen.

---

## Why now (with sources)
| Shift | Evidence |
|---|---|
| **Every gram is now expensive** | 24K at ₹1,49,041 per 10 g on 20 Oct 2026 [S47]; the Q1 2026 average was ₹1,51,108 per 10 g, +81% y/y [S6]. One disputed gram costs about ₹15,000, more than a month's income for many goldsmiths (₹10–20k [S18]) |
| **The regulator made instrument-captured weight the norm** | Since 8 Jun 2026, BIS has required photos and automatic weight capture for hallmarked articles, with manual keyboard entry of weights disabled [S2] |
| **Karigar credit has a public rail** | PM Vishwakarma covers goldsmiths among 18 trades, with collateral-free credit up to ₹1 lakh then ₹2 lakh at 5%; 26.87 lakh registered by Jan 2025 [S41]. ULI and Account Aggregator rails support consented data sharing [S42] |
| **Indic voice AI is cheap enough** | Sarvam STT at ₹30/hour and TTS at ₹30 per 10,000 characters [B §6] make a spoken read-back cost paise |
| **The migrant workforce is under stress** | 2026 voter-roll stress on Bengali migrant workers and a reported karigar exodus [S22][S23]. A portable work record matters more when people move |
| **Nobody has built the karigar's side** | Jewellery ERPs (Marg, Jwelly, Online Munim, Synergics, SoniERP) are owner-side only [S25–S29]; "jewellery job work" had one GitHub repo on 20 Oct 2026 [S46] |
| **The problem statement asks for it** | PS 2.2: "Settlements go to both parties for approval, and each karigar has full access to his own account" [S1] |

---

## Impact thesis
When the weaker party holds a signed copy:
- disputes get **smaller** (caught in the same week) and **fairer** (the karigar can reply and must sign);
- pay gets **faster** (settlement on dual approval opens a UPI intent);
- the karigar's work becomes **evidence** a lender can read.

The jeweller pays because it is dispute insurance. The karigar joins because it is his. Details: [IMPACT.md](../07-business/IMPACT.md).

## MVP (hackathon) vs v1 (production)
- **MVP (hackathon) → [`implementation/demo`](../../implementation/demo/README.md):** one scripted week proves the north star end to end: a dual-signed issue, return, a same-week flag, a voice dispute, a two-party settlement, a UPI QR and a Passport.
- **v1 (production) → [`implementation/scalable`](../../implementation/scalable/README.md):** the north star measured live per shop, with OTP auth, offline-first sync, WhatsApp/IVR and real PSP payments.
