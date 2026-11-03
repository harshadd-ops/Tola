"""Demo control endpoints: personas, story metadata, deterministic reset, and seed assets."""

from __future__ import annotations

from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from tola_api.config import settings
from tola_api.db import get_db
from tola_api.models import DemoState, KarigarProfile, Person, Shop
from tola_api.schemas import ResetRequest
from tola_api.seed.loader import reset_to_step
from tola_api.seed.story import get_story_data

router = APIRouter(prefix="/v1/demo", tags=["demo"])


@router.get("/personas")
def list_personas(db: Session = Depends(get_db)) -> dict[str, object]:
    persons = db.scalars(select(Person).order_by(Person.code.asc())).all()
    profiles = {kp.person_id: kp for kp in db.scalars(select(KarigarProfile)).all()}
    shop = db.scalar(select(Shop).limit(1))
    items = []
    for p in persons:
        kp = profiles.get(p.id)
        items.append(
            {
                "id": p.id,
                "persona": p.code,
                "code": p.code,
                "name": p.name,
                "native_name": p.native_name,
                "role": p.role,
                "title": p.title,
                "chip_label": p.chip_label,
                "avatar": p.avatar,
                "shop_id": p.shop_id,
                "lang": p.lang,
                "ui_lang": p.ui_lang,
                "script": p.script,
                "city": p.city,
                "origin": p.origin,
                "device": p.device,
                "literacy": p.literacy,
                "org": p.organization,
                "pubkey_hex": p.pubkey_hex,
                "craft": kp.craft if kp else None,
                "experience_years": kp.experience_years if kp else None,
                "rate_paise_per_gram": kp.rate_paise_per_gram if kp else None,
                "vishwakarma_id": kp.vishwakarma_id if kp else None,
                "upi_vpa_demo": kp.upi_vpa_demo if kp else None,
                "gstin": kp.gstin if kp else None,
            }
        )
    return {
        "shop": (
            {
                "id": shop.id,
                "name": shop.name,
                "city": shop.city,
                "address": shop.address,
                "gstin": shop.gstin,
                "upi_vpa": shop.upi_vpa,
            }
            if shop
            else None
        ),
        "personas": items,
    }


@router.get("/story")
def get_story(db: Session = Depends(get_db)) -> dict[str, object]:
    story = get_story_data()
    st = db.get(DemoState, "current_step")
    return {
        "current_step": st.value if st else "S01",
        "shop": story.get("shop"),
        "steps": story.get("steps", []),
        "wastage_norms": story.get("wastage_norms"),
    }


@router.post("/reset")
def reset_demo(
    body: ResetRequest | None = Body(default=None),
    db: Session = Depends(get_db),
) -> dict[str, object]:
    target = None
    if body is not None:
        target = body.to_step if body.to_step is not None else body.step
    return reset_to_step(db, to_step=target)


@router.get("/audio/{filename}")
def get_demo_audio(filename: str) -> FileResponse:
    safe_name = filename.replace("..", "").replace("/", "").replace("\\", "")
    path = settings.seed_dir / "audio" / safe_name
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Audio asset '{safe_name}' not found")
    media_type = "audio/mpeg" if safe_name.endswith(".mp3") else "audio/webm"
    return FileResponse(path, media_type=media_type)


@router.get("/photos/{filename}")
def get_demo_photo(filename: str) -> FileResponse:
    safe_name = filename.replace("..", "").replace("/", "").replace("\\", "")
    path = settings.seed_dir / "photos" / safe_name
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Photo asset '{safe_name}' not found")
    return FileResponse(path, media_type="image/jpeg")
