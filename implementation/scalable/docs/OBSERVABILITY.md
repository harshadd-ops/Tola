# Observability
> Project: Tola · Owner: SRE / DevOps lead · Status: Draft v0.1 · Last updated: 2026-10-20
> Related: [Project Brief](../../../docs/00-overview/PROJECT_BRIEF.md) · [Infrastructure](INFRASTRUCTURE.md) · [Runbook](RUNBOOK.md) · [CI/CD](CICD.md) · [Cost](COST.md) · [AI docs](../../../docs/04-ai/) · [Security & compliance](../../../docs/06-security-compliance/)

**Scope.**
- **MVP (hackathon)** `implementation/demo`: the platform's own logs only (Vercel, Render) plus a client-side "AI mode" badge showing `live` or `cached`. There is no PII to redact, because all data is seeded.
- **v1 (production)** `implementation/scalable`: everything below.

## 1. Stack

| Signal | Library (in code) | Collector / backend | Retention |
|---|---|---|---|
| Logs | Python `structlog` (JSON to stdout); Next.js `pino` on server routes | Cloud Logging → bucket `certin-180d` (`asia-south1`, locked) | **400 days** (≥ 180 days CERT-In; ≥ 1 year for DPDP Rules logs, see §7) |
| Traces | OpenTelemetry SDK: `opentelemetry-instrumentation-fastapi`, `-sqlalchemy`, `-httpx`, `-redis`; `@vercel/otel` / OTel Node for Next.js | OTLP → `OTEL_EXPORTER_OTLP_ENDPOINT` (OTel Collector sidecar) → Cloud Trace | 30 days (Cloud Trace default; not verified 2026-10-20) |
| Metrics | OTel metrics + Cloud Run built-ins | Cloud Monitoring (Managed Prometheus-compatible) | 24 months for custom metrics |
| Errors | OTel exception events → Cloud Error Reporting | Error Reporting | 30 days |
| Client (PWA) | `web-vitals` + custom beacon `POST /v1/telemetry` (scalable-only, rate-limited, no PII) | BigQuery `asia-south1` via log sink | 90 days |
| LLM / agents | Lyzr run traces (Agent Studio) + Tola's own `agent_run` spans and table | Cloud Trace + Postgres `agent_run` + BigQuery | 400 days (metadata only; prompts and outputs per §4) |

Package versions are pinned in `services/api/pyproject.toml` (owner: Backend lead). Use the OTel versions current at scaffolding time; they are **not pinned in the brief**.

## 2. Structured logging with PII redaction

Every log line is JSON with these fields:

```json
{
  "ts": "2026-12-27T10:14:03.512Z", "severity": "INFO", "service": "tola-api", "version": "v1.3.0",
  "env": "prod", "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736", "span_id": "00f067aa0ba902b7",
  "request_id": "req_01JF...", "route": "POST /v1/events/{id}/signatures", "status": 201, "latency_ms": 84,
  "shop_id": "shp_7Q2…", "actor_id_hash": "pid:9f2c1a…", "event_id": "evt_01JF…", "event_type": "ISSUE",
  "msg": "signature_added", "party": "karigar"
}
```

**Redaction rules.** A `structlog` processor `redact_pii` runs before rendering, and a unit test fails CI if any fixture PII reaches stdout.

| Data | Rule |
|---|---|
| Phone numbers (E.164, 10-digit Indian mobiles) | Regex-masked to `+91******1234`; `actor_id_hash` = HMAC-SHA256(person_id, `LOG_PEPPER`) |
| Names, addresses, PM Vishwakarma ID, GSTIN, UPI VPA | Never logged. They are allow-listed out at the model level (Pydantic `Field(json_schema_extra={"pii": True})` → dropped) |
| OTP codes, JWTs, API keys, webhook signatures | Dropped by key name (`otp`, `token`, `authorization`, `x-api-key`, `*_secret`) and by regex for `Bearer …` |
| Voice transcripts (E-09) | Never logged. Stored only in Postgres with the voice note; logs carry `voice_note_id` and `confidence` |
| Gram values | **Allowed** (needed to debug reconciliation). They are not personal data on their own and are joined only via pseudonymous ids |
| Request/response bodies | Not logged by default. A per-route debug sampling (1 %) is available only in `dev` |
| Lyzr / Sarvam payloads | Prompt and response text are not logged; we log token counts, model, latency, cost, `agent_id` and `session_id` hash |

**Audit log** is separate from app logs: an append-only Postgres table `audit_log` mirrored to Cloud Logging with `logName=tola-audit`. It records:
- logins (OTP verify);
- Passport share create, view and revoke (E-14);
- settlement approvals (E-12);
- flag changes;
- admin data access;
- every DPDP data-principal request.

