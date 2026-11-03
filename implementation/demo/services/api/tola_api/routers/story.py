"""Story mode endpoints: one snapshot of the week, and one action per step.

`GET  /v1/demo/state`                  everything the stage needs, read-only.
`POST /v1/demo/steps/{step_id}/perform` performs one scripted step with the seed's exact payload.

Every perform goes through the same idempotent `apply_step_sNN` functions that `POST /v1/demo/reset`
uses to fast-forward, so a step performed live is byte-identical to the same step replayed (SC-5).
"""

from __future__ import annotations

import json
from typing import Any, Literal

from fastapi import APIRouter, Body, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from tola_api.config import settings
from tola_api.db import get_db
from tola_api.ledger_core.chain import verify_chain
from tola_api.ledger_core.units import fine_mg
from tola_api.models import (
    DemoState,
    Dispute,
    LedgerEvent,
    Order,
    PassportShare,
    PaymentIntent,
    Person,
    ReconciliationRun,
    ScaleReading,
    Settlement,
    VoiceNote,
)
from tola_api.seed.loader import (
    _reset_lock,
    apply_step_s01,
    apply_step_s02,
    apply_step_s03,
    apply_step_s04,
    apply_step_s05,
    apply_step_s06,
    apply_step_s07,
    apply_step_s09,
    apply_step_s10,
    approve_settlement_party,
    create_settlement_draft,
    mark_step_done,
    passport_summary_dict,
)

router = APIRouter(prefix="/v1/demo", tags=["demo"])

STEP_IDS = [f"S{n:02d}" for n in range(1, 14)]


class PerformRequest(BaseModel):
    party: Literal["jeweller", "karigar"] | None = None


def _event_view(ev: LedgerEvent) -> dict[str, Any]:
    payload: dict[str, Any] = json.loads(ev.payload_json)
    weight_mg = payload.get("gold_mg", payload.get("net_gold_mg", payload.get("gross_mg")))
    if ev.event_type == "ADJUSTMENT":
        weight_mg = payload.get("allowance_mg")
    elif ev.event_type == "DISPUTE_OPEN":
        weight_mg = payload.get("disputed_variance_mg")
    elif ev.event_type == "DISPUTE_RESOLVE":
        weight_mg = payload.get("resolved_variance_mg")
    elif ev.event_type == "SETTLEMENT":
        weight_mg = payload.get("carried_shortfall_mg")
    return {
        "id": ev.id,
        "seq": ev.seq,
        "type": ev.event_type,
        "order": payload.get("order") or (payload.get("orders") or [None])[0],
        "timestamp": ev.timestamp,
        "weight_mg": weight_mg,
        "jeweller_signed": bool(ev.jeweller_sig),
        "karigar_signed": bool(ev.karigar_sig),
        "sealed": bool(ev.jeweller_sig and ev.karigar_sig),
        "prev_hash": ev.prev_hash,
        "hash": ev.event_hash,
        "signer": ev.jeweller_signer_id,
    }


def _order_view(o: Order) -> dict[str, Any]:
    returned_total = None
    loss = None
    if o.return_net_gold_mg is not None:
        returned_total = o.return_net_gold_mg + (o.return_scrap_mg or 0) + (o.return_dust_mg or 0)
        loss = o.target_gross_mg - returned_total
    return {
        "id": o.id,
        "code": o.code,
        "title": o.title,
        "karigar_id": o.karigar_id,
        "type": o.order_type,
        "fineness": o.fineness,
        "norm_bp": o.norm_bp,
        "issued_mg": o.target_gross_mg,
        "issued_fine_mg": fine_mg(o.target_gross_mg, o.fineness),
        "allowed_mg": (o.target_gross_mg * o.norm_bp) // 10000,
        "piece_mg": o.return_net_gold_mg,
        "scrap_mg": o.return_scrap_mg,
        "dust_mg": o.return_dust_mg,
        "returned_total_mg": returned_total,
        "loss_mg": loss,
        "labour_paise": o.labour_paise,
        "issued_on": o.issued_on,
        "due_date": o.due_date,
        "returned_on": o.returned_on,
        "status": o.status,
    }


