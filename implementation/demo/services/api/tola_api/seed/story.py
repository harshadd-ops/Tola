"""Typed reader and helpers over `seed/story.json`."""

from __future__ import annotations

import functools
import json
from typing import Any

from tola_api.config import settings


@functools.lru_cache(maxsize=1)
def get_story_data() -> dict[str, Any]:
    path = settings.seed_dir / "story.json"
    return json.loads(path.read_text(encoding="utf-8"))


def get_story_step(step_id: str) -> dict[str, Any]:
    data = get_story_data()
    for step in data.get("steps", []):
        if step["id"] == step_id:
            return step
    raise KeyError(f"Unknown story step: {step_id}")


def normalize_step_id(to_step: str | int | None) -> str | None:
    if to_step is None:
        return None
    if isinstance(to_step, int):
        if to_step <= 0:
            return None
        return f"S{min(13, to_step):02d}"
    s = str(to_step).strip().upper()
    if not s or s in ("NONE", "0", "S00", "RESET"):
        return None
    if s.startswith("S") and s[1:].isdigit():
        num = int(s[1:])
        return None if num <= 0 else f"S{min(13, num):02d}"
    if s.isdigit():
        num = int(s)
        return None if num <= 0 else f"S{min(13, num):02d}"
    return s


def order_id_from_code(code: str) -> str:
    cleaned = code.strip()
    if cleaned.startswith("order-"):
        return cleaned
    if cleaned.startswith("#"):
        return f"order-{cleaned[1:]}"
    if cleaned.upper().startswith("ORD-"):
        num = int(cleaned.split("-")[1])
        return f"order-{num:02d}"
    if cleaned.isdigit():
        return f"order-{int(cleaned):02d}"
    return f"order-{cleaned.lower()}"
