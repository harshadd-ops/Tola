# Security Policy

## Supported versions
| Version | Supported |
|---|---|
| `main` (scalable track) | ✅ |
| Demo prototype (`implementation/demo`) | ⚠️ Demo only. It has **no authentication by design** and runs on **synthetic data only**. Never deploy it with real users or real gold records. |

## Reporting a vulnerability
- Email **security@tola.example** (placeholder; owner: Backend lead, to be replaced with a real inbox by 15 Dec 2026). Until then, open a private GitHub Security Advisory on the repo.
- Please include steps to reproduce, the impact, and any proof-of-concept.
- Do not publicly disclose an issue until we have responded.

## Response targets
| Stage | Target |
|---|---|
| Acknowledge | 48 hours |
| Triage and severity | 5 working days |
| Fix (critical/high) | 14 days |
| Incident reportable to CERT-In | Reported within **6 hours** of noticing, per the CERT-In directions (see [RUNBOOK](implementation/scalable/docs/RUNBOOK.md)) |

## Full security docs
[SECURITY_ARCHITECTURE](docs/06-security-compliance/SECURITY_ARCHITECTURE.md) · [THREAT_MODEL](docs/06-security-compliance/THREAT_MODEL.md) · [PRIVACY](docs/06-security-compliance/PRIVACY.md) · [COMPLIANCE](docs/06-security-compliance/COMPLIANCE.md)
