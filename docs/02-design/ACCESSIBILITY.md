# Accessibility: Tola
> Project: Tola · Owner: Design lead (front end + design) · Status: Draft v0.1 · Last updated: 2026-10-20
> Related: [DESIGN.md](./DESIGN.md) · [Design system](./DESIGN_SYSTEM.md) · [UI spec](./UI_SPEC.md) · [Localization](./LOCALIZATION.md) · [PRD](../01-product/PRD.md) · [Testing](../../implementation/scalable/docs/TESTING.md)

Tola's main user, Rafiq (P-02), may read little. He uses a ₹6–8k Android or a feature phone, works under a bench lamp, has gold dust on his fingers, and listens to Bengali. The judging criteria require that the product works for **low literacy, limited connectivity and low-cost phones** (brief §13). For Tola, accessibility is the product, not a compliance layer.

**Target:** WCAG **2.2 Level AA** on every web screen (S-01–S-16), plus the low-literacy and voice-first patterns in §2.

| Track | Scope |
|---|---|
| MVP (hackathon) → `implementation/demo` | AA on S-01–S-12 in en/hi/kn/bn, light and dark; axe-clean; keyboard-complete story mode; reduced-motion version of the signature moment |
| v1 (production) → `implementation/scalable` | All of the above for S-13–S-18 + mr/ta; WhatsApp/IVR channels for users who cannot use the app; moderated tests with low-literacy karigars; an accessibility statement page |

---

## 1. WCAG 2.2 AA checklist (applied to Tola)
Legend: ✅ designed in · 🧪 automated test · 👁 manual check

