"""Read and write deterministic AI cache JSON and audio files under `seed/`."""

from __future__ import annotations

import base64
import hashlib
import json
from pathlib import Path
from typing import Any

from tola_api.config import settings
from tola_api.ledger_core.canonical import canonical_bytes

FILENAME_ALIASES: dict[str, str] = {
    "s03_readback_bn": "S03_readback_bn.json",
    "s04_intake_extract": "S04_intake_extract.json",
    "s05_reconcile_explain": "S05_reconcile_explain.json",
    "s06_dispute_extract": "S06_dispute_extract.json",
    "s08_settlement_narrative": "S08_settlement_narrative.json",
}

AUDIO_ALIASES: dict[str, str] = {
    "s03_readback_bn": "S03_readback_bn.mp3",
    "s04_return_note_bn": "S04_return_note_bn.webm",
    "s06_dispute_bn": "S06_dispute_bn.webm",
    "s07_resolution_readback_bn": "S07_resolution_readback_bn.mp3",
    "s08_settlement_readback_bn": "S08_settlement_readback_bn.mp3",
}


def compute_cache_hash(role: str, payload: dict[str, Any]) -> str:
    body = role.encode("utf-8") + b"\n" + canonical_bytes(payload)
    return hashlib.sha256(body).hexdigest()


def _cache_dir() -> Path:
    return settings.seed_dir / "ai-cache"


def _audio_dir() -> Path:
    return settings.seed_dir / "audio"


def read_ai_cache(cache_key: str) -> dict[str, Any] | None:
    cdir = _cache_dir()
    alias = FILENAME_ALIASES.get(cache_key.lower())
    candidates = []
    if alias:
        candidates.append(cdir / alias)
    candidates.append(cdir / f"{cache_key}.json")

    for path in candidates:
        if path.exists():
            return json.loads(path.read_text(encoding="utf-8"))
    return None


def read_audio_b64(clip_key: str) -> tuple[str | None, str | None]:
    adir = _audio_dir()
    alias = AUDIO_ALIASES.get(clip_key.lower())
    candidates = []
    if alias:
        candidates.append(adir / alias)
    candidates.append(adir / clip_key)
    for ext in (".mp3", ".webm", ".wav"):
        candidates.append(adir / f"{clip_key}{ext}")

    for path in candidates:
        if path.exists():
            raw = path.read_bytes()
            return base64.b64encode(raw).decode("ascii"), f"/v1/demo/audio/{path.name}"
    return None, None
