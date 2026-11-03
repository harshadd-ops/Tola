# Coding standards · Scalable track
> Project: Tola · Owner: Tech lead (scalable track) · Status: Draft v0.1 · Last updated: 2026-10-20
> Related: [README](../README.md) · [CLAUDE.md](../CLAUDE.md) · [Backend](BACKEND.md) · [Frontend](FRONTEND.md) · [Git workflow](GIT_WORKFLOW.md) · [Testing](TESTING.md) · [Observability](OBSERVABILITY.md) · [Privacy](../../../docs/06-security-compliance/PRIVACY.md)

These rules apply to everything under `implementation/scalable/`.

The **MVP (hackathon)** build in `implementation/demo` uses a lighter version of the same lint configs, with no coverage gate and no import-linter. The ledger-maths rules in §1 apply to **both** tracks.

---

## 1. The non-negotiables (ledger code)
1. **Units.**
   - Weight is an **integer milligram** (`Mg`).
   - Fineness is an integer in parts per thousand (916 means 22K).
   - Money is integer **paise**.
   - No floats anywhere in gold or money paths: Python, TS, SQL (`bigint`, never `numeric` with scale for mg) or JSON.
2. **Fine gold** = `floor(weight_mg × fineness_ppt / 1000)` and **allowed wastage** = `floor(issued_mg × norm_bps / 10000)` on gross issued (ADR-0006; spec in [ARCHITECTURE §9.1](../../../docs/03-engineering/ARCHITECTURE.md#91-event-body)). Both are computed only by `ledger-core`, which also returns the rounding residue for audit displays.
3. **One implementation, two languages.** `packages/ledger-core/ts` and `packages/ledger-core/py` must both pass `tests/vectors/chain_v1.json` byte for byte. That covers JCS bytes, `body_hash`, `sign_msg`, chain hash, signature verification and balances, as specified in [ARCHITECTURE §9](../../../docs/03-engineering/ARCHITECTURE.md#9-hash-chain-and-signature-specification).
4. **AI never produces a ledger number.** Any digit in an agent's output is treated as display text and is replaced by the `ledger-core` value before it reaches a signed body.
5. **Append-only.** No code path issues an `UPDATE` or `DELETE` on `ledger_events` or `signatures`. Corrections are new `ADJUSTMENT` events, signed by both parties.

The float ban is enforced by a semgrep rule in CI, which runs semgrep in Docker; its version is not verified 2026-10-20.
```yaml
# .semgrep/tola.yml
rules:
  - id: tola-no-float-grams
    languages: [python]
    severity: ERROR
    message: "Gold/money must be integer mg/paise (Mg, Paise). No float()."
    paths: { include: ["services/api/src/tola_api/{ledger,reconciliation,settlements,payments}/**", "packages/ledger-core/py/**"] }
    pattern-either:
      - pattern: float(...)
      - pattern: "$X: float"
      - pattern: Decimal(...)
  - id: tola-no-number-grams-ts
    languages: [typescript]
    severity: ERROR
    message: "Use Mg (bigint-backed) from @tola/ledger-core, not parseFloat/toFixed on grams."
    paths: { include: ["packages/ledger-core/ts/**", "apps/web/src/features/{issue,return,settle,ledger}/**"] }
    pattern-either:
      - pattern: parseFloat(...)
      - pattern: $X.toFixed(...)
```

## 2. TypeScript (apps/web, packages/*)
- **Compiler.**
  - TypeScript 5.9 with `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` and `verbatimModuleSyntax`.
  - No `any`; use `unknown` and narrow it with Zod.
  - No default exports, except where Next.js requires them (pages, layouts, `next.config.ts`).
- **Naming.**
  - Components use `PascalCase.tsx` and hooks `useThing.ts`.
  - Utilities use `camelCase.ts` and constants `SCREAMING_SNAKE`.
  - Routes use kebab-case folders.
  - IDs from the brief appear in comments and test names, for example `// F-02 read-back` or `it("F-07: blocks approval while dispute open")`.
- **Errors.**
  - API calls return a `Result<T, Problem>`, where `Problem` mirrors RFC 9457 (see [BACKEND.md §8](BACKEND.md#8-error-model)).
  - Use `throw` only for programmer errors.
  - The UI shows `t(problem.i18nKey)`, never `detail`.
- **React.**
  - Server Components by default. Add `"use client"` only on interactive leaves.
  - No data fetching in `useEffect`; use TanStack Query.
  - Zustand stores hold UI and session state only, never server data.
- **Accessibility.** Every interactive element has an accessible name in the active locale. Touch targets are ≥ 44 px. Motion respects `prefers-reduced-motion`.

**`tsconfig.base.json`** (root; packages extend it):
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023", "DOM", "DOM.Iterable", "WebWorker"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "jsx": "preserve"
  }
}
```

**`eslint.config.mjs`** (ESLint 10 flat config, root):
```js
// @ts-check
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  { ignores: ["**/.next/**", "**/dist/**", "**/coverage/**", "apps/web/src/api/schema.d.ts"] },
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
    plugins: { "@next/next": nextPlugin, "react-hooks": reactHooks },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...reactHooks.configs.recommended.rules,
      "no-console": ["error", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "no-restricted-imports": ["error", {
        "paths": [
          { "name": "framer-motion", "message": "Use motion/react (Motion 14)." },
          { "name": "localforage", "message": "Use Dexie via src/offline/db.ts." }
        ],
        "patterns": [
          { "group": ["**/implementation/demo/**"], "message": "Scalable must not import the demo." }
        ]
      }],
      "no-restricted-syntax": ["error",
        { "selector": "CallExpression[callee.name='parseFloat']", "message": "No float maths on grams; use @tola/ledger-core." },
        { "selector": "MemberExpression[object.name='localStorage']", "message": "No localStorage: use Dexie (keys/PII must never sit in localStorage)." }
      ]
    }
  },
  prettier
);
```
`eslint-plugin-react-hooks` is 7.1.1 and `@next/eslint-plugin-next` is 16.4.2. Both were checked on 2026-10-20.

**`.prettierrc.json`** (Prettier 3.9):
```json
{
  "printWidth": 100,
  "singleQuote": false,
  "trailingComma": "all",
  "semi": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```
The `prettier-plugin-tailwindcss` version is not verified 2026-10-20. Owner: front-end lead, to pin by 2027-01-15.

## 3. Python (services/api, packages/ledger-core/py)
- **Tooling.** Python 3.12, `uv` 0.13, Ruff 0.17 for lint and format, and mypy 2.4 in `strict` mode with the Pydantic plugin. The full config is in [`services/api/pyproject.toml`](../services/api/pyproject.toml). Key settings: line length 100; rule sets `E W F I B UP S N C4 SIM RET DTZ T20 ASYNC PL RUF TID FBT ERA`.
- **Typing.**
  - Every public function is fully typed.
  - Use `typing.NewType` / `Annotated` for `Mg`, `Paise`, `Fineness`, `PersonId` and `ShopId`.
  - No bare `dict` across module boundaries; use Pydantic models or `TypedDict`.
- **Async.**
  - The request path is fully async (SQLAlchemy 2.1 async + asyncpg).
  - CPU-heavy work goes to RQ, never `run_in_executor` inside a request: batch signature verification beyond 50 events, PDF rendering and audio transcoding.
- **Time.** Only timezone-aware `datetime` in UTC (ruff `DTZ`). Use `core.clock.now()` so tests can freeze time.
- **Errors.**
  - Raise domain exceptions (`BadSignature`, `FineMgMismatch`, `OpenDispute`, `Forbidden`) from `service.py`.
  - A single handler maps them to problem+json. Routers never build error responses by hand.
- **Naming.** Modules and functions use `snake_case`, classes `PascalCase`. Tables are plural `snake_case` (`ledger_events`). Alembic revision messages are imperative (`add passport share scope`).
- **SQL.**
  - SQLAlchemy Core/ORM with bound parameters only. No f-string SQL; Ruff `S608` blocks it.
  - Every new query on a hot path ships with an `EXPLAIN` in the PR description.

## 4. Logging rules (PII redaction)
- **Format.** Structured JSON via `structlog` 26.1, emitted to stdout. Cloud Logging and OpenTelemetry pick it up through `OTEL_EXPORTER_OTLP_ENDPOINT`.
- **Required fields:** `ts`, `level`, `event`, `request_id`, `trace_id`, `module`, `env`, plus `person_ref`, `shop_id` and `event_id` where relevant.

**Never log:**
- phone numbers, names, OTPs, PINs, JWTs or refresh tokens, `Authorization` and `Cookie` headers;
- private keys or seeds, raw signatures, passport tokens;
- audio, transcripts, photos, GSTIN, UPI VPA, PM Vishwakarma ID;
- request or response bodies of API-10, API-15 and API-17 through API-20.

**Allowed:**
- IDs (UUIDs), `event_type`, `mg` amounts, fineness, hash prefixes (first 12 hex chars), error codes, latencies;
- `phone_h`, which is `HMAC-SHA256(TOLA_PII_HASH_KEY, E.164 phone)[:16]`, for support correlation.

```python
# services/api/src/tola_api/core/logging.py  (excerpt)
import hashlib, hmac, re
import structlog

_PHONE = re.compile(r"(?:\+?91[\s-]?)?[6-9]\d{9}")
_OTP = re.compile(r"\b\d{6}\b")
_DENY_KEYS = {"phone", "name", "otp", "pin", "token", "refresh_token", "authorization", "cookie",
              "seed", "private_key", "signature", "transcript", "audio", "photo", "gstin", "vpa",
              "upi_vpa", "vishwakarma_id", "passport_token"}

def _redact(_, __, event_dict: dict[str, object]) -> dict[str, object]:
    for k in list(event_dict):
        if k.lower() in _DENY_KEYS:
            event_dict[k] = "[REDACTED]"
        elif isinstance(v := event_dict[k], str):
            v = _PHONE.sub("[PHONE]", v)
            event_dict[k] = _OTP.sub("[6D]", v) if k in {"event", "detail", "msg"} else v
    return event_dict

def phone_ref(e164: str, key: bytes) -> str:
    return hmac.new(key, e164.encode(), hashlib.sha256).hexdigest()[:16]

def configure(env: str) -> None:
    structlog.configure(processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso", utc=True),
        _redact,                                   # always before rendering
        structlog.processors.dict_tracebacks,
        structlog.processors.JSONRenderer(),
    ])

def get_logger(module: str) -> structlog.stdlib.BoundLogger:
    return structlog.get_logger(module=module)
```

**Redaction tests and log levels.**
- The redaction processor has its own Hypothesis test: random Indian mobile numbers and OTPs embedded in arbitrary strings must never survive.
- Log levels:
  - `INFO` for state transitions (event accepted, settlement approved);
  - `WARNING` for expected failures (bad signature, double-count warning, OTP wrong);
  - `ERROR` for unexpected failures (5xx, job failed after retries);
  - no `DEBUG` in prod.

**Retention.**
- Application logs are kept for **180 days** in Cloud Logging (asia-south1), in line with the CERT-In 2022 direction. See [OBSERVABILITY](OBSERVABILITY.md).
- Audit logs (who read whose ledger or passport) go to a separate sink with 1-year retention.

**Front end.**
- No `console.log` in prod builds; ESLint enforces this.
- Errors go to the Dexie `diag` table only: code, route and timestamp, no PII.
- The user can attach `diag` to a support request. No third-party error tracker in v1.

## 5. Comments and docs
- Comment **why**, not what.
- Every function in `ledger-core` has a docstring or TSDoc with a worked example in mg.
- Public endpoints are documented in `api/openapi.yaml`, not in code comments.
- ADRs go in [`docs/03-engineering/adr/`](../../../docs/03-engineering/adr/) for any decision that changes data shape, crypto, auth or hosting.

## 6. Review checklist (copy into the PR template)
- [ ] Brief IDs (F-/E-/API-/M-) referenced; no new IDs invented
- [ ] Gold/money values are integer mg/paise end-to-end; `ledger-core` used; vectors updated if maths changed
- [ ] No mutation of `ledger_events` / `signatures`; corrections are new signed events
- [ ] Authorisation is checked in `service.py` with `authz.require`; a test was added to the authz matrix
- [ ] Mutating endpoint is idempotent (header and/or natural key)
- [ ] Side effects go through the outbox, not inline
- [ ] No PII in logs, errors, analytics, prompts or fixtures; new PII fields added to the redaction list and [PRIVACY](../../../docs/06-security-compliance/PRIVACY.md)
- [ ] AI output is a draft behind a human gate; works in `AI_FALLBACK_MODE=cached`
- [ ] Strings are translated (en, hi, kn, bn, mr, ta keys present; missing keys fail CI)
- [ ] Karigar route bundle is within budget ([PERFORMANCE](PERFORMANCE.md)); offline path tested
- [ ] OpenAPI changed first; Schemathesis passes
- [ ] Migration is reversible or has a documented forward-fix; it was tested on a copy of the seed DB
