# Personas
> Project: Tola · Owner: Product lead · Status: Draft v0.1 · Last updated: 2026-10-20
> Related: [PRD](./PRD.md) · [User Journeys](./USER_JOURNEYS.md) · [User Stories](./USER_STORIES.md) · [Project Brief](../00-overview/PROJECT_BRIEF.md) · [Accessibility](../02-design/ACCESSIBILITY.md) · [Localization](../02-design/LOCALIZATION.md)

These five personas are **composites**. Names are illustrative and are not real people. Every demographic, money and behaviour claim is tied to a cited source ([S#] from `research/domains/jeweltech.md`). Anything we inferred is marked **HUNCH**. A "quote from research" is a verbatim line from a cited source about people like the persona; it is never attributed to the persona. Lines in *italics* marked "persona voice" are illustrative paraphrases written by us.

**Field validation (open):** PS 2.2 asks teams to take six questions into the field [S1]. Owner Field/Pitch interviews 3 jewellers and 5 karigars by **15 Nov 2026** and updates this file (version Draft v0.2).

| ID | Persona | Segment | Primary channel | MVP role in demo |
|---|---|---|---|---|
| P-01 | Suresh Shetty, 52 | Jeweller, 2-counter shop, 8 karigars | Shop desktop + Android | **Jeweller** |
| P-02 | Rafiq Sheikh, 34 | Migrant Bengali karigar, 3 jewellers | ₹6–8k Android or feature phone | **Karigar** |
| P-03 | Lakshmi, 28 | Counter and accounts staff | Shop Android | Jeweller role (counter screens) |
| P-04 | Branch credit officer | Co-op bank / NBFC | Desktop browser | **Lender** (mocked) |
| P-05 | Head karigar / karkhana owner | Workshop with 5–15 helpers | One shared Android, offline | Not in demo (v1) |

---

## P-01 · Suresh Shetty, 52: the jeweller

| | |
|---|---|
| **Demographics** | Owner of a 2-counter jewellery shop on Avenue Road, Bengaluru. Second-generation business. 8 karigars on job work; 30–60 open custom orders in the wedding season (brief §3). One of 2,36,624 BIS-registered jewellers [S2]. |
| **Device / network** | Shop desktop (Windows) for billing; mid-range Android. Good 4G/Wi-Fi in the shop. |
| **Language** | Kannada, English; workshop Hindi. |
| **Current software** | Possibly a billing ERP in the ₹12k–₹2L/yr band (Marg, Jwelly, Online Munim). These tools have karigar issue/receive modules but are owner-side, "mobile app is weaker", and often Windows-based [S25][S26]. Many small shops still use a paper register (HUNCH, to be checked in interviews). |

**Day in the life (wedding season).**
- **09:30.** Opens the safe. Lakshmi (P-03) weighs out gold for two karigars. The weight goes into a notebook; the karigar signs a slip, or doesn't.
- **11:00–19:00.** At the counter. Customers ask about delivery dates for orders due before a muhurat.
- **Evening.** Karigars come back with pieces. Weights are noted. Wastage is "agreed verbally" [S1].
- **Month end.** He squares accounts with each karigar. The numbers disagree by a gram or two; the argument takes an hour; somebody absorbs it.

**Pains.**
- Unexplained loss. "Losses can't be traced to a specific karigar or item" when wastage is averaged monthly [S28]. At ₹14,904/g of 24K [S47], one gram of 22K is about ₹13,650.
- Exposure on trust. A karigar can hold ₹4–5 lakh of gold [S17]. Fraud on trust happens near him: in Bengaluru two men took 350.25 g of 22K on credit and did not return it [S14].
- Late wedding orders damage his reputation; the PS lists "missed wedding dates" as a cost [S1].
- Losing good karigars. In 2026, a jewellery-business family reported that "99% of them are packing their bags" during the Bengal voting period [S22] (anecdotal).

**Goals.** Every gram out is explained when it comes back. Disputes are settled the same week. Wedding orders are delivered on time. Good karigars stay.

**Current workarounds.**
- Paper register plus slips.
- Gives a new karigar only 100–250 g until trust builds [S17].
- Trusts the head karigar to answer for helpers [S17].

**Quotes from research (not his words).**
> "payments to the karigar is based on gold wastage. The more complex the design, the more wastage will be given to karigar" [S17]

> "there were many theft instances where karigars ran away with the gold assigned to him" [S17]

*Persona voice (illustrative):* "I don't mind paying wastage. I mind not knowing where the gold went."

**What would make him stop using Tola.**
- Capture slower than writing in the notebook (target: issue in ≤ 20 s including the karigar's confirm).
- A karigar using the record against him in a dispute he thinks is unfair. Mitigation: norms are agreed and signed up front (E-05).
- Paying per karigar with no visible drop in unexplained loss within 8 weeks.
- Any sense that Tola shares his business data with competitors or the tax department.

**Tola features:** F-01, F-03, F-05, F-06, F-07, F-09, F-10, F-13.

---

## P-02 · Rafiq Sheikh, 34: the karigar

| | |
|---|---|
| **Demographics** | Migrant from West Bengal. Works in a Zaveri-Bazaar-style workshop in Mumbai (the composite comes from the ideas file [S17][S20]). Mumbai has an estimated 2.2 lakh karigars, most of them Bengali-speaking [S20]. Works for 3 jewellers at once, which is normal: the PS says karigars work "for several jewellers at once" [S1]. Holds about 180 g of other people's gold. |
| **Income** | Wastage-based and fully variable pay, settled weekly or twice a month [S17]. Comparable goldsmiths in Coimbatore earn ₹10,000–20,000 a month and 80% save under ₹5,000 [S18]. |
| **Device / network** | ₹6–8k Android (2 GB RAM), shared data pack, or a feature phone. Workshop signal patchy (HUNCH). |
| **Language** | Bengali; some Hindi; reads numbers but little text (low literacy is a judging requirement [brief §13]). |
| **Credit** | No formal credit file. "Almost all the goldsmiths … borrow loans" and find bank credit hard to get [S18]. May be registered under PM Vishwakarma, where goldsmith is one of 18 trades [S41]. |

**Day in the life.**
- **Morning.** Collects gold from a jeweller's counter. Watches the scale, but the entry goes into the jeweller's book, not his.
- **Day.** Works at the bench with helpers. Dust collects on the floor mats.
- **Evening.** Returns finished pieces to two shops.
- **Month end.** One jeweller's book says he owes 2.1 g more than his own slip says (ideas file composite). Neither can prove it. He pays, because "the head karigar has to pay for gold loss" [S17]. Then he waits weeks for his labour money [S1].

**Pains.**
- Has no copy of the record that decides what he owes.
- A 2 g gap is about ₹27,000 at 22K, which is more than a month of income [S18][S47].
- Waits weeks to be paid [S1].
- His reputation is his only collateral, and it cannot travel. New jewellers start him at 100–250 g [S17]. Migration in 2026 can wipe out his history [S22][S23].

**Goals.** A record he holds and the jeweller cannot change. Faster pay. A way to show a new jeweller or a bank that he is reliable.

**Current workarounds.** His own slips or notebook. Phone photos of the scale display (HUNCH). Relying on the head karigar to argue for him.

**Quotes from research (not his words).**
> "a given karigar has a gold inventory … worth rupees 4 to 5 lacs" [S17]

> "it is very difficult to get financial assistance from bank and other financial institutions" [S18] (Coimbatore goldsmiths)

> "As the trust is developed … they start taking or giving a good amount of gold" [S17]

*Persona voice (illustrative):* "If the book is his, the gram is mine to lose."

**What would make him stop using Tola.**
- Any sign that the jeweller can edit or delete entries. The chain status must be visible to him (F-03).
- Being asked to type or read long text.
- Spending his own data or money: karigar access is free forever (brief §14).
- His data being shared without asking (DPDP; R-05).
- A record that is used against him in a dispute but never for him (no Work Passport).

**Tola features:** F-02, F-03, F-04, F-06, F-07, F-08, F-12, F-14.

---

## P-03 · Lakshmi, 28: counter and accounts staff

| | |
|---|---|
| **Demographics** | Works at P-01's shop. Handles issue and receipt of gold and the karigar register. Prepares the month-end statements. The PS lists "jewellers and their counter staff" as people in the picture [S1]. |
| **Device / network** | Shop Android tablet or phone at the scale; shop Wi-Fi. |
| **Language** | Kannada, Hindi; comfortable with English UI labels. |

**Day in the life.** She weighs gold for issue and return several times a day, writes the register, chases karigars for missing slips, and builds month-end statements by hand.

**Pains.**
- Copying weights by hand causes errors and arguments.
- Month-end statements take hours.
- She is blamed when the register is wrong.
- Rush at the counter during the wedding season.

**Goals.** Capture fast with no typing; statements that build themselves; no blame for numbers she didn't produce.

**Current workarounds.** Register plus a calculator; she photographs slips on her phone (HUNCH).

**Quote from research (not her words).**
> "a register is maintained that mentions a record of gold inventory received, the weight of jewellery prepared from inventory, gold dust collected and gold dust lost" [S17]

**What would make her stop using Tola.**
- Capture that is slower than the register at rush hour.
- A scale connection that drops (fallbacks: M-04 display OCR, two-person manual).
- The owner using the audit trail to blame her for issues that come from the scale.

**Tola features:** F-01, F-04, F-09, F-13, F-14.

---

## P-04 · Branch credit officer, co-op bank / NBFC (v1; mocked in MVP)

| | |
|---|---|
| **Demographics** | Credit officer at an urban co-operative bank or an NBFC branch that lends to artisans, including PM Vishwakarma credit (goldsmith is one of 18 trades; 26.87 lakh registered artisans in all trades as of Jan 2025) [S41]. |
| **Device / network** | Desktop browser; branch network. |
| **Language** | English, plus the local language. |

**Job.** Decide whether to lend to a karigar who has no ITR, no salary slips and no bureau history.

**Pains.**
- No verifiable work record for informal artisans. "Difficult to get financial assistance from banks" was the top problem for 16.6% of surveyed goldsmiths [S18], which is the borrower side of the same gap.
- Consented-data rails (AA, ULI) exist for formal data but not for an artisan's job-work history [S42].

**Goals.** A consented, tamper-evident summary of real work delivered, which he can verify without calling the jeweller.

**Current workarounds.** References from a known jeweller; group lending; scheme documents.

**Quote from research (not his words).**
> "A karigar with a clean record of work delivered looks very different to anyone deciding whether to trust him." [S1] (PS 2.2, "Following the money")

**What would make him stop using it.**
- Records he cannot verify.
- A record that looks like a credit score from an unregulated party. Tola does not score (R-06).
- Links that expire before the loan committee meets. The karigar sets the expiry; the default is 7 days.

**Tola features:** F-08 (lender view; mocked and labelled in MVP; AA/ULI path in v2).

---

## P-05 · Head karigar / karkhana owner (v1)

| | |
|---|---|
| **Demographics** | Runs a workshop (karkhana) with 5–15 helpers. Takes gold from jewellers on behalf of the workshop and distributes it. The field study gives head karigars a "fixed waste percentage" per order type [S17]. |
| **Device / network** | One shared Android for the whole workshop; offline much of the day (HUNCH). |
| **Language** | Bengali or Marathi. |
| **Exposure** | Workshop gold dust of ₹20–25 lakh [S17]. He is liable for helpers' losses: "In case of theft, the head karigar has to pay for gold loss" [S17]. Indirect dust on floor mats is collected yearly by "a specialized agency", paid Rs 500–700 [S17]. |

**Day in the life.** Receives gold from 3–6 jewellers, splits it across helpers, tracks who holds what in his head and a notebook, collects dust, and settles weekly with each jeweller and each helper.

**Pains.**
- Liable for every helper's gram.
- Multiple jewellers with different norms.
- One phone that everyone uses.
- Dust and scrap value goes unrecorded.

**Goals.**
- Sub-ledger per helper.
- One view across all his jewellers.
- Dust credited back.
- Works offline.

**Current workarounds.** Notebook; memory; trust.

**Quote from research (not his words).**
> "the head karigar has to pay for gold loss to the client" [S17]

**What would make him stop using it.**
- Per-person keys that need one phone per helper (R-09). The v1 design gives each helper a PIN-protected key on the shared phone, with delegation by the head karigar.
- Needing a connection to record an event (F-11).

**Tola features:** F-04, F-05, F-11, F-12 (v1); refiner and dust line (v2).

---

## Anti-personas (we do not design for)
- **A large manufacturer with in-house karigars on salary.** Synergics, Karat ERP and SoniERP already target mid/large manufacturers [S28][S29].
- **A jeweller who wants surveillance without karigar access.** This fails the PS boundary [S1]. Tola will not offer a jeweller-only mode.
- **Anyone wanting purity or karat verification.** That is PS 2.1; it is a non-goal.

## Sources
- [S1] PS 2.2 text.
- [S2] BIS Hallmarking brief.
- [S14] Deccan Herald, Sep 2025: https://www.deccanherald.com/india/karnataka/bengaluru/two-nabbed-from-chennai-in-rs-24-lakh-gold-cheating-case-3731344
- [S17] Varkkey & Jha, IIMA/XLRI IGPC report, June 2023.
- [S18] Sivasankaran & Pavithra, IJCRT 2022.
- [S20] NewsClick 2020 (snippet).
- [S22] Prem Soni X post (snippet, anecdotal).
- [S23] Newslaundry, 17 Apr 2026.
- [S25] Codingclave 2026 (vendor-authored).
- [S26] Online Munim.
- [S28] Synergics blog.
- [S29] TechJockey / GoodFirms.
- [S41] Drishti IAS, PM Vishwakarma.
- [S42] Wikipedia, ULI.
- [S47] Zee Business gold rate, 20 Oct 2026.

Full URLs are in [PRD.md § Sources](./PRD.md#sources) and the domain research file.
