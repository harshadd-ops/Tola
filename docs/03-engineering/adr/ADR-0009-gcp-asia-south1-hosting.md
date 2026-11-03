# ADR-0009: GCP asia-south1 (Mumbai) for the scalable track
> Project: Tola · Owner: Tech lead · Status: Accepted · Last updated: 2026-10-20
> Related: [Architecture §7.2](../ARCHITECTURE.md) · [Infrastructure](../../../implementation/scalable/docs/INFRASTRUCTURE.md) · [Cost](../../../implementation/scalable/docs/COST.md) · [Privacy](../../06-security-compliance/PRIVACY.md)

## Context and problem statement
v1 stores personal data (names, phones, voice) and financial records of Indian jewellers and karigars. It needs low latency in India, data residency comfort under DPDP [S53], managed Postgres and cheap scale-to-zero compute. Where do we host?

## Decision drivers
- Data in India; low latency to Bengaluru, Mumbai and Kolkata.
- Managed services with small ops load for a small team.
- Scale to zero for workers; predictable cost at pilot scale.
- Terraform-able.

## Considered options
1. **GCP asia-south1: Cloud Run (web, api, worker), Cloud SQL Postgres 16, Memorystore Redis 7, Cloud Storage, Secret Manager, Cloud KMS (custodial keys), Cloud Tasks + Scheduler; DR backups to asia-south2 (Delhi).**
2. AWS ap-south-1 (ECS Fargate, RDS, ElastiCache).
3. Azure Central India.
4. A single VPS (e.g. an Indian VPS provider) with Docker Compose.

## Decision outcome
Chosen option: **1**. Images are built from `implementation/scalable/infra/docker/web.Dockerfile`, `api.Dockerfile` and `worker.Dockerfile`, pushed to Artifact Registry (asia-south1) and deployed by `scalable-deploy.yml` with Terraform (`implementation/scalable/infra/terraform`). Cloud Run's request-based scaling and min-instances = 1 suit a bursty, weekly-reconcile workload.

### Consequences
- Good: all primary data stays in India; minimal ops; scale-to-zero workers; built-in OTel via Cloud Trace.
- Bad: lock-in to Cloud Run, Cloud Tasks and KMS. Mitigation: plain Docker images, RQ as the in-app queue abstraction, and Postgres (portable).
- Bad: Cloud SQL HA has a fixed floor cost even when idle. Estimated in [COST](../../../implementation/scalable/docs/COST.md) (HUNCH until priced with the GCP calculator; owner: tech lead, by 31 Jan 2027).
- Neutral: the demo track stays on Vercel + Render or Docker Compose (not in India) and holds only composite, non-real data.

### Confirmation
Terraform plan in CI; an org policy restricts resource locations to `asia-south1` / `asia-south2`. Restore drill from PITR each quarter. Review at the end of the pilot (Jun 2027).
