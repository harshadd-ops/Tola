# Frontend · Scalable track
> Project: Tola · Owner: Front-end lead · Status: Draft v0.1 · Last updated: 2026-10-20
> Related: [README](../README.md) · [Architecture](../../../docs/03-engineering/ARCHITECTURE.md) · [Design system](../../../docs/02-design/DESIGN_SYSTEM.md) · [Accessibility](../../../docs/02-design/ACCESSIBILITY.md) · [Backend](BACKEND.md) · [Performance](PERFORMANCE.md) · [Security architecture](../../../docs/06-security-compliance/SECURITY_ARCHITECTURE.md)

This doc covers `apps/web` and `packages/ui` in **v1 (production)**. The **MVP (hackathon)** front end lives in `implementation/demo/apps/web`. It has no login and no offline mode, and it shares the design tokens and components that are extracted here into `@tola/ui`.

---

## 1. Stack (versions from the brief, checked 2026-10-20)
| Concern | Choice | Version |
|---|---|---|
| Framework | Next.js App Router, React, TypeScript | 16.4.2 · 19.3.1 · 5.9 |
| UI | HeroUI v3 (`@heroui/react`, `@heroui/styles`), Tailwind CSS, Motion (`motion/react`) | 3.2.6 · 4.3.3 · 14.4.0 |
| Offline store | Dexie (IndexedDB) | 4.4.6 |
| Service worker | Serwist (`@serwist/next`, `serwist`) | 9.5.13 |
| Client state | Zustand | 5.0.x |
| Server cache | TanStack Query (`networkMode: "offlineFirst"`) | 5.x |
| Validation | Zod (types generated from `api/openapi.yaml`) | 4.6.7 |
| Crypto | `@noble/ed25519` (+ WebCrypto SHA-256, AES-GCM, PBKDF2) | 3.2.0 |
| i18n | `next-intl` | 4.14.9 |
| Tests | Vitest, Playwright, `@axe-core/playwright`, `fake-indexeddb` | 5.0.5 · 1.64.1 · 4.14.0 · 6.2.6 |

API types are generated with `openapi-typescript` (version not verified 2026-10-20) into `apps/web/src/api/schema.d.ts`. CI fails if the generated file differs from the committed one.

## 2. App structure and folder conventions
```
apps/web/
├─ src/
│  ├─ app/[locale]/              routes (see §6)
│  ├─ features/<feature>/        issue, return, confirm, ledger, reconcile, disputes, settle, passport, orders, onboarding
│  │   ├─ components/            feature-only components (compose @tola/ui)
│  │   ├─ hooks/                 useIssueDraft(), useConfirmEvent() …
│  │   └─ <feature>.test.tsx
│  ├─ offline/                   db.ts (Dexie), queue.ts, sync.ts, media.ts
│  ├─ crypto/                    keys.ts (generate/wrap/unwrap), sign.ts (thin wrapper on @tola/ledger-core)
│  ├─ scale/                     serial.ts (Web Serial), ble.ts (Web Bluetooth), ocr.ts (M-04 display reader)
│  ├─ voice/                     recorder.ts (Opus 16 kbps), player.ts (read-back cache)
│  ├─ api/                       client.ts (fetch + auth refresh), schema.d.ts (generated)
│  ├─ i18n/                      routing.ts, request.ts, messages/<locale>/<namespace>.json
│  ├─ stores/                    session.ts, ui.ts (Zustand)
│  └─ sw.ts                      Serwist service worker source
├─ public/manifest.webmanifest
├─ proxy.ts                      locale + auth gate (Next 16 renamed middleware.ts to proxy.ts)
└─ next.config.ts
packages/ui/                     @tola/ui: Button, PillButton, GramFigure, ScaleReadout, ReadBackCard,
                                 SignatureBadge, ChainStatus, VarianceChip, Sheet, PhoneFrame, tokens.css
packages/ledger-core/ts/         @tola/ledger-core: canonicalize(), eventHash(), sign(), verify(),
                                 fineMg(), balance(), variance(); integer-only, no floats
```

**Component patterns.**
- Use HeroUI v3 compound components (`Card.Header`, `Card.Content`).
- Every gram figure renders through `<GramFigure mg={...} />`. It formats integer mg as `12.345 g` in DM Mono and can never accept a `number` of grams.
- Every action that ends in a signature goes through `<ReadBackCard>`. It speaks the event (F-02) before the confirm button is enabled.
- Motion uses springs with damping 1.0 by default. Press feedback fires on pointer-down. `prefers-reduced-motion` swaps springs for 0 ms opacity changes. See the [Design system](../../../docs/02-design/DESIGN_SYSTEM.md).
- Touch targets are ≥ 44 px. Every karigar action is icon-led and has a voice alternative (F-14).

