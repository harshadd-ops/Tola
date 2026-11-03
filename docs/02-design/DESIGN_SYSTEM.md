# Design System: Tola
> Project: Tola · Owner: Design lead (front end + design) · Status: Draft v0.1 · Last updated: 2026-10-20
> Related: [DESIGN.md (lineage, rationale, full CSS)](./DESIGN.md) · [UI spec](./UI_SPEC.md) · [Accessibility](./ACCESSIBILITY.md) · [Localization](./LOCALIZATION.md) · [Frontend](../../implementation/demo/docs/FRONTEND.md) · [Project brief](../00-overview/PROJECT_BRIEF.md)

This is the **lookup reference**: tokens, components, states and rules. For *why* (the Sarvam → Vakyam → Tola lineage, Apple principles and the brand concept), and for the full paste-ready CSS, see [DESIGN.md](./DESIGN.md). If the two documents disagree, DESIGN.md §5 (token CSS) wins.

**Stack (brief §10):**
- HeroUI v3.2 (`@heroui/react`, `@heroui/styles`; MCP reports 3.2.6)
- Tailwind CSS 4.3
- Motion 14.4 (`motion/react`)
- next-intl 4.14
- @gravity-ui/icons 2.22.0
- qrcode.react 4.2.0
- Fontsource fonts 5.3.0

Package versions were checked with `npm view` on 2026-10-20.

---

## 1. Design principles (Ive)
1. **The scale speaks first.** The weight comes from the instrument. The UI's job is to *show* it, never to ask for it. There is no text field for grams anywhere.
2. **Both sides see the same thing at the same moment.** Every event shows both parties and their ticks.
3. **Gold is light.** Warmth comes from a blurred arc and a short halo, never from yellow paint.
4. **One action per screen.** On the karigar phone that action is "Haan".
5. **Numbers are sacred.** DM Mono, tabular figures, two decimals, Latin digits, spoken back.
6. **Honest about the fake.** Anything simulated wears a dashed "Simulated" chip.
7. **Quiet until it matters.** Hairlines, not shadows. Motion only where it explains cause and effect.

Full mapping to Apple's eight principles: [DESIGN.md §3](./DESIGN.md#3-design-principles).

---

## 2. Colour tokens

### 2.1 Primitives
| Token | Light | Dark | Notes |
|---|---|---|---|
| `--ember` | `#f9730c` | `#ff7f24` | Light only, never text (2.81:1) |
| `--amber` | `#ffb053` | `#ffb86b` | Arc; pending-chip tint |
| `--gold` | `#f2c14e` | `#f5c66b` | Arc, halo; **never a fill** |
| `--peri` | `#a5bbfc` | `#a5bbfc` | Arc, focus glow |
| `--mist` | `#f4f7ff` | `#0e1020` | Arc tail |
| `--gold-line` | `#a87810` (3.92:1) | `#c8961e` (6.86:1) | One hairline per screen |
| `--gold-ink` | `#7a5208` (6.91:1) | `#ffd27a` (12.91:1) | "Fine gold" label |
| `--halo` | `rgba(242,193,78,.55)` | `rgba(245,198,107,.45)` | Double-sign bloom |
| `--indigo-50…900` | `#fafcff` … `#212191` (Sarvam ramp) | remapped (see DESIGN §5.2) | Working accent |
| `--green-700` | `#2f7d32` (5.12:1) | `#7fd18b` | Success |
| `--red-600` | `#b81514` (6.66:1) | `#ff8a7a` | Danger / variance |
| `--orange-700` | `#a5460f` (6.03:1) | `#ffb07a` | Warning text |

### 2.2 Neutrals
| Token | Light | Dark |
|---|---|---|
| `--bg` | `#fcfcfc` | `#0c0c0f` |
| `--bg-2` | `#f5f5f5` | `#141418` |
| `--bg-3` | `#f0f0f0` | `#1b1b20` |
| `--bg-4` | `#e6e6e6` | `#26262c` |
| `--card` | `#ffffff` | `#141418` |
| `--ink` | `#1f1f1f` | `#f2f2f4` |
| `--ink-2` | `#3d3d3d` | `#c9c9cf` |
| `--ink-3` | `#666666` | `#9a9aa3` |
| `--hairline` | `#f0f0f0` | `#222228` |
| `--hairline-strong` | `#e6e6e6` | `#2c2c33` |
| `--control-edge` | `#8a8a8a` | `#6b6b75` |
| `--slate` | `#2a2c33` | `#f2f2f4` |
| `--nav` | `rgba(252,252,252,.72)` | `rgba(12,12,15,.66)` |

