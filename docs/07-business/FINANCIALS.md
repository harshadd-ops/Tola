# Financials
> Project: Tola · Owner: Field + pitch lead (model) · Back end + crypto lead (cost inputs) · Status: Draft v0.1 · Last updated: 2026-10-20
> Related: [Business model](BUSINESS_MODEL.md) · [GTM](GTM.md) · [Impact](IMPACT.md) · [Cost (ops)](../../implementation/scalable/docs/COST.md) · [Models §5.1 (AI unit cost)](../04-ai/MODELS.md) · [Risk register](../06-security-compliance/RISK_REGISTER.md) · [Pitch](../00-overview/PITCH.md)

**Read this first.** Tola has no revenue and no field-tested price yet. Every ₹ figure is either:
- **sourced**, with a reference: [S#] = `research/domains/jeweltech.md`, [B] = `research/B-sponsors.md`, or a cost model ([COST.md](../../implementation/scalable/docs/COST.md), [MODELS §5.1](../04-ai/MODELS.md)); or
- **HUNCH**: an explicit assumption, listed in §1 so a judge (or CA Dr I S Prasad) can change it and recompute.

The model is deliberately conservative: a CA should be able to rebuild every number in this file with a calculator.

> **Two facts drive everything.**
> 1. **Gross margin depends on the optimised AI design.** A naïve agent design (a Manager on every voice note) costs **≈ ₹398 per active karigar per month** in AI alone. The optimised design costs **≈ ₹38**, inside the gate of **≤ ₹40** ([MODELS §5.1](../04-ai/MODELS.md)).
> 2. **Even optimised, ₹49 is too cheap.** The fully loaded cost per active karigar is **₹147 at 100 karigars, ₹46 at 10,000 and ₹42.50 at 1 million** ([COST.md §4](../../implementation/scalable/docs/COST.md)). At ₹49 the margin is only 6–13%. **Price floor: ≥ ₹79 per active karigar per month** (brief §14).

---

## 1. Assumptions register

| ID | Assumption | Value | Basis |
|---|---|---|---|
| A-01 | Gold price (24K retail) | ₹1,49,041 per 10 g = ₹14,904/g | 20 Oct 2026 [S47] |
| A-02 | Price per active karigar per month | **Shop ₹79** (floor) · **Shop Pro ₹99** | HUNCH within the ₹49–99 range; floor from COST.md margin check; ERP benchmark ₹12k–2L/yr [S25] |
| A-03 | Blended revenue per paid active pair per month (ARPP) | Y1 ₹79 · Y2 ₹85 · Y3 ₹89 (Pro mix rises) | HUNCH |
| A-04 | Active pairs per shop | 7 (P-01 has 8 karigars; not every karigar is active every month) | HUNCH; P-01 persona |
| A-05 | Free period | 90 days for the first 10 founding shops; 30-day trial for every shop after | Product decision ([BUSINESS_MODEL §4.1](BUSINESS_MODEL.md)) |
| A-06 | Monthly jeweller churn | Y1 5% · Y2 3% · Y3 2.5% | HUNCH; matches [GTM §9](GTM.md) |
| A-07 | Passport pull price | ₹150 flat data fee, the same whatever the lender decides; never linked to a loan | HUNCH, range ₹100–250 |
| A-08 | Refiner fee per lot | ₹500 | HUNCH; the ₹500–700 mat-swap payment is the only datapoint [S17] |
| A-09 | Doot payout | ₹150 bounty per verified active pair + 10% trailing share for 12 months | HUNCH ([BUSINESS_MODEL §4.4](BUSINESS_MODEL.md)) |
| A-10 | Share of pairs sourced by Doots | Y1 0% · Y2 15% · Y3 40% | HUNCH |
| A-11 | US$ to ₹ | ₹88 | HUNCH (not verified 2026-10-20); same rate as MODELS §5.1 |
| A-12 | **Variable cost per active karigar per month** (AI + WhatsApp + IVR + OTP + media) | Naïve ≈ ₹407 · **optimised ≈ ₹41.50** (AI ₹38.20 of it) | [COST.md §3](../../implementation/scalable/docs/COST.md) |
| A-13 | Fixed infra per month | ₹10,550 at 100 karigars; ₹48,850 at 10k | [COST.md §2](../../implementation/scalable/docs/COST.md); in the P&L under "Fixed infra, tools, misc" |
| A-14 | Lyzr customer-VPC rate ($0.03/run) | Halves the Lyzr lines, bringing the fully loaded cost to ≈ ₹28, but needs the enterprise plan ("Production starts at $100K a year") | [COST.md §4](../../implementation/scalable/docs/COST.md); **not assumed** in this 3-year plan because $100K/yr only pays off at very large scale |
| A-15 | Team cost | Y1: 4 founders at ₹25k/month stipend · Y2: 8 people at ₹40k avg · Y3: 15 people at ₹50k avg | HUNCH; Bengaluru early-stage |

---

## 2. Unit economics

### 2.1 Cost to serve one active karigar per month
Taken from [COST.md](../../implementation/scalable/docs/COST.md) §3–4 and [MODELS.md §5.1](../04-ai/MODELS.md).

| Line | Naïve design | **Optimised design (v1 requirement)** | How the optimised design gets there |
|---|---|---|---|
| STT (Saaras) | ₹4.00 | ₹2.00 | One verbatim pass |
| TTS read-backs (Bulbul) | ₹14.40 | ₹7.20 | On-demand, cached by text hash |
| IntakeAgent | ₹63.40 | ₹21.10 | Deterministic numeral parser first; LLM on ≤ 30% of notes |
| ReconcileAgent | ₹21.10 | ₹2.60 | One run per shop-week |
| SettleAgent | ₹10.60 | ₹5.30 | Monthly |
| Manager hops | ≈ ₹285 | ₹0 | No Manager on the hot path |
| **AI subtotal** (gate ≤ ₹40) | **≈ ₹398** | **≈ ₹38.20** | |
| WhatsApp, IVR, OTP, media | ≈ ₹8.90 | ≈ ₹3.30 | Daily digest; DTMF IVR; 30-day sessions |
| **Variable per active karigar** | **≈ ₹407** | **≈ ₹41.50** | |
| **Fully loaded (variable + fixed infra share)** | ₹513 / ₹412 / ₹408 | **₹147 at 100 · ₹46 at 10k · ₹42.50 at 1M** | Fixed infra spread over more karigars |

**What a judge should take from this:**
1. **The naïve design loses money at every scale and every price.** A Manager agent on every voice note would bankrupt the product.
2. **The optimised design is a v1 requirement, not a nice-to-have.** It rests on four rules already in the AI docs:
   - AI never does arithmetic (`ledger-core` computes every milligram);
   - a numeral parser runs before the LLM;
   - one reconciliation run per shop-week;
   - no Manager on the hot path.
3. **The gate has thin headroom.** The optimised AI subtotal clears ₹40 by only ₹1.80. Any new agent call on the hot path needs a matching saving. The gate is tracked on dashboards and in evals (`ai_inr_per_active_karigar_month ≤ 40`, [AI_EVALS §5](../04-ai/AI_EVALS.md)).
4. **₹49 doesn't work, ₹79 does.** Fully loaded margin at 10k karigars is 6% at ₹49 and 42% at ₹79 ([COST.md §4](../../implementation/scalable/docs/COST.md)).

### 2.2 Margin by price (per active karigar per month)

| Price | Variable-cost margin (optimised ₹41.50) | Fully loaded at 10k (₹46) | Fully loaded at 1M (₹42.50) | At 1M with Lyzr in customer VPC (₹28) |
|---|---|---|---|---|
| ₹49 | ₹7.50 (15%) | 6% | 13% | 43% |
| **₹79 (Shop, floor)** | ₹37.50 (47%) | 42% | 46% | 65% |
| ₹99 (Shop Pro) | ₹57.50 (58%) | 54% | 57% | 72% |
| Naïve design, any price | −₹308 to −₹358 | negative | negative | — |

At 100 karigars (Year 1 scale) the fully loaded cost is ₹147, so **every price is negative until about 1,000 karigars**. Credits and grants cover that gap ([COST.md §6](../../implementation/scalable/docs/COST.md), §6 below).

### 2.3 Per shop (7 active pairs, Year-3 base: ₹89 ARPP, optimised design)

| Metric | Calculation | Value |
|---|---|---|
| Monthly revenue per shop | 7 × ₹89 | **₹623** |
| Variable COGS per shop | 7 × ₹41.50 | ₹290.50 |
| Doot trailing share (40% of pairs Doot-sourced × 10%) | ₹623 × 0.04 | ₹24.92 |
| **Gross profit per shop per month** | 623 − 290.50 − 24.92 | **₹307.58** |
| **Gross margin** | 307.58 / 623 | **49.4%** |
| CAC per shop | Doot bounty 7 × ₹150 × 40% = ₹420 + field / marketing / demo ₹2,780 | **₹3,200** |
| **Payback** | 3,200 / 307.58 | **10.4 months** |
| Expected lifetime | 1 / 2.5% monthly churn (A-06) | 40 months |
| **LTV (gross profit)** | 307.58 × 40 | **₹12,303** |
| **LTV : CAC** | 12,303 / 3,200 | **3.8×** |

### 2.4 Value delivered vs price (the jeweller's maths)
- A shop with 8 karigars, each holding ₹4–5 lakh of gold [S17], has **₹32–40 lakh** of its gold on benches.
- Preventing **one 1 g dispute per year** saves about ₹14,904 (A-01). That is 2.0× the annual Shop subscription of ₹7,584 (8 × ₹79 × 12).
- ₹79 per month is about **0.005 g** of 24K gold.

---

## 3. Three-year projection (calendar years; Year 1 = 2027)

### 3.1 Volume
| | Y1 2027 | Y2 2028 | Y3 2029 | Basis |
|---|---|---|---|---|
| Jewellers at year end | 100 | 430 | 1,500 | [GTM §3](GTM.md) rungs |
| Active pairs at year end | 600 | 3,000 | 10,500 | × 7 pairs/shop (A-04), ramp |
| Average **paid** active pairs over the year | 220 | 1,800 | 6,750 | Ramp, minus free periods (A-05) |
| Passport pulls | 0 | 600 | 5,000 | Co-op bank pilot from 2028 (HUNCH) |
| Refiner lots | 0 | 0 | 200 | v2 from 2029 (HUNCH) |

### 3.2 Profit and loss (₹ lakh)
| Line | Y1 2027 | Y2 2028 | Y3 2029 | Calculation |
|---|---|---|---|---|
| Subscription revenue | 2.09 | 18.36 | 72.09 | avg paid pairs × ARPP × 12 (Y1 220 × ₹79; Y2 1,800 × ₹85; Y3 6,750 × ₹89) |
| Passport pulls | 0.00 | 0.90 | 7.50 | pulls × ₹150 |
| Refiner lots | 0.00 | 0.00 | 1.00 | lots × ₹500 |
| **Total revenue** | **2.09** | **19.26** | **80.59** | |
| Variable COGS | 1.10 | 8.96 | 33.62 | paid pairs × ₹41.50 × 12 (A-12). Simplification: free-period pairs' cost is absorbed by credits |
| Doot payouts (bounty + trailing) | 0.00 | 1.20 | 8.50 | A-09, A-10; Y3 ≈ 3,000 new Doot pairs × ₹150 + 10% trailing, rounded up for safety |
| **Gross profit** | **0.99** | **9.10** | **38.47** | |
| Gross margin | 47% | 47% | 48% | |
| Team (A-15) | 12.00 | 38.40 | 90.00 | |
| Field, marketing, demo kits | 3.00 | 10.00 | 25.00 | |
| Compliance (counsel, DPDP, VAPT, audit) | 2.00 | 4.00 | 8.00 | |
| Fixed infra (A-13), tools, misc | 3.00 | 7.60 | 20.00 | Includes ₹10,550–48,850/month fixed infra from COST.md |
| **Total operating expense** | **20.00** | **60.00** | **143.00** | |
| **EBITDA** | **−19.01** | **−50.90** | **−104.53** | |
| Cumulative burn | 19.01 | 69.91 | 174.44 | |

### 3.3 Break-even
- Year-3 fixed cost: about ₹1.43 crore per year.
- Gross profit per paid pair per year at the Y3 base: (₹89 − ₹41.50 − ₹3.56 Doot share) × 12 = **₹527**.
- **Break-even ≈ 27,100 paid active pairs** (about 3,900 shops), around **2031** on the current growth path (HUNCH).
- Sensitivity (Doot share 4% of ARPP):
  - ₹99 ARPP: (99 − 41.50 − 3.96) × 12 = ₹642 per pair-year, so break-even is **≈ 22,300 pairs**.
  - ₹79 ARPP: (79 − 41.50 − 3.16) × 12 = ₹412, so break-even is **≈ 34,700 pairs**.
  - ₹49 ARPP: (49 − 41.50 − 1.96) × 12 = ₹66, so break-even is **≈ 2.15 lakh pairs**. **Not viable**, which is why ₹79 is the floor.
  - Lyzr in customer VPC at large scale lowers cost to ≈ ₹28 fully loaded ([COST.md §4](../../implementation/scalable/docs/COST.md)). That is an upside after about 1M karigars; it is not in this plan.
- **Price and AI cost are the two biggest unknowns.** Price is the first field-interview question ([HACKATHON_PLAN §3](../00-overview/HACKATHON_PLAN.md)); AI cost is gated at ≤ ₹40.

### 3.4 Market sizing (for context)
| Level | Calculation | Value |
|---|---|---|
| TAM (jewellers) | About 5,00,000 jewellers incl. unregistered [S16]; 2,36,624 BIS-registered [S2] | 2.4–5 lakh shops |
| SAM (pairs) | HUNCH: 40% of 5 lakh shops use job-work karigars × 5 pairs = 10 lakh pairs × ₹89 × 12 | **≈ ₹1,070 crore/year** |
| SOM (Y3) | 10,500 pairs × ₹89 × 12 | ≈ ₹1.1 crore run-rate, about 1% of SAM pairs |

---

## 4. Financial risks

| Risk | Effect | Mitigation | Owner · date | Link |
|---|---|---|---|---|
| **AI cost above the ₹40 gate** (naïve design ≈ ₹398) | Negative gross margin at any price we can charge | Optimised-design rules (§2.1); cost per karigar on the OBSERVABILITY dashboard; eval gate `ai_inr_per_active_karigar_month ≤ 40`; deterministic fallback if over budget | AI · every release | [MODELS §5.1](../04-ai/MODELS.md), [COST.md](../../implementation/scalable/docs/COST.md), [RISK_REGISTER](../06-security-compliance/RISK_REGISTER.md) |
| **Jewellers won't pay ₹79** | At ₹49 fully loaded margin is 6–13% and break-even is out of reach | Field price ladder (₹49 / ₹79 / ₹99 / ₹149); lead with Shop Pro value (GST drafts, IVR, deadlines); one avoided gram pays for 2 years | FP · 10 Nov 2026 | [BUSINESS_MODEL §8](BUSINESS_MODEL.md) |
| **Sub-scale fixed cost** (₹147 per karigar at 100) | Year 1 is loss-making on every customer | Credits and grants; stay on scale-to-zero infra until 1,000 karigars | BE · 2027 | [COST.md §6](../../implementation/scalable/docs/COST.md) |
| Passport demand lower than assumed | −₹7.5 lakh in Y3 | Not needed for break-even; upside only | FP · 2028 | §3.2 |

---

## 5. Funding needs
| Round | When | Amount | Use | Milestone it buys |
|---|---|---|---|---|
| **Pre-seed (non-dilutive first)** | Jan–Dec 2027 | **₹25–40 lakh** | 4 founders' stipends, field onboarding of 10 → 100 shops, incorporation, DPDP counsel | 100 paying jewellers at ≥ ₹79, 600 active pairs, 1 co-op bank letter, AI cost ≤ ₹40 proven in production |
| **Seed** | H1 2028 | **₹2.5 crore** | Team of 8 → 15, Mumbai and Kolkata clusters, Passport pulls live; covers the cumulative ₹1.74 crore burn through 2029 | 10,500 active pairs, 3 co-op banks |

---

## 6. Grant, competition and scheme sources

| Source | What it offers | Fit for Tola | Status |
|---|---|---|---|
| **Tech4Bharat · GAVS Hackathon prize** | ₹1,00,000 1st and ₹50,000 2nd per theme; ₹3,00,000 grand prize | Runway for the pilot | Verified via the hackathon bible [biblehackathon §At a glance] |
| **Startup India Seed Fund Scheme (SISFS)**, DPIIT | Outlay **₹945 crore**. **Up to ₹20 lakh grant** for proof of concept, prototype or product trials, milestone-based. **Up to ₹50 lakh** for market entry or commercialisation as convertible debentures or debt. Applied **through a selected incubator**. Eligibility: a **DPIIT-recognised startup incorporated not more than 2 years ago**, which must not have received more than ₹10 lakh from other central or state schemes (**prize money from competitions is excluded**) | Strong: apply via Accelerate RVCE or another SISFS incubator after incorporation | **Verified 2026-10-20** from the scheme portal's published text (seedfund.startupindia.gov.in). Whether a given incubator holds SISFS funds now is not verified |
| **Karnataka Startup Policy 2025–30 / Elevate NxT** | Policy outlay **₹518.27 crore** for 25,000 startups over five years, 10,000 of them outside Bengaluru. **Elevate NxT** is the flagship programme | Bengaluru-based; artisan-livelihood angle | Policy figures verified 2026-10-20 via Outlook Business (bible source [36]). **Elevate grant amount, eligibility and next call: not verified 2026-10-20.** The official site could not be reached |
| **MeitY schemes** (MeitY Startup Hub; TIDE 2.0; SAMRIDH; GENESIS) | Incubator-routed grants and accelerator support for tech startups | Possible | **Not verified 2026-10-20.** msh.meity.gov.in and meity.gov.in returned no readable content or 403. Check by 30 Jan 2027 (owner: FP) |
| **Lyzr credits** | Agent platform credits; building is free | Prototype AI costs | Credit amount per team UNKNOWN; ask at registration or the AMA [B §1] |
| **Sarvam** | ₹100 free credits on signup | Prototype speech | Verified in [B §6] |
| **Cloud credits** | See [COST.md §6](../../implementation/scalable/docs/COST.md) | Year-1 infra | Per COST.md |
| **PM Vishwakarma** | Not funding for Tola. Collateral-free credit to goldsmiths (up to ₹1 lakh, then ₹2 lakh, at 5%) and a toolkit incentive of up to ₹15,000 [S41] | A credit outcome for karigars that the Passport supports | Verified (Drishti IAS page, fetched 2026-10-20) |
| **Accelerate RVCE** | Incubation (named organiser of the hackathon) | SISFS route; office; mentors | Programme terms not verified |

**Sequencing:** prize money (Dec 2026) → incorporate and apply for DPIIT recognition (Jan 2027) → SISFS grant via an incubator (Q2 2027) → Karnataka programme call when published → seed round (2028).

---

## 7. MVP (hackathon) vs v1 (production) cost
| | MVP (hackathon) → `implementation/demo` | v1 (production) → `implementation/scalable` |
|---|---|---|
| AI | Lyzr free build tier; Sarvam ₹100 credits; `AI_FALLBACK_MODE=cached` keeps stage runs at ₹0 | Optimised design ≤ ₹40 AI per karigar per month (§2.1) |
| Hosting | Vercel + Render free/starter tiers | GCP asia-south1 ([COST.md](../../implementation/scalable/docs/COST.md)) |
| Hardware | One 0.01 g balance with serial output for the demo (model and price not verified; budget ≤ ₹3,000 HUNCH); an HX711 bench rig labelled "not for trade" (R-03) | The shop's own verified balance (R-04) |
| Cash need to the final | **≤ ₹10,000** (balance, Sarvam top-up, travel for field interviews), HUNCH | §5 |
