"""Unit and Hypothesis property tests for canonical JSON, hash chain, and Ed25519 signing."""

from __future__ import annotations

import json

import pytest
from hypothesis import given
from hypothesis import strategies as st

from tola_api.ledger_core.canonical import canonical_bytes
from tola_api.ledger_core.chain import GENESIS_HASH, compute_event_hash, verify_chain
from tola_api.ledger_core.signing import derive_demo_keypair, sign_event_hash, verify_sig


def test_canonical_json_rejects_floats() -> None:
    with pytest.raises(TypeError):
        canonical_bytes({"gold_mg": 40.0})
    with pytest.raises(TypeError):
        canonical_bytes({"nested": [1, 2.5]})


def test_canonical_json_sorted_and_compact() -> None:
    raw = canonical_bytes({"b": 2, "a": 1})
    assert raw == b'{"a":1,"b":2}'


def test_chain_and_signatures_detect_tamper() -> None:
    j_kp = derive_demo_keypair("p-suresh")
    k_kp = derive_demo_keypair("p-rafiq")
    pubkeys = {
        "p-suresh": j_kp.pubkey_hex,
        "p-rafiq": k_kp.pubkey_hex,
    }

    events = []
    prev = GENESIS_HASH
    for seq in range(1, 5):
        payload = {"order": f"#{seq}", "gold_mg": seq * 10_000, "fineness": 916}
        ev_hash = compute_event_hash(
            prev_hash=prev,
            seq=seq,
            event_type="ISSUE",
            timestamp=f"2026-10-12T10:0{seq}:00+05:30",
            actor_id="p-suresh",
            karigar_id="p-rafiq",
            order_id=f"order-{seq}",
            payload=payload,
        )
        events.append(
            {
                "id": f"E{seq}",
                "seq": seq,
                "event_type": "ISSUE",
                "timestamp": f"2026-10-12T10:0{seq}:00+05:30",
                "actor_id": "p-suresh",
                "jeweller_signer_id": "p-suresh",
                "karigar_id": "p-rafiq",
                "order_id": f"order-{seq}",
                "payload": payload,
                "prev_hash": prev,
                "event_hash": ev_hash,
                "jeweller_sig": sign_event_hash(j_kp.seed_hex, ev_hash),
                "karigar_sig": sign_event_hash(k_kp.seed_hex, ev_hash),
            }
        )
        prev = ev_hash

    ok = verify_chain(events, pubkeys_by_person=pubkeys, require_dual_signatures=True)
    assert ok.valid is True
    assert ok.checked == 4

    # Flip weight in E2
    tampered = [dict(e, payload=dict(e["payload"])) for e in events]
    tampered[1]["payload"]["gold_mg"] += 1
    bad = verify_chain(tampered, pubkeys_by_person=pubkeys, require_dual_signatures=True)
    assert bad.valid is False
    assert bad.broken_at == "E2"
    assert bad.broken_seq == 2
    assert bad.reason == "hash_mismatch"

    # Cross-persona signature never verifies
    assert verify_sig(k_kp.pubkey_hex, events[0]["event_hash"], events[0]["jeweller_sig"]) is False


@given(
    st.dictionaries(
        keys=st.text(min_size=1, max_size=8),
        values=st.integers(min_value=-1_000_000, max_value=1_000_000),
        max_size=10,
    )
)
def test_canonical_idempotent_roundtrip(d: dict[str, int]) -> None:
    b1 = canonical_bytes(d)
    b2 = canonical_bytes(json.loads(b1.decode("utf-8")))
    assert b1 == b2
