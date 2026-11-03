# Compliance
> Project: Tola · Owner: Product lead · Status: Draft v0.1 · Last updated: 2026-10-20
> Related: [Privacy](PRIVACY.md) · [Security Architecture](SECURITY_ARCHITECTURE.md) · [Threat Model](THREAT_MODEL.md) · [Risk Register](RISK_REGISTER.md) · [Business Model](../07-business/BUSINESS_MODEL.md) · [Integrations](../03-engineering/INTEGRATIONS.md) · [Project Brief](../00-overview/PROJECT_BRIEF.md) · [Runbook (scalable)](../../implementation/scalable/docs/RUNBOOK.md)

**How to read this.** Each law lists:
- **Applies?**
- **Requirement:** what the law asks.
- **MVP (hackathon):** how `implementation/demo` complies.
- **v1 (production):** what `implementation/scalable` needs.
- **Owner.**

Status tags:
- **(verified 2026-10-20)**: we fetched a source this session.
- **(from research [S#])**: taken from `research/domains/jeweltech.md` or the war-room log.
- **(not verified 2026-10-20)**: our best reading; it must be checked before production.

**This is not legal advice.** Owner: Product lead. Book a pro bono legal review (RVCE incubator / NSRCEL-style network) by **31 Jan 2027**.

**Owner roles:**
- Product lead;
- Backend lead (back end + crypto);
- AI lead (AI/voice);
- Frontend lead (front end + design);
- Field & pitch lead.

---

## 0. Positioning that keeps us out of regulated perimeters
Tola is a **record-keeping and communication tool**. Each item below is a deliberate design choice (brief §12) that we restate in the pitch, the product copy and the terms.

| We are NOT | Because that would make us | So the product |
|---|---|---|
| A weighing instrument or a certifier of weight | Subject to Legal Metrology type-approval and verification | Records the reading of the shop's **own verified balance** |
| A hallmarking or purity tester | Within BIS / AHC territory | Stores *declared* fineness only. Never uses the word "certificate". |
| A credit bureau or scorer | A Credit Information Company under CICRA 2005 | Computes **no score**. The karigar shares his own raw record. |
| A lender, a Lending Service Provider or a loan marketplace | Covered by the RBI Digital Lending Directions | Doesn't originate, route or price loans. Takes no fee from the borrower. |
| A payment aggregator or wallet | Under the PSS Act 2007 / RBI PA rules | Never touches funds. UPI goes from payer to payee through a licensed PSP. |
| A GST filer or tax adviser | Covered by the GST practitioner rules | Produces **drafts**. The CA files. |
| A gold custodian or gold-metal lender | Covered by RBI gold-loan rules | Holds no gold. It stays with the parties. |

---

## 1. Digital Personal Data Protection Act, 2023 + DPDP Rules, 2025
**Applies?** Yes, in v1. The demo processes synthetic data only.

**Status**
- Act provisions phase in on **13 Nov 2025 / 13 Nov 2026 / 13 May 2027**.
- Rules notified **13 Nov 2025**. Rule 4 (Consent Managers) starts 13 Nov 2026. Rules 3 and 5–16 (notice, safeguards, breach, retention, children, rights) start **13 May 2027**.

Verified 2026-10-20 via SCC Online and Wikipedia. The MeitY and PIB primary pages returned 403, so the primary text is not verified. Full detail is in [PRIVACY §1](PRIVACY.md#1-legal-status-check-dpdp-as-of-2026-10-20).

| Requirement | MVP (hackathon) | v1 (production) | Owner |
|---|---|---|---|
| Notice, in clear language, listing the data, purposes, rights and how to complain (s.5, Rule 3) | Notice screen and spoken notice shown in the story mode as a demo of the flow | Spoken + text notice in bn/hi/kn/en (+mr, ta). Versioned and hashed into `consent_record` | Product lead |
| Free, specific, informed consent; withdrawal as easy as giving it (s.6) | Shown, not legally needed | Separate consents C1–C4 ([PRIVACY §4](PRIVACY.md#4-notice-and-consent-dpdp-s5-s6-rule-3-verify-current-text)); "STOP TOLA" / IVR 9 | Product lead |
| Reasonable security safeguards; one-year log retention (s.8(5), Rule 6) | Synthetic data; secrets server-side | [SECURITY_ARCHITECTURE](SECURITY_ARCHITECTURE.md); logs kept 1 year in India | Backend lead |
| Breach intimation to the Board and to affected people; detailed report within 72 h (s.8(6), Rule 7) | N/A | Playbook in [RUNBOOK](../../implementation/scalable/docs/RUNBOOK.md), run jointly with CERT-In reporting (6 h) | Backend lead |
| Erasure when the purpose is served; retention limits (s.8(7), Rule 8) | Demo DB dropped 31 Jan 2027 | Retention schedule ([PRIVACY §5](PRIVACY.md#5-retention-schedule)); crypto-shredding | Backend lead |
| Data principal rights: access, correction, erasure, grievance, nomination (ss.11–14) | "My record" screen in the karigar view | Full rights flows; Grievance Officer named | Product lead |
| Children: verifiable parental consent; no tracking (s.9, Rule 10) | No children's data | 18+ attestation; no minors onboarded ([PRIVACY §8](PRIVACY.md#8-childrens-data)) | Field & pitch lead |
| Cross-border transfer allowed unless restricted (s.16) | Lyzr/Sarvam get synthetic data only | Pseudonymised LLM calls; plan for India-hosted M-03 by 31 Mar 2027 | AI lead |
| Processor contracts | N/A | DPAs with GCP, Sarvam, Lyzr, Meta, IVR, SMS, PSP | Product lead |
| Significant Data Fiduciary duties (DPIA, audit, DPO) | N/A | Not expected to apply. We do a voluntary DPIA ([PRIVACY §9](PRIVACY.md#9-dpia-voluntary-v1-before-the-pilot)) | Product lead |

---

## 2. Information Technology Act, 2000; CERT-In Directions (28 Apr 2022)
**Applies?** Yes. Tola is a "body corporate" and service provider under s.70B directions once incorporated.

**CERT-In Directions** (verified 2026-10-20 from the CERT-In PDF, `CERT-In_Directions_70B_28.04.2022.pdf`):
- report cyber incidents in Annexure I **within 6 hours** of noticing them (incident@cert-in.org.in);
- keep logs of all ICT systems for a **rolling 180 days, within Indian jurisdiction**;
- sync clocks to **NIC or NPL NTP** servers, or servers traceable to them;
- designate a **Point of Contact**;
- the directions took effect 60 days after issue.

| Requirement | MVP (hackathon) | v1 (production) | Owner |
|---|---|---|---|
| 6-hour incident reporting (CERT-In) | Not applicable to a student demo. We rehearse the playbook once. | On-call rota; SEV-1/SEV-2 triggers a CERT-In report ≤ 6 h; template in RUNBOOK | Backend lead |
| 180-day logs in India (CERT-In) | Render/Vercel logs (default retention) | Cloud Logging buckets in `asia-south1`, 1-year retention (also covers DPDP) | Backend lead |
| NTP sync to NIC/NPL (CERT-In) | Platform default | Cloud Run uses Google NTP. Whether that counts as "traceable" to NIC/NPL is not verified 2026-10-20. VMs, if any, point to `time.nplindia.org` / `samay1.nic.in` | Backend lead |
| Point of Contact to CERT-In | — | Register the PoC (Annexure II format) at incorporation | Product lead |
| s.43A / SPDI Rules 2011 (reasonable security practices) | — | Covered by ISO 27001-aligned controls. DPDP s.44 is expected to omit s.43A when the remaining provisions start (not verified 2026-10-20) | Backend lead |
| s.72A (disclosure in breach of contract) | — | Staff NDAs; access controls | Product lead |
| **Legal standing of our signatures** (ss.3, 3A, 5; Second Schedule) | Called "signed by both" in the UI, never "digitally signed under the IT Act" | Ed25519 device signatures with no licensed-CA certificate are **electronic records with integrity evidence, not IT-Act "digital signatures"** (our reading, not verified 2026-10-20). Evidentiary use needs a certificate for electronic records under the Bharatiya Sakshya Adhiniyam, 2023 (s.63, not verified). v1 can generate that certificate on export. Aadhaar eSign for settlements is a v2 option. | Product lead |
| s.79 / IT Rules 2021 (intermediaries) | — | Tola mainly hosts its own users' ledger. If treated as an intermediary: Grievance Officer, 24-h acknowledgement, published rules (not verified 2026-10-20) | Product lead |

---

## 3. Legal Metrology Act, 2009 (and the Legal Metrology (General) Rules, 2011)
**Applies?** Yes, indirectly. It governs weighing **in trade**. Tola records weights; it is not an instrument.

From research [S52] (Wikipedia, war-room log): weights and measures used in transactions must be of an approved model and periodically **verified and stamped** by the Legal Metrology department. The exact section numbers and the balance accuracy class needed for gold are **not verified 2026-10-20**.

| Requirement | MVP (hackathon) | v1 (production) | Owner |
|---|---|---|---|
| Trade weighing only on a verified, stamped instrument | Simulated scale + optional Web Serial balance; the bench HX711 rig is labelled **"not for trade"** (R-03) | Tola reads the **shop's own verified balance**. Onboarding records its make, model, serial and verification certificate number + due date. The UI warns when verification is overdue. | Field & pitch lead |
| Don't present Tola as a measuring device | Copy says "recorded from the balance", never "Tola weighed" | Same; terms of service say so | Product lead |
| DIY load cells | Demo only | Never offered for trade use. Any Tola-branded hardware would need model approval (out of scope) | Backend lead |
| Display OCR (M-04) | Fallback demo path | OCR *reads* the verified balance's display. It doesn't replace it. A mismatch blocks the event. | AI lead |

---

## 4. GST: job work (CGST Act s.143; CGST Rules 45, 46, 55)
**Applies?** Yes, for registered jewellers and karigars above the threshold. Tola only drafts documents (F-09).

From the GJC *GST FAQs for Gem & Jewellery Industry* [S24], fetched and text-extracted 2026-10-20. The document is from 2017 and predates later rate changes.
- Inputs may be sent to a job worker **without payment of tax** under s.143, under a **Rule 55 delivery challan**.
- Inputs must come back **within one year**.
- Karigar labour on gold jewellery is a supply of service at **5% GST**; gold supplied is at 3%.
- The job worker invoices under **Rule 46**.
- An unregistered karigar triggers reverse charge on the principal, per the 2017 FAQ.

Whether the 5% job-work rate and that reverse-charge position still stand after later rate rationalisations (incl. Sept 2025) is **not verified 2026-10-20**. The CA must confirm.

| Requirement | MVP (hackathon) | v1 (production) | Owner |
|---|---|---|---|
| Rule 55 delivery challan when gold goes to the karigar | `API-16` makes a PDF **draft**, watermarked "DRAFT · DEMO", with a fake GSTIN | Draft challan from each `ISSUE` event: challan number series per shop, HSN, weight, fineness, value | Backend lead |
| Return within 1 year (s.143) | Not shown | F-10 flags issued gold that is approaching 11 months without a return | Backend lead |
| Job-worker labour invoice at 5% (Rule 46) | Draft labour invoice at 5% (config value `gst.jobwork_rate_bps=500`, so it can change without code) | Same; the rate comes from config, reviewed by the CA quarterly | Backend lead |
| ITC-04 job-work return by the principal | Not in the demo | Export of issue/return data for ITC-04 (form and periodicity not verified 2026-10-20) | Backend lead |
| Record keeping (s.35/s.36) | — | Retention per [PRIVACY §5](PRIVACY.md#5-retention-schedule) | Product lead |
| Not a GST practitioner | Every PDF says "Draft for your CA. Tola does not file." | Same; Tally export for the CA | Product lead |

---

## 5. BIS hallmarking (BIS Act 2016; Hallmarking Order; HUID)
**Applies?** **Not in scope.** PS 2.2 is job-work tracking, not hallmarking (brief §9).

| Requirement | MVP (hackathon) | v1 (production) | Owner |
|---|---|---|---|
| Only BIS-recognised AHCs hallmark; HUID on hallmarked articles [S2] | No hallmark data | Optional `huid` text field on finished pieces, stored as entered and **not verified by Tola**. No public BIS API is known [S2]. | Product lead |
| Never imply certification | Banned words list in UI copy: "certified", "hallmarked", "certificate" (lint rule on i18n strings) | Same | Frontend lead |

---

## 6. Credit Information Companies (Regulation) Act, 2005 (CICRA)
**Applies?** Only if Tola collects and furnishes "credit information" as a business, or scores people. We design so it doesn't (R-06).

The definition of "credit information" and the scope of the RBI registration requirement are **not verified 2026-10-20**.

| Requirement | MVP (hackathon) | v1 (production) | Owner |
|---|---|---|---|
| Only RBI-registered CICs may carry on credit-information business | The Work Passport shows the karigar's **own raw record and simple counts**, with **no score, rank or grade**. The lender view is mocked. | Same. No lender can query Tola for anyone. Data flows only when the karigar pushes a share (C3). No bulk feeds to CICs. | Product lead |
| No adverse reporting on borrowers | — | Tola never reports defaults and holds no loan data | Product lead |
| Before AA/ULI | — | Partner with an RBI-regulated entity (FIP/AA). Tola would supply data through them, not as a CIC. Who can be an FIP is not verified 2026-10-20. | Product lead |

---

## 7. RBI: Digital Lending Directions, Payment Aggregators, PSS Act 2007, Account Aggregator
**Applies?** Not if the positioning in §0 holds. Two business-model items need care.

The current text of the RBI Digital Lending Directions (2025 consolidation) and the PA directions is **not verified 2026-10-20**.

| Topic | Risk | MVP (hackathon) | v1 (production) | Owner |
|---|---|---|---|---|
| Lending Service Provider (LSP) | "Lenders pay per consented passport pull" (brief §14) could look like sourcing borrowers for a fee (war-room, Harvey/Sharma) | No lender integration; mock only | Charge lenders a **flat data-access fee per consented pull, not tied to loan sanction or amount**; no loan application or lead routing; get a legal opinion before the first lender contract | Product lead |
| Payment Aggregator / PSS Act | Holding or routing settlement money | UPI intent `upi://pay?...` labelled **simulated**; no money moves | UPI intent/collect through a **licensed PSP** (Razorpay/Cashfree/PhonePe PG). Money goes payer → payee bank. Tola never pools funds. | Backend lead |
| KYC Master Direction | Lenders must KYC | Not applicable | Tola does no KYC on behalf of lenders. The passport says "Not KYC". | Product lead |
| Account Aggregator / ULI | Consent-based data flow to lenders [S42] | Mocked lender view, labelled | Post-pilot partner FIU/FIP path; sandbox access not verified | Product lead |
| Gold loans / gold-metal loans | Lending gold to karigars (vetoed in the war-room) | Out of scope | Out of scope | — |

---

## 8. PMLA 2002 (jewellers as reporting entities)
**Applies?** To **jewellers** (dealers in precious metals and stones), not to Tola. The specific notification and its thresholds are not verified 2026-10-20.

| Requirement | MVP (hackathon) | v1 (production) | Owner |
|---|---|---|---|
| Jewellers' own AML duties | — | Tola doesn't take on any AML role. We won't build features to hide cash flows. We cooperate with lawful requests, with a transparency report. | Product lead |

---

## 9. PM Vishwakarma scheme data
**Applies?** Lightly. There is an optional `pm_vishwakarma_id` field (E-03) [S41].

| Requirement | MVP (hackathon) | v1 (production) | Owner |
|---|---|---|---|
| Don't imply government affiliation or verification | Optional field, labelled "self-declared" | Same. No scheme logo or emblem use. No scraping of scheme portals. No public API is known [S41]. | Product lead |
| Data use | Not shown to shops | Shown only in a passport share if the karigar includes it | Product lead |
| Future integration | — | Only through an official MoU or API with MSME. Pitch it as a *JanAI* outreach channel, not a data source. | Product lead |

---

## 10. Consumer Protection Act, 2019; CCPA Dark Patterns Guidelines, 2023
**Applies?** Yes, to the jeweller subscription (B2B). The guidelines also reach consumer-facing UX, which here means the free karigar app.

| Requirement | MVP (hackathon) | v1 (production) | Owner |
|---|---|---|---|
| No unfair trade practices; clear pricing | Pricing slides marked HUNCH | Published price list (₹ per active karigar); no hidden charges | Product lead |
| No dark patterns (e.g. false urgency, basket sneaking, confirm-shaming, forced action, subscription traps) | Equal-weight "Haan / Na" buttons | Design review checklist; "Na" (deny) as easy as "Haan"; cancellation in ≤ 2 taps | Frontend lead |
| Karigar access is free forever (brief §14) | Stated | Written into the terms of service | Product lead |

---

## 11. Other applicable rules (short list)
| Law / rule | Applies? | MVP (hackathon) | v1 (production) | Owner |
|---|---|---|---|---|
| TRAI TCCCPR 2018 (DLT registration for SMS) | Yes, for OTP SMS | No SMS | Register the entity, sender ID and OTP template on DLT via the SMS provider | Backend lead |
| WhatsApp Business / Messaging policies | Yes (F-12) | Simulated phone | Approved templates; opt-in recorded; utility category only | Backend lead |
| Telecommunications Act, 2023 | Not as a telecom; we use licensed providers | — | — | — |
| Child and Adolescent Labour (Prohibition and Regulation) Act, 1986 | Ethical/contextual | Persona ages ≥ 18 | No minors onboarded ([PRIVACY §8](PRIVACY.md#8-childrens-data)) | Field & pitch lead |
| RPwD Act, 2016; WCAG 2.2 AA | Yes (low literacy, low vision) | 44 px targets; spoken numbers | WCAG 2.2 AA audit ([ACCESSIBILITY](../02-design/ACCESSIBILITY.md)) | Frontend lead |
| Copyright Act, 1957 (fonts, voices, design references) | Yes | Fontsource fonts (OFL); no Sarvam proprietary fonts or logo (brief §11) | Licence register | Frontend lead |
| Trade Marks Act, 1999 ("Tola" name) | Yes | Not checked | Search the IP India register in classes 9, 36, 42 before branding spend (owner Product lead, by 31 Jan 2027) | Product lead |
| Code on Social Security, 2020 (gig/platform workers) | Unlikely. Tola is not an aggregator of the karigar's work. | — | Re-check if Tola ever matches karigars to jobs | Product lead |
| Global: GDPR / EU AI Act | **No.** India-only users and data | — | Re-assess if we expand abroad (e.g. the Gulf jewellery trade) | Product lead |
| MeitY AI governance guidelines / advisories | Voluntary; good practice | AI outputs labelled; human-in-the-loop | Map to [RESPONSIBLE_AI](../04-ai/RESPONSIBLE_AI.md) | AI lead |

---

## 12. Compliance calendar (v1)
| When | Item | Owner |
|---|---|---|
| 13 Nov 2026 | DPDP Rule 4 (Consent Managers) starts. Note it; no action for the MVP. | Product lead |
| 30 Nov 2026 | Re-verify DPDP Rules phases against the Gazette text | Product lead |
| 20 Dec 2026 | P0 internal security check of the demo before the 27 Dec final | Backend lead |
| 31 Jan 2027 | Legal opinion: fiduciary role, LSP/CICRA positioning, IT Act signature standing; trade-mark search | Product lead |
| 28 Feb 2027 | DPIA signed off; processor DPAs signed; DLT registered | Product lead |
| 13 May 2027 | DPDP main duties start. Must be fully compliant (planned to be already). | Product lead |
| Every quarter | CA review of GST rates in config; access review; restore drill | Backend lead |
| Every year | External pen test (CERT-In empanelled); policy review | Backend lead |

---

## 13. Certifications roadmap
| Certification | Why | Trigger / target | Cost (HUNCH) | Owner |
|---|---|---|---|---|
| CERT-In empanelled VAPT report | Lenders and co-op banks ask for it first | Before the first lender integration (target Jun 2027) | ₹1.5–3 lakh | Backend lead |
| **ISO/IEC 27001:2022** | The baseline banks/NBFCs expect from data partners | Readiness at 6 months after the pilot; certify when ≥ 50 paying shops or the first lender contract asks for it (target Q4 2027) | ₹4–8 lakh first year (consultant + certification body), using a compliance-automation tool | Backend lead |
| **SOC 2 Type I → Type II** | Only if we sell to global or enterprise customers (large jewellery chains with US/Gulf parents) | Not before 2028 unless a customer requires it | ₹8–15 lakh (Type II) | Product lead |
| **ISO/IEC 42001:2023** (AI management system) | Signals responsible AI to lenders and government (JanAI); pairs with ISO 27001 | After ISO 27001 (target 2028) | ₹4–6 lakh incremental | AI lead |
| WCAG 2.2 AA conformance statement | Inclusion; GIGW if a government partner adopts Tola | Before any government pilot | ₹50k–1 lakh audit | Frontend lead |
| STQC / GIGW (government apps) | Only if a state department deploys Tola | On demand | Not estimated | Product lead |

**MVP (hackathon) answer to a judge asking "is it compliant?"**
> "The demo uses only synthetic data and has no login on purpose. The production design follows the DPDP Act and Rules, which become fully enforceable on 13 May 2027. It meets CERT-In's 6-hour and 180-day rules and keeps data in Mumbai. It stays outside the Legal Metrology, BIS, CICRA and RBI perimeters by design: we record the shop's verified balance, we never certify, we never score, and we never touch money."
