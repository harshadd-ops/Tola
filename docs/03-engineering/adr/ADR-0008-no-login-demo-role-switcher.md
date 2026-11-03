# ADR-0008: No-login demo with a role switcher and story mode
> Project: Tola · Owner: Front end + design lead · Status: Accepted · Last updated: 2026-10-20
> Related: [Project brief §5 demo rule](../../00-overview/PROJECT_BRIEF.md) · [API spec §1](../API_SPEC.md) · [Security architecture](../../06-security-compliance/SECURITY_ARCHITECTURE.md) · [ADR-0001](ADR-0001-two-track-repo.md)

## Context and problem statement
The 3-minute walkthrough must show three viewpoints (Jeweller, Karigar, Lender) across one scripted week. OTP logins on stage would waste time and could fail on venue networks. How do actors identify themselves in the demo without pretending to be secure?

## Decision drivers
- Zero friction on stage; instant switching between viewpoints.
- Real cryptography stays visible (real Ed25519 signatures, a real chain).
- Honesty: never imply that the demo is production auth.

## Considered options
1. **No login. A role switcher sets `X-Tola-Persona`; seeded personas with public demo keys; story mode drives the week.**
2. Real OTP with test numbers.
3. Pre-logged-in sessions per browser tab.

## Decision outcome
Chosen option: **1**.
- API-02 (`GET /v1/demo/personas`) returns the personas and their `demo_private_seed`. These seeds are **publicly known**, so the browser can sign as any persona.
- The server still enforces role permissions per persona, so the story stays logically correct.
- `POST /v1/demo/reset` requires `X-Demo-Reset-Token = DEMO_RESET_TOKEN`.
- Every demo screen shows a small "Demo: no login, simulated payments" chip.
- Because one laptop signs for both parties, events carry the `SIGNED_ON_ONE_DEVICE` warning. The UI shows it, and the pitch explains that in v1 each party signs on their own device.

### Consequences
- Good: a fast, reliable story; judges can click freely; a reset in < 3 s.
- Bad: demo keys are not secret, so the demo proves the mechanism, not the security. Mitigation: the scalable track defines OTP (API-17), device keys with a 72 h cooling-off for settlements, passkeys (ES256) and assurance tiers.
- Neutral: the demo hosting must never hold real personal data. Only composite personas are seeded.

### Confirmation
`implementation/demo` has no `/v1/auth/*` routes (contract test). A Playwright test runs the full story through the switcher in < 3 min. Review on 16 Dec 2026.
