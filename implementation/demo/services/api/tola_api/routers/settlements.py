"""Weekly settlement, dual approval, UPI payment intent, and GST Rule 55 PDF endpoints."""

from __future__ import annotations

import json
from typing import Any

from fastapi import APIRouter, Body, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from tola_api.ai.fallback import with_fallback
from tola_api.ai.lyzr_client import run_lyzr_agent
from tola_api.ai.templates import template_settlement_narrative
from tola_api.db import get_db
from tola_api.models import PaymentIntent, Settlement
from tola_api.pdf.gst_draft import render_gst_draft_pdf
from tola_api.schemas import SettlementApproveRequest, SettlementCreateRequest
from tola_api.seed.loader import apply_step_s09, approve_settlement_party, create_settlement_draft

router = APIRouter(prefix="/v1/settlements", tags=["settlements"])


def _serialize_settlement(db: Session, stl: Settlement, source: str = "cached") -> dict[str, object]:
    summary = json.loads(stl.summary_json)
    pi = db.get(PaymentIntent, "PI-2026-W42-RAFIQ")
    return {
        "id": stl.id,
        "shop_id": stl.shop_id,
        "karigar_id": stl.karigar_id,
        "period_start": stl.period_start,
        "period_end": stl.period_end,
        "summary": summary,
        "narrative": stl.narrative,
        "jeweller_approved": stl.jeweller_approved,
        "karigar_approved": stl.karigar_approved,
        "sealed": bool(stl.jeweller_approved and stl.karigar_approved),
        "event_id": stl.event_id,
        "status": stl.status,
        "source": source,
        "payment_intent": (
            {
                "id": pi.id,
                "amount_paise": pi.amount_paise,
                "upi_uri": pi.upi_uri,
                "uri": pi.upi_uri,
                "status": pi.status,
            }
            if pi
            else None
        ),
    }


@router.post("", status_code=201)
def create_settlement(
    body: SettlementCreateRequest | None = Body(default=None),
    db: Session = Depends(get_db),
) -> dict[str, object]:
    stl = create_settlement_draft(db)

    def _live() -> dict[str, Any]:
        return run_lyzr_agent(
            "settle",
            {"summary": json.loads(stl.summary_json)},
            session_id="demo-S08",
        )

    ai_res = with_fallback(
        cache_key="s08_settlement_narrative",
        live_fn=_live,
        template_fn=template_settlement_narrative,
        timeout_ms=6000,
    )
    stl.narrative = str(ai_res.value.get("narrative_en") or stl.narrative)
    db.commit()
    return _serialize_settlement(db, stl, source=ai_res.source)


@router.get("/{settlement_id}")
def get_settlement(settlement_id: str, db: Session = Depends(get_db)) -> dict[str, object]:
    stl = db.get(Settlement, settlement_id)
    if not stl:
        raise HTTPException(status_code=404, detail=f"Settlement '{settlement_id}' not found")
    return _serialize_settlement(db, stl)


@router.post("/{settlement_id}/approve")
def approve_settlement(
    settlement_id: str,
    body: SettlementApproveRequest,
    db: Session = Depends(get_db),
) -> dict[str, object]:
    if settlement_id != "SET-2026-W42-RAFIQ":
        raise HTTPException(status_code=404, detail=f"Settlement '{settlement_id}' not found")
    party = "karigar" if (body.signer_id == "p-rafiq" or body.role == "karigar") else "jeweller"
    stl = approve_settlement_party(db, party)
    db.commit()
    return _serialize_settlement(db, stl)


@router.post("/{settlement_id}/payment-intent", status_code=201)
def create_payment_intent(settlement_id: str, db: Session = Depends(get_db)) -> dict[str, object]:
    stl = db.get(Settlement, settlement_id)
    if not stl:
        raise HTTPException(status_code=404, detail=f"Settlement '{settlement_id}' not found")
    if not (stl.jeweller_approved and stl.karigar_approved):
        raise HTTPException(
            status_code=409,
            detail={
                "type": "https://tola.india/errors/approvals-missing",
                "title": "Both jeweller and karigar approvals are required before payment intent",
                "status": 409,
                "detail": f"Settlement {stl.id} is not yet dual-approved",
                "code": "APPROVALS_MISSING",
            },
        )
    pi = apply_step_s09(db)
    db.commit()
    return {
        "id": pi.id,
        "settlement_id": pi.settlement_id,
        "amount_paise": pi.amount_paise,
        "amount_inr": "5040.00",
        "upi_uri": pi.upi_uri,
        "uri": pi.upi_uri,
        "status": pi.status,
        "label": "Simulated, no money moves",
        "created_at": pi.created_at,
    }


@router.get("/{settlement_id}/gst-draft")
@router.get("/{settlement_id}/gst-draft.pdf")
def get_gst_draft_pdf(settlement_id: str, db: Session = Depends(get_db)) -> Response:
    stl = db.get(Settlement, settlement_id)
    if not stl:
        raise HTTPException(status_code=404, detail=f"Settlement '{settlement_id}' not found")
    pdf_bytes = render_gst_draft_pdf(
        settlement_id=stl.id,
        order_code="#14",
        shop_name="Shetty Jewellers, Avenue Road, Bengaluru",
        jeweller_name="Suresh Shetty",
        karigar_name="Rafiq Sheikh",
        issued_gross_mg=40000,
        returned_gross_mg=38620,
        purity_karat=22,
        purity_fineness=916,
        carry_forward_mg=250,
        carry_forward_fine_mg=229,
        labour_amount_paise=480000,
        gst_paise=24000,
        total_invoice_paise=504000,
        payment_intent_id="PI-2026-W42-RAFIQ",
    )
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="tola-gst-draft-{stl.id}.pdf"',
        },
    )
