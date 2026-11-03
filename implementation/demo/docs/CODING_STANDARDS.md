# Coding Standards (demo build)
> Project: Tola · Owner: Tech lead (demo track) · Status: Draft v0.1 · Last updated: 2026-10-20
> Related: [CLAUDE.md](../CLAUDE.md) · [Front end](./FRONTEND.md) · [Back end](./BACKEND.md) · [Testing](./TESTING.md)

These standards are short on purpose. [CLAUDE.md](../CLAUDE.md) has the full do/don't list.

## Non-negotiables
1. **Grams are integers in mg; money is integer paise; purity is ‰.** No `float`, `number` division, `REAL` or `Decimal` for weights. Format only at the UI edge.
2. **AI never does arithmetic.** Agents explain and extract; `ledger_core` computes.
3. **Append-only ledger.** Corrections are new events. No UPDATE or DELETE on `ledger_events`.
4. **No auth code** in this build. No new IDs or env var names without updating the brief.
5. **Label simulations** on screen (UPI, lender, GST draft, demo keys, cached AI).

## TypeScript / React
- TS 5.9 `strict`, plus `noUncheckedIndexedAccess`. No `any`; use `unknown` and narrow with Zod.
- Server components by default. Put `'use client'` on the smallest feature component that needs it.
- File names: components `PascalCase.tsx`, hooks `useThing.ts`, others `kebab-case.ts`. One component per file.
- Styling: Tailwind utilities that map to tokens, plus HeroUI variants. No hex values in TSX. No inline `style` except computed transforms.
- Motion: import from `motion/react`, use `m.*` under `LazyMotion`, and take springs only from `lib/springs.ts`. No CSS keyframes on draggable things.
- Strings come from `messages/*.json` (`useTranslations`). Never hard-code UI copy in components; persona names come from the seed.
- ESLint: `eslint-config-next` 16.4.2 (flat config). The build fails on errors.

## Python
- Python 3.12, type hints everywhere, Pydantic models at the edges, and plain `@dataclass(frozen=True)` inside `ledger_core`.
- `ruff check` + `ruff format` (line length 110). Rules: E, F, I, B, UP, S, RUF.
- `ledger_core` imports only the standard library and PyNaCl.
- Routers stay thin: validate → service → response. No SQL in routers.
- Errors are RFC 9457 problem+json with a stable `code`.

## Git
- Branches: `demo/TOLA-xxx-slug`. Commits: Conventional Commits (`feat(api): add reconcile run`).
- PRs: one concern each, CI green, plus a screenshot or GIF for UI changes. Touching `seed/story.json` requires updating DEMO_SPEC §8 and the story tests in the same PR.
- Never commit `.env*` (except `.env.example`), `*.db` or keys.

## Review checklist
- [ ] Integers for every gram and rupee? Units in names (`gold_mg`, `labour_paise`)?
- [ ] Does it work with `AI_FALLBACK_MODE=cached` and no network?
- [ ] Press feedback, reduced motion and 44/56 px targets?
- [ ] en + bn strings present?
- [ ] Tests updated (property, story numbers, e2e step)?
