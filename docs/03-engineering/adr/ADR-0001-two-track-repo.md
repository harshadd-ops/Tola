# ADR-0001: Two-track repository (demo vs scalable) with shared docs and one API contract
> Project: Tola · Owner: Tech lead · Status: Accepted · Last updated: 2026-10-20
> Related: [Architecture](../ARCHITECTURE.md) · [Project brief §16](../../00-overview/PROJECT_BRIEF.md) · [OpenAPI](../../../api/openapi.yaml) · [ADR-0008](ADR-0008-no-login-demo-role-switcher.md)

## Context and problem statement
The finale (27 Dec 2026, Bangalore Palace) rewards a working, stunning 3-minute demo. Judges also score architecture, scalability and business potential. One codebase that serves both a flawless stage story and a production design (OTP, offline sync, WhatsApp, GCP) would slow the demo down and blur the production design. How do we serve both without forking the product's meaning?

## Decision drivers
- The stage demo must not fail. It needs no login, seeded data and offline fallbacks.
- Production needs auth, Postgres, offline-first, channels and observability.
- The product rules (hash chain, signatures, integer arithmetic, IDs) must be identical in both.
- A 4-person team with about 3 weeks of prototype time (23 Nov – 15 Dec 2026).

## Considered options
1. A single app with feature flags.
2. **Two implementations (`implementation/demo`, `implementation/scalable`) sharing `docs/` and `api/openapi.yaml`.**
3. A demo only, with production described in slides.

## Decision outcome
Chosen option: **2**. `docs/` is common, and `api/openapi.yaml` is the single contract. Operations carry `x-tola-track: both | demo-only | scalable-only`. Both tracks must pass the same golden chain vectors (`tests/vectors/chain_v1.json`). The scalable track grows `packages/ledger-core` (`implementation/scalable/packages/ledger-core`), and the demo embeds the same algorithm as `services/api/app/ledger_core`.

### Track impact
| | MVP (demo) | v1 (scalable) |
|---|---|---|
| Code | Next.js + FastAPI + SQLite, inline jobs | Same stack + Postgres, Redis/RQ, workers, Terraform |
| Contract | Implements `both` + `demo-only` | Implements `both` + `scalable-only` |
| CI | `demo-ci.yml` (path filter `implementation/demo/**`) | `scalable-ci.yml`, `scalable-deploy.yml`, `evals.yml` |

### Consequences
- Good: the demo can be polished without production drag; the scalable design stays honest.
- Bad: duplicated ledger-core logic until the demo imports the package; the risk of drift.
- Mitigation: shared golden vectors, an OpenAPI diff check in both CIs, and one owner (the back-end lead) for `ledger_core` in both.

### Confirmation
CI fails if either implementation fails `chain_v1.json`, or if a generated OpenAPI differs from `api/openapi.yaml` for its track. Review on 16 Dec 2026, after the prototype round.