| SC | Name | How Tola meets it | Check |
|---|---|---|---|
| 1.1.1 | Non-text content | Icons have text labels; the replay button has `aria-label`; QR has adjacent text "Pay ₹5,040.00 to Rafiq Sheikh" and the UPI link; phone mockups in the hero are `inert` with `aria-label="Preview of the karigar's phone"`; the light arc is `aria-hidden` | ✅ 🧪 |
| 1.2.1 | Audio-only (prerecorded) | Every read-back has its text on screen; every voice note shows a transcript (or "Transcript unavailable" + the original text when typed) | ✅ 👁 |
| 1.3.1 | Info and relationships | `Table` with `<th scope>`; landmarks (`header`, `nav`, `main`, `aside` for the phone stage, `footer`); `GramFigure` uses `<data value="mg">` | ✅ 🧪 |
| 1.3.2 | Meaningful sequence | DOM order = visual order; the phone stage comes after main content in the DOM | ✅ 👁 |
| 1.3.3 | Sensory characteristics | No instruction says "the gold button" or "on the right"; it says "Press Haan" | ✅ 👁 |
| 1.3.4 | Orientation | Works in portrait and landscape; the phone stage reflows | ✅ 👁 |
| 1.3.5 | Identify input purpose | `autocomplete="tel"`, `one-time-code`, `name`, `organization` | ✅ 🧪 |
| 1.4.1 | Use of colour | Status = colour **+ shape + text** (DESIGN §4.2); variance always shows "+0.38 g" and ▲ | ✅ 👁 |
| 1.4.3 | Contrast (minimum) | All text ≥ 4.5:1 (large ≥ 3:1); see §4 | ✅ 🧪 |
| 1.4.4 | Resize text | rem-based type; no clipping at 200% | ✅ 👁 |
| 1.4.5 | Images of text | None; the wordmark is live text | ✅ |
| 1.4.10 | Reflow | Single column at 320 CSS px; tables become stacked cards below 640 px | ✅ 👁 |
| 1.4.11 | Non-text contrast | Field/checkbox edges `--control-edge #8a8a8a` (3.45:1 on white, 3.17:1 on `#f5f5f5`); focus ring indigo-600; `--gold-line #a87810` 3.92:1 | ✅ 🧪 |
| 1.4.12 | Text spacing | No fixed heights on text containers; tested with the text-spacing bookmarklet; Indic leading boost already ≥ 1.5 | ✅ 👁 |
| 1.4.13 | Content on hover or focus | Tooltips dismissible (Esc), hoverable, persistent; never the only source of information | ✅ 👁 |
| 2.1.1 | Keyboard | Whole story mode by keyboard: Tab, Enter/Space, ← → beats, Esc closes sheets; simulated scale has quick-pick buttons and arrow keys on the slider | ✅ 🧪 |
| 2.1.2 | No keyboard trap | Sheets trap focus only while open; Esc releases | ✅ 🧪 |
| 2.1.4 | Character key shortcuts | Single-key shortcuts (`R`, `?`) only active when focus is on the story rail **or** can be turned off in the shortcut sheet | ✅ 👁 |
| 2.2.1 | Timing adjustable | The voice-listen window (6 s) is not a deadline: the tap is always available. OTP resend timer is informational. Passport expiry is set by the user | ✅ |
| 2.2.2 | Pause, stop, hide | Ledger ticker has a pause button and pauses on hover/focus; no autoplaying loops over 5 s elsewhere | ✅ 👁 |
| 2.3.1 | Three flashes | No flashing; the halo blooms once at 600 ms | ✅ |
| 2.4.1 | Bypass blocks | "Skip to content" link (Vakyam pattern) | ✅ 🧪 |
| 2.4.2 | Page titled | `<title>` per screen: "Issue gold · Tola" in the active language | ✅ 🧪 |
| 2.4.3 | Focus order | Logical; after the gram lands, focus moves to "Haan" **only** on the karigar route, never stolen on the jeweller screen | ✅ 👁 |
| 2.4.4 | Link purpose | Specific labels ("View GST draft for ST-0007") | ✅ |
| 2.4.6 | Headings and labels | One H1 per screen; card titles are H2/H3 | ✅ 🧪 |
| 2.4.7 | Focus visible | 2 px `--focus` outline + 3 px peri glow, offset 2 px, in both themes | ✅ 🧪 |
| 2.4.11 | Focus not obscured (minimum) **(new in 2.2)** | Translucent nav and story rail use `scroll-padding-top: 72px; scroll-padding-bottom: 72px` so focused items never hide under the chrome | ✅ 👁 |
| 2.5.1 | Pointer gestures | No multipoint or path gestures required; the sheet drag has buttons | ✅ |
| 2.5.2 | Pointer cancellation | Commit on up-event; drag away to cancel (React Aria press) | ✅ |
| 2.5.3 | Label in name | Visible label text is contained in the accessible name ("Issue 40.00 g to Rafiq") | ✅ 🧪 |
| 2.5.4 | Motion actuation | No shake or tilt input | ✅ |
| 2.5.7 | Dragging movements **(new in 2.2)** | Every drag (sheet detents, simulate slider) has a single-pointer alternative: close button, detent buttons, quick-pick chips, arrow keys | ✅ 👁 |
| 2.5.8 | Target size (minimum) **(new in 2.2)** | 24 px minimum required; Tola uses ≥ 44 px (48 px phone, 64 px Haan/Na) | ✅ 🧪 |
| 3.1.1 | Language of page | `<html lang>` follows the UI locale | ✅ 🧪 |
| 3.1.2 | Language of parts | The phone stage carries `lang="bn"` when the app is in `en`; mixed-language transcripts are wrapped in `<span lang>` | ✅ 🧪 |
| 3.2.1 / 3.2.2 | On focus / on input | No context change on focus; changing the language does not navigate away | ✅ |
| 3.2.3 | Consistent navigation | Same nav, role switcher and story rail on every app screen | ✅ |
| 3.2.4 | Consistent identification | Ticks, chips and the SimChip look and behave the same everywhere | ✅ |
| 3.2.6 | Consistent help **(new in 2.2)** | "Help · 🔊 Hear this screen" sits in the same nav position on every screen (v1: plus WhatsApp help number) | ✅ |
| 3.3.1 | Error identification | Inline `Alert` with text + icon; field errors via `FieldError` linked by `aria-describedby` | ✅ 🧪 |
| 3.3.2 | Labels or instructions | Every field labelled; the scale states what to do ("Place the gold on the scale") | ✅ |
| 3.3.3 | Error suggestion | "Voice said 38.2 g; scale says 38.12 g. Scale wins." | ✅ |
| 3.3.4 | Error prevention (legal, financial, data) | Settlement approval: review + AlertDialog; every ledger event is read back before signing; signed lines can't be edited, only disputed or adjusted by both | ✅ |
| 3.3.7 | Redundant entry **(new in 2.2)** | Karigar, order, fineness and norm are pre-filled from the order; returns pre-fill from the issue | ✅ |
| 3.3.8 | Accessible authentication (minimum) **(new in 2.2)** | OTP supports paste and `autocomplete="one-time-code"` (Android SMS autofill); voice-call OTP; the PIN is not a cognitive test (it can be shown while typing) | ✅ 👁 (v1) |
| 4.1.2 | Name, role, value | HeroUI v3 / React Aria provide roles; custom `SignatureTicks` uses `role="img"` + label; `ScaleWidget` live value uses `role="status"` | ✅ 🧪 |
| 4.1.3 | Status messages | Toasts and "Waiting for Rafiq" use `aria-live="polite"`; errors use `role="alert"`; scale settling is **not** announced, only the stable value | ✅ 🧪 |

