# Front End (demo build)
> Project: Tola · Owner: Front-end + design lead · Status: Built v0.2 · Last updated: 2026-10-21
> Related: [Demo spec](./DEMO_SPEC.md) · [Back end](./BACKEND.md) · [Design](../../../docs/02-design/DESIGN.md) · [Design references](../../../docs/02-design/reference/) · [Project brief §10–11](../../../docs/00-overview/PROJECT_BRIEF.md) · [Testing](./TESTING.md)

The demo web app lives in `implementation/demo/apps/web`. It must look like **sarvam.ai** and the team's **Vakyam** site (warm canvas, light-as-colour arc, serif display) and move like an Apple app (springs, press-on-pointer-down, interruptible sheets, translucent chrome). Pinned versions are in [`apps/web/package.json`](../apps/web/package.json).

## 1. Stack
| Concern | Choice (exact version) | Why |
|---|---|---|
| Framework | Next.js **16.4.2**, App Router, Turbopack (default in 16) | Server components for static pages, client islands for the story |
| UI runtime | React **19.3.1** | Required by HeroUI v3 |
| Components | `@heroui/react` **3.2.6** + `@heroui/styles` **3.2.6** (React Aria under the hood; peers `react-aria` 3.53.1, `react-aria-components` 1.22.1) | Accessible primitives; compound API; theme by CSS variables; **no Provider** |
| Styling | Tailwind CSS **4.3.3** via `@tailwindcss/postcss` 4.3.3 | Same pipeline as Vakyam |
| Motion | `motion` **14.4.0** (`motion/react`, `LazyMotion` + `m.*`) | Springs with `bounce` + `visualDuration` map to Apple's damping + response |
| Client state | `zustand` **5.0.15** | Tiny stores for session, story, scale |
| Server state | `@tanstack/react-query` **5.104.5** | Polling the ledger for the live mirror; cache invalidation per step |
| Validation | `zod` **4.6.7** | Parse every API response; reject floats for grams |
| i18n | `next-intl` **4.14.9** (en, hi, kn, bn), no locale in the URL | Persona switch changes language without a route change |
| Crypto | `@noble/ed25519` **3.2.0** + `@noble/hashes` **2.4.0** | Sign the event hash in the browser |
| QR | `qrcode.react` **4.2.0** | UPI intent QR, rendered client-side |
| Icons | `@gravity-ui/icons` **2.22.0** | HeroUI v3's own icon set; one drawing language with the components |
| Fonts | Fontsource: Fraunces Variable, Figtree Variable, DM Mono, Mukta, Noto Sans Bengali, Noto Sans Kannada (all **5.3.0**) | Self-hosted, so the stage works offline |
| Tests | Vitest **5.0.5**, Testing Library 16.3.3, Playwright **1.64.1**, fast-check 4.10.2 | See [TESTING.md](./TESTING.md) |
| Language | TypeScript **5.9.3** (`strict`, `noUncheckedIndexedAccess`) | Pinned by the brief (TS 7 exists but is not adopted) |