## 3. Tracing (OpenTelemetry)

- W3C `traceparent` propagates **PWA → API → Cloud Tasks (as a task header) → worker → Lyzr/Sarvam HTTP calls**. One karigar confirmation is therefore one trace, even across WhatsApp webhook → worker → TTS.
- **Sampling:** 100 % for errors and for slow requests (> 2 s, tail-based in the Collector); 10 % head sampling otherwise (1M scale: 2 %).
- **Custom spans:** `ledger.append`, `ledger.verify_chain`, `crypto.verify_ed25519`, `scale.ingest`, `reconcile.compute` (deterministic) vs `agent.reconcile.explain` (LLM), `voice.stt`, `voice.tts`, `upi.intent`, `psp.webhook`.
- **Span attributes** are pseudonymous ids only, never names or phones.

## 4. LLM and agent observability

Every call to Lyzr (M-03) or Sarvam (M-01, M-02) writes one `agent_run` row and one span:

| Field | Example | Use |
|---|---|---|
| `agent` | `IntakeAgent` / `ReconcileAgent` / `SettleAgent` / `Manager` / `sarvam.saaras` / `sarvam.bulbul` | Breakdown |
| `lyzr_agent_id`, `lyzr_session_id` | From `LYZR_AGENT_ID_*` | Jump to the Lyzr Studio trace |
| `provider_model` | `gpt-4o-mini` | Drift tracking |
| `tokens_in`, `tokens_out` | 1,850 / 320 | Token cost |
| `cost_inr` | Computed: Lyzr per-run fee (US$0.06 single / US$0.18 manager) × FX + tokens at provider rates; Sarvam ₹30/h STT, ₹30 per 10k chars TTS | Unit economics ([COST.md](COST.md)) |
| `latency_ms`, `ttfb_ms` | 2,340 | SLO |
| `fallback_used` | `none` / `cached` / `template` / `indicconformer` | R-07 health |
| `hitl_outcome` | `accepted` / `edited` / `rejected` by the human before signing | **Quality signal**: edit rate is the best live proxy for extraction accuracy |
| `faithfulness_ok` | `true`: every number in the agent text matches ledger-core output (checked in code before display) | Hard guardrail; `false` blocks display and falls back to the template |
| `stt_confidence`, `language` | 0.87, `bn-IN` | Low-confidence routing to a tap-confirm |
| `prompt_version` | `intake@2026-12-01.3` | Tie quality to the prompt in `ai/prompts/` |

Prompt and response **text** is stored for 30 days only in the `agent_io` table, encrypted, for debugging and eval mining, with the karigar's consent captured at onboarding. After 30 days only the metadata above remains.

**Dashboards** (Cloud Monitoring, defined as JSON in `infra/terraform/dashboards/`; owner: DevOps lead, by 15 Dec 2026):
1. **Golden signals:** RPS, p50/p95/p99 latency, 5xx ratio, saturation (instances, DB CPU and connections, Redis memory) per service.
2. **Ledger integrity:** events/min by type; signatures pending more than 24 h; `chain_verify_failures_total`; signature-mismatch rate; disputes opened per 100 events.
3. **AI:**
   - runs, cost (₹/day, ₹ per active karigar), p95 latency per agent;
   - fallback rate;
   - HITL edit/reject rate;
   - faithfulness failures;
   - STT confidence distribution per language.
4. **Channels:** WhatsApp sent/delivered/read/failed; IVR calls answered; OTP send success; PSP webhook lag.
5. **Business:** active karigars (signed ≥ 1 event in 30 days), weekly reconciliation completion %, settlements dual-approved.

## 5. SLOs and key metrics

| SLI | SLO (prod) | Error budget (30 d) |
|---|---|---|
| API availability (non-5xx on `/v1/*`, excluding 4xx) | 99.5 % | 3 h 36 min |
| API latency, non-AI routes | p95 < 400 ms, p99 < 1 s | — |
| Read-back ready (API-09) | p95 < 2.5 s live, < 300 ms cached | — |
| Voice intake (API-10, async) | p95 < 8 s from upload to draft | — |
| Weekly reconciliation (F-05) | 99 % of pairs reconciled by Saturday 23:59 IST | — |
| Offline sync (API-18) | 99.9 % of queued events accepted on first sync, or rejected with a reason | — |
| Ledger integrity | **0** chain-verify failures; **0** accepted events with an invalid signature | No budget: any occurrence is SEV-1 |

## 6. Alerts and thresholds

These route to the on-call email channel and to a phone or WhatsApp page via the paging integration (provider choice: owner DevOps lead, by 15 Jan 2027). Severity levels are defined in [RUNBOOK.md](RUNBOOK.md) §2.

