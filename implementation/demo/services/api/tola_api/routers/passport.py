"""Verifiable Karigar Work Passport share, verify, and revoke endpoints (`/v1/passport`)."""

from __future__ import annotations

import json

from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.orm import Session

from tola_api.config import settings
from tola_api.db import get_db
from tola_api.ledger_core.canonical import canonical_bytes
from tola_api.ledger_core.signing import derive_server_keypair, sign_event_hash
from tola_api.models import KarigarProfile, PassportShare, Person
from tola_api.schemas import PassportShareCreateRequest
from tola_api.seed.loader import apply_step_s10

router = APIRouter(prefix="/v1/passport", tags=["passport"])


def _serialize_passport(db: Session, share: PassportShare) -> dict[str, object]:
    karigar = db.get(Person, share.karigar_id)
    profile = db.get(KarigarProfile, share.karigar_id)
    recipient = db.get(Person, share.recipient_id)
    summary = json.loads(share.summary_json)
    scope = json.loads(share.scope_json)

    server_kp = derive_server_keypair(settings.tola_server_signing_key)
    digest_bytes = canonical_bytes(summary)
    import hashlib

    summary_hash = hashlib.sha256(digest_bytes).hexdigest()
    server_sig = sign_event_hash(server_kp.seed_hex, summary_hash)

    return {
        "token": share.token,
        "url_path": f"/lender/passport/{share.token}",
        "karigar": {
            "id": karigar.id if karigar else share.karigar_id,
            "name": karigar.name if karigar else "Rafiq Sheikh",
            "native_name": karigar.native_name if karigar else "রফিক শেখ",
            "city": karigar.city if karigar else "Bengaluru",
            "origin": karigar.origin if karigar else "Domjur, Howrah → Bengaluru",
            "craft": profile.craft if profile else "plain, studded",
            "experience_years": profile.experience_years if profile else 11,
            "vishwakarma_id": profile.vishwakarma_id if profile else "PMV-WB-HWH-2024-018492",
            "pubkey_hex": karigar.pubkey_hex if karigar else "",
        },
        "recipient": {
            "id": recipient.id if recipient else share.recipient_id,
            "name": recipient.name if recipient else "Meera Rao",
            "org": recipient.organization if recipient else "Sahyadri Co-operative Credit Society",
        },
        "scope": scope,
        "summary": summary,
        "verification": {
            "summary_hash": summary_hash,
            "server_pubkey_hex": server_kp.pubkey_hex,
            "server_sig_hex": server_sig,
            "verified": True,
        },
        "created_at": share.created_at,
        "expires_at": share.expires_at,
        "revoked": share.revoked,
        "views": share.views,
        "lender_banner": "Mocked lender view",
    }


@router.post("/shares", status_code=201)
def create_passport_share(
    body: PassportShareCreateRequest | None = Body(default=None),
    db: Session = Depends(get_db),
) -> dict[str, object]:
    share = apply_step_s10(db)
    share.revoked = False
    db.commit()
    return _serialize_passport(db, share)


@router.get("/{token}")
def get_passport_by_token(token: str, db: Session = Depends(get_db)) -> dict[str, object]:
    share = db.get(PassportShare, token)
    if not share:
        raise HTTPException(status_code=404, detail=f"Passport token '{token}' not found")
    if share.revoked:
        raise HTTPException(
            status_code=410,
            detail={
                "type": "https://tola.india/errors/passport-revoked",
                "title": "Passport share token has been revoked by the karigar",
                "status": 410,
                "detail": f"Passport token {token} is revoked",
                "code": "PASSPORT_REVOKED",
            },
        )
    return _serialize_passport(db, share)


@router.delete("/shares/{token}")
def revoke_passport_share(token: str, db: Session = Depends(get_db)) -> dict[str, object]:
    share = db.get(PassportShare, token)
    if not share:
        raise HTTPException(status_code=404, detail=f"Passport token '{token}' not found")
    share.revoked = True
    db.commit()
    return {"token": share.token, "revoked": True}
