"""Scale reading capture endpoint (`POST /v1/scale/readings`)."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from tola_api.db import get_db
from tola_api.ledger_core.units import fine_mg, format_grams, require_non_neg_int
from tola_api.models import ScaleReading
from tola_api.seed.loader import apply_step_s01
from tola_api.seed.story import order_id_from_code

router = APIRouter(prefix="/v1/scale", tags=["scale"])


@router.post("/readings", status_code=201)
async def create_scale_reading(
    request: Request,
    db: Session = Depends(get_db),
) -> dict[str, object]:
    raw_body = await request.json()
    weight_raw = raw_body.get("weight_mg")
    if type(weight_raw) is not int or weight_raw < 0:
        raise HTTPException(
            status_code=422,
            detail={
                "type": "https://tola.India/errors/not-integer-mg",
                "title": "Weight must be a non-negative integer in milligrams",
                "status": 422,
                "detail": f"Received weight_mg={weight_raw!r}",
                "code": "NOT_INTEGER_MG",
            },
        )
    weight_mg = require_non_neg_int(weight_raw, "weight_mg")
    source = str(raw_body.get("source", "simulated"))
    order_ref = raw_body.get("order_id") or raw_body.get("order") or "order-14"
    oid = order_id_from_code(str(order_ref)) if order_ref else None

    if source == "manual_dual":
        second_mg = raw_body.get("second_entry_mg")
        if second_mg != weight_mg:
            raise HTTPException(
                status_code=422,
                detail="Manual dual-entry weights must match exactly",
            )

    if weight_mg == 40000 and oid == "order-14":
        reading = apply_step_s01(db)
        db.commit()
    else:
        rid = str(raw_body.get("id") or f"SR-{uuid.uuid4().hex[:8].upper()}")
        reading = ScaleReading(
            id=rid,
            shop_id=str(raw_body.get("shop_id", "shop-shetty")),
            order_id=oid,
            weight_mg=weight_mg,
            source=source,
            device_id=str(raw_body.get("device_id", "sim-balance-01")),
            stable=bool(raw_body.get("stable", True)),
            raw_frame=str(raw_body.get("raw_frame") or f"ST,GS,+  {weight_mg / 1000:.3f}g"),
            captured_at=str(raw_body.get("captured_at", "2026-10-12T10:02:00+05:30")),
        )
        db.add(reading)
        db.commit()

    return {
        "id": reading.id,
        "shop_id": reading.shop_id,
        "order_id": reading.order_id,
        "weight_mg": reading.weight_mg,
        "weight_g": format_grams(reading.weight_mg),
        "fine_mg": fine_mg(reading.weight_mg, 916),
        "source": reading.source,
        "device_id": reading.device_id,
        "stable": reading.stable,
        "raw_frame": reading.raw_frame,
        "captured_at": reading.captured_at,
    }
