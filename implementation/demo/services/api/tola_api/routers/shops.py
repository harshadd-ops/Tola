"""Shop overview and karigar roster endpoints (`/v1/shops/{shop_id}/*`)."""

from __future__ import annotations

import json
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from tola_api.db import get_db
from tola_api.ledger_core.signing import derive_demo_keypair
from tola_api.ledger_core.units import fine_mg
from tola_api.models import KarigarProfile, Order, Person, Shop, WastageNorm
from tola_api.schemas import AddKarigarCreateRequest

router = APIRouter(prefix="/v1/shops", tags=["shops"])


def _karigar_open_gold(db: Session, karigar_id: str) -> tuple[int, int, int]:
    orders = db.scalars(
        select(Order).where(
            Order.karigar_id == karigar_id,
            Order.is_history.is_(False),
        )
    ).all()
    open_gross = 0
    open_fine = 0
    active_count = 0
    for o in orders:
        if o.status in ("ISSUED", "IN_PROGRESS"):
            open_gross += o.target_gross_mg
            open_fine += fine_mg(o.target_gross_mg, o.fineness)
            active_count += 1
    return open_gross, open_fine, active_count


@router.get("/{shop_id}/karigars")
def list_karigars(shop_id: str, db: Session = Depends(get_db)) -> dict[str, object]:
    shop = db.get(Shop, shop_id) or db.scalar(select(Shop).limit(1))
    if not shop:
        raise HTTPException(status_code=404, detail=f"Shop '{shop_id}' not found")

    persons = db.scalars(select(Person).where(Person.role == "karigar")).all()
    profiles = {kp.person_id: kp for kp in db.scalars(select(KarigarProfile)).all()}
    norms_all = db.scalars(select(WastageNorm)).all()

    items = []
    for p in persons:
        kp = profiles.get(p.id)
        open_gross, open_fine, active_orders = _karigar_open_gold(db, p.id)
        p_norms = {n.order_type: n.norm_bp for n in norms_all if n.karigar_id == p.id}
        items.append(
            {
                "id": p.id,
                "code": p.code,
                "name": p.name,
                "native_name": p.native_name,
                "lang": p.lang,
                "script": p.script,
                "origin": p.origin,
                "pubkey_hex": p.pubkey_hex,
                "craft": kp.craft if kp else "plain",
                "experience_years": kp.experience_years if kp else 5,
                "rate_paise_per_gram": kp.rate_paise_per_gram if kp else 12000,
                "vishwakarma_id": kp.vishwakarma_id if kp else None,
                "upi_vpa_demo": kp.upi_vpa_demo if kp else "karigar.demo@upi",
                "gstin": kp.gstin if kp else None,
                "open_gold_mg": open_gross,
                "open_fine_mg": open_fine,
                "active_orders_count": active_orders,
                "norms_bp": p_norms,
            }
        )
    return {"shop_id": shop.id, "karigars": items}


@router.post("/{shop_id}/karigars", status_code=201)
def add_karigar(
    shop_id: str,
    body: AddKarigarCreateRequest,
    db: Session = Depends(get_db),
) -> dict[str, object]:
    shop = db.get(Shop, shop_id) or db.scalar(select(Shop).limit(1))
    if not shop:
        raise HTTPException(status_code=404, detail=f"Shop '{shop_id}' not found")

    display_name = body.name or body.display_name or "New Karigar"
    pid = body.id or f"p-{uuid.uuid4().hex[:6]}"
    kp_crypto = derive_demo_keypair(pid)
    pubkey = body.public_key or kp_crypto.pubkey_hex

    person = Person(
        id=pid,
        code="P-NEW",
        name=display_name,
        native_name=body.native_name or display_name,
        role="karigar",
        title=f"Karigar ({body.craft})",
        chip_label=f"{display_name} · Karigar ({body.lang.upper()})",
        avatar=display_name[:2].upper(),
        shop_id=shop.id,
        lang=body.lang,
        ui_lang=body.lang,
        script="Beng" if body.lang == "bn" else "Latn",
        city="Bengaluru",
        origin="Bengaluru",
        device="Android",
        literacy="voice-first",
        organization=None,
        pubkey_hex=pubkey,
    )
    profile = KarigarProfile(
        person_id=pid,
        shop_id=shop.id,
        craft=body.craft,
        experience_years=5,
        rate_paise_per_gram=body.rate_paise_per_gram,
        vishwakarma_id=body.vishwakarma_id,
        voice_lang=body.lang,
        languages_json=json.dumps(body.languages),
        other_jewellers_offline=1,
        upi_vpa_demo=f"{pid}@upi",
        phone_display="+91 98xxx xxxxx",
        gstin=None,
    )
    db.add(person)
    db.add(profile)
    for otype, nbp in (("plain", 250), ("studded", 350), ("antique", 400)):
        db.add(
            WastageNorm(
                id=f"norm-{pid}-{otype}",
                shop_id=shop.id,
                karigar_id=pid,
                order_type=otype,
                norm_bp=nbp,
                flag_tolerance_mg=50,
                agreed_on="2026-10-18",
            )
        )
    db.commit()
    return {
        "id": person.id,
        "name": person.name,
        "native_name": person.native_name,
        "lang": person.lang,
        "craft": profile.craft,
        "pubkey_hex": person.pubkey_hex,
    }


@router.get("/{shop_id}/overview")
def get_shop_overview(shop_id: str, db: Session = Depends(get_db)) -> dict[str, object]:
    shop = db.get(Shop, shop_id) or db.scalar(select(Shop).limit(1))
    if not shop:
        raise HTTPException(status_code=404, detail=f"Shop '{shop_id}' not found")

    orders = db.scalars(select(Order).where(Order.is_history.is_(False))).all()
    total_issued_mg = sum(o.target_gross_mg for o in orders if o.status != "DRAFT")
    flagged_count = sum(1 for o in orders if o.status in ("FLAGGED", "DISPUTED"))
    open_count = sum(1 for o in orders if o.status in ("DRAFT", "ISSUED", "IN_PROGRESS"))

    return {
        "shop": {
            "id": shop.id,
            "name": shop.name,
            "city": shop.city,
            "address": shop.address,
            "gstin": shop.gstin,
        },
        "metrics": {
            "active_orders_count": open_count,
            "flagged_orders_count": flagged_count,
            "total_issued_mg": total_issued_mg,
            "total_issued_fine_mg": fine_mg(total_issued_mg, 916),
        },
    }