| Alert | Condition | Sev | Playbook |
|---|---|---|---|
| API 5xx | 5xx ratio > 2 % for 5 min | SEV-2 (SEV-1 if > 10 %) | RUNBOOK §5.1 |
| API latency | p95 > 1.5 s for 10 min | SEV-3 | §5.1 |
| Uptime check fail | 2 of 3 regions fail for 2 min | SEV-1 | §5.1 |
| Error budget burn | 14.4× burn over 1 h **or** 6× over 6 h | SEV-2 | §5.1 |
| **Hash-chain verify failure** | `chain_verify_failures_total` increase > 0 (nightly job or on-read) | **SEV-1** | §5.4 |
| **Signature mismatch** | `signature_invalid_total` > 3 in 10 min (any shop), or > 0 for an already-accepted event | SEV-2 / **SEV-1** | §5.5 |
| Sarvam degraded | STT/TTS error rate > 10 % or p95 > 5 s for 5 min | SEV-3 (auto-fallback) | §5.2 |
| Lyzr degraded | Agent error rate > 10 % or p95 > 10 s for 5 min; or fallback rate > 30 % for 15 min | SEV-3 (auto-fallback) | §5.3 |
| Agent faithfulness | `faithfulness_ok=false` > 1 % of runs per hour | SEV-2 | §5.3 |
| AI spend spike | Daily AI ₹ > 150 % of the 7-day average, or > the daily cap in [COST.md](COST.md) | SEV-3 | §5.3 |
| AI unit-cost gate | Rolling 30-day AI ₹ per active karigar > ₹36 (warn) or > **₹40** (gate from [COST.md](COST.md) / AI_EVALS v1) | SEV-3 / SEV-2 | §5.3 |
| **PSP webhook loss** | No PSP webhook for 30 min while payment intents were created **or** > 5 intents `pending` > 20 min | SEV-2 | §5.6 |
| WhatsApp delivery | Failed > 5 % over 15 min, or webhook silent 15 min during 08:00–22:00 IST | SEV-3 | §5.7 |
| OTP | Send success < 95 % over 10 min | SEV-2 | §5.7 |
| Cloud Tasks backlog | `reconcile` queue oldest task > 30 min; `voice` > 5 min | SEV-3 | §5.9 |
| DB | CPU > 80 % for 15 min; connections > 85 %; disk > 85 %; replication lag > 60 s | SEV-2 | §5.9 |
| Redis | Memory > 85 %; evictions > 0 | SEV-3 | §5.9 |
| Security | > 50 failed OTP verifies per phone per hour; Cloud Armor blocks > 1,000/min; IAM policy change in prod outside Terraform SA | SEV-2 | §5.10 |
| Backups | Last successful Cloud SQL backup > 26 h ago; DR export missing | SEV-2 | §6 |
| Log sink | Log entries to `certin-180d` drop by > 90 % vs the same hour last week | SEV-2 (compliance) | §5.10 |

## 7. CERT-In and DPDP log retention

- **CERT-In Directions (No. 20(3)/2022-CERT-In, 28 Apr 2022)** require service providers to **"maintain logs of all their ICT systems … for a rolling period of 180 days" within Indian jurisdiction**, and to provide them to CERT-In on request. They also require **incident reporting within 6 hours** (see [RUNBOOK.md](RUNBOOK.md) §7) and **NTP sync** to NIC/NPL servers or traceable equivalents.
  - Logs go to bucket `certin-180d` in `asia-south1` with **400-day** retention; it is locked in prod, so even project owners cannot shorten it.
  - Covered: Cloud Run request and app logs, Cloud SQL logs, Cloud Audit Logs (admin activity, data access for Secret Manager, SQL and IAM), LB/Cloud Armor logs, Cloud NAT error logs, and the app audit log.
  - Cloud Run and GCE use Google's NTP. Google's traceability to Indian time sources is **not verified 2026-10-20** (owner: Compliance lead to confirm with Google or a counsel opinion, by 31 Jan 2027).
- **DPDP Rules 2025:** the requirement to retain logs of personal-data processing for at least one year is taken from the DPDP Rules as summarised in [docs/06-security-compliance](../../../docs/06-security-compliance/). The 400-day retention covers it. Re-confirm against the gazetted text (owner: Compliance lead).
- **Access:** only the `tola-sre` group (break-glass) can read the log bucket. Every read is itself audit-logged.
- **Export on request:** `gcloud logging read … --bucket=certin-180d --location=asia-south1 --format=json > certin-<incident>.json`, to an encrypted `exports` object with a 7-day signed URL.
