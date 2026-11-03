# Environment Setup (demo build)
> Project: Tola · Owner: Tech lead (demo track) · Status: Draft v0.1 · Last updated: 2026-10-20
> Related: [README](../README.md) · [Back end](./BACKEND.md) · [Front end](./FRONTEND.md) · [Testing](./TESTING.md) · [Deployment](./DEPLOYMENT.md) · [Project brief §10](../../../docs/00-overview/PROJECT_BRIEF.md)

Goal: from a clean machine to `/stage` running in **≤ 15 minutes**.

## 1. Requirements
| Tool | Version | Check |
|---|---|---|
| Node.js | **22.12+** (Vitest 5 requires `^22.12.0 \|\| ^24 \|\| >=26`; Next 16 requires ≥ 20.9) | `node -v` |
| npm | ships with Node 22 | `npm -v` |
| Python | **3.12+** | `python --version` (Windows) / `python3 --version` |
| uv (recommended) or pip | uv latest / pip ≥ 24 | `uv --version` |
| Git | any recent | `git --version` |
| Docker (optional) | Docker Desktop / Engine with Compose v2 | `docker compose version` |
| Chrome or Edge | current | needed for Web Serial and the stage |

## 2. Install the toolchain
**Windows 11** (PowerShell):
```powershell
winget install OpenJS.NodeJS.LTS        # make sure the result is 22.12 or newer: node -v
winget install Python.Python.3.12
winget install astral-sh.uv
winget install Git.Git
# optional
winget install Docker.DockerDesktop
```
Git Bash works for every command in these docs. In PowerShell, use `copy` instead of `cp` and activate the venv with `.venv\Scripts\Activate.ps1`.

**macOS** (Homebrew):
```bash
brew install node@22 python@3.12 uv git
brew install --cask docker   # optional
```

**Linux** (Ubuntu 24.04):
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt-get install -y nodejs
sudo apt-get install -y python3.12 python3.12-venv git
curl -LsSf https://astral.sh/uv/install.sh | sh
```

## 3. Configure
```bash
cd implementation/demo
cp .env.example .env                    # read by the API (pydantic-settings) and docker compose
cp .env.example apps/web/.env.local     # Next.js reads NEXT_PUBLIC_* from here
```
| Variable | Needed for | Default in the demo |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | web → api | `http://localhost:8000` |
| `NEXT_PUBLIC_DEMO_MODE` | persona chips, stepper, labels | `1` |
| `DATABASE_URL` | API | `sqlite:///./tola-demo.db` |
| `AI_FALLBACK_MODE` | API | `cached` (no keys needed) |
| `LYZR_API_KEY`, `LYZR_AGENT_ID_MANAGER`, `LYZR_AGENT_ID_INTAKE`, `LYZR_AGENT_ID_RECONCILE`, `LYZR_AGENT_ID_SETTLE` | live agents | empty |
| `SARVAM_API_KEY` | live TTS/STT | empty |
| `TOLA_SERVER_SIGNING_KEY` | server signatures | empty → demo key + warning |
| `TOLA_UPI_VPA`, `TOLA_UPI_PAYEE_NAME` | simulated UPI URI | `rafiq.demo@upi`, `Rafiq Sheikh (demo)` |

Live AI: Sarvam's free credits (₹100 per the brief) and Lyzr's free build tier are enough for rehearsals. Keep stage runs on `cached` unless the venue network is proven.

## 4. Run the API
With uv:
```bash
cd services/api
uv sync --extra dev
uv run tola-seed --reset
uv run uvicorn tola_api.main:app --reload --port 8000
```
With pip:
```bash
cd services/api
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\Activate.ps1
pip install -e ".[dev]"
tola-seed --reset
uvicorn tola_api.main:app --reload --port 8000
```
Check: `curl http://localhost:8000/v1/health` returns `"status":"ok"`. The OpenAPI UI is at http://localhost:8000/docs.

## 5. Run the web app
```bash
cd apps/web
npm install           # first time; commits package-lock.json
npm run dev           # http://localhost:3000
```
Open http://localhost:3000/stage. Press **Shift+R** to reset the week.

## 6. Optional extras
- **Playwright browsers:** `npm run e2e:install`.
- **Real serial balance:** connect it over USB serial (or a USB-RS232 adapter). In Chrome, press **S** on `/stage` and pick the port. Windows may need the adapter vendor's driver. Balance output formats vary and are not verified per model, so set the parser regex in the scale settings popover.
- **Phone mirror:** find the laptop IP (`ipconfig` / `ip a`). Run `npm run dev -- --hostname 0.0.0.0`, set `NEXT_PUBLIC_API_URL=http://<ip>:8000`, start uvicorn with `--host 0.0.0.0`, then open `http://<ip>:3000/karigar?as=rafiq` on the phone. The microphone requires HTTPS or localhost, so on a LAN IP the phone mirror uses cached voice clips.
- **Re-bake the AI cache** (live keys required): `uv run python ../../scripts/bake_audio.py` and `uv run python ../../scripts/bake_ai_cache.py`. Commit the outputs under `seed/`.

## 7. Troubleshooting
| Symptom | Fix |
|---|---|
| `EBADENGINE` from vitest | Node older than 22.12; upgrade |
| Fonts look like Times / Arial | `npm install` did not finish; Fontsource packages are missing |
| CORS error in the console | `NEXT_PUBLIC_API_URL` does not match the API origin; restart `npm run dev` after editing `.env.local` |
| `sqlite3.OperationalError: database is locked` | Two uvicorn processes share the file; stop one |
| Web Serial button missing | Firefox/Safari, or a non-secure origin; use Chrome/Edge on localhost |
| Bengali shows boxes | Noto Sans Bengali is not loaded; check `layout.tsx` imports `@fontsource/noto-sans-bengali` |
