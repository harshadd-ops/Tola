# ADR-0004: SQLite for the demo, PostgreSQL 16 for scalable
> Project: Tola · Owner: Back end + crypto lead · Status: Accepted · Last updated: 2026-10-20
> Related: [Data model §5](../DATA_MODEL.md) · [Architecture §7](../ARCHITECTURE.md) · [ADR-0001](ADR-0001-two-track-repo.md)

## Context and problem statement
The demo must reset to a seeded story week in seconds and run on a laptop with no network. Production needs concurrent writers, row locks for chain appends, RLS, PITR backups and data residency in India. One database or two?

## Decision drivers
- Stage reset in < 3 s; zero ops for the demo.
- Chain appends must be serialised per pair (`FOR UPDATE`).
- Append-only enforcement at the database level.
- Same SQLAlchemy 2.1 models for both tracks.

## Considered options
1. **SQLite (demo) + PostgreSQL 16 on Cloud SQL (scalable), same SQLAlchemy models.**
2. Postgres everywhere (Docker on the stage laptop).
3. Firestore / MongoDB.

## Decision outcome
Chosen option: **1**.
- **Demo:** SQLite in WAL mode, `BEGIN IMMEDIATE` for appends, append-only triggers, and the file rebuilt from `seed/story_week.json` by API-02 (guarded by `DEMO_RESET_TOKEN`).
- **Scalable:** Postgres 16 with Alembic 1.20 migrations, `SELECT … FOR UPDATE` on the pair row, `REVOKE UPDATE, DELETE` on the append-only tables, RLS by shop and karigar, PITR for 7 days.

### Consequences
- Good: an instant, portable demo; a production-grade store for v1.
- Bad: two SQL dialects (JSON vs JSONB, arrays, exclusion constraints). Mitigation: avoid dialect-specific SQL in repositories, and run the scalable test suite against Postgres in CI (service container).
- Bad: no concurrent writers in the demo. That is fine with one stage laptop.

### Confirmation
The demo reset benchmark is < 3 s in CI. A Postgres integration test proves that two concurrent appends to one pair produce seq n and n+1 with a valid chain. Review on 16 Dec 2026.