### 2.3 HeroUI v3 semantic mapping
| HeroUI variable | Light → | Dark → |
|---|---|---|
| `--background` / `--foreground` | `--bg` / `--ink` | same tokens |
| `--surface` / `-secondary` / `-tertiary` | `--card` / `--bg-2` / `--bg-3` | `--card` / `--bg-3` / `--bg-4` |
| `--overlay` | `#ffffff` | `#18181c` |
| `--muted` | `--ink-3` | `--ink-3` |
| `--default` | `--bg-2` | `--bg-3` |
| `--accent` / `-foreground` | `--slate` / `#fff` | `#f2f2f4` / `#0c0c0f` |
| `--success` | `--green-700` | `--green-700` |
| `--warning` | `--amber` | `--amber` |
| `--danger` | `--red-600` | `--red-600` |
| `--segment` / `-foreground` | `#fff` / `--indigo-800` | `#2a2a31` / `--ink` |
| `--field-background` / `--field-border` | `--bg-2` / `--control-edge` | `--bg-3` / `--control-edge` |
| `--border` / `--separator` | `--hairline-strong` / `--hairline` | same tokens |
| `--focus` / `--link` | `--indigo-600` / `--indigo-800` | same tokens |
| `--radius` | `1rem` | `1rem` |
| `--surface-shadow` | `none` | n/a |

### 2.4 Semantic status (meaning → colour + shape)
| Status | Colour | Shape | Component |
|---|---|---|---|
| `signed-one` | indigo-700 | ✓ | `SignatureTicks count=1` |
| `signed-both` | indigo-700 + halo | ✓✓ | `SignatureTicks count=2` |
| `pending` | orange-700 on amber-50 | clock | `Chip` |
| `within-norm` | green-700 | ● | `VarianceBar` |
| `over-norm` | red-600 | ▲ + delta | `FlagCard` |
| `disputed` | red-600 outline | ⚑ | `Chip variant="outline"` |
| `simulated` | ink-3 on bg-3, dashed | ◌ | `SimChip` |
| `chain-ok` / `chain-broken` | green-700 / red-600 | link / link-off | `ChainBadge` |

---

## 3. Typography

| Token | Family | Weight | Size | Tracking | Leading (Latin / bn,kn) |
|---|---|---|---|---|---|
| `t-hero` | Fraunces Variable | 560 | clamp 40→56 px | −0.035em | 1.04 / 1.25 |
| `t-section` | Fraunces Variable | 540 | clamp 32→40 px | −0.025em | 1.10 / 1.30 |
| `t-metric` | DM Mono | 500 | clamp 36→48 px | −0.02em | 1.00 |
| `t-gram-phone` | DM Mono | 500 | 56 px | −0.025em | 1.00 |
| `t-card` | Figtree Variable | 600 | 20 px | −0.01em | 1.30 / 1.50 |
| `t-body-lg` | Figtree Variable | 400 | 18 px | −0.005em | 1.55 / 1.75 |
| `t-body` | Figtree Variable | 400 | 16 px | 0 | 1.55 / 1.75 |
| `t-caption` | Figtree Variable | 450 | 14 px | +0.005em | 1.45 / 1.65 |
| `t-label` | DM Mono, UPPERCASE | 500 | 12 px | +0.06em | 1.30 |

**Indic support:**

| Language | Display | Text | Leading boost | Package |
|---|---|---|---|---|
| hi, mr | Mukta 600/700 | Figtree → Mukta | +12% | `@fontsource/mukta` |
| bn | Noto Sans Bengali Variable | Figtree → Noto Sans Bengali | +18% | `@fontsource-variable/noto-sans-bengali` |
| kn | Noto Sans Kannada Variable | Figtree → Noto Sans Kannada | +20% | `@fontsource-variable/noto-sans-kannada` |
| ta (v1) | Noto Sans Tamil Variable | Figtree → Noto Sans Tamil | +18% | `@fontsource-variable/noto-sans-tamil` |

