"""Property-based tests P1–P8 from `docs/TESTING.md §2`."""

from __future__ import annotations

import json
import random

import pytest
from hypothesis import given
from hypothesis import strategies as st

from tola_api.ledger_core.canonical import canonical_bytes
from tola_api.ledger_core.chain import GENESIS_HASH, compute_event_hash, verify_chain
from tola_api.ledger_core.reconcile import reconcile_order
from tola_api.ledger_core.settle import compute_settlement
from tola_api.ledger_core.signing import derive_demo_keypair, sign_event_hash, verify_sig
from tola_api.ledger_core.units import bp_of, fine_mg, format_grams


@given(
    issued=st.integers(min_value=1_000, max_value=200_000),
    returned_piece=st.integers(min_value=0, max_value=180_000),
    scrap=st.integers(min_value=0, max_value=10_000),
    dust=st.integers(min_value=0, max_value=5_000),
    norm_bp=st.sampled_from([250, 350, 400]),
    adj=st.integers(min_value=0, max_value=2_000),
)
def test_p1_conservation_of_gold(
    issued: int,
    returned_piece: int,
    scrap: int,
    dust: int,
    norm_bp: int,
    adj: int,
) -> None:
    allowed = bp_of(issued, norm_bp)
    stl = compute_settlement(
        karigar_id="p-rafiq",
        period_start="2026-10-12",
        period_end="2026-10-18",
        orders_closed=["#14"],
        opening_gold_with_karigar_mg=18_000,
        issued_mg=issued,
        returned_net_gold_mg=returned_piece,
        scrap_mg=scrap,
        dust_credit_mg=dust,
        allowed_wastage_mg=allowed,
        approved_adjustment_mg=adj,
        labour_paise=480_000,
    )
    assert issued == returned_piece + scrap + dust + allowed + adj + stl.carried_shortfall_mg


@given(st.floats(allow_nan=False, allow_infinity=False))
def test_p3_no_float_accepted(f: float) -> None:
    with pytest.raises(TypeError):
        fine_mg(f, 916)  # type: ignore[arg-type]
    with pytest.raises(TypeError):
        bp_of(f, 250)  # type: ignore[arg-type]


@given(
    chain_len=st.integers(min_value=1, max_value=12),
    tamper_idx=st.integers(min_value=0, max_value=11),
)
def test_p4_chain_tamper_pinpoints_broken_event(chain_len: int, tamper_idx: int) -> None:
    idx = tamper_idx % chain_len
    events = []
    prev = GENESIS_HASH
    for seq in range(1, chain_len + 1):
        payload = {"order": f"#{seq}", "gold_mg": seq * 1000}
        ev_hash = compute_event_hash(
            prev_hash=prev,
            seq=seq,
            event_type="ISSUE",
            timestamp="2026-10-12T10:00:00+05:30",
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
                "timestamp": "2026-10-12T10:00:00+05:30",
                "actor_id": "p-suresh",
                "karigar_id": "p-rafiq",
                "order_id": f"order-{seq}",
                "payload": payload,
                "prev_hash": prev,
                "event_hash": ev_hash,
            }
        )
        prev = ev_hash

    events[idx]["payload"] = {"order": f"#{idx + 1}", "gold_mg": (idx + 1) * 1000 + 1}
    res = verify_chain(events)
    assert res.valid is False
    assert res.broken_at == f"E{idx + 1}"


def test_p5_signature_cross_persona_rejection() -> None:
    personas = ["p-suresh", "p-lakshmi", "p-rafiq", "p-manju", "p-subrata"]
    digest = "a" * 64
    for a in personas:
        kp_a = derive_demo_keypair(a)
        sig_a = sign_event_hash(kp_a.seed_hex, digest)
        assert verify_sig(kp_a.pubkey_hex, digest, sig_a) is True
        for b in personas:
            if a != b:
                kp_b = derive_demo_keypair(b)
                assert verify_sig(kp_b.pubkey_hex, digest, sig_a) is False


@given(st.lists(st.integers(min_value=1, max_value=50_000), min_size=3, max_size=8))
def test_p7_reconcile_permutation_invariance(weights: list[int]) -> None:
    inputs = [(f"order-{i}", f"#{i}", w, max(0, w - 500)) for i, w in enumerate(weights, start=1)]
    rows_a = [
        reconcile_order(oid, code, "p-rafiq", iss, ret, 0, 0, 250).to_story_row()
        for oid, code, iss, ret in inputs
    ]
    shuffled = list(inputs)
    random.Random(42).shuffle(shuffled)
    rows_b = [
        reconcile_order(oid, code, "p-rafiq", iss, ret, 0, 0, 250).to_story_row()
        for oid, code, iss, ret in shuffled
    ]
    assert sorted(rows_a, key=lambda r: str(r["order"])) == sorted(rows_b, key=lambda r: str(r["order"]))


@given(st.integers(min_value=0, max_value=999_999_999))
def test_p8_grams_format_roundtrip(mg: int) -> None:
    formatted = format_grams(mg)
    assert formatted.endswith(" g")
    whole, frac = formatted[:-2].split(".")
    parsed = int(whole) * 1000 + int(frac)
    assert parsed == mg
    assert canonical_bytes({"mg": parsed}) == json.dumps({"mg": mg}, separators=(",", ":")).encode()
