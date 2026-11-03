"""Deterministic canonical JSON serialization (RFC 8785 subset).

Sorted keys, no whitespace, UTF-8, and strict rejection of floating-point numbers
anywhere in the payload tree.
"""

from __future__ import annotations

import json
from typing import Any


def _assert_no_floats(value: Any, path: str = "$") -> None:
    if type(value) is float:
        raise TypeError(f"Floats are forbidden in canonical ledger JSON at {path}: {value!r}")
    if isinstance(value, dict):
        for k, v in value.items():
            if not isinstance(k, str):
                raise TypeError(f"Dictionary keys must be strings at {path}: {k!r}")
            _assert_no_floats(v, f"{path}.{k}")
    elif isinstance(value, (list, tuple)):
        for idx, item in enumerate(value):
            _assert_no_floats(item, f"{path}[{idx}]")


def canonical_bytes(obj: Any) -> bytes:
    """Serialize `obj` to canonical UTF-8 JSON bytes with sorted keys and no whitespace."""
    _assert_no_floats(obj)
    return json.dumps(
        obj,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
        allow_nan=False,
    ).encode("utf-8")