---

## 2. Low-literacy and voice-first patterns
These go beyond WCAG and are what make Tola usable for P-02 and P-05 (R-08).

| # | Pattern | Rule | Where |
|---|---|---|---|
| 1 | **Every number is spoken** | Each ledger event, settlement total and passport figure has a 🔊 that reads it in the user's language; numbers are expanded to words by code, not by the TTS engine | S-05, S-08, S-09, S-10 |
| 2 | **One screen, one decision** | The karigar phone shows only the number, who it's from, and Haan / Na | S-05 |
| 3 | **Icon + colour + word + sound** | No state relies on reading alone; ✓✓ is learnt from WhatsApp | All |
| 4 | **Say or tap, never only one** | Voice "haan" and the tap both work; neither is required | S-05, S-17, S-18 |
| 5 | **Never auto-sign on uncertain speech** | A low-confidence STT result asks again; a signature needs a clear "haan" or a tap | S-05 |
| 6 | **Read-back before signature** | The read-back finishes or is skipped by the user; the Haan button is active during playback (no forced wait) | S-05 |
| 7 | **No typing for numbers** | Weights come from the scale; amounts are computed | S-04, S-06 |
| 8 | **Big, separated targets** | Haan / Na 64 px tall, 16 px apart, stacked (thumb reach, dusty fingers) | S-05 |
| 9 | **Speak the screen** | "🔊 Hear this screen" in the nav reads the H1 and primary action (v1) | All |
| 10 | **Familiar metaphors** | Two ticks, a register, a scale; no "blockchain", "hash" or "token" in karigar copy (hash shown only to jeweller/lender as a small chip) | All |
| 11 | **Channel fallback** | If the app is too hard: WhatsApp buttons, then an IVR call with keypad 1/2/9 | S-17, S-18 |
| 12 | **Shared phone** | Each person has their own PIN-protected key on the karkhana phone; the active person's name and photo are always visible at the top (R-09) | v1 |

**Validation plan:**
- MVP: 5 karigars (bn/hi), moderated task "confirm this issue" with the screen text hidden. Pass = 5/5 complete it, median ≤ 10 s. Owner: field + pitch lead, by 15 Dec 2026.
- v1: 20 karigars across bn/mr/ta, SUS ≥ 70 (measured with a read-aloud SUS variant).

---

