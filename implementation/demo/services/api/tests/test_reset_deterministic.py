"""Verify deterministic reset (`reset_to_step`) produces identical chain heads across runs."""

from __future__ import annotations

from tola_api.db import SessionLocal
from tola_api.seed.loader import (
    apply_step_s01,
    apply_step_s02,
    apply_step_s03,
    apply_step_s04,
    apply_step_s05,
    reset_to_step,
)


def test_two_resets_produce_identical_chain_heads() -> None:
    with SessionLocal() as db:
        r1 = reset_to_step(db, to_step=None)
        r2 = reset_to_step(db, to_step=None)
        assert r1["head_hash_rafiq"] == r2["head_hash_rafiq"]
        assert r1["events_count"] == r2["events_count"]


def test_fast_forward_s05_matches_manual_step_replay() -> None:
    with SessionLocal() as db:
        ff = reset_to_step(db, to_step="S05")

        reset_to_step(db, to_step=None)
        apply_step_s01(db)
        apply_step_s02(db)
        apply_step_s03(db)
        apply_step_s04(db)
        run = apply_step_s05(db)
        db.commit()

        from sqlalchemy import select

        from tola_api.models import LedgerEvent

        rafiq_head = db.scalar(
            select(LedgerEvent)
            .where(LedgerEvent.karigar_id == "p-rafiq")
            .order_by(LedgerEvent.seq.desc())
            .limit(1)
        )
        assert rafiq_head is not None
        assert rafiq_head.event_hash == ff["head_hash_rafiq"]
        assert run.flags_count == 1
