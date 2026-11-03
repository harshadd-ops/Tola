# Performance · Scalable track
> Project: Tola · Owner: Tech lead + platform engineer · Status: Draft v0.1 · Last updated: 2026-10-20
> Related: [README](../README.md) · [PRD §7 NFRs](../../../docs/01-product/PRD.md) · [Frontend §9](FRONTEND.md#9-performance-budget-68k-android-2-gb-ram-on-3g) · [Backend](BACKEND.md) · [Testing §6](TESTING.md#6-load-tests-k6) · [Observability](OBSERVABILITY.md) · [Cost](COST.md)

The numbers here **implement** the PRD's v1 non-functional requirements. Where this doc is stricter than the PRD, the PRD value is the release gate and ours is the internal target.

- **MVP (hackathon)** targets for the stage demo are different: "Run week" ≤ 1 s over about 60 events, read-back ≤ 300 ms cached, and chain verify of 500 events ≤ 500 ms. They live in the PRD and `implementation/demo`.
- **Why integrity comes first.** At about ₹1.49 lakh per 10 g [S47], **1 g of error costs about ₹15,000**. We never trade integrity for latency: signature and chain checks are always on the hot path. They are fast enough (§6) not to need skipping.

---

## 1. SLOs and SLIs (v1 production)
Measurement:
- server-side latency comes from OpenTelemetry spans at the API ingress (Cloud Run request latency as a cross-check);
- client latency comes from the PWA's own timing marks, kept local and sampled in the `diag` table only with consent.

The window is 28 rolling days.

| SLI | SLO (internal target) | PRD release gate |
|---|---|---|
| API availability (non-5xx share of valid requests, excluding 429) | **99.5%** → error budget ≈ 3 h 21 min / 28 days | 99.5% monthly |
| Read endpoints p95 (API-03, 04, 08, 15 view) | ≤ 250 ms | ≤ 400 ms |
| Single event write p95 (API-06, API-07: verify + chain lock + insert) | ≤ 300 ms | ≤ 400 ms |
| `POST /v1/sync` with 50 events, p95 | ≤ 1.5 s (p99 ≤ 3 s) | — |
| Sync freshness: share of queued events accepted within 60 s of the device regaining ≥ 3G | ≥ 99% | — |
| TTS read-back (API-09) p95: live / cached | ≤ 2.5 s / ≤ 200 ms | TTS p95 ≤ 2.5 s |
| Voice intake (API-10 → draft fields) p95 | ≤ 6 s | — |
| Weekly reconciliation | 1,000 karigars ≤ 10 min; 15,000 karigars (year 1) ≤ 60 min, staggered by shop schedule | 1,000 karigars ≤ 10 min |
| Inbound webhook ack (API-19, API-20) p95 | ≤ 500 ms (work is deferred to the outbox) | — |
| Notification delivered after its trigger, p95 | ≤ 5 min | — |
| Nightly full-chain verification | completes by 05:00 IST; 0 mismatches | integrity: nightly verify with alerting |
| Data durability | RPO ≤ 5 min (Cloud SQL PITR), RTO ≤ 4 h | no data loss on a region outage |

**Error-budget policy.**
- If more than 50% of the budget is burnt in 7 days, feature merges to `scalable` pause. Only reliability work merges until the burn rate is back below 1×.
- Burn-rate alerts (1 h at 14.4× and 6 h at 6×) page the on-call engineer ([RUNBOOK](RUNBOOK.md)).

## 2. Low-end device budget (₹6–8k Android)
**Reference device.** An Android Go / entry Android at about ₹7k with 2 GB RAM, an eMMC storage class, a 4× Cortex-A53-class CPU and Chrome stable.
- The lab device is bought by the front-end lead by 2027-01-31; target spend ≤ ₹8,000 (HUNCH).
- Until then, use Chrome DevTools at 6× CPU throttle on a laptop.

| Budget | Target | Gate |
|---|---|---|
| JS gzipped on karigar routes | ≤ 170 KB (internal) | **≤ 250 KB** (PRD) |
| Main-thread long tasks during confirm flow | none > 200 ms | Lighthouse TBT ≤ 600 ms at mobile throttling |
| Ed25519 sign (noble, JS) | ≤ 20 ms per signature | — |
| SHA-256 of canonical body (WebCrypto) | ≤ 2 ms | — |
| PBKDF2 PIN unlock | ≈ 1 s (calibrated, ≥ 310k iterations) | ≤ 1.5 s |
| Verify a 500-event chain on device (karigar's own audit) | ≤ 1.5 s, in a Web Worker | — |
| IndexedDB write of one event | ≤ 30 ms p95 | — |
| Storage used after 6 months of typical use | ≤ 40 MB (events ≈ 2 KB each; media evicted after upload) | ≤ 50 MB media cap |
| Memory (JS heap) | ≤ 60 MB karigar, ≤ 90 MB shop | Chrome kills tabs early on 2 GB devices |
| Battery | No polling while hidden; sync uses the Background Sync API; no wake locks | — |

Detailed page metrics (LCP, INP, CLS, fonts) are in [FRONTEND.md §9](FRONTEND.md#9-performance-budget-68k-android-2-gb-ram-on-3g).

## 3. Network targets (2G/3G)
These profiles are defined by us so that tests are repeatable. They are applied with Playwright/CDP `Network.emulateNetworkConditions` and in Lighthouse CI.

| Profile | Down / Up | RTT | Loss |
|---|---|---|---|
| `tola-4g-poor` | 4 Mbps / 1 Mbps | 150 ms | 0% |
| `tola-3g` | 750 kbps / 250 kbps | 300 ms | 1% |
| `tola-2g` (EDGE-like) | 240 kbps / 100 kbps | 800 ms | 2% |
| `offline` | 0 | — | — |

| Action | 3G target | 2G target | How |
|---|---|---|---|
| First visit to the karigar home, uncached | LCP ≤ 4.0 s | LCP ≤ 9 s; usable shell ≤ 6 s | ≤ 170 KB JS; one Indic font; RSC |
| Repeat visit (SW warm) | ≤ 1.5 s | ≤ 1.5 s (no network needed) | Precache |
| OTP request → SMS sent (server part) | ≤ 2 s | ≤ 4 s | Request ≤ 1 KB |
| Confirm an event ("haan") | ≤ 150 ms local; synced ≤ 3 s | ≤ 150 ms local; synced ≤ 10 s | Local-first |
| Sync 50 queued events | ≤ 6 s | ≤ 20 s | ≈ 1.2 KB per event JSON; gzip/br → about 30 KB per batch |
| Read-back audio (uncached) | first audio ≤ 3 s | ≤ 6 s, or the on-device digit clips (≤ 300 ms) | Opus 24 kbps; on-device fallback |
| Voice note upload, 20 s | ≤ 3 s | ≤ 8 s | Opus 16 kbps ≈ 40 KB |
| Scale photo upload | ≤ 5 s (≤ 150 KB AVIF/WebP, 1280 px) | **Deferred** until ≥ 3G unless the user forces it | The event syncs without waiting for its photo; the photo hash is in the signed body |
| WhatsApp / IVR confirm (feature phone) | not data-dependent | not data-dependent | F-12 |

**Payload rules.**
- Gzip or Brotli on every JSON response.
- No response over 100 KB without pagination. Ledger pages are 100 events with cursor pagination.
- `ETag` on ledger reads, so a `304` costs ≈ 300 bytes.

## 4. Capacity model (v1 planning)
These are assumptions (HUNCH), to be re-checked with pilot telemetry by 2027-03-31; owner: tech lead.

| Input | Pilot | v1 target |
|---|---|---|
| Shops (pilot → year 1, per [ARCHITECTURE §8](../../../docs/03-engineering/ARCHITECTURE.md#8-scalability-approach-v1)) | 50 | 2,000 |
| Karigars | 400 | 15,000 |
| Events per karigar per working day (issue + return + scrap/dust) | 3 | 3 |
| Wedding-season multiplier | ×3 | ×3 |
| Events per day (peak season) | 3,600 | **135,000** |
| Busy window | 10:00–20:00 IST | 10:00–20:00 IST |
| Average events/s (peak season) | 0.1 | ≈ 3.8 |
| Peak-hour events/s (×3 of average) | 0.3 | **≈ 11** |
| Read requests/s at peak (≈ 10 × writes: dashboards, ledgers) | 3 | **≈ 110** |
| Load-test headroom (×3 of year-1 peak) | — | 35 writes/s, 330 reads/s |
| Ledger growth (≈ 1.5 KB per event incl. signatures + witness; normal season ≈ 45k/day) | ≈ 0.6 GB/yr | ≈ 25 GB/yr |
| Media to GCS (≈ 1 photo per 2 events at 150 KB; voice ≈ 40 KB per note) | ≈ 0.1 GB/day | ≈ 3.4 GB/day normal, ≈ 10 GB/day peak → Nearline after 30 days |

**What this means.**
- Year-1 peak is about 11 writes/s and 110 reads/s, and we test at 3× that. This is **small** for Postgres.
- The real risks are elsewhere:
  - **hot rows**: the chain-head lock per shop–karigar pair is fine, since contention is per pair;
  - **sync storms** when a market's network comes back: thousands of devices reconnect within 2 minutes;
  - **weekly-run fan-out** to Lyzr.
- The load plan below targets those risks.

## 5. Load test plan
k6 scripts live in `tests/load/`. The environment is a dedicated GCP `perf` project that mirrors the prod tiers, with external providers stubbed. Run weekly and before every `scalable-v*` tag.

| Scenario | Shape | Pass thresholds |
|---|---|---|
| `steady-day` | 300 req/s mixed (80% reads, 15% event write, 5% sync) for 30 min | p95 reads ≤ 250 ms, writes ≤ 300 ms; errors < 0.1% |
| `sync-peak` (wedding season) | Ramp to 40 sync batches/s (≈ 2,000 events/s burst) for 20 min | sync p95 ≤ 1.5 s, p99 ≤ 3 s; 0 `rejected`; 0 lost events (count check after the run) |
| `reconnect-storm` | 5,000 virtual devices each send a 50-event batch within 120 s (≈ 250k events) | No 5xx; 429 with `Retry-After` allowed; full drain ≤ 10 min; DB CPU ≤ 80% |
| `weekly-run` | 15,000 karigars across 2,000 shops fired at once (worst case, no stagger); Lyzr stub at 3 s latency, 10% of karigars flagged | Completes ≤ 60 min; API p95 unaffected (≤ +20%) while it runs |
| `soak` | `steady-day` at 50% load for 8 h | No memory growth > 10% per instance; no connection-pool exhaustion |
| `same-pair-race` | 2 devices × 1,000 pairs submitting offline-signed items to the same pair concurrently | Every item appended exactly once; `seq` gap-free per pair; chain verifies; 0 deadlocks; duplicate weighings flagged `POSSIBLE_DOUBLE_COUNT` |

**Starting tiers under test.** These are assumptions to validate; ₹ costs are in [COST](COST.md).
- Cloud SQL Postgres 16: 2 vCPU / 8 GB with HA.
- API on Cloud Run: 2 vCPU / 1 GiB, concurrency 40, min 1 / max 40 (ARCHITECTURE §7.2).
- Worker: min 0 / max 10.
- Memorystore Redis 7: 1 GB.
- Connection pool: SQLAlchemy `pool_size=10, max_overflow=5` per instance, with total connections capped below the Cloud SQL limit.

## 6. Hot-path budgets (server)
| Step in `POST /v1/events` / `sync` per event | Budget |
|---|---|
| Pydantic strict parse + canonicalise | ≤ 1 ms |
| SHA-256 recompute | ≤ 0.1 ms |
| Ed25519 verify ×2 (PyNaCl / libsodium) | ≤ 0.5 ms |
| `SELECT … FOR UPDATE` on the pair head + witness sign + inserts + `outbox_jobs`, in one transaction | ≤ 8 ms |
| Authz + RLS session settings | ≤ 2 ms |
| **Per-event server time** | **≤ 15 ms**, so 50 events ≈ 750 ms, within the 1.5 s SLO |

## 7. Caching and cost-performance trade-offs
| Decision | Performance effect | Cost effect (HUNCH, ₹/month at v1) |
|---|---|---|
| API `min-instances=1` | No cold start for the first request of the day (Python cold start ≈ 2–4 s, not verified) | ≈ ₹1,500–3,000 for one always-on instance |
| TTS phrase cache (Redis index + GCS) | Cached read-back ≤ 200 ms; most read-backs repeat the same templates with different numbers | Cuts Sarvam TTS calls by an estimated 60–80% |
| On-device digit clips for read-back | Read-back works at 0 bars | ≈ 400 KB per language of precache; ₹0 per call |
| Lyzr explanation **only for flagged** karigars | Weekly run time is dominated by flags, not by the karigar count | LLM spend scales with the about 10% flagged, not with 100% |
| Read replica | Not in v1; peak reads (300/s) fit on the primary | Saves about one Cloud SQL instance; revisit at 70% CPU sustained |
| Photos deferred on 2G | Events sync fast on bad networks | Fewer retried uploads |
| Brotli + ETag on ledger reads | Repeat reads ≈ 300 B on 2G | Lower egress |

## 8. Monitoring the budgets
Each budget has a home and an alert:
- **Dashboards** ([OBSERVABILITY](OBSERVABILITY.md)): p50/p95/p99 per route, sync result mix (`appended`/`duplicate`/`rejected`, plus warning counts), queue depth per RQ queue, outbox lag, weekly-run duration, Lyzr and Sarvam latency and cost per call.
- **Alerts:**
  - outbox lag > 60 s for 5 min;
  - RQ `high` queue depth > 500;
  - `rejected` sync result rate > 0.1% (possible tampering or client bug);
  - nightly verify not finished by 05:00 IST.
- **Field telemetry** from devices is kept local by default. A karigar's phone sends nothing beyond API calls (privacy first). Field LCP/INP come from opt-in shop-staff devices only.
