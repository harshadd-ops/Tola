# ADR-0003: FastAPI modular monolith for the back end
> Project: Tola · Owner: Back end + crypto lead · Status: Accepted · Last updated: 2026-10-20
> Related: [Architecture §4](../ARCHITECTURE.md) · [Tech stack](../TECH_STACK.md) · [API spec](../API_SPEC.md)

## Context and problem statement
The back end has to append to hash chains, verify Ed25519 signatures, run integer reconciliation, call Lyzr and Sarvam (Python SDKs `lyzr-adk`, `sarvamai`), render PDFs and serve an OpenAPI 3.1 contract. What framework and shape?

## Decision drivers
- The sponsor SDKs and the AI/voice team work in Python.
- A typed contract generated from code (Pydantic) to keep `api/openapi.yaml` honest.
- One deployable for the demo; a clean path to workers in v1.

## Considered options
1. **FastAPI 0.153 + Pydantic 2.14 + Uvicorn 0.54 (Python 3.12+), modular monolith.**
2. Node (NestJS / Next.js route handlers) with a Python sidecar for AI.
3. Django + DRF.
4. Microservices from day one.

## Decision outcome
Chosen option: **1**. The modules are routers per API group, pure `ledger_core`, service adapters (Lyzr, Sarvam, PSP, PDF) and SQLAlchemy 2.1 repositories. In v1 the same image runs as `api` and `worker` (RQ 2.12 / Cloud Tasks), built from `implementation/scalable/infra/docker/{api,worker}.Dockerfile`.

### Consequences
- Good: one language for crypto (PyNaCl 1.6), AI and the API; async I/O for AI calls; OpenAPI out of the box.
- Bad: Python CPU throughput is lower than Go's. That is acceptable: hashing and verification are microseconds, and reconcile is pure integer maths.
- Neutral: the modular monolith must enforce boundaries in review (`ledger_core` has no imports from FastAPI, SQLAlchemy or the AI SDKs).

### Confirmation
p95 < 300 ms for API-06/07 under k6 at 50 req/s on 1 Cloud Run instance (2 vCPU). An import-linter rule protects `ledger_core`. Review at the v1 pilot (Feb 2027).
