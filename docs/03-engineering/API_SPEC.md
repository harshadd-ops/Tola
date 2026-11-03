# API Specification
> Project: Tola · Owner: Back end + crypto lead · Status: Draft v0.1 · Last updated: 2026-10-20
> Related: [OpenAPI 3.1 contract](../../api/openapi.yaml) · [Project brief §7](../00-overview/PROJECT_BRIEF.md) · [Architecture](ARCHITECTURE.md) · [Data model](DATA_MODEL.md) · [Integrations](INTEGRATIONS.md) · [Security architecture](../06-security-compliance/SECURITY_ARCHITECTURE.md)

The machine-readable contract is [`api/openapi.yaml`](../../api/openapi.yaml). It validates with `openapi-spec-validator` (checked 2026-10-20). This page explains the conventions and gives worked examples. Where the two disagree, the YAML wins.

## 1. Conventions
| Topic | Rule |
|---|---|
| Style | REST + JSON, base path `/v1`. Port `8000`. |
| Versioning | URL major version (`/v1`). Additive changes only within v1. Event bodies carry their own `"v": 1` ([ARCHITECTURE §9](ARCHITECTURE.md#9-hash-chain-and-signature-specification)). |
| Tracks | Every operation has `x-tola-track`: `both`, `demo-only` (API-02) or `scalable-only` (API-17..API-23). The demo returns `404` for scalable-only paths, and the scalable build returns `404` for API-02. |
| Units | `*_mg` integer milligrams · `fineness_ppt` (‰) · `*_bps` basis points · `*_paise` integer paise. No floats on gold or money. |
| Rounding | Weight conversions **floor** (`fine_mg = floor(weight_mg × fineness_ppt / 1000)`), wastage `allowed_mg = floor(issued_mg × norm_bps / 10000)` on **gross** issued; money rounds half up. See [ADR-0006](adr/ADR-0006-integer-mg-deterministic-ledger-core.md). |
| Bytes | Hashes: lowercase hex (64 chars). Ed25519 keys and signatures: base64url without padding. |
| IDs | UUIDv7. Clients may generate `event_id` (offline). |
| Errors | RFC 9457 `application/problem+json` with a stable `code` (e.g. `FINE_MG_MISMATCH`, `WEIGHT_NOT_FROM_SCALE`, `BAD_SIGNATURE`, `CHAIN_BROKEN`, `OPEN_DISPUTE`). |
| Idempotency | `Idempotency-Key` header on POSTs; the key plus route is stored for 24 h; a replay with a different body returns `422 IDEMPOTENCY_REPLAY_MISMATCH`. |
| Pagination | Cursor based: `?cursor=&limit=` (max 200) → `next_cursor`. The ledger uses `sinceSeq`. |
| Auth (MVP) | **None.** `X-Tola-Persona: <person uuid>` picks the actor from the role switcher ([ADR-0008](adr/ADR-0008-no-login-demo-role-switcher.md)). The server still checks that the persona's role may do the action, so the story stays honest. |
| Auth (v1) | Phone OTP (API-17) → `Authorization: Bearer <JWT>` (15 min), refresh 30 d. Scopes come from the role: `shop:write` (owner, staff), `karigar:self`, `passport:share`. Postgres RLS is applied as well. |
| Time | UTC ISO-8601 with ms. The UI shows IST. |
| Language | `Accept-Language` picks the language of agent explanations. Voice endpoints take an explicit BCP-47 `lang`. |
| CORS | Demo: `https://*.vercel.app` + `http://localhost:3000`. v1: the app origin only. |
| Rate limits | See §4. Response headers: `RateLimit-Limit`, `RateLimit-Remaining`, `Retry-After` on 429. |

## 2. Endpoint catalogue
| ID | Method · Path | Auth scope (v1) | Track | Rate limit (per actor) |
|---|---|---|---|---|
| API-01 | `GET /v1/health` | public | both | 60/min/IP |
| API-02 | `GET /v1/demo/personas` · `POST /v1/demo/reset` | public | **demo-only** | 10/min |
| API-03 | `GET/POST /v1/shops/{shopId}/karigars` | `shop:read` / `shop:write` | both | 60/min |
| API-04 | `GET/POST /v1/orders` · `GET /v1/orders/{id}` | `shop:*`; karigar sees his own | both | 120/min |
| API-05 | `POST /v1/scale/readings` | `shop:write`, `karigar:self` | both | 120/min |
| API-06 | `POST /v1/events` | `shop:write`, `karigar:self` (RETURN, SCRAP_RETURN) | both | 60/min |
| API-07 | `POST /v1/events/{id}/signatures` | the signer only | both | 60/min |
| API-08 | `GET /v1/ledger` | a party to the pair | both | 60/min |
| API-09 | `POST /v1/voice/readback` | a party | both | 30/min |
| API-10 | `POST /v1/voice/intake` | a party | both | 10/min |
| API-11 | `POST /v1/reconciliation/runs` · `GET …/{id}` | `shop:write` (karigar can GET his flags) | both | 6/hour |
| API-12 | `POST /v1/disputes` · `…/{id}/messages` · `…/{id}/resolve` | a party | both | 30/min |
| API-13 | `POST /v1/settlements` · `…/{id}/approve` | draft: `shop:write`; approve: each party | both | 20/min |
| API-14 | `POST /v1/settlements/{id}/payment-intent` | `shop:write` | both (demo: simulated) | 20/min |
| API-15 | `POST /v1/passport/shares` · `GET /v1/passport/{token}` · `DELETE …/shares/{id}` | `passport:share` (karigar); GET is public by token | both | GET 30/min/IP |
| API-16 | `GET /v1/settlements/{id}/gst-draft` | `shop:read` | both | 20/min |
| API-17 | `POST /v1/auth/otp/request` · `…/verify` | public | **scalable-only** | 3 per 15 min per phone; 10/hour/IP |
| API-18 | `POST /v1/sync` | authenticated device | **scalable-only** | 30/min, ≤ 200 items |
| API-19 | `GET/POST /v1/webhooks/whatsapp` · `POST /v1/webhooks/ivr` | HMAC signature | **scalable-only** | 600/min |
| API-20 | `POST /v1/webhooks/psp` | provider signature | **scalable-only** | 600/min |
| API-21 | `GET /v1/me` | authenticated | **scalable-only** | 60/min |
| API-22 | `POST /v1/telemetry` | optional auth; PII-free | **scalable-only** | 30/min/IP, ≤ 100 events/batch |
| API-23 | `POST /v1/pairs/{pairId}/norms` · `POST /v1/norms/{id}/signatures` | a party | **scalable-only** (added by these engineering docs, not yet in the brief; the demo seeds signed norms) | 20/min |

## 3. Worked examples (canonical demo week)
The examples use the canonical numbers from the [brief §2](../00-overview/PROJECT_BRIEF.md): Order #14, plain 22K bangles, norm 2.50% of gross issued.

### API-01 Health
`GET /v1/health` → `200 {"status":"ok","version":"0.1.0","track":"demo","ai_fallback_mode":"live","db":"ok"}`

### API-02 Demo personas / reset (demo-only)
`GET /v1/demo/personas` →
```json
{"personas":[
  {"person_id":"…01","role":"jeweller_owner","display_name":"Suresh Shetty","persona_ref":"P-01","lang":"kn","public_key":"Xq…","demo_private_seed":"pV…"},
  {"person_id":"…02","role":"karigar","display_name":"Rafiq Sheikh","persona_ref":"P-02","lang":"bn","public_key":"b7…","demo_private_seed":"Qe…"},
  {"person_id":"…04","role":"lender_officer","display_name":"Branch credit officer","persona_ref":"P-04","lang":"en","public_key":"Lk…","demo_private_seed":"Zr…"}],
 "story":{"scenario":"story_week","step":0,"steps_total":9,"step_label":"Mon: issue 40 g for Order #14"}}
```
`POST /v1/demo/reset {"scenario":"story_week","step":0}` with header `X-Demo-Reset-Token: $DEMO_RESET_TOKEN` → `200` story state. Errors: `401 DEMO_RESET_TOKEN_INVALID`. Idempotent.

### API-03 Karigars
`POST /v1/shops/{shopId}/karigars`
```json
{"display_name":"Rafiq Sheikh","phone":"+919800000000","languages":["bn","hi"],"public_key":"b7…","labour_rate_paise_per_g":12000,
 "initial_norms":[{"order_type":"plain","norm_bps":250},{"order_type":"studded","norm_bps":2500},{"order_type":"antique","norm_bps":400}]}
```
→ `201` `KarigarSummary` with `pair.head_seq: 0` and `balance.held_fine_mg: 0`. Errors: `409 CONFLICT` (already linked), `422 VALIDATION`.

### API-04 Orders
`POST /v1/orders {"shop_id":"…a1","pair_id":"…p1","title":"Plain 22K bangles (pair)","order_type":"plain","target_fineness_ppt":916,"due_date":"2026-12-24"}`
→ `201 {"id":"…14","code":"ORD-0014","status":"open","late_risk":"none",…}`
`GET /v1/orders/{id}` → order plus events and `totals`:
```json
{"totals":{"issued_mg":40000,"returned_mg":38620,"loss_mg":1380,"allowed_mg":1000,"variance_mg":380,"issued_fine_mg":36640}}
```

### API-05 Scale reading
```json
{"shop_id":"…a1","weight_mg":40000,"source":"serial","device_id":"serial:VID_0403&PID_6001","stable":true,"raw_frame":"ST,GS,+  40.000 g"}
```
→ `201 {"id":"…r1","weight_display":"40.000 g",…}`. `source:"manual_dual"` requires `second_entry_mg == weight_mg` and `second_person_id`. Errors: `422 READING_NOT_STABLE`, `422 VALIDATION`.

### API-06 Create event
```json
{"pair_id":"…p1","type":"ISSUE","order_id":"…14","reading_ids":["…r1"],"fineness_ppt":916}
```
→ `201`
```json
{"id":"…e1","seq":1,"type":"ISSUE","status":"pending_signatures",
 "body":{"v":1,"event_id":"…e1","pair_id":"…p1","type":"ISSUE","order_id":"…14","weight_mg":40000,"fineness_ppt":916,"fine_mg":36640,"reading_ids":["…r1"],"norm_id":"…n1","refs":[],"note":null,"created_by":"…03","created_at":"2026-12-21T05:12:09.120Z"},
 "body_hash":"3f…","prev_hash":"0000…0000","hash":"9c…","witness_sig":"Mz…","signing_message":"dG9sYTp2MTpib2R5Oi…","signatures":[]}
```
Errors: `422 WEIGHT_NOT_FROM_SCALE` (an ISSUE/RETURN without `reading_ids`), `422 FINE_MG_MISMATCH`, `422 NORM_MISSING`, `409 CONFLICT` (`event_id` reused with a different body).

### API-07 Sign
```json
{"role":"karigar","signer_id":"…02","key_id":"…k2","alg":"ed25519","public_key":"b7…","sig":"kQ…","readback_sha256":"5d…","assurance_tier":"device_key","decision":"approve","channel":"app","signed_at":"2026-12-21T05:12:31.004Z"}
```
→ `201` event (`status` becomes `committed` once both roles have approved). `alg` is `ed25519` (default) or `es256` (passkey, v1.1, with `authenticator_data` and `client_data_json`); both are verified. `readback_sha256` is the hash of the audio the signer heard and is part of the signed message. `assurance_tier` is `device_key`, `channel_whatsapp_ivr` or `witnessed_in_person`. If both approvals come from one device, the event carries the warning `SIGNED_ON_ONE_DEVICE` (expected in the single-laptop demo). Errors: `400 BAD_SIGNATURE`, `400 UNKNOWN_KEY`, `400 UNSUPPORTED_ALG`, `403 FORBIDDEN` (persona is not a party, or role mismatch), `409 ALREADY_SIGNED`. `decision:"reject"` keeps the event pending and the client then opens a dispute (API-12).

### API-08 Ledger
`GET /v1/ledger?karigarId=…02&shopId=…a1` →
```json
{"pairs":[{"pair":{"id":"…p1","head_seq":7,"head_hash":"ab…"},
  "chain":{"ok":true,"length":7,"head_hash":"ab…","problems":[]},
  "balance":{"held_fine_mg":229,"open_orders":0,"pending_events":0,"open_flags":0},
  "events":[…]}],"server_public_key":"Sv…"}
```
The final 229 mg fine is the canonical outcome (250 mg gross remains after the 130 mg agreed adjustment). Errors: `400 VALIDATION` if neither filter is given.

### API-09 Read-back
`{"subject_type":"event","subject_id":"…e1","lang":"bn-IN","speaker":"ritu","pace":0.9}` →
```json
{"text":"অর্ডার চোদ্দ। চল্লিশ গ্রাম সোনা, বাইশ ক্যারেট, আপনাকে দেওয়া হলো। ঠিক থাকলে হ্যাঁ বলুন।","lang":"bn-IN","audio_url":"/media/tts/7f…wav","source":"live","model":"bulbul:v3","duration_ms":5200}
```
The text is built from a template filled with `ledger_core` values. The LLM never writes read-back numbers. If TTS fails, `source` is `cached` or `template`. Errors: `404 NOT_FOUND`.

### API-10 Voice intake
`multipart/form-data`: `audio=@note.wav`, `lang=bn-IN`, `pair_id=…p1`, `reading_ids=…r2,…r3` →
```json
{"voice_note":{"id":"…v1","transcript":"অর্ডার চোদ্দ বালা রেডি, আধা গ্রাম স্ক্র্যাপ","source":"live","model_ids":{"stt":"saaras:v3","llm":"lyzr:intake"}},
 "drafts":[
  {"type":"RETURN","order_code":"ORD-0014","reading_id":"…r2","weight_mg":38120,"spoken_weight_mg":null,"mismatch":false,"field_confidence":{"order":0.94}},
  {"type":"SCRAP_RETURN","order_code":"ORD-0014","reading_id":"…r3","weight_mg":500,"spoken_weight_mg":500,"mismatch":false,"field_confidence":{"order":0.94,"weight":0.88}}],
 "needs_review":false,"agent_trace_id":"lyzr-…"}
```
Real-time clips are limited to **30 s**. Demo: longer audio → `413 AUDIO_TOO_LONG`. Scalable: longer audio → `202` with `status:"queued_batch"` (Sarvam batch). M-01 is `saaras:v3` in the demo and `saaras:v4` in scalable. Each AI step writes an E-19 `AiTrace` (`ai_trace_ids`). Errors: `413 PAYLOAD_TOO_LARGE` (> 2 MB), `422 VALIDATION`. If AI is down, the drafts come from the cached transcript (demo) or are left empty with `needs_review:true`.

### API-11 Reconciliation
`POST /v1/reconciliation/runs {"shop_id":"…a1","period_from":"2026-12-21","period_to":"2026-12-27"}` → `201` (demo) / `202` (v1)
```json
{"id":"…run1","status":"done","chains_verified":3,"pairs_count":3,
 "flags":[{"order_id":"…14","issued_mg":40000,"returned_mg":38620,"loss_mg":1380,"allowed_mg":1000,"variance_mg":380,"variance_fine_mg":348,
   "variance_value_paise":518800,"severity":"critical","code":"OVER_NORM","warnings":["SIGNED_ON_ONE_DEVICE"],"status":"open",
   "explanation":{"source":"live","text":{"en":"Order #14 lost 1.380 g against 1.000 g allowed (2.50% of 40 g), 0.380 g over the agreed norm.","bn":"…"}}}]}
```
Flag codes: `OVER_NORM`, `OPEN_BALANCE`, `DUPLICATE`, `UNSIGNED`, `UNUSUAL_FOR_KARIGAR`; warning `SIGNED_ON_ONE_DEVICE`. The run also writes a daily E-17 `Checkpoint` per pair. Errors: `409 CHAIN_BROKEN` (run status `chain_broken`, no flags issued).

### API-12 Disputes
- Open: `POST /v1/disputes {"pair_id":"…p1","flag_id":"…f1","message":{"kind":"voice","voice_note_id":"…v2"}}` → `201 {"status":"open","open_event_id":"…e6",…}`
- Message: `POST /v1/disputes/{id}/messages {"kind":"text","text":"Dust from this week is still in the sweep; will bring Monday."}` → `201`
- Resolve: `POST /v1/disputes/{id}/resolve {"kind":"ADJUSTMENT","weight_mg":-130,"fineness_ppt":916,"note":"Agreed: 130 mg written off as extra filing loss"}` → `201 {"status":"proposed_resolution","resolve_event_id":"…e7","adjustment_event_id":"…e8"}`. Both parties then sign `…e7` and `…e8` through API-07. The dispute becomes `resolved` once `…e7` is committed.
Errors: `409 CONFLICT` (dispute already resolved), `422 VALIDATION` (neither a flag nor events given), `422 DISPUTE_WINDOW_CLOSED` (more than **14 days** after the event was committed).

### API-13 Settlement
`POST /v1/settlements {"pair_id":"…p1","period_from":"2026-12-21","period_to":"2026-12-27"}` →
```json
{"id":"…s1","code":"STL-0001","status":"awaiting_karigar","gold_balance_fine_mg":229,"labour_paise":480000,"gst_labour_bps":500,"gst_paise":24000,
 "deductions_paise":0,"net_payable_paise":504000,"chain_head_seq":8,"chain_head_hash":"ab…","body_hash":"c4…","signing_message":"dG9sYTp2MTpib2R5Oi…",
 "narrative":{"source":"live","text":{"en":"Labour ₹4,800 plus 5% GST ₹240. Payable ₹5,040. 0.229 g fine gold stays with Rafiq for next week.","bn":"…"}},"signatures":[]}
```
`POST /v1/settlements/{id}/approve` with a `SignatureInput` → `200`. After the second approval the status is `approved` and a `SETTLEMENT` event is appended. Errors: `409 OPEN_DISPUTE`, `409 PENDING_EVENTS`, `400 BAD_SIGNATURE`, `403 DEVICE_COOLING_OFF` (key registered less than **72 h** ago).

### API-14 Payment intent
`POST /v1/settlements/{id}/payment-intent` →
```json
{"amount_paise":504000,"tr_ref":"STL-0001-01","provider":"simulated","status":"simulated","simulated":true,
 "upi_uri":"upi://pay?pa=tola-demo@upi&pn=Tola%20Demo&am=5040.00&cu=INR&tn=STL-0001&tr=STL-0001-01","qr_svg":"<svg…>"}
```
Errors: `409 NOT_APPROVED`.

### API-15 Work Passport
- Create (karigar persona): `{"scope":"summary","recipient_label":"Co-op bank, Chickpet branch","purpose":"working_capital_loan","expires_in_days":7,"consent":{"notice_version":"notice-bn-v1","lang":"bn","accepted":true}}` → `201 {"id":"…ps1","token":"q3J…22chars","url":"https://…/p/q3J…","expires_at":"…"}`
- View: `GET /v1/passport/q3J…` → `200` `PassportView` (`grams_handled_fine_mg`, `on_time_bps`, `variance_vs_norm_bps`, `chain_head_hashes`, `server_sig`, `disclaimer`, and `demo_label` in the demo).
- Revoke: `DELETE /v1/passport/shares/{id}` → `204`. A later view returns `410 SHARE_REVOKED`.

### API-16 GST draft
`GET /v1/settlements/{id}/gst-draft?kind=both` → `application/pdf` with two pages: the Rule 55 delivery challan for the gold sent for job work, and the labour invoice at 5% GST [S24]. Every page is watermarked **"DRAFT: verify with your CA"**. Errors: `409 NO_GSTIN`.

### API-17..API-23 (scalable-only)
- **API-17:** `POST /v1/auth/otp/request {"phone":"+919800000000","lang":"bn"}` → `202 {"challenge_id":"…","expires_in_s":300}`; `POST /v1/auth/otp/verify {"challenge_id":"…","code":"482913","device_public_key":"…"}` → `200 AuthTokens`. Errors: `401`, `429`.
- **API-18:** `POST /v1/sync {"device_id":"…","items":[{"kind":"event","body":{…},"signatures":[…]}],"last_known_heads":{"…p1":7}}` → `200 {"results":[{"event_id":"…","status":"appended","seq":8,"hash":"…","warnings":[]}],"server_events":[…]}`
- **API-19:** Meta webhook (`X-Hub-Signature-256`, HMAC-SHA256 of the raw body with the app secret) and IVR webhook (`X-Tola-Webhook-Signature`). Both are acknowledged within 2 s, and the work is queued.
- **API-20:** PSP webhook. The provider signature is verified, then the status is mapped to `PaymentIntent.status`. Idempotent on the provider event id.
- **API-21:** `GET /v1/me` → `200 {"person":{…},"roles":["karigar"],"pair_ids":["…p1"],"feature_flags":{"whatsapp_channel":true,"passkeys":false}}`.
- **API-22:** `POST /v1/telemetry {"session_hash":"9f2c…","events":[{"name":"readback_latency","ts":"…","value_ms":1840,"lang":"bn","device_class":"low","net":"3g"}]}` → `202`. The schema is closed (`additionalProperties: false`): no ids, names, phones, weights or free text. Also accepts `text/plain` for `navigator.sendBeacon`.
- **API-23:** `POST /v1/pairs/{pairId}/norms {"order_type":"plain","norm_bps":250,"effective_from":"2027-01-01"}` → `201` (status `proposed`), then each party calls `POST /v1/norms/{id}/signatures`; the norm becomes `active` when both have signed.

## 4. Rate limiting and quotas
- MVP: an in-memory token bucket per persona (slowapi-style middleware). This mostly guards the Sarvam/Lyzr credits: voice endpoints have a global cap of 200 calls/hour, after which they switch to `cached` with a banner.
- v1: Redis token bucket per subject and IP, plus Cloud Armor rules (≥ 1,000 req/min/IP → block for 10 min).

## 5. Webhooks (v1)
| Webhook | Verification | Retries expected from sender | Our handling |
|---|---|---|---|
| WhatsApp (API-19) | `X-Hub-Signature-256` (HMAC SHA-256 with the app secret) | Yes (Meta retries; policy not verified 2026-10-20) | Dedup on message id; map button `HAAN`/`NA` to a custodial-key signature ([INTEGRATIONS §5](INTEGRATIONS.md)) |
| IVR (API-19) | `X-Tola-Webhook-Signature` = HMAC SHA-256 (shared secret `IVR_PROVIDER_KEY`) over the raw body | Provider-specific | DTMF 1 = approve, 2 = reject; PIN before confirm |
| PSP (API-20) | Provider signature (e.g. Razorpay HMAC SHA-256 with the webhook secret) | Yes | Dedup on the provider event id; status changes go only forward |

## 6. Contract testing
- Demo CI: pytest against FastAPI's generated schema, diffed with `api/openapi.yaml` (operations tagged `scalable-only` are excluded).
- Scalable CI: Schemathesis runs property-based tests against all `both` and `scalable-only` operations, and the TS client types are generated with `openapi-typescript` (version pinned in the scalable `package.json`).