Rules for Indic text:
- `letter-spacing: 0` on every `:lang()` Indic node.
- Headlines are segmented with `Intl.Segmenter` by word, never by character.
- Labels in Indic languages use sentence case at 13 px in the script face, not uppercase mono.

**Numbers:** DM Mono with `tabular-nums` and Latin digits in every locale, formatted with `en-IN`. See [DESIGN.md §7](./DESIGN.md#7-numerals-and-grams).

---

## 4. Spacing, layout, radius, elevation
| Scale | Values |
|---|---|
| Space (4-pt) | 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 56 · 80 · 128 px |
| Section gap | `clamp(4rem, 9vw, 8rem)` |
| Gutter | `clamp(1rem, 4vw, 2.5rem)` (16 px minimum on phones) |
| Content max | 72 rem; prose 38 rem |
| Breakpoints | `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 (phone stage splits) · `2xl` 1536 · stage 1920 |
| Radius | xs 8 · sm 12 · md 16 · lg 24 · xl 32 · phone 44 · pill 9999 (concentric: inner = outer − padding) |
| Touch target | ≥ 44×44 px; karigar phone ≥ 48×48; Haan/Na 64 px tall |
| Elevation | 0 canvas · 1 card (hairline, no shadow) · 2 translucent chrome · 3 sheet/modal (`--shadow-sheet` + backdrop) · device (`--shadow-device`) |

---

## 5. Components

The full inventory mapped to HeroUI is in [DESIGN.md §13](./DESIGN.md#13-component-inventory-heroui-v3). This section specifies the **custom** components and the HeroUI components whose usage is constrained.

### 5.1 `PillButton` (HeroUI `Button`)
| Variant | Fill | Text | Height | Use |
|---|---|---|---|---|
| `primary` | `--slate` | white | 44 (48 phone) | One per screen |
| `secondary` | `--bg-2`, hover `--card` | ink | 44 | Secondary actions |
| `outline` | transparent, 1 px `--control-edge` | ink | 44 | "Na", "Open as Jeweller" |
| `ghost` | transparent | indigo-800 | 40 | Tertiary, inline |
| `danger-outline` | transparent, 1 px `--red-600` | red-600 | 44 | "Raise dispute", "Revoke" |

States:
- `hover`: background transition 350 ms on `--ease-cw`.
- `pressed`: `scale(.97)` within 100 ms on pointer-down via `data-pressed`.
- `focus-visible`: `--shadow-focus` plus a 2 px `--focus` outline at 2 px offset.
- `disabled`: opacity .4 with `aria-disabled`; the tooltip says why.
- `loading`: the label stays, a `Spinner` replaces the icon, and the width is locked.

### 5.2 `GramFigure`
Props: `mg: number`, `kind: 'gross' | 'fine' | 'delta'`, `size: 'metric' | 'phone' | 'row'`, `state: 'settling' | 'stable' | 'final'`, `speakable?: boolean`.
- `settling`: ink-3 at 60% opacity with a ◌ indicator; `aria-live="off"`.
- `stable`: full ink with a 1 px gold-line underline; `aria-live="polite"` announces "40.00 grams, stable".
- `final`: no underline; part of the signed record.
- `delta`: sign with a true minus, ▲/▼, and a colour from status.
- It renders `<data value="40000">40.00 g</data>`, with milligrams as the machine value.

### 5.3 `ScaleWidget`
Anatomy:
- source chip (`Serial` / `Simulated`);
- the live `GramFigure`;
- a stability meter (800 ms ring);
- a `Tare` button and a "Place gold" **simulate** control (`Slider` plus quick-pick chips 10.00 / 25.00 / 40.00 g, demo only);
- a `Connect scale` button (Web Serial, Chrome only; hidden if `!('serial' in navigator)`).

States: `disconnected` · `connecting` · `settling` · `stable` · `error (port lost)` · `simulated`.

Rules:
- **No text input for weight.** In the demo, the simulate slider is labelled "Simulated: demo only".
- 2-person manual fallback (M-04 fallback): both parties type the same number. This exists only in v1, behind a flag.

### 5.4 `PhoneFrame`
- 390×844 logical size, scaled to fit the stage.
- Outer radius 44 px, 10 px bezel, a status bar with the time and a "Rafiq · বাংলা" label.
- Renders children in the karigar locale independent of the app locale (`NextIntlClientProvider locale={karigarLocale}`).
- In the hero, two frames are fanned ±6°.
- Never interactive in the hero (`inert`); always interactive on the stage.

### 5.5 `ReadbackPlayer` and `ConfirmPair`
- Shows a big `GramFigure size="phone"`, an order line, and a waveform of 24 bars driven by an `AnalyserNode` (static bars under reduced motion).
- 🔊 Replay is 48 px and plays automatically once on arrival (stage) or after a tap (v1).
- Sources: `live` (Sarvam Bulbul) or `cached` (pre-generated clip), shown as a tiny caption chip.
- `ConfirmPair`: "Haan" (primary, 64 px) and "Na" (outline, 64 px), stacked and full width.
- The microphone listens for "haan / हाँ / হ্যাঁ / ಹೌದು" only while the ring is active. The tap is always available.

### 5.6 `SignatureTicks`
Props: `count: 0 | 1 | 2`, `parties: [Person, Person]`, `animate?: boolean`, `size: 16 | 20 | 28`.
- SVG with two paths drawn on `spring.tick`, plus the halo on `count === 2` (600 ms bloom, once per event per session).
- `aria-label`: "Signed by Suresh Jewellers and Rafiq Sheikh" or "Signed by Suresh Jewellers. Waiting for Rafiq Sheikh".

### 5.7 `HashChip` and `ChainBadge`
- `HashChip`: DM Mono 12 px, `#a3f9…c21` (first 4 and last 3 hex characters). The tooltip shows the full SHA-256 and `prev_hash`. Copy on click.
- `ChainBadge`: "Chain verified · 42 events" with a link icon. Clicking re-runs `GET /v1/ledger` verification (API-08). Broken state: "Chain broken at event 17" in danger.

### 5.8 `VarianceBar` (HeroUI `Meter`)
- 0–200% of the allowed wastage.
- A norm tick at 100%.
- Fill is green-700 up to 100% and red-600 beyond, with a ▲.
- Label: "1.38 g used of 1.00 g allowed (2.50%)". The value text is always present (colour is never the only cue).

### 5.9 `AgentNote`
A HeroUI `Alert` with a 1 px hairline, a `sparkles`-free design (no AI sparkle cliché) and the caption "Draft by Tola agent · Lyzr · check before signing". It has a "Why?" disclosure that shows the deterministic numbers it explains. Status: `live` / `cached` (shows "Cached explanation" when `AI_FALLBACK_MODE=cached`).

### 5.10 `SettlementCard`
Anatomy:
- two `Avatar`s with `SignatureTicks` under each;
- rows: Gold balance (fine), Labour ₹, Dust credit, Net ₹;
- open disputes listed (they cannot be hidden);
- primary "Approve" (opens `ApproveDialog`);
- after both approve: `UpiQr`.

States: `draft` · `awaiting-jeweller` · `awaiting-karigar` · `approved` · `payment-simulated` · `blocked-by-dispute`.

### 5.11 `SimChip`
A dashed 1 px `--control-edge` border, a ◌ icon and the text "Simulated" (localized). Mandatory on `UpiQr`, the lender view, `ScaleWidget` in simulate mode, and the WhatsApp / IVR mock frames.

### 5.12 HeroUI components with usage constraints
| Component | Constraint |
|---|---|
| `AlertDialog` | Only for: approve settlement, confirm UPI, revoke passport |
| `NumberField` | Only for the wastage norm %, never for grams or ₹ amounts the system can compute |
| `Toast` | 4 s, top edge, pausable; one at a time; never for errors that need action (use inline `Alert`) |
| `Tooltip` | Never the only place important information lives (touch has no hover) |
| `Skeleton` | Only for the first load; never for re-fetches (keep the stale data visible) |
| `Drawer` | Wrapped as `TolaSheet` if velocity handoff is needed ([DESIGN.md §10.5](./DESIGN.md#105-sheets-sign-dispute-composer-approve-settlement)) |

---

## 6. Icons
`@gravity-ui/icons` 2.22.0 (HeroUI's icon set), sizes 16 / 20 / 24. The glyph map is in [DESIGN.md §11](./DESIGN.md#11-iconography-and-ornament). Rules:
- Icons are always paired with a label, except the replay button, which has an `aria-label`.
- No brand icons (no UPI app logos, no WhatsApp logo in the demo; the WhatsApp mock uses a generic chat frame labelled "WhatsApp (simulated)").
- Custom brand glyphs (Tola mark, tola weight, bench lamp) live in `src/components/brand/` with a 24×24 viewBox and a 1.5 stroke.

---

## 7. Motion
| Preset | Config | Use |
|---|---|---|
| `spring.ui` | `bounce 0, visualDuration .35` | Default |
| `spring.move` | `bounce 0, visualDuration .4` | Layout, gram flight x |
| `spring.arc` | `bounce 0, visualDuration .48` | Gram flight y |
| `spring.sheet` | `bounce 0, visualDuration .3` | Sheets by button |
| `spring.throw(v)` | `bounce .2, visualDuration .3, velocity v` | After a flick only |
| `spring.tick` | `bounce 0, visualDuration .3` | Tick draw |
| `tween.reveal` | `.7s, [.22,1,.36,1]` | Landing reveals |
| `tween.mask` | `.85s, stagger .055` | `MaskHeadline` |
| `tween.fade` | `.2s linear` | Reduced-motion replacement |
| CSS press | `scale(.97)`, 100 ms | All pressables |

Signature-moment choreography and sheet physics: [DESIGN.md §10](./DESIGN.md#10-motion).

---

## 8. Voice and tone
- **Numbers first, then the people, then the action:** "40.00 g to Rafiq. Waiting for his yes."
- **No blame:** "0.38 g above the agreed 2.50%" rather than "Rafiq lost 0.38 g".
- **No jargon:** "can't be changed now" rather than "immutable", "record" rather than "blockchain", "check" rather than "reconciliation run" (in karigar copy).
- **Label AI and simulations honestly.**
- **Second person** for the karigar ("you"); third person for the jeweller's view of the karigar.
- Bilingual examples are in [DESIGN.md §12](./DESIGN.md#12-voice-and-tone); full string rules are in [LOCALIZATION.md](./LOCALIZATION.md).

---

## 9. File layout (demo; extracted to `packages/ui` in scalable)
```
implementation/demo/web/src/
├─ styles/   index.css · tokens.css · base.css · materials.css · a11y.css · animations.css · components/heroui.css
├─ motion/   provider.tsx (LazyMotion + MotionConfig) · springs.ts · reveal.tsx (from Vakyam) · flight.tsx (gram flight)
├─ components/
│  ├─ brand/     TolaMark · TolaWeight · BenchLamp · Filigree
│  ├─ gram/      GramFigure · ScaleWidget · VarianceBar
│  ├─ ledger/    LedgerTable · SignatureTicks · HashChip · ChainBadge
│  ├─ phone/     PhoneFrame · ReadbackPlayer · ConfirmPair · WhatsAppMock · IvrMock
│  ├─ settle/    SettlementCard · UpiQr · GstDraftPreview
│  ├─ passport/  PassportCard · ShareSheet
│  ├─ shell/     RoleSwitcher · StoryRail · LanguageMenu · ThemeToggle · Nav
│  └─ ui/        PillButton · SimChip · AgentNote · EmptyState · TolaSheet
└─ lib/format.ts (formatGrams, formatFine, formatINR, formatDelta)
```

## 10. Quality gates (per component)
| Gate | Target | Tool |
|---|---|---|
| Contrast | All text ≥ 4.5:1, UI edges ≥ 3:1, light and dark | axe-core via Playwright 1.64 |
| Reduced motion | Every animated component has a reduced-motion story/test | Playwright `reducedMotion: 'reduce'` |
| RTL | Not required (no RTL languages in scope) | n/a |
| Text scaling | No clipping at 200% browser zoom and Android font scale 1.3 | Manual + Playwright screenshot |
| Gram rule | Every rendered weight matches `/^\d{1,3}(,\d{2})*(,\d{3})?\.\d{2} g$/` or the fine/delta forms | Vitest 5 unit test on `format.ts` + DOM lint |
