"""Orders endpoints (`GET /v1/orders`, `POST /v1/orders`, `GET /v1/orders/{id}`)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from tola_api.db import get_db
from tola_api.ledger_core.units import bp_of, fine_mg, require_non_neg_int
from tola_api.models import Dispute, LedgerEvent, Order, Person
from tola_api.schemas import CreateOrderBody
from tola_api.seed.story import order_id_from_code

router = APIRouter(prefix="/v1/orders", tags=["orders"])


def _serialize_order(db: Session, o: Order, persons_map: dict[str, Person]) -> dict[str, object]:
    karigar = persons_map.get(o.karigar_id)
    allowed_mg = bp_of(o.target_gross_mg, o.norm_bp)
    issued_fine = fine_mg(o.target_gross_mg, o.fineness)
    returned_total_mg = None
    actual_loss_mg = None
    variance_mg = None
    if o.return_net_gold_mg is not None:
        scrap = o.return_scrap_mg or 0
        dust = o.return_dust_mg or 0
        returned_total_mg = o.return_net_gold_mg + scrap + dust
        actual_loss_mg = o.target_gross_mg - returned_total_mg
        variance_mg = actual_loss_mg - allowed_mg

    return {
        "id": o.id,
        "code": o.code,
        "shop_id": o.shop_id,
        "karigar_id": o.karigar_id,
        "karigar_name": karigar.name if karigar else o.karigar_id,
        "karigar_native_name": karigar.native_name if karigar else "",
        "title": o.title,
        "order_type": o.order_type,
        "type": o.order_type,
        "fineness": o.fineness,
        "norm_bp": o.norm_bp,
        "target_gross_mg": o.target_gross_mg,
        "issued_gold_mg": o.target_gross_mg,
        "issued_fine_mg": issued_fine,
        "stone_mg": o.stone_mg,
        "allowed_wastage_mg": allowed_mg,
        "labour_paise": o.labour_paise,
        "labour_inr": o.labour_paise // 100,
        "issued_on": o.issued_on,
        "due_date": o.due_date,
        "returned_on": o.returned_on,
        "return_gross_mg": o.return_gross_mg,
        "return_net_gold_mg": o.return_net_gold_mg,
        "return_scrap_mg": o.return_scrap_mg,
        "return_dust_mg": o.return_dust_mg,
        "returned_total_mg": returned_total_mg,
        "actual_loss_mg": actual_loss_mg,
        "variance_mg": variance_mg,
        "occasion": o.occasion,
        "status": o.status,
        "is_history": o.is_history,
        "photo_url": o.photo_url,
    }


@router.get("")
def list_orders(
    karigar_id: str | None = Query(default=None, alias="karigarId"),
    include_history: bool = Query(default=False, alias="includeHistory"),
    db: Session = Depends(get_db),
) -> dict[str, object]:
    stmt = select(Order)
    if not include_history:
        stmt = stmt.where(Order.is_history.is_(False))
    if karigar_id:
        stmt = stmt.where(Order.karigar_id == karigar_id)
    orders = db.scalars(stmt.order_by(Order.code.asc())).all()
    persons_map = {p.id: p for p in db.scalars(select(Person)).all()}
    return {
        "orders": [_serialize_order(db, o, persons_map) for o in orders],
    }


@router.post("", status_code=201)
def create_order(body: CreateOrderBody, db: Session = Depends(get_db)) -> dict[str, object]:
    require_non_neg_int(body.target_gross_mg, "target_gross_mg")
    require_non_neg_int(body.labour_paise, "labour_paise")
    fineness = body.target_fineness_ppt or body.fineness
    norm_map = {"plain": 250, "studded": 350, "antique": 400}
    norm_bp = norm_map.get(body.order_type, 250)

    active_count = len(db.scalars(select(Order).where(Order.is_history.is_(False))).all())
    code = body.code or f"#{16 + active_count}"
    oid = body.id or order_id_from_code(code)

    order = Order(
        id=oid,
        code=code,
        shop_id=body.shop_id,
        karigar_id=body.karigar_id,
        title=body.title,
        order_type=body.order_type,
        fineness=fineness,
        norm_bp=norm_bp,
        target_gross_mg=body.target_gross_mg,
        stone_mg=body.stone_mg,
        labour_paise=body.labour_paise,
        issued_on=body.issued_on,
        due_date=body.due_date,
        returned_on=None,
        return_gross_mg=None,
        return_net_gold_mg=None,
        return_scrap_mg=None,
        return_dust_mg=None,
        occasion=body.occasion,
        status="DRAFT",
        is_history=False,
        photo_url=None,
    )
    db.add(order)
    db.commit()
    persons_map = {p.id: p for p in db.scalars(select(Person)).all()}
    return _serialize_order(db, order, persons_map)


@router.get("/{order_id_or_code}")
def get_order(order_id_or_code: str, db: Session = Depends(get_db)) -> dict[str, object]:
    oid = order_id_from_code(order_id_or_code)
    order = db.get(Order, oid) or db.scalar(select(Order).where(Order.code == order_id_or_code))
    if not order:
        raise HTTPException(status_code=404, detail=f"Order '{order_id_or_code}' not found")

    persons_map = {p.id: p for p in db.scalars(select(Person)).all()}
    events = db.scalars(
        select(LedgerEvent).where(LedgerEvent.order_id == order.id).order_by(LedgerEvent.seq.asc())
    ).all()
    dispute = db.scalar(select(Dispute).where(Dispute.order_id == order.id))

    data = _serialize_order(db, order, persons_map)
    data["events"] = [
        {
            "id": ev.id,
            "seq": ev.seq,
            "event_type": ev.event_type,
            "timestamp": ev.timestamp,
            "actor_id": ev.actor_id,
            "prev_hash": ev.prev_hash,
            "event_hash": ev.event_hash,
            "jeweller_sig": ev.jeweller_sig,
            "karigar_sig": ev.karigar_sig,
            "status": ev.status,
        }
        for ev in events
    ]
    data["dispute_id"] = dispute.id if dispute else None
    return data
