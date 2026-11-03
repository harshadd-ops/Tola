"""3-mode AI fallback orchestrator (`live` -> `cached` -> `template`)."""

from __future__ import annotations

import time
from collections.abc import Callable
from concurrent.futures import ThreadPoolExecutor
from concurrent.futures import TimeoutError as FuturesTimeoutError
from dataclasses import dataclass
from typing import Any, Literal

from tola_api.ai.cache import read_ai_cache
from tola_api.config import settings

AiSource = Literal["live", "cached", "template"]


@dataclass(frozen=True)
class FallbackResult:
    value: dict[str, Any]
    source: AiSource
    latency_ms: int


def with_fallback(
    *,
    cache_key: str,
    live_fn: Callable[[], dict[str, Any]] | None,
    template_fn: Callable[[], dict[str, Any]],
    timeout_ms: int = 3500,
) -> FallbackResult:
    start = time.perf_counter()
    mode = settings.ai_fallback_mode

    if mode == "off":
        val = template_fn()
        elapsed = int((time.perf_counter() - start) * 1000)
        return FallbackResult(value=val, source="template", latency_ms=elapsed)

    if mode == "live" and live_fn is not None:
        has_keys = bool(settings.lyzr_api_key or settings.sarvam_api_key)
        if has_keys:
            try:
                with ThreadPoolExecutor(max_workers=1) as pool:
                    fut = pool.submit(live_fn)
                    val = fut.result(timeout=timeout_ms / 1000.0)
                elapsed = int((time.perf_counter() - start) * 1000)
                return FallbackResult(value=val, source="live", latency_ms=elapsed)
            except (FuturesTimeoutError, Exception):
                pass

    cached = read_ai_cache(cache_key)
    if cached is not None:
        elapsed = int((time.perf_counter() - start) * 1000)
        return FallbackResult(value=cached, source="cached", latency_ms=elapsed)

    val = template_fn()
    elapsed = int((time.perf_counter() - start) * 1000)
    return FallbackResult(value=val, source="template", latency_ms=elapsed)