## 3. Screen readers
| Platform | Reader | Test |
|---|---|---|
| Android (primary for karigars) | TalkBack (Chrome) | Full S-05 confirm, S-10 share; swipe order; live region announcements |
| Windows (jeweller desktop) | NVDA 2025.x + Chrome | S-03, S-04, S-07, S-09 |
| macOS / iOS | VoiceOver + Safari | S-01 landing, S-11 lender view |

Specifics:
- `GramFigure` accessible name: "40.00 grams" (not "four zero dot zero zero g"). Fine: "36.640 grams fine". Delta: "plus 0.38 grams, above norm".
- `SignatureTicks`: "Signed by Suresh Jewellers and Rafiq Sheikh".
- `HashChip`: "Record fingerprint a3f9 … c21. Press to copy full fingerprint."
- **Gram flight:** the animated chips are `aria-hidden`; one polite announcement fires on landing: "Sent to Rafiq's phone. Waiting for his yes."
- **The halo** is decorative; the announcement is "Both signed".
- **Story rail:** `nav aria-label="Story"` with `aria-current="step"`.
- **Phone stage:** `aside aria-label="Rafiq's phone (Bengali)" lang="bn"`.

---

## 4. Contrast
All ratios computed on 2026-10-20 with the WCAG relative-luminance formula. The script below (Node ≥ 18) is the single source; re-run it after any token change (CI: `pnpm test:contrast`).

| Pair (fg on bg) | Ratio | Use | Pass |
|---|---|---|---|
| `#1f1f1f` on `#fcfcfc` | 16.07 | ink | AAA |
| `#3d3d3d` on `#fcfcfc` | 10.59 | body | AAA |
| `#666666` on `#fcfcfc` | 5.60 | caption | AA |
| `#666666` on `#f5f5f5` | 5.27 | caption on bg-2 | AA |
| `#ffffff` on `#2a2c33` | 13.94 | slate button | AAA |
| `#3333cc` on `#ffffff` | 8.45 | link | AAA |
| `#4250d5` on `#ffffff` | 6.29 | signed tick (non-text ≥ 3) | AA |
| `#7a5208` on `#ffffff` | 6.91 | gold-ink label | AA |
| `#a87810` on `#ffffff` | 3.92 | gold-line (non-text only) | 1.4.11 ✓ |
| `#b81514` on `#ffffff` | 6.66 | danger text | AA |
| `#2f7d32` on `#ffffff` | 5.12 | success text | AA |
| `#a5460f` on `#ffffff` | 6.03 | warning text | AA |
| `#8a8a8a` on `#ffffff` | 3.45 | control edge (non-text) | 1.4.11 ✓ |
| `#f9730c` on `#ffffff` | 2.81 | **ember: decorative light only** | ✗ for text, by design |
| `#f2f2f4` on `#0c0c0f` | 17.47 | dark ink | AAA |
| `#9a9aa3` on `#141418` | 6.58 | dark caption | AA |
| `#ffd27a` on `#141418` | 12.91 | dark gold-ink | AAA |
| `#b4c3ff` on `#141418` | 10.67 | dark link | AAA |
| `#ff8a7a` on `#141418` | 8.02 | dark danger | AAA |
| `#7fd18b` on `#141418` | 9.97 | dark success | AAA |

```js
// scripts/contrast.mjs
const L = h => { const c = [0, 2, 4].map(i => parseInt(h.slice(1).substr(i, 2), 16) / 255)
  .map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
export const ratio = (a, b) => { const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
```

**Text over the light arc.** Text never sits directly on the arc. A `--bg` scrim of at least 70% opacity is laid under text blocks, and axe runs with the arc enabled.

**High contrast.** `prefers-contrast: more` darkens hairlines and ink-3, removes translucency and hides the arc (DESIGN §5.6). `forced-colors: active` uses system colours, and ticks use `CanvasText`.

---

