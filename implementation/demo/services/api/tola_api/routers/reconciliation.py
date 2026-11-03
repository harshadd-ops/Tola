"""Weekly reconciliation run endpoints (`/v1/reconciliation/runs`)."""

from __future__ import annotations

import json
from typing import Any

from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from tola_api.ai.fallback import with_fallback
from tola_api.ai.lyzr_client import run_lyzr_agent
from tola_api.ai.templates import template_reconcile_explanation
from tola_api.db import get_db
from tola_api.ledger_core.reconcile import robust_z_score_x100
from tola_api.models import Order, ReconciliationRun
from tola_api.schemas import ReconcileRunCreate
from tola_api.seed.loader import apply_step_s05

router = APIRouter(prefix="/v1/reconciliation", tags=["reconciliation"])


def _serialize_run(db: Session, run: ReconciliationRun, source: str = "cached") -> dict[str, object]:
    rows = json.loads(run.rows_json)
    hist_orders = db.scalars(
        select(Order).where(Order.karigar_id == "p-rafiq", Order.is_history.is_(True))
    ).all()
    hist_variances: list[int] = []
    for ho in hist_orders:
        if ho.return_net_gold_mg is not None:
            ret_tot = ho.return_net_gold_mg + (ho.return_scrap_mg or 0) + (ho.return_dust_mg or 0)
            loss = ho.target_gross_mg - ret_tot
            allowed = (ho.target_gross_mg * ho.norm_bp) // 10000
            hist_variances.append(loss - allowed)

    z_x100 = robust_z_score_x100(380, hist_variances)

    return {
        "id": run.id,
        "shop_id": run.shop_id,
        "week": run.week,
        "ran_at": run.ran_at,
        "orders_checked": run.orders_checked,
        "flags_count": run.flags_count,
        "rows": rows,
        "explanation": run.explanation,
        "statistical_context": {
            "karigar_id": "p-rafiq",
            "history_orders_count": len(hist_variances),
            "robust_z_x100": z_x100,
            "summary": "First over-norm order in Rafiq's last 15 completed orders.",
        },
        "source": source if not run.cached else "cached",
        "cached": run.cached,
    }


@router.post("/runs", status_code=201)
def create_reconciliation_run(
    body: ReconcileRunCreate | None = Body(default=None),
    db: Session = Depends(get_db),
) -> dict[str, object]:
    run = apply_step_s05(db)

    def _live() -> dict[str, Any]:
        return run_lyzr_agent(
            "reconcile",
            {"rows": json.loads(run.rows_json)},
            session_id="demo-S05",
        )

    def _tpl() -> dict[str, Any]:
        return {"explanation_en": template_reconcile_explanation()}

    ai_res = with_fallback(
        cache_key="s05_reconcile_explain",
        live_fn=_live,
        template_fn=_tpl,
        timeout_ms=6000,
    )
    explanation = str(ai_res.value.get("explanation_en") or ai_res.value.get("text") or run.explanation)
    run.explanation = explanation
    run.cached = ai_res.source != "live"
    db.commit()
    return _serialize_run(db, run, source=ai_res.source)


@router.get("/runs/{run_id}")
def get_reconciliation_run(run_id: str, db: Session = Depends(get_db)) -> dict[str, object]:
    run = db.get(ReconciliationRun, run_id)
    if not run:
        raise HTTPException(status_code=404, detail=f"ReconciliationRun '{run_id}' not found")
    return _serialize_run(db, run)
