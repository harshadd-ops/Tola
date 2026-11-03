# Tola · तोला

**Two signatures on every gram.**

Tola is a gold job-work ledger that the jeweller and the karigar both sign.
- The scale captures the weight; nobody types it.
- The karigar confirms by voice in his own language.
- An AI agent reconciles the ledger every week.
- The karigar gets a **Work Passport**: proof of the gold he has handled honestly, which he can take to a lender.

> Built for **Tech4Bharat · GAVS Hackathon 2026**, Theme 2 Jeweltech, PS 2.2: *"Gold given to karigars for job-work is tracked on trust, and disputes follow."*

> 🎬 **Demo GIF placeholder:** issue 40.00 g → Bengali read-back → two ticks. Save it as `docs/02-design/reference/demo.gif`.
*(Record this GIF from the demo story mode before submission. Owner: Frontend lead, due 14 Dec 2026.)*

---

## The problem
- A karigar typically holds ₹4–5 lakh of a jeweller's gold against a notebook entry.
- Wastage is "agreed verbally" and settled at month end.
- At about ₹1.49 lakh per 10 g, a 1 g disagreement costs about ₹15,000, and the karigar, the weaker party, usually pays it.

No jewellery ERP gives the karigar his own account. Details and sources: [PROJECT_BRIEF](docs/00-overview/PROJECT_BRIEF.md).

## What Tola does
| | Feature |
|---|---|
| ⚖️ | **Scale-captured issue and return** (F-01, F-04). Weight comes from the balance, never typed. |
| 🔊 | **Voice read-back and confirm** (F-02) in Bengali, Hindi, Kannada or English. |
| ✍️ | **Two signatures, hash-chained** (F-03). An append-only ledger neither side can quietly edit. |
| 🧮 | **Weekly reconciliation agent** (F-05). Flags variance against the agreed wastage the same week. |
| 💬 | **Disputes stay open and visible** (F-06), with voice replies. |
| ✅ | **Two-tick settlement and UPI intent** (F-07), plus GST job-work drafts (F-09). |
| 🪪 | **Work Passport** (F-08). The karigar shares his record with a lender, on his terms. |

## Two builds, one design
| Track | Folder | What it is |
|---|---|---|
| **Demo** | [`implementation/demo`](implementation/demo/README.md) | A stage prototype: **no login**, a role switcher (Jeweller · Karigar · Lender) and a guided story through one week. Next.js 16 + HeroUI v3 + Tailwind 4 + Motion; FastAPI + SQLite. |
| **Scalable** | [`implementation/scalable`](implementation/scalable/README.md) | The production path: OTP auth, Postgres, offline-first PWA, WhatsApp/IVR, workers, GCP Mumbai. |

Product, design, architecture, AI, security and business docs are **shared** in [`docs/`](docs/).

## Quick start (demo)
```bash
git clone <repo> tola && cd tola/implementation/demo
cp .env.example .env            # optional: add LYZR_API_KEY / SARVAM_API_KEY; leave blank for cached mode
docker compose up               # web → http://localhost:3000 · api → http://localhost:8000/docs
```
Without Docker, see [demo ENVIRONMENT_SETUP](implementation/demo/docs/ENVIRONMENT_SETUP.md).

## Tech stack
![Next.js](https://img.shields.io/badge/Next.js-16.4-black) ![React](https://img.shields.io/badge/React-19.3-61dafb) ![HeroUI](https://img.shields.io/badge/HeroUI-v3.2-7828c8) ![Tailwind](https://img.shields.io/badge/Tailwind-4.3-38bdf8) ![Motion](https://img.shields.io/badge/Motion-14.4-ff0055) ![FastAPI](https://img.shields.io/badge/FastAPI-0.153-009688) ![Lyzr](https://img.shields.io/badge/Lyzr-agents-1f1f1f) ![Sarvam](https://img.shields.io/badge/Sarvam-Saaras%20%2F%20Bulbul-f9730c)

**AI Partner:** Lyzr (Manager → Intake / Reconcile / Settle agents). **Indic speech:** Sarvam. **Rule:** AI never does gram arithmetic; `ledger-core` does.

## Project structure
```
docs/                 shared docs (overview, product, design, engineering, AI, security, business, project)
api/openapi.yaml      the one API contract
implementation/demo/  stage prototype
implementation/scalable/  production path
.github/workflows/    path-filtered CI for each track
```
Full tree and reading orders: **[MAP.md](MAP.md)**.

## Docs index
[Brief](docs/00-overview/PROJECT_BRIEF.md) · [PRD](docs/01-product/PRD.md) · [Design](docs/02-design/DESIGN.md) · [Architecture](docs/03-engineering/ARCHITECTURE.md) · [API](docs/03-engineering/API_SPEC.md) · [Models](docs/04-ai/MODELS.md) · [Privacy](docs/06-security-compliance/PRIVACY.md) · [Pitch](docs/00-overview/PITCH.md) · [Hackathon plan](docs/00-overview/HACKATHON_PLAN.md)

## Team
Four STEM students. Roles and RACI are in [TEAM.md](docs/08-project/TEAM.md).

## Licence
MIT for code, CC BY 4.0 for docs. Final choice owner: team lead, by 15 Nov 2026; check the hackathon's participant IP terms first.
