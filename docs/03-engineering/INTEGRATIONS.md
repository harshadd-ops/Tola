# Integrations
> Project: Tola · Owner: AI/voice lead (Lyzr, Sarvam) + back-end lead (UPI, WhatsApp, GST) · Status: Draft v0.1 · Last updated: 2026-10-20
> Related: [Project brief §9](../00-overview/PROJECT_BRIEF.md) · [Architecture](ARCHITECTURE.md) · [API spec](API_SPEC.md) · [Hardware](HARDWARE.md) · [AI models](../04-ai/MODELS.md) · [Prompts](../04-ai/PROMPTS.md) · [Compliance](../06-security-compliance/COMPLIANCE.md) · [Cost](../../implementation/scalable/docs/COST.md)

Every integration sits behind an adapter interface in `services/api/app/adapters/`, and each adapter has a `live` and a `fallback` implementation. `AI_FALLBACK_MODE` (`live` | `cached` | `off`) selects the AI adapters. Payment and messaging adapters are chosen by track: in the demo they are simulated.

## 1. Summary
| System | Purpose | MVP (demo) | v1 (scalable) | Auth | Cost |
|---|---|---|---|---|---|
| Lyzr Agent Studio | M-03 agents: Manager, Intake, Reconcile, Settle | Live (free build tier) + cached/template fallback | Live | `x-api-key` header (`LYZR_API_KEY`) | ~$0.06 per single-agent run [B-sponsors 17]; hackathon credits amount unknown |
| Sarvam AI | M-01 STT, M-02 TTS | Live with ₹100 free credits + cached audio | Live (paid) | `api-subscription-key` header (`SARVAM_API_KEY`) | STT ₹30/hour; Bulbul v3 ₹30 per 10K chars |
| Jewellery balance | Weight capture (F-01) | Simulated widget + Web Serial | Web Serial / BLE / display OCR | Browser permission prompt | See [HARDWARE](HARDWARE.md) |
| UPI | Settlement payment (F-07) | `upi://pay` intent + QR, **simulated** | PSP intent/collect + webhook | PSP key/secret | PSP UPI pricing (not verified 2026-10-20) |
| WhatsApp | Karigar confirm/dispute without the app (F-12) | Simulated phone frame | Meta WhatsApp Cloud API | Bearer `WHATSAPP_TOKEN` | Meta per-message pricing (not verified 2026-10-20) |
| IVR | Feature-phone confirm (F-12) | Simulated | Exotel or Sarvam Voice Agents | `IVR_PROVIDER_KEY` | Sarvam Voice Agents ₹3.50/min + ₹59 per 30 days per number |
| OTP SMS | Login (API-17) | Not used | SMS provider (`OTP_PROVIDER_KEY`) | Provider key | HUNCH ₹0.15–0.25 per SMS |
| GST | Rule 55 challan + 5% labour invoice drafts (F-09) | PDF draft | PDF + Tally export | — | ₹0 |
| AA / ULI | Lender pull of the passport (F-08 later) | Mocked lender view, labelled | Partner FIU path, post-pilot | — | — |
| PM Vishwakarma | Optional ID on E-03 | Field only | Field only | — | — |
| Bhashini | Sovereign ASR/TTS fallback | Not used | Option | ULCA userID + API key | Free for proof-of-concept use only [B-sponsors 32] |

Sarvam and Lyzr prices are from the hackathon sponsor research (`research/B-sponsors.md`, Oct 2026). Re-check them before the cost model is frozen ([COST](../../implementation/scalable/docs/COST.md)).

---

## 2. Lyzr Agent Studio (AI Partner)
**Purpose.** The M-03 agents. The Manager routes to `IntakeAgent` (voice transcript → event draft), `ReconcileAgent` (explains flags computed by `ledger_core`) and `SettleAgent` (statement narrative + GST draft text). See [MODELS](../04-ai/MODELS.md) and [PROMPTS](../04-ai/PROMPTS.md).

