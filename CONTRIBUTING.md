# Contributing to Tola

## Setup
- Demo: [implementation/demo/docs/ENVIRONMENT_SETUP.md](implementation/demo/docs/ENVIRONMENT_SETUP.md)
- Scalable: [implementation/scalable/docs/ENVIRONMENT_SETUP.md](implementation/scalable/docs/ENVIRONMENT_SETUP.md)

## Branches
Short-lived branches off `main`, named `<type>/<track>-<area>-<short-desc>`, for example `feat/demo-scale-widget` or `fix/scalable-sync-idempotency`.

Put the ticket ID in the PR title, for example `feat(demo): scale widget [TOLA-041]`. Ticket IDs come from [BACKLOG](docs/08-project/BACKLOG.md).

Full workflow: [GIT_WORKFLOW](implementation/scalable/docs/GIT_WORKFLOW.md).

## Commits: Conventional Commits
`feat(demo): …` · `fix(ledger-core): …` · `docs(design): …` · `test(api): …` · `chore(ci): …`

The scope is the track or module. Breaking changes use `feat!:` and a `BREAKING CHANGE:` footer.

## Pull request template
```
### What
### Why (F-xx / US-xx / TOLA-xxx)
### Track
- [ ] demo  - [ ] scalable  - [ ] shared docs/contract
### How tested
### Screenshots / screen recording (UI changes)
### Checklist
- [ ] Grams stay integer mg; no LLM arithmetic
- [ ] Numbers read back in voice flows
- [ ] Tokens from DESIGN.md; reduced-motion respected
- [ ] No secrets, no real PII
- [ ] Docs / openapi.yaml updated if the contract changed
```

## Review checklist
- **Correctness:** the hash chain verifies, both signatures are checked, and variance maths matches `ledger-core` tests.
- **Boundaries (PS 2.2):** settlement goes to both parties; the karigar can see his whole account.
- **Accessibility:** 44 px targets, visible focus, labels in the user's language.
- **Performance:** within the budget in the track's FRONTEND/PERFORMANCE doc.

## Definition of done
- Acceptance criteria of the linked US-xx pass.
- Tests are added and CI is green.
- Docs are updated.
- The demo story still runs end to end (`npm run e2e` in demo).