## 3. Offline-first model (F-11)

**Principle:** the device is a full participant in the ledger, not a thin client.
- An event is **created, read back, signed and stored locally first**. The network is only how it reaches the server.
- The UI never waits for the server to show the karigar what he signed.

```mermaid
sequenceDiagram
  autonumber
  participant J as Jeweller device (PWA)
  participant K as Karigar device (PWA)
  participant DX as Dexie (J)
  participant SW as Service worker
  participant API as API-18 /v1/sync
  J->>J: Scale reading (Web Serial / BLE / OCR) → draft ISSUE body (weight_mg, fineness_ppt, fine_mg)
  J->>J: body_hash = SHA-256(JCS(body)) via @tola/ledger-core
  J->>J: Jeweller signs sign_msg(pair_id, body_hash) (Ed25519, PIN-unlocked key)
  J-->>K: QR (body + jeweller sig), works with 0 bars
  K->>K: Recompute body_hash; read-back in bn/hi/kn (cached TTS or on-device digit clips)
  K->>K: Karigar taps "haan" → signs the same sign_msg
  K-->>J: QR (karigar sig)
  J->>DX: put item {state: "dual_signed", syncState: "pending"}
  Note over J,DX: Both parties hold a dual-signed body offline; chain position not yet assigned
  SW->>API: on reconnect: POST /v1/sync {device_id, items[], last_known_heads} (Idempotency-Key)
  API-->>SW: results [{event_id, status, seq, hash, warnings[]}] + server_events since last_known_heads
  SW->>DX: mark synced; store seq/hash; re-verify the pair chain locally
```

There are three ways to collect the counter-signature:
1. **Same-room QR exchange**, shown above. It works fully offline.
2. **Remote push.** The event goes to the karigar's app or WhatsApp when either side is online. Until he signs, the server keeps it as `pending_signatures` (locally: `pending_countersign`).
3. **Shared karkhana phone (P-05).** The device holds several person keys, each behind its own PIN. Delegation by the head karigar comes in v1.1 (R-09).

