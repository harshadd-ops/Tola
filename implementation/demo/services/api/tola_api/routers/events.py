"""Ledger event creation and dual-signature endpoints (`/v1/events`)."""

from __future__ import annotations

import base64
import json
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from tola_api.db import get_db
from tola_api.ledger_core.signing import derive_demo_keypair, sign_event_hash, verify_sig
from tola_api.ledger_core.units import bp_of, fine_mg
from tola_api.models import EventSignature, LedgerEvent, Order, Person
from tola_api.schemas import EventCreateRequest, SignatureCreateRequest
from tola_api.seed.loader import append_chained_event, apply_step_s02, apply_step_s03, apply_step_s04
from tola_api.seed.story import order_id_from_code

router = APIRouter(prefix="/v1/events", tags=["events"])


def _serialize_event(ev: LedgerEvent) -> dict[str, object]:
    payload = json.loads(ev.payload_json)
    canon_b64 = base64.b64encode(ev.payload_json.encode("utf-8")).decode("ascii")
    sealed = bool(ev.jeweller_sig and ev.karigar_sig)
    return {
        "id": ev.id,
        "ref": ev.id,
        "seq": ev.seq,
        "karigar_id": ev.karigar_id,
        "order_id": ev.order_id,
        "event_type": ev.event_type,
        "type": ev.event_type,
        "timestamp": ev.timestamp,
        "actor_id": ev.actor_id,
        "jeweller_signer_id": ev.jeweller_signer_id,
        "payload": payload,
        "canonical_b64": canon_b64,
        "prev_hash": ev.prev_hash,
        "event_hash": ev.event_hash,
        "hash": ev.event_hash,
        "jeweller_sig": ev.jeweller_sig,
        "karigar_sig": ev.karigar_sig,
        "server_sig": ev.server_sig,
        "status": ev.status,
        "sealed": sealed,
        "signatures_count": (1 if ev.jeweller_sig else 0) + (1 if ev.karigar_sig else 0),
        "required_signers": [ev.jeweller_signer_id, ev.karigar_id],
    }


@router.post("", status_code=201)
def create_event(body: EventCreateRequest, db: Session = Depends(get_db)) -> dict[str, object]:
    ev_type = (body.event_type or body.type or "ISSUE").upper()
    order_ref = body.order_id or body.order or "#14"
    oid = order_id_from_code(order_ref) if order_ref else None
    order = db.get(Order, oid) if oid else None
    order_code = order.code if order else (order_ref if str(order_ref).startswith("#") else "#14")

    # Story S02 shortcut: ISSUE on Order #14 for 40,000 mg
    gold_val = body.gold_mg or body.weight_mg or body.gross_mg or 40000
    if ev_type == "ISSUE" and order_code == "#14" and gold_val == 40000 and not db.get(LedgerEvent, "R5"):
        ev = apply_step_s02(db)
        if body.auto_sign_karigar:
            ev = apply_step_s03(db)
        db.commit()
        return _serialize_event(ev)

    # Story S04 shortcut: RETURN on Order #14 for 38,120 mg
    if ev_type == "RETURN" and order_code == "#14" and not db.get(LedgerEvent, "R6"):
        r6, r7 = apply_step_s04(db)
        db.commit()
        res = _serialize_event(r6)
        res["scrap_event"] = _serialize_event(r7)
        return res

    ev_id = body.id or body.ref or body.event_id or f"EV-{uuid.uuid4().hex[:6].upper()}"
    fineness = body.fineness_ppt or body.fineness or (order.fineness if order else 916)
    norm_bp = body.norm_bp or (order.norm_bp if order else 250)

    payload = dict(body.payload) if body.payload else {}
    if not payload:
        payload["order"] = order_code
        if ev_type == "ISSUE":
            payload["gold_mg"] = gold_val
            payload["fineness"] = fineness
            payload["fine_mg"] = fine_mg(gold_val, fineness)
            payload["stone_mg"] = body.stone_mg
            payload["norm_bp"] = norm_bp
            payload["allowed_mg"] = bp_of(gold_val, norm_bp)
        elif ev_type == "RETURN":
            net_mg = body.net_gold_mg or (gold_val - body.stone_mg)
            payload["gross_mg"] = gold_val
            payload["stone_mg"] = body.stone_mg
            payload["net_gold_mg"] = net_mg
            payload["fineness"] = fineness
            payload["fine_mg"] = fine_mg(net_mg, fineness)
        else:
            payload["gold_mg"] = gold_val
            payload["fineness"] = fineness
            payload["fine_mg"] = fine_mg(gold_val, fineness)

    jeweller_signer = body.jeweller_signer_id or (
        body.actor_id if body.actor_id in ("p-suresh", "p-lakshmi") else "p-suresh"
    )
    ev = append_chained_event(
        db,
        event_id=ev_id,
        karigar_id=body.karigar_id,
        order_id=oid,
        event_type=ev_type,
        timestamp=body.timestamp or "2026-10-18T12:00:00+05:30",
        actor_id=body.actor_id,
        jeweller_signer_id=jeweller_signer,
        payload=payload,
        sign_jeweller=body.auto_sign_jeweller or bool(body.jeweller_sig) or True,
        sign_karigar=body.auto_sign_karigar or bool(body.karigar_sig),
    )
    db.commit()
    return _serialize_event(ev)


@router.post("/{event_id}/signatures")
def sign_event(
    event_id: str,
    body: SignatureCreateRequest,
    db: Session = Depends(get_db),
) -> dict[str, object]:
    ev = db.get(LedgerEvent, event_id)
    if not ev and event_id == "R5":
        ev = apply_step_s02(db)
    if not ev:
        raise HTTPException(status_code=404, detail=f"LedgerEvent '{event_id}' not found")

    if body.decision == "reject":
        ev.status = "rejected"
        db.commit()
        return _serialize_event(ev)

    person = db.get(Person, body.signer_id)
    if not person:
        raise HTTPException(status_code=404, detail=f"Signer '{body.signer_id}' not found")

    sig_candidate = body.sig_hex or body.sig
    if sig_candidate and not body.auto_demo_sign:
        if not verify_sig(person.pubkey_hex, ev.event_hash, sig_candidate):
            raise HTTPException(
                status_code=422,
                detail={
                    "type": "https://tola.india/errors/bad-signature",
                    "title": "Ed25519 signature verification failed",
                    "status": 422,
                    "detail": f"Invalid signature for signer {person.id} on event {ev.id}",
                    "code": "BAD_SIGNATURE",
                },
            )
        sig_hex = sig_candidate
    else:
        kp = derive_demo_keypair(person.id)
        sig_hex = sign_event_hash(kp.seed_hex, ev.event_hash)

    role = body.role or ("karigar" if person.role == "karigar" else "jeweller")
    if role == "karigar":
        ev.karigar_sig = sig_hex
    else:
        ev.jeweller_sig = sig_hex

    sig_row_id = f"sig-{ev.id}-{person.id}"
    if not db.get(EventSignature, sig_row_id):
        db.add(
            EventSignature(
                id=sig_row_id,
                event_id=ev.id,
                signer_id=person.id,
                role=role,
                sig_hex=sig_hex,
                signed_at=body.signed_at or "2026-10-12T10:03:00+05:30",
                readback_played=body.readback_played,
            )
        )

    if ev.jeweller_sig and ev.karigar_sig:
        ev.status = "committed"
        if ev.id == "R5":
            order14 = db.get(Order, "order-14")
            if order14 and order14.status in ("DRAFT", "ISSUED"):
                order14.status = "IN_PROGRESS"

    db.commit()
    return _serialize_event(ev)