## 5. Font scaling and zoom
- All type is in `rem`, and layout spacing in `rem`/`em`, so it follows the browser and Android font scale (Apple "Dynamic Type" principle).
- Tested at 200% browser zoom and Android font scale 1.3 (the largest default step on many devices; not verified per OEM). Nothing clips, and gram figures wrap to their own line rather than shrink.
- **The minimum on the karigar phone is 18 px body and a 56 px gram figure.** Text does not shrink below these on small screens.
- Indic leading boost (+12–20%) prevents clipping of matras and conjuncts at large sizes (DESIGN §5.3).
- `text-wrap: balance` on headings; `pretty` on body.
- No viewport zoom lock (`maximum-scale` is never set).

---

## 6. Motion, transparency and sensory safety
| Preference | Behaviour |
|---|---|
| `prefers-reduced-motion: reduce` | Gram flight becomes an in-place crossfade on both phones; ticks appear without drawing; MaskHeadline becomes a fade; scroll tilt is off; ticker becomes a static list; sheet release uses a fade (drag tracking stays, because it is direct manipulation) |
| `prefers-reduced-transparency: reduce` | Nav and sheets become solid; the arc is dimmed to 25% |
| `prefers-contrast: more` | See §4 |
| Sound | The tick click plays only in stage mode and never on its own; a visible mute toggle is in settings |
| Haptics | `navigator.vibrate(12)` only on commit (sign / approve); never in a loop |
| Vestibular | No parallax on app screens; no full-viewport motion; no loops slower than 1 cycle per 5 s |

---

## 7. Indian legal and policy alignment
| Instrument | What it asks | Tola response | Status |
|---|---|---|---|
| **Rights of Persons with Disabilities Act, 2016**, s.40 (accessibility standards for ICT) and s.42 (access to ICT, audio description, sign language, captions) | Accessible ICT products and services | WCAG 2.2 AA, audio-first by design, captions/transcripts for every audio | Applies to the product as a service to the public; legal applicability to a private startup's app should be confirmed by counsel (not verified 2026-10-20) |
| **GIGW 3.0** (Guidelines for Indian Government Websites and Apps, 2023) | WCAG 2.1 AA baseline + Indian-language, mobile, security requirements | Tola is not a government site; we follow GIGW 3.0 voluntarily because co-op banks and PM Vishwakarma partners may require it in procurement | Voluntary |
| **IS 17802** (BIS standard for ICT accessibility) | ICT accessibility requirements | Track it for v1 procurement; WCAG 2.2 AA should cover most clauses | Clause mapping not verified 2026-10-20; owner: product lead by 31 Jan 2027 |
| **DPDP Act 2023** (notice in the user's language) | Notice understandable to the Data Principal | Consent notice in the karigar's language, read aloud (S-14), with "Hear again" | See [privacy docs](../06-security-compliance/) |

---

## 8. Testing and gates
| Gate | Tool / version | Threshold | Track |
|---|---|---|---|
| Automated a11y | `@axe-core/playwright` on Playwright 1.64, every screen × {en, bn} × {light, dark} | 0 serious/critical violations | Demo + scalable CI |
| Reduced motion | Playwright `reducedMotion: 'reduce'` snapshot of S-04/S-05 | No transform animations recorded; final state identical | Demo + scalable |
| Keyboard story | Playwright e2e completes beats 1–7 with keyboard only | Pass | Demo |
| Contrast tokens | `scripts/contrast.mjs` over the token table | All listed pairs ≥ thresholds | CI |
| Target size | DOM check: every `button`, `a`, `[role=button]` ≥ 44×44 (≥ 48 inside `PhoneFrame`) | 100% | CI |
| Screen readers | Manual TalkBack + NVDA scripts (§3) | All tasks complete | Before 15 Dec 2026 (demo), each release (v1) |
| Low-literacy test | Moderated, §2 | 5/5 complete | 15 Dec 2026 |

**Owner:** design lead. **Accessibility statement** (v1): `/accessibility` page listing conformance, known issues and a WhatsApp help number. Due 31 Mar 2027.
