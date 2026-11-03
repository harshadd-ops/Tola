#!/usr/bin/env bash
# Stage readiness verification script for the Tola demo track.
# Usage: ./scripts/stage-check.sh [API_URL] [WEB_URL]

set -euo pipefail

API_URL="${1:-http://localhost:8000}"
WEB_URL="${2:-http://localhost:3000}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEMO_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "=== Tola Stage Readiness Check ==="
echo "API_URL: ${API_URL}"
echo "WEB_URL: ${WEB_URL}"

echo "[1/4] Checking seed audio & AI cache files..."
for f in S03_readback_bn.mp3 S04_return_note_bn.webm S06_dispute_bn.webm S06_flag_bn.mp3 S07_proposal_bn.mp3; do
  if [[ ! -s "${DEMO_DIR}/seed/audio/${f}" ]]; then
    echo "FAIL: missing or empty seed/audio/${f}"
    exit 1
  fi
done
for f in S03_readback_bn.json S04_intake_bn.json S05_reconcile_en.json S06_dispute_bn.json S07_resolve_bn.json S08_settle_en.json; do
  if [[ ! -s "${DEMO_DIR}/seed/ai-cache/${f}" ]]; then
    echo "FAIL: missing or empty seed/ai-cache/${f}"
    exit 1
  fi
done
echo "  OK: all seed audio and AI cache assets present."

echo "[2/4] Checking API health at ${API_URL}/v1/health..."
HEALTH_JSON="$(curl -fsS "${API_URL}/v1/health")"
echo "  Response: ${HEALTH_JSON}"

echo "[3/4] Checking deterministic reset speed (< 1000 ms)..."
START_MS="$(python3 -c 'import time; print(int(time.time()*1000))' 2>/dev/null || python -c 'import time; print(int(time.time()*1000))')"
RESET_JSON="$(curl -fsS -X POST "${API_URL}/v1/demo/reset" -H "Content-Type: application/json" -d '{}')"
END_MS="$(python3 -c 'import time; print(int(time.time()*1000))' 2>/dev/null || python -c 'import time; print(int(time.time()*1000))')"
ELAPSED_MS=$((END_MS - START_MS))
echo "  Reset completed in ${ELAPSED_MS} ms: ${RESET_JSON}"
if (( ELAPSED_MS > 1000 )); then
  echo "WARN: Reset took ${ELAPSED_MS} ms (> 1000 ms target)"
fi

echo "[4/4] Reminder: Plug laptop into AC power, set browser zoom to 100%, press F11 on ${WEB_URL}/stage, and press Shift+R before going on stage."
echo "=== Stage Check PASSED ==="