**Ordering and conflicts.** This follows the normative spec in [ARCHITECTURE §9–10](../../../docs/03-engineering/ARCHITECTURE.md#9-hash-chain-and-signature-specification).
- **Parties sign the body, not the chain position.** The device never computes `prev_hash` for a new event. The server assigns `seq`, `prev_hash` and `hash` under a per-pair lock, in arrival order, and adds its witness signature.
- **No re-signing is needed** when two offline devices add events to the same pair. Both are appended.
- **Possible double counts are flagged** by `ledger-core` for human review: the same `reading_ids`, or the same weight ±10 mg within 10 min. Such items come back with `warnings: ["POSSIBLE_DOUBLE_COUNT"]`.
- **Conflict card.** The app shows a **"Check this entry"** card to both parties. Either can open a dispute (F-06) or post a signed `ADJUSTMENT`.
- **Stale norms** (`NORM_STALE`) and clock skew over 24 h are surfaced the same way.
- **Note on the PRD.** F-11's acceptance text says the server "rejects a chain fork". Under this design no fork can exist on the server, because the order is assigned centrally. The conflict that must be "shown to both parties" is the double-count warning. This mismatch has been reported to the brief owner for a PRD wording fix.

## 4. Dexie schema and sync queue
```ts
// apps/web/src/offline/db.ts
import Dexie, { type EntityTable } from "dexie";

export type SyncState = "pending" | "syncing" | "synced" | "warning" | "rejected";

export interface QueuedEvent {
  eventId: string;            // UUIDv7 (client-generated), = body.event_id
  pairId: string;             // shop–karigar pair; one hash chain per pair
  seqLocal: number;           // monotonic per pairId on this device (send order only)
  body: Record<string, unknown>; // JCS body exactly as signed (integers only, "v": 1)
  bodyHash: string;           // lowercase hex SHA-256(JCS(body))
  signatures: { signerId: string; role: "jeweller" | "karigar"; publicKey: string; sig: string }[]; // base64url
  seq?: number;               // assigned by the server on append
  hash?: string;              // chain hash assigned by the server
  warnings?: string[];        // e.g. POSSIBLE_DOUBLE_COUNT, NORM_STALE
  state: "draft" | "pending_countersign" | "dual_signed";
  syncState: SyncState;
  attempts: number;
  nextAttemptAt: number;      // epoch ms
  lastError?: { code: string; detail: string };
  createdAt: number;
}

export const db = new Dexie("tola") as Dexie & {
  events: EntityTable<QueuedEvent, "eventId">;
  keys: EntityTable<{ personId: string; keyId: string; wrappedSeed: ArrayBuffer; salt: Uint8Array; iv: Uint8Array; iterations: number; publicKey: string }, "keyId">;
  ledgerCache: EntityTable<{ pairId: string; headSeq: number; headHash: string; balanceFineMg: number; events: unknown[]; fetchedAt: number }, "pairId">;
  media: EntityTable<{ id: string; kind: "photo" | "voice"; blob: Blob; eventId?: string; uploaded: boolean }, "id">;
  ttsCache: EntityTable<{ key: string; lang: string; audio: Blob; createdAt: number }, "key">;
  diag: EntityTable<{ id?: number; at: number; code: string; detail: string }, "id">;
};

db.version(1).stores({
  events: "eventId, pairId, [pairId+seqLocal], syncState, nextAttemptAt",
  keys: "keyId, personId",
  ledgerCache: "pairId, fetchedAt",
  media: "id, eventId, uploaded",
  ttsCache: "key, createdAt",
  diag: "++id, at",
});
```
`balanceFineMg` is an integer. JS `number` is safe up to 2⁵³ mg, which is about 9 billion kg, so overflow is not a concern. `@tola/ledger-core` still uses `bigint` internally for sums.

**Sync rules.**
| Rule | Value |
|---|---|
| Ordering | Sent in `[pairId+seqLocal]` order, so the server's arrival order matches the device's creation order. A `rejected` item (bad signature, units, authz) does **not** block the rest of the pair. It is shown on `/sync` for the user to act on. |
| Batch | ≤ 50 items or ≤ 256 KB per `POST /v1/sync` (API-18 allows ≤ 200; we send smaller batches for 2G). Media goes first via resumable signed-URL upload to GCS, and the body carries its content hash. |
| Idempotency | `Idempotency-Key: sync-<deviceId>-<firstEventId>-<lastEventId>`. Each item is also deduped server-side by `event_id` (see [BACKEND.md §5](BACKEND.md#5-idempotency-and-offline-sync-api-18)). |
| Outbox limits | 500 items or 50 MB of audio ([ARCHITECTURE §10](../../../docs/03-engineering/ARCHITECTURE.md#10-offline-and-sync-strategy-v1-only-f-11)). At 80% the app warns: "Connect to send your records". |
| Triggers | `online` event · Background Sync API (`sync` tag `tola-events`, Chrome Android) · app foreground · every 60 s while visible |
| Backoff | Exponential with full jitter: 2 s → 5 min cap. `429`/`503` honour `Retry-After`. |
| Durability | Call `navigator.storage.persist()` at onboarding. Media cap is 50 MB; uploaded media is evicted first. Events are **never** evicted. |
| Offline window | Tested at 0 bars for **72 h** (PRD). The queue survives app kill, reboot and refresh-token expiry. |
| User visibility | Header shows a chip: "3 waiting to send". The `/sync` page lists every queued event with its read-back text. |

## 5. Key storage (per person, per device)
| Step | Implementation |
|---|---|
| Generate | 32-byte seed from `crypto.getRandomValues`; public key via `@noble/ed25519`. |
| Protect | 6-digit PIN → PBKDF2-SHA-256 (WebCrypto). The iteration count is calibrated on the device to about 1 s and is **at least 310,000**. That derives a non-extractable AES-GCM-256 key, which wraps the seed. Dexie stores `{wrappedSeed, salt, iv, iterations}`. |
| Register | The public key is sent with `POST /v1/auth/otp/verify` (API-17) as `device_public_key`. A proof-of-possession signature over the `challenge_id` is a proposed addition; see [BACKEND §2](BACKEND.md#2-modules). The server stores it in `person_keys` (child of E-02) with `key_label = device`. |
| Use | The seed is unwrapped into memory only after PIN entry. It is cleared after 5 minutes idle or when the app is backgrounded. It is never written to storage, logs or the network unwrapped. |
| Brute force | 5 wrong PINs → 15-minute lockout, enforced locally with a counter in Dexie. Server-side rate limits apply to the custodial (WhatsApp/IVR) key. |
| Loss / new phone | OTP login on the new device plus the counter-party's attestation (ARCHITECTURE FM-08) → a new row in `person_keys`. The old key gets `revoked_at`; old signatures stay verifiable because each Signature row stores its `public_key`. |
| v1.1 | Passkey/WebAuthn with a platform authenticator (Android Keystore), per the brief. Native WebCrypto Ed25519 in Chrome is (not verified 2026-10-20). |

## 6. Routing (App Router, `[locale]` = en · hi · kn · bn · mr · ta)
| Route | Who | Purpose | Feature / API |
|---|---|---|---|
| `/[locale]/login` | all | Phone number entry (+91 only in v1) | API-17 request |
| `/[locale]/login/otp` | all | 6-digit OTP with auto-read via WebOTP API where supported, plus resend timer (30 s) | API-17 verify |
| `/[locale]/setup/pin` | first login on a device | Create PIN → generate and register key | API-17 verify |
| `/[locale]/setup/consent` | karigar | DPDP notice in his language with an audio version; consent record | [PRIVACY](../../../docs/06-security-compliance/PRIVACY.md) |
| `/[locale]/shop/[shopId]` | owner, staff | Dashboard: fine-gold balance per karigar, flags, approvals | F-13 |
| `/[locale]/shop/[shopId]/issue` | owner, staff | Scale-captured issue | F-01, API-05/06 |
| `/[locale]/shop/[shopId]/return` | owner, staff | Return, scrap and dust capture + voice note | F-04, API-10 |
| `/[locale]/shop/[shopId]/karigars/[karigarId]` | owner, staff | Ledger stream + chain status | API-08 |
| `/[locale]/shop/[shopId]/orders` | owner, staff | Order and deadline tracker | F-10, API-04 |
| `/[locale]/shop/[shopId]/reconciliation/[runId]` | owner | Weekly run and flags | F-05, API-11 |
| `/[locale]/shop/[shopId]/settings/norms` | owner | Wastage norms (signed by both) | E-05 |
| `/[locale]/me` | karigar | **My full account across all my jewellers** (PS 2.2 boundary) | API-08 |
| `/[locale]/me/confirm/[eventId]` | karigar | Read-back + "haan" sign | F-02, API-07/09 |
| `/[locale]/me/disputes/[id]`, `/shop/[shopId]/disputes/[id]` | both parties | Dispute thread, voice replies | F-06, API-12 |
| `/[locale]/me/settlements/[id]`, `/shop/[shopId]/settlements/[id]` | both parties | Statement, approve, UPI intent | F-07, API-13/14/16 |
| `/[locale]/me/passport` | karigar | Create, see and revoke shares | F-08, API-15 |
| `/[locale]/p/[token]` | lender (P-04), **no login** | Read-only passport view; `noindex`; expires | API-15 |
| `/[locale]/sync` | all | Queue and conflict centre | F-11 |
| `/~offline` | all | Serwist navigation fallback | — |

**Auth gate (`proxy.ts`).**
- It is optimistic: it only checks that the `tola_rt` refresh cookie exists and redirects to `/login` if not.
- Real authorisation is always enforced by the API ([BACKEND.md §4](BACKEND.md#4-authorisation-rbac--abac)).
- Access JWTs (15 min) live in memory only. The refresh token (30 days, rotating) is an `HttpOnly; Secure; SameSite=Strict` cookie with `Path=/v1/auth`.
- **Offline with an expired session.** The app still opens and can create and sign events, because the device key authenticates the content. Sync waits for a fresh OTP login, and the banner says so.

## 7. Service worker (Serwist 9.5)
| Request | Strategy | Notes |
|---|---|---|
| App shell, JS/CSS chunks, fonts for the active locale | Precache (revisioned) | Precache only karigar + shared routes, not the whole app (budget §9) |
| Navigation | NetworkFirst with a 3 s timeout → cache → `/~offline` | |
| `messages/<locale>/*.json` | StaleWhileRevalidate | |
| `GET /v1/ledger`, `/v1/orders` | **NetworkOnly in the SW.** Reads use the Dexie `ledgerCache` through TanStack Query | Keeps authorisation-scoped data out of the Cache Storage |
| `POST/DELETE /v1/*` | NetworkOnly | Writes are queued in Dexie by app code, **not** by Workbox-style background-sync replay. Events must be signed and ordered. |
| TTS audio (API-09) | App-level `ttsCache` in Dexie keyed by `hash(text, lang, voice)` | Read-back works offline for numbers already heard. Otherwise an on-device template reads the digits with pre-recorded number clips per language, about 400 KB per language. |

Updates use `skipWaiting` only after the user taps "Update". A new SW never takes over while there are `syncing` events.

## 8. Internationalisation (F-14)
- **Library and locales.** `next-intl` 4.14 with locale prefixes always on. Locales: `en, hi, kn, bn` (as in the MVP) plus `mr, ta` (v1).
- **Messages** are split by namespace (`common`, `issue`, `confirm`, `ledger`, `settle`, `passport`) and loaded per route. A karigar route loads ≤ 15 KB of messages.
- **Numbers.** Grams always show Latin digits in DM Mono (`12.345 g`) so both parties compare the same glyphs. The spoken read-back uses the karigar's language. Rupees use `Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" })` for lakh/crore grouping.
- **Dates and time.** Dates follow the locale and times are IST. Wedding dates show the day name.
- **Fonts.** Fontsource self-hosted: Fraunces, Figtree and DM Mono for every locale, plus Mukta (hi/mr), Noto Sans Bengali (bn), Noto Sans Kannada (kn) and Noto Sans Tamil (ta), **only for the active locale**. Each is subsetted with `font-display: swap`.
- **Default language.** The karigar picks a language at first launch by tapping a spoken sample. The UI language and the voice language are separate settings.

## 9. Performance budget (₹6–8k Android, 2 GB RAM, on 3G)
Reference device class: about ₹7k Android Go / entry Android (for example a 4×A53-class CPU with 2 GB RAM), Chrome stable. Network profiles are defined in [PERFORMANCE.md §3](PERFORMANCE.md#3-network-targets-2g3g).

| Metric | Karigar routes (`/me/*`) | Shop routes (`/shop/*`) |
|---|---|---|
| JS, gzipped, initial route | **≤ 170 KB** (hard cap 250 KB from the PRD) | ≤ 250 KB |
| CSS, gzipped | ≤ 25 KB | ≤ 35 KB |
| Fonts on first view | ≤ 90 KB (Latin subset + one Indic script) | ≤ 120 KB |
| LCP, first visit, 3G profile | ≤ 4.0 s | ≤ 4.5 s |
| LCP, repeat visit (SW warm) | ≤ 1.5 s | ≤ 2.0 s |
| INP (p75 field) | ≤ 200 ms | ≤ 200 ms |
| CLS | ≤ 0.05 | ≤ 0.1 |
| Offline cold start → interactive | ≤ 2.0 s | ≤ 2.5 s |
| Sign + store one event (PIN already unlocked) | ≤ 150 ms | ≤ 150 ms |
| JS heap after 10 min use | ≤ 60 MB | ≤ 90 MB |

**How we stay inside it.**
- RSC by default; client components only for interactive leaves.
- Motion is imported per component (`motion/react` `m` + `LazyMotion`), never globally.
- HeroUI components are tree-shaken.
- No chart library on karigar routes. Sparklines are inline SVG.
- Images go through `next/image` as AVIF.
- **Enforcement.**
  - A `size-limit`-style CI check on `.next` chunks; tool version not verified 2026-10-20. Owner: front-end lead. Decide by 2027-01-15.
  - Lighthouse CI (`@lhci/cli` 0.15.1) with the throttling in [PERFORMANCE.md](PERFORMANCE.md) on every PR that touches `apps/web` or `packages/ui`.

## 10. Scale input (F-01)
| Source | API | Where it works |
|---|---|---|
| `serial` | Web Serial | Chrome desktop (shop desktop P-01). Android Chrome support is (not verified 2026-10-20). |
| `ble` | Web Bluetooth GATT | Chrome Android + desktop; balance needs a BLE adapter |
| `display_ocr` | Camera → M-04 seven-segment reader (WASM/OpenCV template matching, lazy-loaded about 300 KB, never on the karigar's initial bundle) | Any phone with a camera |
| `simulated` | — | **Disabled in prod builds.** Allowed only when `TOLA_ENV != prod`. |

**The reading is never typed** (F-01). If every capture path fails, the fallback is M-04's "manual 2-person confirm": both parties type the number on their own devices and it must match.

## 11. Testing hooks
- Vitest + `fake-indexeddb` for the `offline/*` and `crypto/*` modules.
- Playwright drives two browser contexts (jeweller + karigar) and uses `context.setOffline(true)` for the QR exchange and the 72 h queue scenario, with a fake clock.
- `@axe-core/playwright` on every route.

Details are in [TESTING.md](TESTING.md).