## 2. Folder structure (as built, 2026-10-21)
```
apps/web/
├─ next.config.mjs             /v1 proxied to the API (same origin: no CORS, a LAN phone works); devIndicators off
├─ e2e/                        Playwright: story (golden path), stepper (jumps, Skip, keys), a11y (axe light+dark, 390 px), no-network
└─ src/
   ├─ app/
   │  ├─ layout.tsx            fonts, QueryProvider, MotionProvider, Boot (theme). No nav here.
   │  ├─ stage/page.tsx        /stage: the 3-minute story (own chrome: top bar + story rail)
   │  ├─ (site)/layout.tsx     SiteNav (translucent) + footer for the landing and explore pages
   │  ├─ (site)/page.tsx       landing, Sarvam rhythm (hero, problem, how it works, live ledger, two sides, close)
   │  ├─ (site)/jeweller, karigar, ledger, lender/passport/[token], orders/[code], settlements/[id]
   │  ├─ (site)/jeweller/{issue,returns,reconcile,reconcile/[runId]}, karigar/passport → redirect to /stage?step=…
   │  └─ not-found.tsx · error.tsx · loading.tsx
   ├─ components/tola/         the design system on top of HeroUI v3:
   │                           TolaMark, Gram (DM Mono figure), Ticks (signatures), Chips (SimChip, HashChip, SourcePill),
   │                           AgentNote (Alert), Voice (ReadbackPlayer, VoiceNoteButton), Devices (PhoneFrame, BrowserFrame),
   │                           SiteNav, LinkButton (buttonVariants on a link), ThemeToggle, Boot
   ├─ features/
   │  ├─ story/                steps.ts (13 beats, cues, presenter lines, autoNext), useStory (server state, perform,
   │  │                        serialised navigation, auto-advance), Stage, StoryRail, RealVsMocked, Closing, useStoryKeys
   │  ├─ console/              one scene per surface: IssueScene (S01–03), ReturnScene (S04), WeekScene (S05–07),
   │  │                        SettleScene (S08–09), ProofScenes (Passport S10, Lender S11, GST S12, Ledger S13), ScalePanel
   │  ├─ karigar/KarigarPhone  Rafiq's phone; on /stage it follows the presenter, on /karigar it follows the server
   │  ├─ explore/              JewellerDashboard, KarigarMirror, ExplorePages (ledger, lender, order, settlement)
   │  ├─ landing/              HeroDevices, LedgerTicker (the real chain)
   │  └─ scale/                useSimulatedScale, useWebSerialScale, parseBalanceLine
   ├─ lib/                     story.ts (state/perform/reset client + types), units.ts, crypto.ts (noble), springs.ts, api.ts
   ├─ stores/                  story (stage pointer, ready/busy), stage (UI-only moments inside a beat), scale, session
   ├─ motion/                  MotionProvider, primitives (Vakyam Reveal / RevealGroup / MaskHeadline, landing only)
   └─ styles/                  tokens.css (Vakyam structure + Tola), heroui.css (Sarvam tuning of HeroUI BEM classes), …
```
Rules: routes stay thin, features own logic, tokens own colour. Every control is a HeroUI v3 component
(`Button`, `Chip`, `Card`-style surfaces, `Table`, `Meter`, `Alert`, `Avatar`, `Checkbox`, `Modal`, `Dropdown`, `Tooltip`, `Kbd`,
`Spinner`); every icon comes from `@gravity-ui/icons`. Antigravity's first build is kept, untouched, in
`implementation/demo/_archive/antigravity-v1/` for reference.