**Sandbox access.**
1. Sign up at https://studio.lyzr.ai and create an API key under *Account → API Keys*.
2. Create the four agents in Studio (provider `gpt-4o-mini`). Copy the ids into `LYZR_AGENT_ID_MANAGER`, `LYZR_AGENT_ID_INTAKE`, `LYZR_AGENT_ID_RECONCILE` and `LYZR_AGENT_ID_SETTLE`.
3. Python: `pip install lyzr-adk==0.1.12`. Or call REST directly:
   `POST https://agent-prod.studio.lyzr.ai/v3/agent/{agent_id}/chat` with headers `x-api-key`, `Content-Type: application/json` and body `{"message": "...", "session_id": "pair-<pseudonym>"}` (from the Lyzr quickstart as captured in the sponsor research; re-verify the request schema against https://docs.lyzr.ai/enterprise/get-started/quickstart before coding).
4. Ask the organisers how many hackathon credits Lyzr gives (UNKNOWN as of 2026-10-20). Owner: field + pitch lead, at the AMA on 24 Dec 2026 at the latest, and preferably at registration.

**Data exchanged.** Outbound: the transcript text, open order codes, reading ids and the fixed numbers from `ledger_core`. Person names are replaced by pseudonyms (`K-7f3a`). No audio, phone numbers or VPAs. Inbound: JSON that must validate against the Pydantic draft schema.

**Failure handling.**
| Failure | Handling |
|---|---|
| Timeout (8 s) / 5xx / 429 | One retry with jitter, then the template fallback. The UI shows "Explained by template". |
| Invalid JSON | One repair retry, then the template. |
| A number that `ledger_core` did not produce | Rejected (`validator_result=rejected_number`); the template is used (FM-04). |
| Demo with `AI_FALLBACK_MODE=cached` | Seeded outputs in `seed/ai_cache/*.json`, keyed by the input hash. |

Every call writes an E-19 `AiTrace`.

## 3. Sarvam AI (speech)
**Purpose.** M-01 STT for karigar voice notes and "haan/na". M-02 TTS read-back of every gram figure in bn/hi/kn (plus mr/ta in v1).

**Sandbox access.** Sign up at https://dashboard.sarvam.ai (₹100 free credits, which do not expire). Create an API key and put it in `SARVAM_API_KEY`. SDK: `pip install sarvamai==0.1.37`.

**Endpoints (verified against docs.sarvam.ai, 2026-10-20).**
| Call | Request | Response | Limits |
|---|---|---|---|
| STT `POST https://api.sarvam.ai/speech-to-text` | multipart: `file` (WAV/MP3/FLAC), `model` (`saaras:v3` demo, `saaras:v4` scalable), `mode` (`transcribe`; v3 only), `language_code` (`bn-IN`, … or `unknown`) | `transcript`, `language_code`, `request_id` | REST is for audio < 30 s; longer audio uses the Batch API |
| TTS `POST https://api.sarvam.ai/text-to-speech` | JSON: `text` (≤ 2,500 chars for bulbul:v3), `language_code`, `speaker` (e.g. `ritu`, `shubh`), `model: "bulbul:v3"`, `pace`, `speech_sample_rate` | `audios[]`: base64 WAV | Starter tier 20 req/min [B-sponsors] |

Header for both: `api-subscription-key: $SARVAM_API_KEY`. Errors are 400/403/422/429/500/503, each with `error.message` and `error.code`.

**Number handling.** Read-back text is generated by our own template from `ledger_core` integers, for example "40.000 g" → "চল্লিশ গ্রাম". Sarvam's docs advise commas in numbers above four digits. A digit-by-digit fallback is also pre-recorded per language.

**Failure handling.**
- **TTS:** if there is no audio within 2.5 s, play the cached clip (seeded events) or stitch pre-recorded digit clips (`public/audio/{lang}/digits/*.wav`).
- **STT:** in the demo, use the pre-recorded transcript (`demo_clip_id`). In v1, mark the draft `needs_review` and let the user tap the fields.
- **Credit guard:** a global cap of 200 voice calls per hour, after which the system switches to `cached` and shows a banner.

**Data protection.** Audio goes to Sarvam only for transcription. It is kept by us for 90 days (E-09). Sarvam's own retention terms are not verified (2026-10-20) and must be checked before the pilot. Owner: AI/voice lead, by 15 Jan 2027.

## 4. UPI payments
**MVP (simulated).** API-14 builds the NPCI UPI deep-link format:
```
upi://pay?pa=<TOLA_UPI_VPA>&pn=<TOLA_UPI_PAYEE_NAME>&am=5040.00&cu=INR&tn=STL-0001&tr=STL-0001-01
```
It also renders an SVG QR (`qrcode` 8.2). The UI labels it **"Simulated: no money moves"**, and its status stays `simulated`. Opening it on a real phone would start a real UPI app, so the demo VPA is a team-controlled account and the amount is shown but never auto-submitted.

**v1 (PSP).** Razorpay, Cashfree or PhonePe PG, chosen in the pilot (owner: back-end lead, by 31 Jan 2027).
- Create an order/intent server-side with `PSP_KEY_ID` / `PSP_KEY_SECRET`. The jeweller (payer) completes it in their UPI app.
- The PSP calls API-20. We verify the provider's HMAC signature, dedup on the event id, and move `PaymentIntent.status` forward only.
- If no webhook arrives within 30 min, poll the PSP status API (FM-09).
- Tola **never holds funds**: PSP → karigar's bank. Payment-aggregator licensing therefore stays with the PSP (non-goal; see [COMPLIANCE](../06-security-compliance/COMPLIANCE.md)).

## 5. WhatsApp and IVR (v1, F-12)
**WhatsApp Cloud API.** Meta Business account → WhatsApp → phone number id (`WHATSAPP_PHONE_ID`) and a permanent token (`WHATSAPP_TOKEN`).
- **Outbound:** a template message (approved in the karigar's language) with the read-back text, the read-back audio, and two quick-reply buttons, `हाँ / হ্যাঁ` and `ना / না`.
- **Inbound:** API-19. Verify `X-Hub-Signature-256`, then map the button reply to a signature.

**How a WhatsApp/IVR "yes" becomes a signature.** A karigar without a smartphone cannot hold an Ed25519 key. For him:
1. He enrols in person: phone number + a 4-digit PIN, with a consent record (E-15) for `whatsapp_channel`.
2. Tola creates a **custodial key** in Cloud KMS (`person_keys.key_label = custodial`) that can be used only for him.
3. On an inbound "Haan" from his verified number, which quotes the event code (and the PIN on IVR), the worker signs `sign_msg` with that key. E-07 records `assurance_tier = channel_whatsapp_ivr` and `channel = whatsapp|ivr`.
4. The tier is shown to both parties and in the passport. Disputes can still be opened for 14 days.

**IVR.** Exotel or Sarvam Voice Agents (11 Indian languages + English; ₹3.50/min). The call plays the Bulbul read-back, then asks for DTMF 1 (yes) / 2 (no) after the PIN, and posts the result to API-19 (`X-Tola-Webhook-Signature`). Provider choice is owned by the back-end lead, by 31 Jan 2027.

**Failures.** For an unknown number or a wrong PIN: no signature, one retry message, then the shop is notified. If a template is rejected by Meta, fall back to SMS with a link (v1.1).

## 6. OTP login (v1, API-17)
An Indian SMS provider via `OTP_PROVIDER_KEY` (DLT-registered sender and template, required for Indian commercial SMS; not verified 2026-10-20). 6-digit code, 5-minute expiry, 5 attempts, 3 sends per 15 minutes per phone. Codes are stored hashed in `otp_challenges`.

## 7. GST drafts (F-09)
- **Challan:** Rule 55 delivery challan for gold sent to the job worker. It lists the description, weight (g, 3 decimals), purity and taxable value at the shop's declared rate.
- **Invoice:** the job worker's labour invoice at **5%** GST on labour; gold itself is not part of job-work labour [S24].
- **Format:** PDF via ReportLab, watermarked "DRAFT: verify with your CA". **No filing**: the CA files (non-goal). v1 adds CSV/Tally XML export (format to be validated with a practising CA; owner: field + pitch lead, by 15 Feb 2027).

## 8. Jewellery balance
Web Serial (Chromium desktop + Android Chrome), Web Bluetooth (v1) and display OCR (M-04). Full detail is in [HARDWARE.md](HARDWARE.md).

## 9. Account Aggregator / ULI (later)
The MVP lender view (P-04) is a mock labelled "Lender view is a mock for demonstration". v1 shares the passport by link only (E-14). A regulated pull through an AA/ULI partner as FIU is post-pilot and needs a partner (owner: product lead, by 30 Jun 2027). Tola computes **no score** (R-06).

## 10. Integration test matrix
| Adapter | Contract test | Recorded fixtures | Chaos test |
|---|---|---|---|
| Lyzr | Pydantic schema of the draft | `tests/fixtures/lyzr/*.json` | Timeout/5xx → template within 8.5 s |
| Sarvam | Response shape | `tests/fixtures/sarvam/*.json` + WAV | No audio within 2.5 s → cached |
| UPI | URI format regex + amount in rupees with 2 decimals | — | — |
| WhatsApp/PSP webhooks | Signature verification, dedup | Sample payloads | Replay → idempotent |
