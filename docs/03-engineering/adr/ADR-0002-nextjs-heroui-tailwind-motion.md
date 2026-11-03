# ADR-0002: Next.js 16 + HeroUI v3 + Tailwind 4 + Motion for the front end
> Project: Tola · Owner: Front end + design lead · Status: Accepted · Last updated: 2026-10-20
> Related: [Tech stack](../TECH_STACK.md) · [Design](../../02-design/DESIGN.md) · [Architecture §4.1](../ARCHITECTURE.md)

## Context and problem statement
Tola needs one web front end for three very different users: a jeweller on a shop desktop, a karigar on a ₹6–8k Android phone with low literacy, and a lender on a desktop. The design brief asks for the Sarvam/Vakyam look with Apple fluid-motion principles. The demo must look stunning on a projector and stay usable at 44 px touch targets. Which front-end stack?

## Decision drivers
- Accessibility (React Aria), 44 px targets, screen-reader labels in 4 languages.
- Interruptible spring motion with full `prefers-reduced-motion` support.
- Reuse of the team's Vakyam tokens and motion primitives (`docs/02-design/reference/`).
- PWA capability for v1 (offline-first, F-11).
- Speed of building with a 4-person team.

## Considered options
1. **Next.js 16.4 (App Router) + React 19.3 + HeroUI v3.2 + Tailwind CSS 4.3 + Motion 14.4.**
2. Next.js + shadcn/ui + Tailwind + Motion.
3. Flutter (web + Android).
4. Native Android (Kotlin/Compose) + a separate web lender view.

## Decision outcome
Chosen option: **1**. HeroUI v3 is built on React Aria and Tailwind 4 and needs no provider. Its compound components fit the card-and-hairline Sarvam style. Motion gives spring physics (damping 1.0 by default) and `useReducedMotion`. Next.js gives RSC (fast first paint on cheap phones), `next-intl` 4.14 i18n and a straightforward PWA path.

### Track impact
| | MVP (demo) | v1 (scalable) |
|---|---|---|
| UI | Components in `apps/web` | Extracted to `packages/ui` |
| Extras | Role switcher, story mode | Service worker, Dexie 4.4 outbox, passkeys (v1.1) |

### Consequences
- Good: accessible primitives, a single language (TS) for UI and client crypto (`@noble/ed25519`).
- Bad: HeroUI v3 is newer than v2, so there is less community content. Mitigation: use the HeroUI MCP docs, and pin exact versions.
- Bad: no native app for Android Keystore keys in v1. Mitigation: WebCrypto key wrapping now, WebAuthn passkeys (ES256) in v1.1.

### Confirmation
Lighthouse on a Moto-class Android: Performance ≥ 85, Accessibility ≥ 95 for the karigar routes. Playwright visual checks of the story mode. Review on 1 Dec 2026.
