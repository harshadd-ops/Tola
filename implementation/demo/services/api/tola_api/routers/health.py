"""Health check endpoint (`GET /v1/health` and `/healthz`)."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from tola_api.config import settings
from tola_api.db import get_db
from tola_api.ledger_core.chain import GENESIS_HASH
from tola_api.models import DemoState, LedgerEvent, Person

router = APIRouter(tags=["health"])


@router.get("/v1/health")
@router.get("/healthz")
def get_health(db: Session = Depends(get_db)) -> dict[str, object]:
    db.execute(text("SELECT 1"))
    persons = db.scalars(select(Person).where(Person.role == "karigar")).all()
    chain_heads: dict[str, str] = {}
    for p in persons:
        last_ev = db.scalar(
            select(LedgerEvent)
            .where(LedgerEvent.karigar_id == p.id)
            .order_by(LedgerEvent.seq.desc())
            .limit(1)
        )
        chain_heads[p.id] = last_ev.event_hash if last_ev else GENESIS_HASH

    st = db.get(DemoState, "current_step")
    return {
        "status": "ok",
        "service": "tola-demo-api",
        "version": "0.1.0",
        "ai_mode": settings.ai_fallback_mode,
        "db": "ok",
        "current_step": st.value if st else "S01",
        "chain_heads": chain_heads,
    }
