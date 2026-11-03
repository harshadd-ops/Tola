# Vakyam · Marketing & Public Health Site

A single-page marketing and clinical overview site for **Vakyam**, built with **React 19 + HeroUI v3 + Tailwind CSS v4 + TypeScript + Vite**.

> *"Others use AI to talk to patients. Vakyam lets patients talk back."*

## Visual Identity: Sarvam design language

- **Canvas**: warm off-white `#fcfcfc`, white cards with 1px `#f0f0f0` hairlines (no heavy shadows), text `#1f1f1f` / `#3d3d3d` / `#666`.
- **Colour as light**: the hero hangs a blurred ember → amber → periwinkle arc (`#F9730C → #FFB053 → #A5BBFC → #F4F7FF`); indigo (`#556adc`, `#212191`, `#3333cc`) is the working accent; slate `#2a2c33` pill buttons.
- **Typography**: Fraunces (display, Season Mix stand-in), Figtree (text, Matter stand-in), DM Mono (labels), Mukta for Devanagari. All self-hosted through Fontsource and subset by unicode-range: no third-party font requests, and the two hero fonts are preloaded.
- **Ornament**: original kolam-curl dividers, gradient botanical rosettes that peek on card hover, and a line-art mandala in the closing CTA.
- **Motion**: Motion for React (`motion/react`) via `LazyMotion` with async-loaded features and `MotionConfig reducedMotion="user"`; masked headline reveals, staggered card rises, scroll-linked Android device tilt, scroll-progress timeline, shared-axis tab transitions; CSS marquees with pause control.
- **Adapted open-source effects** (`src/components/fx/`, MIT, credited in each file): Amicro ARC card fan (hero Android screens), Amicro magnetic button and concentric pulse, Componentry eye tracking (gaze eyes in the keyboard demo) and flipping word swap (languages card), Smooth UI scroll-reveal paragraph (problem intro), Magic UI border beam (Vakyam cost card).
- **Components**: HeroUI v3 (Tabs, Accordion, Modal, Drawer, ToggleButtonGroup, Card, Avatar, ProgressBar, Kbd, Tooltip) themed via its CSS variables.
- **Accessibility**: keyboard navigation, visible indigo focus rings, 44px touch targets on mobile, semantic landmarks, full `prefers-reduced-motion` support, bilingual English / Marathi.

---

## Project Structure

```
landing/
├── index.html               Document shell: meta, OG/Twitter, manifest, theme bootstrap
├── public/                  Served as-is from the site root
│   ├── icons/               favicon.svg, icon-192.png, icon-512.png
│   ├── images/
│   │   ├── og.png           Social preview (1200x630)
│   │   ├── team/            Team portraits (WebP)
│   │   ├── recognition/     Hackathon photos + -sm thumbnails (WebP)
│   │   └── video/           Video posters and walkthrough frames (WebP)
│   ├── scripts/theme-init.js  Applies saved theme/language before first paint
│   ├── _headers             Security + cache headers (Netlify, Cloudflare Pages)
│   ├── robots.txt
│   └── site.webmanifest
├── src/
│   ├── main.tsx             Entry: self-hosted fonts, global styles, React root
│   ├── App.tsx              Page composition, section order
│   ├── config/site.ts       Video ids, contact email, team data
│   ├── i18n/
│   │   ├── index.tsx        Language + theme provider (useApp)
│   │   └── locales/         en.ts (source of truth for keys), mr.ts
│   ├── components/
│   │   ├── layout/          Navbar, Footer, Section primitives
│   │   ├── sections/        One file per page section, in page order
│   │   ├── mockups/         Landscape Android phone mockup, interactive eye keyboard
│   │   ├── media/           Click-to-load YouTube player
│   │   ├── brand/           Logo mark, kolam divider, corner motifs, mandala
│   │   ├── effects/         Adapted motion effects (credited, MIT)
│   │   └── ui/              Icons, voice ticker
│   ├── motion/              LazyMotion provider, reveal primitives
│   ├── hooks/               useMediaQuery / useIsNarrow
│   ├── lib/                 Small DOM helpers (button spotlight)
│   └── styles/
│       ├── index.css        Import order: Tailwind, HeroUI, then the files below
│       ├── tokens.css       Colour, type, radius, shadow and easing tokens
│       ├── base.css         Element defaults
│       ├── components/      One file per concern: layout, typography, surfaces, light, buttons, chips, nav, heroui
│       ├── a11y.css         Focus, skip link, contrast and transparency preferences
│       └── animations.css   Keyframes, marquees, reduced-motion overrides
├── vite.config.ts           @ alias, vendor chunks, hero font preload
├── vercel.json / netlify.toml  Host configuration
└── .env.example             VITE_SITE_URL
```

Imports use the `@/` alias for `src/` (for example `import { useApp } from '@/i18n'`), so files can move without breaking relative paths.

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start the local development server
npm run dev

# 3. Type-check and build static production bundle
npm run build

# 4. Preview the production build locally
npm run preview
```

---

## Configuration & Customization

1. **Videos, contact email and team**: edit [`src/config.ts`] (in the Vakyam repo: `src/config.ts`).
   - `DEMO_VIDEO_ID`: YouTube id of the product walkthrough (Demo section and every "Watch demo" button).
   - `PATIENT_VIDEO_ID`: YouTube id of the bedside field-trial short (Validation section).
   - `CONTACT_EMAIL`: address used by the final call to action.
   - `TEAM`: names, roles, domains, skills, photos, LinkedIn and email for each member.
2. **Photos**: team portraits live in `public/images/team/`, hackathon photos in `public/images/recognition/` (full size plus `-sm` thumbnails), video posters and frames in `public/images/video/`. All WebP.
3. **Site URL**: set `VITE_SITE_URL` in `.env` (for example `https://vakyam.in`, no trailing slash) so Open Graph, Twitter and canonical links are absolute.
4. **Open Graph image**: replace `public/images/og.png` (`1200x630`).

---

## Performance & Production Notes

- Scroll work is kept off the main thread: the navbar uses an IntersectionObserver sentinel (no scroll listener), scroll-linked transforms track 1:1 without springs, and looping effects run as compositor-only CSS (transform and opacity). Measured at 4x CPU throttle: no long tasks while scrolling.
- YouTube players load only after a press, from `youtube-nocookie.com`.
- Vendor code is split into long-cached chunks (`vendor-react`, `vendor-heroui`, `vendor-motion`).
- Security and cache headers ship with the build: `public/_headers` (Netlify, Cloudflare Pages) and `vercel.json` (Vercel). They set a strict Content-Security-Policy (only YouTube is allowed as a frame source), `nosniff`, `SAMEORIGIN`, a referrer policy YouTube embeds accept, HSTS, one-year immutable caching for `/assets/*` and revalidation for the page itself.
- `public/scripts/theme-init.js` runs before first paint so the saved theme and language never flash.

---

## Deploying

The site is served from the domain root (`base: '/'`).

**Vercel**: import the repository, set the Root Directory to `landing`. `vercel.json` already sets the build command, output directory and headers. Add `VITE_SITE_URL` under Environment Variables.

**Netlify**: set the base directory to `landing`. `netlify.toml` sets the build, and `public/_headers` is copied into `dist/`. Add `VITE_SITE_URL` in Site settings.

**Cloudflare Pages**: build command `npm run build`, output `dist`, root `landing`. `_headers` is picked up automatically.

**Any static host**: run `npm run build` and upload `dist/`. Recreate the headers from `public/_headers` in your server config.