def build_state(db: Session) -> dict[str, Any]:
    st = db.get(DemoState, "current_step")
    current = st.value if st else "S00"
    done_n = int(current[1:])

    people = {p.id: p for p in db.scalars(select(Person)).all()}
    pubkeys = {pid: p.pubkey_hex for pid, p in people.items()}

    rafiq_rows = db.scalars(
        select(LedgerEvent).where(LedgerEvent.karigar_id == "p-rafiq").order_by(LedgerEvent.seq.asc())
    ).all()
    chain_input = [
        {
            "id": r.id,
            "seq": r.seq,
            "event_type": r.event_type,
            "timestamp": r.timestamp,
            "actor_id": r.actor_id,
            "karigar_id": r.karigar_id,
            "order_id": r.order_id,
            "payload": json.loads(r.payload_json),
            "prev_hash": r.prev_hash,
            "event_hash": r.event_hash,
            "jeweller_signer_id": r.jeweller_signer_id,
            "jeweller_sig": r.jeweller_sig,
            "karigar_sig": r.karigar_sig,
        }
        for r in rafiq_rows
    ]
    check = verify_chain(chain_input, pubkeys_by_person=pubkeys)

    orders = db.scalars(select(Order).where(Order.is_history.is_(False)).order_by(Order.code.asc())).all()
    readings = {r.id: r.weight_mg for r in db.scalars(select(ScaleReading)).all()}

    run = db.get(ReconciliationRun, "RUN-2026-W42")
    dispute = db.get(Dispute, "D-14")
    stl = db.get(Settlement, "SET-2026-W42-RAFIQ")
    pi = db.get(PaymentIntent, "PI-2026-W42-RAFIQ")
    share = db.get(PassportShare, "ps-rafiq-w42-demo0001a")
    voice = {v.id: v for v in db.scalars(select(VoiceNote)).all()}
    resolved_mg = dispute.resolved_variance_mg if dispute else None

    open_status = {"ISSUED", "IN_PROGRESS"}
    carried = json.loads(stl.summary_json)["carried_shortfall_mg"] if stl and stl.event_id else 0
    karigars = []
    for kid in ("p-rafiq", "p-manju", "p-subrata"):
        mine = [o for o in orders if o.karigar_id == kid]
        open_orders = [o for o in mine if o.status in open_status]
        person = people.get(kid)
        karigars.append(
            {
                "id": kid,
                "name": person.name if person else kid,
                "native_name": person.native_name if person else None,
                "orders_this_week": len(mine),
                "open_orders": [o.code for o in open_orders],
                "open_mg": sum(o.target_gross_mg for o in open_orders),
                "carried_mg": carried if kid == "p-rafiq" else 0,
                "flagged": [o.code for o in mine if o.status in {"FLAGGED", "DISPUTED"}],
            }
        )

    # "placeholder" until scripts/bake_audio.py writes real Bulbul read-backs and the team's recordings.
    source_file = settings.seed_dir / "audio" / "SOURCE"
    audio_source = source_file.read_text(encoding="utf-8").strip() if source_file.exists() else "placeholder"

    return {
        "last_done": current,
        "audio_source": audio_source,
        "karigars": karigars,
        "done": STEP_IDS[:done_n],
        "scale_readings": readings,
        "orders": [_order_view(o) for o in orders],
        "events": [_event_view(e) for e in rafiq_rows if not e.id.startswith("H-")],
        "chain": {
            "valid": check.valid,
            "length": check.checked,
            "head_hash": rafiq_rows[-1].event_hash if rafiq_rows else "0" * 64,
            "broken_at": check.broken_at,
        },
        "voice_notes": {
            vid: {
                "transcript": v.transcript,
                "extracted": json.loads(v.extracted_json),
                "confidence": v.confidence,
                "cached": v.cached,
            }
            for vid, v in voice.items()
        },
        "reconcile": (
            {
                "id": run.id,
                "week": run.week,
                "ran_at": run.ran_at,
                "rows": json.loads(run.rows_json),
                "explanation": run.explanation,
                "cached": run.cached,
            }
            if run
            else None
        ),
        "dispute": (
            {
                "id": dispute.id,
                "status": dispute.status,
                "disputed_mg": dispute.disputed_variance_mg,
                "allowance_mg": dispute.Allowance_mg,
                "resolved_mg": dispute.resolved_variance_mg,
                "resolved_fine_mg": None if resolved_mg is None else fine_mg(resolved_mg, 916),
                "messages": json.loads(dispute.messages_json),
                "opened_at": dispute.opened_at,
                "resolved_at": dispute.resolved_at,
            }
            if dispute
            else None
        ),
        "settlement": (
            {
                "id": stl.id,
                "status": stl.status,
                "jeweller_approved": stl.jeweller_approved,
                "karigar_approved": stl.karigar_approved,
                "sealed": bool(stl.jeweller_approved and stl.karigar_approved),
                "event_id": stl.event_id,
                "summary": json.loads(stl.summary_json),
                "narrative": stl.narrative,
            }
            if stl
            else None
        ),
        "payment": (
            {"id": pi.id, "amount_paise": pi.amount_paise, "upi_uri": pi.upi_uri, "status": pi.status}
            if pi
            else None
        ),
        "passport_preview": passport_summary_dict(),
        "passport": (
            {
                "token": share.token,
                "recipient": people["p-meera"].name if "p-meera" in people else share.recipient_id,
                "recipient_org": people["p-meera"].organization if "p-meera" in people else None,
                "scope": json.loads(share.scope_json),
                "summary": json.loads(share.summary_json),
                "created_at": share.created_at,
                "expires_at": share.expires_at,
                "revoked": share.revoked,
                "views": share.views,
            }
            if share
            else None
        ),
    }


@router.get("/state")
def get_state(db: Session = Depends(get_db)) -> dict[str, Any]:
    return build_state(db)


@router.post("/steps/{step_id}/perform")
def perform_step(
    step_id: str,
    body: PerformRequest | None = Body(default=None),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    sid = step_id.strip().upper()
    if sid not in STEP_IDS:
        raise HTTPException(status_code=404, detail=f"Unknown story step '{step_id}'")
    party = body.party if body else None

    with _reset_lock:
        if sid == "S01":
            apply_step_s01(db)
        elif sid == "S02":
            apply_step_s02(db)
        elif sid == "S03":
            apply_step_s03(db)
        elif sid == "S04":
            apply_step_s04(db)
        elif sid == "S05":
            apply_step_s05(db)
        elif sid == "S06":
            apply_step_s06(db)
        elif sid == "S07":
            apply_step_s07(db)
        elif sid == "S08":
            if party is None:
                create_settlement_draft(db)
            else:
                approve_settlement_party(db, party)
        elif sid == "S09":
            apply_step_s09(db)
        elif sid == "S10":
            share = apply_step_s10(db)
            share.revoked = False
        else:
            # S11 lender opens the link, S12 GST draft, S13 verify: read-only steps.
            apply_step_s10(db)
            if sid == "S11":
                share = db.get(PassportShare, "ps-rafiq-w42-demo0001a")
                if share is not None:
                    share.views += 1
            mark_step_done(db, sid)
        db.commit()
        return build_state(db)
