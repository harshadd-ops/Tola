# User Stories
> Project: Tola · Owner: Product lead · Status: Draft v0.1 · Last updated: 2026-10-20
> Related: [PRD](./PRD.md) · [Features](./FEATURES.md) · [Personas](./PERSONAS.md) · [User Journeys](./USER_JOURNEYS.md) · [API Spec](../03-engineering/API_SPEC.md) · [Backlog](../08-project/BACKLOG.md) · [Testing](../../implementation/scalable/docs/TESTING.md)

## Conventions
- **ID:** US-xx. Each story maps to exactly one feature F-xx from the [Project Brief](../00-overview/PROJECT_BRIEF.md), except US-34 and US-35, which cover the demo harness (API-02) and have no F-ID.
- **Priority:** MoSCoW for the MVP.
- **Estimate:** S ≤ 0.5 day · M = 1–2 days · L = 3–5 days, for one person on the 4-person team.
- **Build:**
  - **MVP** = `implementation/demo`;
  - **v1** = `implementation/scalable`;
  - **Both** = the story ships in the demo and is carried into v1.
- **Gherkin** is the acceptance test. Playwright (e2e) and pytest (ledger-core) tests reference the story ID in their names, e.g. `test_US14_variance_flag`.
- **Seed values** in scenarios come from the scripted demo week ([USER_JOURNEYS.md §6](./USER_JOURNEYS.md#6-the-scripted-demo-week-mvp)).

## Epics
| Epic | Name | Features | Stories |
|---|---|---|---|
| EP-01 | Capture what moved | F-01, F-02, F-04 | US-01 – US-07, US-11 – US-13 |
| EP-02 | Ledger both sides trust | F-03 | US-08 – US-10 |
| EP-03 | Catch it the same week | F-05, F-06 | US-14 – US-19 |
| EP-04 | Settle and pay | F-07, F-09 | US-20 – US-22, US-26 |
| EP-05 | Karigar's own record | F-08 | US-23 – US-25 |
| EP-06 | Jeweller's view | F-10, F-13 | US-27, US-30, US-31 |
| EP-07 | Reach and access | F-11, F-12, F-14 | US-28, US-29, US-32, US-33 |
| EP-08 | Demo harness (MVP only) | — (API-02) | US-34, US-35 |

## Story index
| ID | Story (short) | F-xx | Persona | Priority | Est. | Build |
|---|---|---|---|---|---|---|
| US-01 | Capture issue weight from the balance | F-01 | P-03 | Must | M | Both |
| US-02 | Attach photo, order, type, norm to an issue | F-01 | P-01 | Must | S | Both |
| US-03 | Agree and sign a wastage norm per order type | F-01 | P-01, P-02 | Must | M | Both |
| US-04 | Fallback capture when no balance is connected | F-01 | P-03 | Should | M | MVP simulated / v1 OCR |
| US-05 | Hear the issue read back in my language | F-02 | P-02 | Must | M | Both |
| US-06 | Confirm by tap or "haan" | F-02 | P-02 | Must | S | Both |
| US-07 | Reject an entry I disagree with | F-02 | P-02 | Must | S | Both |
| US-08 | Every event signed by both parties | F-03 | P-01, P-02 | Must | L | Both |
| US-09 | See that the chain is verified | F-03 | P-02 | Must | M | Both |
| US-10 | Correct by adjustment, never edit | F-03 | P-01 | Must | S | Both |
| US-11 | Weigh back piece, scrap and dust | F-04 | P-03 | Must | M | Both |
| US-12 | Voice note becomes a structured return draft | F-04 | P-02 | Must | L | Both |
| US-13 | Warn on a likely duplicate return | F-04 | P-03 | Should | S | Both |
| US-14 | Run the weekly reconciliation | F-05 | P-01 | Must | L | Both |
| US-15 | Understand a flag in my language | F-05 | P-01, P-02 | Must | M | Both |
| US-16 | Reconciliation runs on schedule | F-05 | P-01 | Should | M | v1 |
| US-17 | Open a dispute on a line | F-06 | P-02 | Must | M | Both |
| US-18 | Reply to a dispute by voice | F-06 | P-02 | Must | M | Both |
| US-19 | Resolve a dispute with both signatures | F-06 | P-01, P-02 | Must | M | Both |
| US-20 | Receive the same settlement statement as the jeweller | F-07 | P-02 | Must | M | Both |
| US-21 | Dual approval before payment | F-07 | P-01, P-02 | Must | S | Both |
| US-22 | UPI intent opens on dual approval | F-07 | P-01 | Must | S | MVP simulated / v1 PSP |
| US-23 | Share my Work Passport with a lender | F-08 | P-02 | Should | M | Both |
| US-24 | Revoke a passport share | F-08 | P-02 | Should | S | Both |
| US-25 | Lender views a verified passport | F-08 | P-04 | Should | M | MVP mocked / v1 |
| US-26 | Get Rule 55 challan and labour-invoice drafts | F-09 | P-01 | Should | M | Both |
| US-27 | See orders by occasion date with late risk | F-10 | P-01 | Could | S (MVP) / M (v1) | Both |
| US-28 | Record events offline and sync later | F-11 | P-05 | Should | L | v1 |
| US-29 | Confirm and dispute over WhatsApp or IVR | F-12 | P-02 | Should | L | MVP simulated / v1 |
| US-30 | See fine-gold balance per karigar | F-13 | P-01 | Must | M | Both |
| US-31 | See what needs my action today | F-13 | P-01 | Must | S | Both |
| US-32 | Use the app in my language | F-14 | P-02, P-03 | Must | M | Both |
| US-33 | Use every karigar screen without reading | F-14 | P-02 | Must | M | Both |
| US-34 | Switch role without logging in | — (API-02) | Judge / presenter | Must | S | MVP |
| US-35 | Walk the scripted week in story mode and reset | — (API-02) | Judge / presenter | Must | M | MVP |

---

## EP-01 · Capture what moved

### US-01 · Capture issue weight from the balance (F-01 · Must · M · Both)
As **Lakshmi (P-03)**, I want the issue weight to come straight from the balance so that nobody can argue I typed it wrong.
```gherkin
Feature: Scale-captured issue
  Scenario: Stable reading is captured
    Given the balance is connected with source "serial"
    And the reading has been stable at 40.000 g for 1.5 seconds
    When I tap "Capture"
    Then a ScaleReading of 40000 mg with source "serial" is stored
    And the weight field shows 40.000 g in DM Mono and is not editable

  Scenario: Unstable reading cannot be captured
    Given the reading changed by more than 10 mg in the last 1.5 seconds
    Then the "Capture" button is disabled
    And the hint "Wait for the scale to settle" is shown

  Scenario: No keyboard path exists
    When I focus the weight field
    Then no on-screen keyboard opens
```

### US-02 · Attach photo, order, type and norm (F-01 · Must · S · Both)
As **Suresh (P-01)**, I want each issue to carry a photo, the order, the order type and the agreed norm so that the event is complete evidence.
```gherkin
Scenario: Issue draft carries context
  Given a captured reading of 40000 mg
  When I choose Order "#14", type "plain", fineness 916 and take a photo
  Then the ISSUE draft shows norm 2.50% from the signed norm for Suresh and Rafiq for "plain"
  And the draft is sent to Rafiq for confirmation via API-06
```

### US-03 · Agree and sign a wastage norm (F-01 · Must · M · Both)
As **Suresh and Rafiq**, we want the wastage norm per order type agreed and signed before work starts so that variance is objective.
```gherkin
Scenario: Norm is signed by both before use
  Given no signed norm exists for Suresh and Rafiq for type "plain"
  When Suresh proposes 2.50% and Rafiq confirms by voice
  Then a WastageNorm version 1 with two signatures is stored
  And issues of type "plain" can now be created for this pair

Scenario: Issue blocked without a signed norm
  Given the norm for "studded" is unsigned
  When Lakshmi tries to issue gold for a studded order
  Then she sees "Agree the wastage norm with the karigar first"
```

### US-04 · Fallback capture (F-01 · Should · M · MVP simulated / v1 display OCR)
As **Lakshmi**, I want a safe fallback when the balance will not connect so that the counter does not stop.
```gherkin
Scenario: Simulated scale in the demo
  Given NEXT_PUBLIC_DEMO_MODE is "true"
  Then the simulated scale widget is shown with the label "Simulated scale"
  And captured readings have source "simulated"

Scenario: Display OCR in v1
  Given the balance is not connected
  When Lakshmi photographs the display showing "40.00"
  Then M-04 proposes 40000 mg with a confidence
  And the karigar must confirm the same number before the event is signed
```

### US-05 · Hear the issue read back (F-02 · Must · M · Both)
As **Rafiq (P-02)**, I want to hear every issue in Bengali so that I know exactly what I am signing.
```gherkin
Scenario: Bengali read-back
  Given an ISSUE draft of 40000 mg for Order "#14" with norm 2.50%
  And Rafiq's language is "bn"
  When the draft reaches Rafiq's view
  Then audio from API-09 plays the order, the full weight including decimals and the norm
  And the same text is shown on screen with the number in large digits

Scenario: Cached fallback
  Given AI_FALLBACK_MODE is "cached"
  Then pre-generated audio for this event plays within 300 ms
```

### US-06 · Confirm by tap or "haan" (F-02 · Must · S · Both)
As **Rafiq**, I want to confirm with one tap or one word so that it takes no extra work.
```gherkin
Scenario Outline: Confirmation inputs
  Given the read-back has finished
  When Rafiq <action>
  Then his Ed25519 signature is added via API-07

  Examples:
    | action                       |
    | taps the large tick          |
    | says "haan"                  |
    | says "howa" (Bengali yes)    |
```

### US-07 · Reject an entry (F-02 · Must · S · Both)
As **Rafiq**, I want to say no to a wrong entry so that I am never signed up for gold I did not receive.
```gherkin
Scenario: Karigar rejects
  When Rafiq says "na" or taps the cross
  Then the event stays with one signature and status "rejected by karigar"
  And Suresh sees it in "Needs action"
  And the event is not settlement-eligible

Scenario: No response
  Given 30 seconds pass without input
  Then the event status is "awaiting karigar"
```

---

## EP-02 · Ledger both sides trust

### US-08 · Dual signatures (F-03 · Must · L · Both)
As **Suresh and Rafiq**, we want every event signed by both of us so that neither can later deny it.
```gherkin
Scenario: Event becomes final only with two valid signatures
  Given an ISSUE event signed by Suresh
  When Rafiq's signature is verified by PyNaCl against his public key
  Then the event status is "dual-signed"
  And its hash = SHA-256(prev_hash || canonical payload) is stored

Scenario: Invalid signature
  When a signature does not verify
  Then API-07 returns 422 and the event remains "awaiting karigar"
```

### US-09 · Chain verified (F-03 · Must · M · Both)
As **Rafiq**, I want to see that my ledger has not been changed so that I can trust it.
```gherkin
Scenario: Verified chain
  When Rafiq opens his ledger
  Then API-08 returns chain_status "verified"
  And a green "Verified" badge with the event count is shown

Scenario: Tamper detected (demo step 10)
  Given one stored byte in event 7 is altered
  When the ledger is read
  Then chain_status is "broken" with first_broken_index 7
  And both parties see "Ledger altered at entry 7"
```

### US-10 · Adjust, never edit (F-03 · Must · S · Both)
As **Suresh**, I want to correct mistakes with a new signed entry so that the history stays honest.
```gherkin
Scenario: No edit path
  When any client sends PUT, PATCH or DELETE to an event
  Then the API returns 405

Scenario: Adjustment
  When Suresh creates an ADJUSTMENT of +130 mg against Order "#14" with a reason
  Then it needs Rafiq's signature before it changes any balance
```

### US-11 · Weigh back piece, scrap and dust (F-04 · Must · M · Both)
As **Lakshmi**, I want to weigh the piece, the scrap and the dust separately so that each is credited correctly.
```gherkin
Scenario: Return of Order #14
  Given Order "#14" has an ISSUE of 40000 mg
  When Lakshmi captures 38120 mg as RETURN and 500 mg as SCRAP_RETURN
  Then two drafts linked to Order "#14" go to Rafiq for confirmation
  And after both sign, Order "#14" shows returned 38620 mg
```

### US-12 · Voice note to structured return (F-04 · Must · L · Both)
As **Rafiq**, I want to explain a return by voice so that I don't have to type.
```gherkin
Scenario: IntakeAgent drafts from voice plus scale
  Given a scale reading of 38120 mg
  And Rafiq records "Order fourteen, bangles done, the solder joint cracked, I redid it" in Bengali
  When API-10 runs M-01 then M-03
  Then the draft has order "#14", type RETURN, note text and confidence values
  And the weight is 38120 mg from the scale reading, not from the transcript
  And fields with confidence below 0.8 are highlighted for human review
```

### US-13 · Duplicate warning (F-04 · Should · S · Both)
As **Lakshmi**, I want to be warned about a likely duplicate return so that we don't credit gold twice.
```gherkin
Scenario: Same order and weight within 10 minutes
  Given a RETURN of 38120 mg for Order "#14" was created 4 minutes ago
  When another RETURN of 38120 mg for Order "#14" is drafted
  Then the warning "Looks like a duplicate" is shown with both entries
  And Lakshmi must choose "Keep both" or "Discard"
```

---

## EP-03 · Catch it the same week

### US-14 · Weekly reconciliation (F-05 · Must · L · Both)
As **Suresh**, I want to run the week's reconciliation so that I see any gap while it is small.
```gherkin
Scenario: Variance flag on Order #14 (demo step 4)
  Given Order "#14": ISSUE 40000 mg, RETURN 38120 mg, SCRAP_RETURN 500 mg, norm 2.50%
  When Suresh clicks "Run week"
  Then ledger-core computes allowed 1000 mg, loss 1380 mg, variance +380 mg
  And a VarianceFlag for Order "#14" is created with expected, actual and variance
  And the rupee value shown is ₹5,188 at ₹14,904/g 24K and fineness 916

Scenario: Deterministic
  When the same run is repeated on the same events
  Then the same flags and numbers are produced
```

### US-15 · Flag explained in my language (F-05 · Must · M · Both)
As **Suresh** (kn) and **Rafiq** (bn), we each want the flag explained in our own language so that we both understand it the same way.
```gherkin
Scenario: Explanation uses only ledger-core numbers
  Given the flag for Order "#14"
  When the ReconcileAgent writes explanations in "kn" and "bn"
  Then every number in each text equals a number in the flag payload
  And if a guard finds any other number, the deterministic template is used instead
```

### US-16 · Scheduled run (F-05 · Should · M · v1)
As **Suresh**, I want the reconciliation to run on its own every week so that I never forget.
```gherkin
Scenario: Weekly job
  Given the schedule is Sunday 20:00 IST
  When the worker runs
  Then a ReconciliationRun is created for every active shop–karigar pair
  And both parties get a notification if any flag exists
```

### US-17 · Open a dispute (F-06 · Must · M · Both)
As **Rafiq**, I want to dispute a line so that it is not settled until we agree.
```gherkin
Scenario: Dispute on a flag (demo step 5)
  Given the flag on Order "#14"
  When Rafiq taps "I disagree"
  Then a Dispute linked to the flag and its events is created via API-12
  And the line shows "Disputed" to both parties
  And the line is excluded from settlement approval
```

### US-18 · Voice reply (F-06 · Must · M · Both)
As **Rafiq**, I want to answer by voice so that I can explain without writing.
```gherkin
Scenario: Voice message on a dispute
  When Rafiq records a 20-second Bengali reply
  Then a message with audio, transcript and language "bn" is added
  And Suresh can play it and read the Kannada translation
  And no message can be edited or deleted
```

### US-19 · Resolve with two signatures (F-06 · Must · M · Both)
As **Suresh and Rafiq**, we want a dispute closed only when both of us sign so that the outcome is fair.
```gherkin
Scenario: Agreed adjustment (demo step 6)
  Given the dispute on Order "#14"
  When Suresh proposes accepting 130 mg as rework wastage
  And Rafiq confirms
  Then an ADJUSTMENT of 130 mg and a DISPUTE_RESOLVE event are created, each signed by both
  And Rafiq's balance on Order "#14" is 250 mg gross (229 mg fine)

Scenario: One-sided close is impossible
  When only Suresh signs DISPUTE_RESOLVE
  Then the dispute status stays "open"
```

---

## EP-04 · Settle and pay

### US-20 · Same statement for both (F-07 · Must · M · Both)
As **Rafiq**, I want to see exactly the statement the jeweller sees so that nothing is hidden from me.
```gherkin
Scenario: Identical statement
  When the SettleAgent drafts the week's settlement via API-13
  Then Suresh and Rafiq get the same statement hash
  And it shows gold carried forward 229 mg fine, labour ₹4,800, GST ₹240, payable ₹5,040
  And Rafiq's version is read aloud in Bengali on request
```

### US-21 · Dual approval (F-07 · Must · S · Both)
As **Suresh and Rafiq**, we want payment released only after both of us approve so that settlement is mutual.
```gherkin
Scenario: One approval is not enough
  Given Suresh approved the settlement
  Then the status is "awaiting karigar" and no payment intent exists

Scenario: Both approve
  When Rafiq approves too
  Then the status is "approved" with two signatures
```

### US-22 · UPI intent on approval (F-07 · Must · S · MVP simulated / v1 PSP)
As **Suresh**, I want the payment to open as soon as we both approve so that Rafiq is paid at once.
```gherkin
Scenario: Simulated UPI intent (MVP)
  Given the settlement is "approved"
  When API-14 is called
  Then a link "upi://pay?pa=<TOLA_UPI_VPA>&pn=<TOLA_UPI_PAYEE_NAME>&am=5040.00&cu=INR&tn=Tola settlement" and a QR are shown
  And PaymentIntent.status is "simulated"
  And the label "Simulated, no money moves" is visible

Scenario: PSP webhook (v1)
  When the PSP posts a success to API-20
  Then PaymentIntent.status becomes "paid" and both parties are notified
```

### US-26 · GST job-work drafts (F-09 · Should · M · Both)
As **Suresh**, I want Rule 55 challan and labour-invoice drafts so that my CA can file without re-typing.
```gherkin
Scenario: Drafts tie to the ledger
  Given the approved settlement for the week
  When Suresh downloads from API-16
  Then a delivery-challan draft lists the ISSUE events with weights and fineness
  And a labour-invoice draft shows ₹4,800 + 5% GST ₹240 = ₹5,040
  And every page carries "DRAFT, not filed"
```

---

## EP-05 · Karigar's own record

### US-23 · Share a Work Passport (F-08 · Should · M · Both)
As **Rafiq**, I want to share my verified work history with a lender so that I can get credit.
```gherkin
Scenario: Consented share
  When Rafiq chooses scope "summary", recipient "Co-op bank" and expiry 7 days
  And hears the consent notice in Bengali and confirms
  Then a PassportShare with a unique token is created via API-15
  And the summary includes weeks of history, grams handled, on-time %, variance vs norm and counter-signing jewellers
  And it includes no score
```

### US-24 · Revoke a share (F-08 · Should · S · Both)
As **Rafiq**, I want to revoke a share at any time so that I stay in control.
```gherkin
Scenario: Revoke
  When Rafiq taps "Stop sharing"
  Then API-15 DELETE marks the share revoked
  And GET /v1/passport/{token} returns 410 with "Revoked by the karigar"
```

### US-25 · Lender views a passport (F-08 · Should · M · MVP mocked / v1)
As a **credit officer (P-04)**, I want to see a verified work summary so that I can make my own decision.
```gherkin
Scenario: Lender view
  When the officer opens a valid passport link
  Then the page shows the summary, chain_status "verified", the expiry and "Tola does not score or lend"
  And in the demo the page shows the label "Mocked lender view"
```

---

## EP-06 · Jeweller's view

### US-27 · Orders by occasion date (F-10 · Could · S/M · Both)
As **Suresh**, I want orders sorted by the customer's occasion date with late-risk flags so that no wedding waits.
```gherkin
Scenario: Late risk (v1)
  Given Order "#21" has an occasion date 6 days away and no RETURN event
  Then it shows "At risk" at the top of the list
```

### US-30 · Fine-gold balance per karigar (F-13 · Must · M · Both)
As **Suresh**, I want each karigar's fine-gold balance so that I know who holds what.
```gherkin
Scenario: Balance equals signed events
  When Suresh opens the dashboard
  Then each karigar's balance equals the sum of his dual-signed events in fine mg
  And tapping a balance lists those events
```

### US-31 · Today's actions (F-13 · Must · S · Both)
As **Suresh**, I want one list of what needs me today so that nothing waits on me.
```gherkin
Scenario: Needs action
  Then the "Needs action" list shows events awaiting my signature, open disputes, flags and settlements awaiting approval
  And each item opens the right screen in one tap
```

---

## EP-07 · Reach and access

### US-28 · Offline record and sync (F-11 · Should · L · v1)
As a **head karigar (P-05)**, I want to record events without signal so that work doesn't stop.
```gherkin
Scenario: Offline then sync
  Given the device is offline
  When a helper signs a RETURN with his PIN
  Then the event is stored in IndexedDB and signed locally
  When the device reconnects
  Then API-18 accepts the batch in order and the chain verifies

Scenario: Fork
  Given the server chain advanced while the device was offline
  Then the conflict is shown to both parties, and no event is dropped
```

### US-29 · WhatsApp / IVR channel (F-12 · Should · L · MVP simulated / v1)
As **Rafiq**, I want to confirm or dispute from WhatsApp or a plain call so that I don't need the app.
```gherkin
Scenario: Simulated phone (MVP)
  Then the karigar role shows a phone frame with a WhatsApp-style message and an "IVR call" button
  And it is labelled "Simulated channel"

Scenario: WhatsApp confirm (v1)
  When Rafiq replies "1" to the confirmation message and enters his PIN on the IVR or web prompt
  Then API-19 records his confirmation and adds his signature
```

### US-32 · My language (F-14 · Must · M · Both)
As **Rafiq** and **Lakshmi**, we want the app in our own language so that we understand every screen.
```gherkin
Scenario Outline: Locale
  When the user selects <locale>
  Then all UI strings render from next-intl messages for <locale>
  And gram figures keep DM Mono with the locale's digit grouping

  Examples:
    | locale |
    | en     |
    | hi     |
    | kn     |
    | bn     |
```

### US-33 · No reading needed (F-14 · Must · M · Both)
As **Rafiq**, I want to use every karigar screen by listening and tapping so that reading is never required.
```gherkin
Scenario: Voice-first karigar screens
  Then every karigar screen has a speaker button that reads it aloud
  And every action target is at least 44 by 44 px
  And with prefers-reduced-motion, transitions are replaced by fades
```

---

## EP-08 · Demo harness (MVP only, API-02)

### US-34 · Role switcher (— · Must · S · MVP)
As the **presenter**, I want to switch between Jeweller, Karigar and Lender without logging in so that judges see both sides in seconds.
```gherkin
Scenario: Switch role
  Given NEXT_PUBLIC_DEMO_MODE is "true"
  When I pick "Karigar" in the role switcher
  Then the view changes to Rafiq's screens within 300 ms with a spring transition
  And no login screen exists anywhere in the demo build
```

### US-35 · Story mode and reset (— · Must · M · MVP)
As the **presenter**, I want a guided scripted week and a one-click reset so that the 3-minute walkthrough is repeatable.
```gherkin
Scenario: Walk the week
  When I start story mode
  Then steps 1 to 10 of the scripted week run in order, each advanced by one click or key
  And I can leave story mode at any step and interact freely

Scenario: Reset
  When I call POST /v1/demo/reset
  Then the seed is restored in under 2 seconds and chain_status is "verified"
```
