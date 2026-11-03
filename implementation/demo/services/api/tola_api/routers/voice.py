"""Voice readback (TTS) and voice intake (STT + Lyzr Intake) endpoints (`/v1/voice/*`)."""

from __future__ import annotations

import json
from typing import Any

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from tola_api.ai.cache import read_audio_b64
from tola_api.ai.fallback import with_fallback
from tola_api.ai.lyzr_client import run_lyzr_agent
from tola_api.ai.sarvam_client import synthesize_speech
from tola_api.ai.templates import template_intake_extract, template_readback_text
from tola_api.db import get_db
from tola_api.models import LedgerEvent
from tola_api.schemas import ReadbackRequestModel

router = APIRouter(prefix="/v1/voice", tags=["voice"])


@router.post("/readback")
def voice_readback(body: ReadbackRequestModel, db: Session = Depends(get_db)) -> dict[str, object]:
    ev_id = body.event_id or body.subject_id or "R5"
    ev = db.get(LedgerEvent, ev_id) if ev_id else None
    vars_dict: dict[str, Any] = dict(body.vars)
    if ev is not None:
        payload = json.loads(ev.payload_json)
        for k, v in payload.items():
            vars_dict.setdefault(k, v)

    step_key = (body.step_id or body.template_id or "").upper()
    if step_key == "S07" or ev_id in ("R9", "R10"):
        cache_key = "s07_resolution_readback_bn"
        audio_key = "s07_resolution_readback_bn"
    elif step_key == "S08" or ev_id == "R11":
        cache_key = "s08_settlement_readback_bn"
        audio_key = "s08_settlement_readback_bn"
    else:
        cache_key = "s03_readback_bn"
        audio_key = "s03_readback_bn"

    def _live() -> dict[str, Any]:
        txt = template_readback_text(body.lang, vars_dict)
        b64 = synthesize_speech(txt, body.lang)
        return {"text_bn": txt, "audio_b64": b64}

    def _tpl() -> dict[str, Any]:
        txt = template_readback_text(body.lang, vars_dict)
        return {"text_bn": txt, "en": template_readback_text("en", vars_dict)}

    res = with_fallback(
        cache_key=cache_key,
        live_fn=_live,
        template_fn=_tpl,
        timeout_ms=3500,
    )
    text_out = str(
        res.value.get("text_bn") or res.value.get("text") or template_readback_text(body.lang, vars_dict)
    )
    caption_en = str(res.value.get("en") or template_readback_text("en", vars_dict))
    audio_b64, audio_url = read_audio_b64(audio_key)
    if res.value.get("audio_b64"):
        audio_b64 = str(res.value["audio_b64"])

    return {
        "event_id": ev_id,
        "lang": body.lang,
        "text": text_out,
        "caption_en": caption_en,
        "audio_b64": audio_b64,
        "audio_url": audio_url or "/v1/demo/audio/S03_readback_bn.mp3",
        "source": res.source,
        "cached": res.source != "live",
        "latency_ms": res.latency_ms,
    }


@router.post("/intake")
async def voice_intake(request: Request, db: Session = Depends(get_db)) -> dict[str, object]:
    content_type = request.headers.get("content-type", "")
    lang = "bn"
    piece_gross_mg = 38120
    scrap_mg = 500
    dust_mg = 0
    clip_id = "s04_return_note_bn"

    if "application/json" in content_type:
        data = await request.json()
        lang = str(data.get("lang", "bn"))
        piece_gross_mg = int(data.get("piece_gross_mg") or 38120)
        scrap_mg = int(data.get("scrap_mg") or 500)
        dust_mg = int(data.get("dust_mg") or 0)
        clip_id = str(data.get("demo_clip_id") or data.get("clip_id") or "s04_return_note_bn")
    else:
        form = await request.form()
        lang = str(form.get("lang") or "bn")
        if form.get("piece_gross_mg"):
            piece_gross_mg = int(str(form.get("piece_gross_mg")))
        if form.get("scrap_mg"):
            scrap_mg = int(str(form.get("scrap_mg")))

    def _live() -> dict[str, Any]:
        return run_lyzr_agent(
            "intake",
            {
                "lang": lang,
                "scale_piece_gross_mg": piece_gross_mg,
                "scale_scrap_mg": scrap_mg,
                "scale_dust_mg": dust_mg,
            },
            session_id="demo-S04",
        )

    default_bn = (
        "দাদা, চৌদ্দ নম্বরের মালাটা ফেরত দিচ্ছি। ওজন ৩৮.১২০ গ্রাম। "
        "সাথে ০.৫০০ গ্রাম টুকরো আছে। ক্লাম্পটা দু'বার ঝালাই করতে হয়েছে। "
        "গুঁড়ো এখনও ট্রেতে আছে।"
    )

    def _tpl() -> dict[str, Any]:
        return {
            "transcript_bn": default_bn,
            "extracted": template_intake_extract("#14", piece_gross_mg, scrap_mg, dust_mg),
        }

    res = with_fallback(
        cache_key="s04_intake_extract",
        live_fn=_live,
        template_fn=_tpl,
        timeout_ms=5000,
    )
    extracted = dict(
        res.value.get("extracted") or template_intake_extract("#14", piece_gross_mg, scrap_mg, dust_mg)
    )
    # Scale always wins over voice for weights
    extracted["piece_gross_mg"] = piece_gross_mg
    extracted["net_gold_mg"] = piece_gross_mg - int(extracted.get("stone_mg", 0))
    extracted["scrap_mg"] = scrap_mg
    extracted["dust_mg"] = dust_mg

    transcript = str(res.value.get("transcript_bn") or res.value.get("transcript") or default_bn)
    _, audio_url = read_audio_b64(clip_id)

    return {
        "lang": lang,
        "transcript": transcript,
        "caption_en": (
            "Returning Necklace #14: 38.120 g piece + 0.500 g scrap. "
            "Clasp soldered twice; dust still in tray."
        ),
        "extracted": extracted,
        "audio_url": audio_url or "/v1/demo/audio/S04_return_note_bn.webm",
        "source": res.source,
        "cached": res.source != "live",
        "latency_ms": res.latency_ms,
    }