## 3. Routes
See [DEMO_SPEC §4](./DEMO_SPEC.md#4-route-map). `/stage` is the product on stage; the explore pages reuse the same scenes
(`standalone` mode: they never move the story). Sub-routes that were separate screens in the spec
(`/jeweller/issue`, `/returns`, `/reconcile`, `/karigar/passport`) now redirect to the matching beat on `/stage`.
- `/stage` layout: `grid-cols-[minmax(0,1fr)_auto]` at ≥ 1180 px (console + sticky phone); below that the phone stacks under
  the console. The phone frame keeps 390 × 844 and scales to `min(780px, max(540px, 100dvh − 180px))`.

## 4. State: the server owns the story
| Where | What | Notes |
|---|---|---|
| `GET /v1/demo/state` (TanStack Query `['story-state']`) | Everything on screen: orders, Rafiq's events, chain check, run, dispute, settlement, payment, passport, karigar balances, `done[]` | Polled every 1 s on `/stage` and `/karigar` (live mirror) |
| `POST /v1/demo/steps/{id}/perform` | Each on-screen action (Capture, Sign, হ্যাঁ, Run the week, Approve …) | Runs the same idempotent `apply_step_sNN` the reset uses, so a live run and a replay produce the same hashes |
| `POST /v1/demo/reset {to_step}` | Jumps: entering beat N resets to "everything before N is done" | Serialised with every other navigation; the rail waits for the initial sync (`ready`) |
| `stores/story` (Zustand) | The stage pointer, `ready`, `busy`, presenter line, dialogs | Pointer persisted in `localStorage` `tola-stage-step` |
| `stores/stage` (Zustand) | UI-only moments inside a beat (voice note arrived, piece weighed, proposal sent) | Cleared on every beat change |
| `stores/scale`, `stores/session` | Live scale samples (EC-2 stability); theme | |

Auto-advance is reactive: when the beat on screen is done and continues on the same surface (`autoNext`), the stage moves on
after 0.9 s. Results the room should look at (the lender view, the PDF, the chain) wait for →. **Next** on an unfinished beat
performs it first (Skip).

Grams cross the wire as integers. The Zod schema `Mg = z.number().int().nonnegative()` rejects floats at the boundary. `formatGrams(40000)` returns `"40.000 g"` by string slicing, not by division.

## 5. Theming: HeroUI v3 via tokens
- `src/styles/index.css` imports, in this order: `tailwindcss`, `@heroui/styles`, the dark `@custom-variant`, then [`tokens.css`](../apps/web/src/styles/tokens.css), then the component layers. This mirrors Vakyam's `index.css`.
- `tokens.css` keeps Vakyam's structure (primitives, ramps, neutrals, radius, HeroUI semantic mapping, fonts, motion) and adds Tola's **gold** ramp, the **ember → amber → gold → periwinkle → mist** arc stops and the ledger semantics (`--tick-sealed`, `--variance-flag`, `--dispute-open`, `--simulated`).
- HeroUI reads `--accent`, `--surface`, `--border`, `--focus`, `--radius` and the others directly. We never pass colour props. Buttons use `variant` only (primary = slate pill; secondary = grey pill; outline/ghost for the rest). `heroui.css` only tunes HeroUI's own BEM classes (pill radius, Sarvam easing, hairline cards, the dashed `.chip--sim`).
- Dark mode: `<html class="dark">` set from the session store before paint by a 6-line inline script in `layout.tsx` (no flash). The theme change cross-fades the canvas over 240 ms (Apple: avoid abrupt brightness jumps).
- The arc: `.arc-light` is a blurred half-disc behind the landing hero and behind the stage header, at 35% opacity on `/stage` so it never competes with figures. It is static (no looping animation; Apple warns against slow full-viewport oscillation).
- Type scale: display `clamp(2.5rem, 5vw, 4.5rem)` / 1.04 / `--track-display`; h2 `clamp(1.75rem, 3vw, 2.5rem)` / 1.1; body 1rem / 1.55; labels 0.8125rem with `--track-label` uppercase; **every gram figure** uses `font-family: var(--font-mono); font-variant-numeric: tabular-nums;`.
- Indic scripts: `html[lang=bn|kn|hi]` swaps to Noto Sans Bengali / Noto Sans Kannada / Mukta, removes negative tracking and raises leading to 1.65.

## 6. Motion
Presets are in [`src/lib/springs.ts`](../apps/web/src/lib/springs.ts):

| Preset | Damping · response | Used for |
|---|---|---|
| `spring.default` | 1.0 · 0.4 s | cards entering, layout shifts, variance rows (stagger 60 ms) |
| `spring.snappy` | 1.0 · 0.25 s | ticks, toggles, segmented thumb, persona chip ring |
| `spring.press` | 1.0 · 0.18 s | release after the 0.97 press scale |
| `spring.sheet` | 0.8 · 0.3 s | settlement / share sheets **after a drag release** (with the release velocity) |
| `spring.momentum` | 0.8 · 0.4 s | flicked chain strip |
| `spring.gentle` | 1.0 · 0.6 s | phone frame, stepper, big surfaces arriving |
| `spring.counter` | 1.0 · 0.5 s | scale digits (no overshoot on a weight) |

Rules (from the Apple design skill):
1. **Pointer-down feedback.** `whileTap={{ scale: 0.97 }}` on every pressable surface, plus the HeroUI `.button:active` rule from Vakyam's `heroui.css`.
2. **Interruptible.** Sheets are `m.div` with `drag="y"`, `dragConstraints`, `dragElastic` for rubber-banding, and `onDragEnd` choosing open/closed with `nearestSnap(y, velocity.y, [0, closedY])`. The sheet animates from its current value. Input is never locked during a transition.
3. **Spatial consistency.** The settlement sheet rises from the bottom and dismisses to the bottom. The phone notification drops from the top and leaves to the top. Popovers use `transform-origin` at their trigger.
4. **Signature moment.** When the second signature lands, the two ticks fill (`spring.snappy`), a new block slides onto the chain strip (`layout` animation, `spring.default`), and a 12 ms `navigator.vibrate` fires on the real phone mirror. All three happen on the same frame (causality, harmony).
5. **Materials.** Nav, persona bar and stepper use `backdrop-filter: blur(20px) saturate(180%)` over `--nav`. They never stack on another translucent layer. `prefers-reduced-transparency` makes them solid.
6. **Reduced motion.** `MotionConfig reducedMotion="user"`, and `pick(name, useReducedMotion())` swaps springs for a 200 ms opacity fade. Waveforms render static. The arc is already static.
7. **Compositor only.** Animate `transform` and `opacity`, nothing else. `will-change` only while a sheet is being dragged.

`MotionProvider` follows Vakyam's pattern: `LazyMotion` with async `domAnimation` features (about 5 kB at first paint) plus `MotionConfig`.

## 7. Scale widget (F-01)
`features/console/ScalePanel.tsx` is the balance: a DM Mono readout with 3 decimals and the fine-gold line, a "Settling / Stable / Captured" chip, a dashed "Simulated scale" chip, Place → Capture, and a "USB balance" button for Web Serial.

| Source | How | Notes |
|---|---|---|
| `simulated` (default) | `useSimulatedScale(targetMg, jitter)` replays `steps[S01].scale.jitter_mg` every 200 ms after the bar is dropped (drag the bar onto the pan, or click it) | Deterministic for tests |
| `serial` (optional) | **Web Serial API**: `navigator.serial.requestPort()` → `port.open({ baudRate })` → `port.readable.pipeThrough(new TextDecoderStream())` → split lines → `parseBalanceLine()` | Chrome/Edge desktop only, secure context (localhost counts). Baud default 9600, configurable (balance output formats vary by model and are not verified; the parser takes a regex from settings) |
| `manual_dual` | Two inputs (jeweller, karigar); accepted only when both strings are equal | The M-04 fallback when the scale is unavailable |

`parseBalanceLine("ST,GS,+  40.000 g") → 40000`: the parser extracts the number with a regex and converts it to mg **by string**: integer part × 1000 + the fraction padded to 3 digits. It rejects more than 3 decimals or a missing unit. A property test checks that `parse(format(mg)) === mg` for 0–1,000,000 mg.

Stability: the capture button is enabled only when the last 3 readings span ≤ 10 mg and cover ≥ 1.5 s (EC-2). The reading posts to API-05 with `source`, `device_id` and `occurred_at`.

## 8. Simulated phone frame (F-12 stand-in) and karigar UI
- `components/tola/Devices.tsx` `PhoneFrame` is a portrait version of Vakyam's `PhoneMockup`: a near-black bezel (`#0A0A0B`), radius `--r-device`, inset 1.5 px ring, punch-hole camera, status bar (time from the **story clock**, signal, battery) and `--shadow-device`. Inner sizing is in `em` off a container-relative font (`container-type: inline-size`), so it stays crisp at any width.
- It renders the **real** `KarigarPhone` component, not a screenshot and not an iframe. State is shared through the query cache, so a signature on the console updates the phone immediately.
- Karigar UI rules: Bengali first; one primary action per screen; **56 px** buttons (হ্যাঁ green, না neutral); a speaker button on every card; every number is spoken and captioned; icons lead and text follows (R-08).
- `NotificationBanner` drops from the top inside the frame with `spring.gentle`, with a 150 ms delay after the console action, so the eye travels from console to phone.
- `MicButton`: press-and-hold. It starts on pointer-down, stops on pointer-up, and slide-away-to-cancel uses 10 px hysteresis. When live, it records with `MediaRecorder` (`audio/webm;codecs=opus`) and posts to API-10. When cached, the press plays the seeded clip with a live-looking waveform.

## 9. Performance budget
| Metric | Budget | Where |
|---|---|---|
| First-load JS, `/stage` | ≤ 250 kB gzip | `scripts/check-bundle-budget.mjs` in CI |
| First-load JS, `/karigar` | ≤ 180 kB gzip | same |
| LCP | ≤ 1.8 s on the stage laptop; ≤ 2.5 s on a Moto G-class phone with Lighthouse mobile throttling (`/karigar`) | Lighthouse |
| INP | ≤ 100 ms | Web Vitals overlay in dev |
| CLS | 0.00 on `/stage` across all 13 steps | Playwright `layout-shift` observer |
| Frame rate during step transitions | ≥ 55 fps on the stage laptop (integrated GPU) | Chrome Performance panel |
| Fonts | ≤ 6 files preloaded on first paint (Latin + Bengali subsets of the text faces, DM Mono 400); others lazy | `layout.tsx` |
| Audio clips | ≤ 60 kB each (mp3 48 kbps mono / opus) | `bake_audio.py` |
| API round trip (local) | p95 ≤ 120 ms for writes; reset ≤ 800 ms | pytest timing + `stage-check.sh` |

Tactics: server components for static content; `next/dynamic` for `GstDraftViewer`, `TamperSandbox` and the QR; `LazyMotion` (`m.*` only, `strict`); no icon font (inline SVG); no chart library (variance bars are plain divs).

`scripts/check-bundle-budget.mjs` is owned by the front-end lead and due **25 Nov 2026**. It reads the Next build output and fails CI when a route exceeds its budget. Until it lands, the CI step is expected to fail loudly, not silently.

## 10. Lighthouse targets (production build, `next start`)
| Route | Mode | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|---|
| `/` | mobile | ≥ 90 | 100 | ≥ 95 | ≥ 90 |
| `/stage` | desktop | ≥ 95 | 100 | ≥ 95 | n/a (noindex) |
| `/karigar` | mobile | ≥ 90 | 100 | ≥ 95 | n/a (noindex) |
| `/lender/passport/[token]` | desktop | ≥ 95 | 100 | ≥ 95 | noindex |

## 11. Accessibility and language (F-14)
- Targets ≥ 44 px (56 px in the karigar UI); visible focus ring `2px var(--focus)`; skip link; all controls reachable by keyboard (the stepper keys are in [DEMO_SPEC §6](./DEMO_SPEC.md#6-story-mode-stepper)).
- Every gram figure has an `aria-label` with the spoken form ("40.000 grams"). Bengali labels come from `messages/bn.json`.
- Colour is never the only signal: flags carry an icon and the word "Over norm"; ticks carry "1 of 2" / "2 of 2".
- Contrast ≥ 4.5:1 for text (gold text uses `--gold-deep` on light backgrounds).
- `axe` runs in Playwright on every route (`a11y.spec.ts`) with 0 serious or critical violations allowed.

## 12. MVP (hackathon) vs v1 (production)
| Area | MVP (this build) | v1 ([scalable](../../scalable/README.md)) |
|---|---|---|
| App type | Online web app, desktop-first stage + phone frame | Offline-first PWA (Dexie 4.4, service worker) |
| Identity | Persona chips | OTP login, device keys |
| Karigar surface | `KarigarPhone` in a frame or on a mirrored phone | Same app + WhatsApp/IVR |
| Packages | Single app | `packages/ui` shared kit |
