"""Append-only ledger inspection and tamper-sandbox verification (`GET /v1/ledger`)."""

from __future__ import annotations

import base64
import json
from typing import Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from tola_api.db import get_db
from tola_api.ledger_core.chain import verify_chain
from tola_api.models import LedgerEvent, Person

router = APIRouter(prefix="/v1/ledger", tags=["ledger"])


@router.get("")
def get_ledger(
    karigar_id: str | None = Query(default="p-rafiq", alias="karigarId"),
    karigar_id_snake: str | None = Query(default=None, alias="karigar_id"),
    shop_id: str | None = Query(default="shop-shetty", alias="shopId"),
    include_history: bool = Query(default=False, alias="includeHistory"),
    sandbox: str | None = Query(default=None),
    tamper_event_id: str | None = Query(default=None),
    tamper_delta_mg: int = Query(default=100),
    db: Session = Depends(get_db),
) -> dict[str, object]:
    target_karigar = karigar_id_snake or karigar_id or "p-rafiq"
    rows = db.scalars(
        select(LedgerEvent).where(LedgerEvent.karigar_id == target_karigar).order_by(LedgerEvent.seq.asc())
    ).all()
    persons_map = {p.id: p.pubkey_hex for p in db.scalars(select(Person)).all()}

    tamper_id = tamper_event_id
    if sandbox and sandbox.startswith("tamper:"):
        tamper_id = sandbox.split(":", 1)[1].strip()

    chain_dicts: list[dict[str, Any]] = []
    display_events: list[dict[str, Any]] = []

    for r in rows:
        payload_obj: dict[str, Any] = json.loads(r.payload_json)
        tampered_this = False
        if tamper_id and r.id == tamper_id:
            tampered_this = True
            payload_obj = dict(payload_obj)
            if "gross_mg" in payload_obj:
                payload_obj["gross_mg"] = int(payload_obj["gross_mg"]) + tamper_delta_mg
            if "net_gold_mg" in payload_obj:
                payload_obj["net_gold_mg"] = int(payload_obj["net_gold_mg"]) + tamper_delta_mg
            elif "gold_mg" in payload_obj:
                payload_obj["gold_mg"] = int(payload_obj["gold_mg"]) + tamper_delta_mg

        chain_dicts.append(
            {
                "id": r.id,
                "seq": r.seq,
                "event_type": r.event_type,
                "timestamp": r.timestamp,
                "actor_id": r.actor_id,
                "karigar_id": r.karigar_id,
                "order_id": r.order_id,
                "payload": payload_obj,
                "prev_hash": r.prev_hash,
                "event_hash": r.event_hash,
                "jeweller_signer_id": r.jeweller_signer_id,
                "jeweller_sig": r.jeweller_sig,
                "karigar_sig": r.karigar_sig,
            }
        )

        is_hist_ev = r.id.startswith("H-")
        if include_history or not is_hist_ev:
            display_events.append(
                {
                    "id": r.id,
                    "ref": r.id,
                    "seq": r.seq,
                    "karigar_id": r.karigar_id,
                    "order_id": r.order_id,
                    "order": payload_obj.get("order"),
                    "event_type": r.event_type,
                    "type": r.event_type,
                    "timestamp": r.timestamp,
                    "actor_id": r.actor_id,
                    "jeweller_signer_id": r.jeweller_signer_id,
                    "payload": payload_obj,
                    "canonical_b64": base64.b64encode(r.payload_json.encode("utf-8")).decode("ascii"),
                    "prev_hash": r.prev_hash,
                    "event_hash": r.event_hash,
                    "hash": r.event_hash,
                    "jeweller_sig": r.jeweller_sig,
                    "karigar_sig": r.karigar_sig,
                    "server_sig": r.server_sig,
                    "status": r.status,
                    "sealed": bool(r.jeweller_sig and r.karigar_sig),
                    "tampered_in_sandbox": tampered_this,
                }
            )

    check = verify_chain(chain_dicts, pubkeys_by_person=persons_map)
    head_hash = chain_dicts[-1]["event_hash"] if chain_dicts else "0" * 64

    return {
        "shop_id": shop_id,
        "karigar_id": target_karigar,
        "events": display_events,
        "total_chain_events": len(rows),
        "chain": {
            "valid": check.valid,
            "checked": check.checked,
            "length": check.checked,
            "head_hash": head_hash,
            "broken_at_id": check.broken_at,
            "broken_at": check.broken_at,
            "broken_at_seq": check.broken_seq,
            "reason": check.reason,
            "sandbox": sandbox,
        },
    }
