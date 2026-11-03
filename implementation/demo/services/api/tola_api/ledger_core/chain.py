"""SHA-256 hash chain computation and verification for each shop-karigar pair."""

from __future__ import annotations

import hashlib
from collections.abc import Sequence
from dataclasses import dataclass
from typing import Any

from tola_api.ledger_core.canonical import canonical_bytes
from tola_api.ledger_core.signing import verify_sig

GENESIS_HASH = "0" * 64


def compute_event_hash(
    prev_hash: str,
    seq: int,
    event_type: str,
    timestamp: str,
    actor_id: str,
    karigar_id: str,
    order_id: str | None,
    payload: dict[str, Any],
) -> str:
    """Compute the SHA-256 hex digest of the canonical envelope for a ledger event."""
    if type(seq) is not int or seq < 1:
        raise ValueError(f"seq must be int >= 1, got {seq!r}")
    if len(prev_hash) != 64:
        raise ValueError(f"prev_hash must be 64 hex chars, got {prev_hash!r}")
    envelope = {
        "prev_hash": prev_hash,
        "seq": seq,
        "event_type": event_type,
        "timestamp": timestamp,
        "actor_id": actor_id,
        "karigar_id": karigar_id,
        "order_id": order_id,
        "payload": payload,
    }
    return hashlib.sha256(canonical_bytes(envelope)).hexdigest()


@dataclass(frozen=True)
class ChainCheck:
    valid: bool
    broken_at: str | None = None
    broken_seq: int | None = None
    reason: str | None = None
    checked: int = 0


def verify_chain(
    events: Sequence[dict[str, Any]],
    pubkeys_by_person: dict[str, str] | None = None,
    require_dual_signatures: bool = False,
) -> ChainCheck:
    """Walk a karigar's event sequence from genesis and verify hashes, links, and signatures."""
    prev = GENESIS_HASH
    for idx, ev in enumerate(events, start=1):
        ev_id = str(ev.get("id", f"seq-{idx}"))
        seq = ev.get("seq")
        if seq != idx:
            return ChainCheck(
                valid=False,
                broken_at=ev_id,
                broken_seq=idx,
                reason="seq_gap",
                checked=idx - 1,
            )
        if ev.get("prev_hash") != prev:
            return ChainCheck(
                valid=False,
                broken_at=ev_id,
                broken_seq=idx,
                reason="prev_hash_mismatch",
                checked=idx - 1,
            )
        expected = compute_event_hash(
            prev_hash=ev["prev_hash"],
            seq=ev["seq"],
            event_type=ev["event_type"],
            timestamp=ev["timestamp"],
            actor_id=ev["actor_id"],
            karigar_id=ev["karigar_id"],
            order_id=ev.get("order_id"),
            payload=ev["payload"],
        )
        if ev.get("event_hash") != expected:
            return ChainCheck(
                valid=False,
                broken_at=ev_id,
                broken_seq=idx,
                reason="hash_mismatch",
                checked=idx - 1,
            )

        if require_dual_signatures:
            if not ev.get("jeweller_sig") or not ev.get("karigar_sig"):
                return ChainCheck(
                    valid=False,
                    broken_at=ev_id,
                    broken_seq=idx,
                    reason="missing_signature",
                    checked=idx - 1,
                )

        if pubkeys_by_person:
            j_signer = ev.get("jeweller_signer_id") or ev.get("actor_id")
            k_signer = ev.get("karigar_id")
            j_sig = ev.get("jeweller_sig")
            k_sig = ev.get("karigar_sig")
            if j_sig and j_signer in pubkeys_by_person:
                if not verify_sig(pubkeys_by_person[j_signer], expected, j_sig):
                    return ChainCheck(
                        valid=False,
                        broken_at=ev_id,
                        broken_seq=idx,
                        reason="bad_jeweller_signature",
                        checked=idx - 1,
                    )
            if k_sig and k_signer in pubkeys_by_person:
                if not verify_sig(pubkeys_by_person[k_signer], expected, k_sig):
                    return ChainCheck(
                        valid=False,
                        broken_at=ev_id,
                        broken_seq=idx,
                        reason="bad_karigar_signature",
                        checked=idx - 1,
                    )

        prev = expected

    return ChainCheck(valid=True, checked=len(events))
