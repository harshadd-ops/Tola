"""Deterministic SQLite database seeding and step fast-forwarding from `seed/story.json`.

Can be invoked via CLI (`tola-seed --reset` / `tola-seed --if-empty`) or
called in-process from `POST /v1/demo/reset` in < 100 ms.
"""

from __future__ import annotations

import argparse
import json
import threading
from typing import Any
from urllib.parse import quote

from sqlalchemy import select
from sqlalchemy.orm import Session

from tola_api.config import settings
from tola_api.db import Base, SessionLocal, engine
from tola_api.ledger_core.canonical import canonical_bytes
from tola_api.ledger_core.chain import GENESIS_HASH, compute_event_hash
from tola_api.ledger_core.passport import compute_passport_summary
from tola_api.ledger_core.reconcile import reconcile_order
from tola_api.ledger_core.settle import compute_settlement
from tola_api.ledger_core.signing import (
    derive_demo_keypair,
    derive_server_keypair,
    sign_event_hash,
)
from tola_api.ledger_core.units import bp_of, fine_mg
from tola_api.models import (
    DemoState,
    Dispute,
    EventSignature,
    KarigarProfile,
    LedgerEvent,
    Order,
    PassportShare,
    PaymentIntent,
    Person,
    ReconciliationRun,
    ScaleReading,
    Settlement,
    Shop,
    VoiceNote,
    WastageNorm,
)
from tola_api.seed.story import get_story_data, normalize_step_id, order_id_from_code

NATIVE_NAMES: dict[str, tuple[str, str, str, int, str, int]] = {
    "p-suresh": ("ಸುರೇಶ್ ಶೆಟ್ಟಿ", "Knda", "Bengaluru", 18, "jeweller", 0),
    "p-lakshmi": ("ಲಕ್ಷ್ಮಿ", "Knda", "Bengaluru", 6, "accounts", 0),
    "p-rafiq": ("রফিক শেখ", "Beng", "Domjur, Howrah → Bengaluru", 11, "plain, studded", 12000),
    "p-manju": ("ಮಂಜುನಾಥ್ ಆಚಾರ್", "Knda", "Bengaluru", 8, "plain", 10400),
    "p-subrata": ("সুব্রত পাল", "Beng", "Medinipur → Bengaluru", 16, "antique", 22600),
    "p-meera": ("Meera Rao", "Latn", "Bengaluru", 9, "credit", 0),
}


def append_chained_event(
    db: Session,
    *,
    event_id: str,
    karigar_id: str,
    order_id: str | None,
    event_type: str,
    timestamp: str,
    actor_id: str,
    jeweller_signer_id: str,
    payload: dict[str, Any],
    sign_jeweller: bool = True,
    sign_karigar: bool = True,
) -> LedgerEvent:
    """Append an event to `karigar_id`'s hash chain and optionally sign for demo personas."""
    last_ev = db.scalar(
        select(LedgerEvent)
        .where(LedgerEvent.karigar_id == karigar_id)
        .order_by(LedgerEvent.seq.desc())
        .limit(1)
    )
    seq = 1 if last_ev is None else last_ev.seq + 1
    prev_hash = GENESIS_HASH if last_ev is None else last_ev.event_hash

    payload_str = canonical_bytes(payload).decode("utf-8")
    ev_hash = compute_event_hash(
        prev_hash=prev_hash,
        seq=seq,
        event_type=event_type,
        timestamp=timestamp,
        actor_id=actor_id,
        karigar_id=karigar_id,
        order_id=order_id,
        payload=payload,
    )

    server_kp = derive_server_keypair(settings.tola_server_signing_key)
    server_sig = sign_event_hash(server_kp.seed_hex, ev_hash)

    j_sig: str | None = None
    k_sig: str | None = None

    if sign_jeweller:
        j_kp = derive_demo_keypair(jeweller_signer_id)
        j_sig = sign_event_hash(j_kp.seed_hex, ev_hash)
    if sign_karigar:
        k_kp = derive_demo_keypair(karigar_id)
        k_sig = sign_event_hash(k_kp.seed_hex, ev_hash)

    status = "committed" if (j_sig and k_sig) else "pending_karigar"

    row = LedgerEvent(
        id=event_id,
        seq=seq,
        karigar_id=karigar_id,
        order_id=order_id,
        event_type=event_type,
        timestamp=timestamp,
        actor_id=actor_id,
        jeweller_signer_id=jeweller_signer_id,
        payload_json=payload_str,
        prev_hash=prev_hash,
        event_hash=ev_hash,
        jeweller_sig=j_sig,
        karigar_sig=k_sig,
        server_sig=server_sig,
        status=status,
    )
    db.add(row)
    db.flush()

    if j_sig:
        db.add(
            EventSignature(
                id=f"sig-{event_id}-{jeweller_signer_id}",
                event_id=event_id,
                signer_id=jeweller_signer_id,
                role="jeweller",
                sig_hex=j_sig,
                signed_at=timestamp,
                readback_played=False,
            )
        )
    if k_sig:
        db.add(
            EventSignature(
                id=f"sig-{event_id}-{karigar_id}",
                event_id=event_id,
                signer_id=karigar_id,
                role="karigar",
                sig_hex=k_sig,
                signed_at=timestamp,
                readback_played=True,
            )
        )
    db.flush()
    return row


def _seed_base(db: Session, story: dict[str, Any]) -> None:
    shop_data = story["shop"]
    shop = Shop(
        id=shop_data["id"],
        name=shop_data["name"],
        city="Bengaluru",
        address=shop_data.get("address", "Avenue Road, Bengaluru 560002"),
        gstin=shop_data["gstin"],
        upi_vpa="shetty.demo@upi",
        default_lang="en",
    )
    db.add(shop)
    db.flush()

    for p in story["persons"]:
        pid = p["id"]
        kp = derive_demo_keypair(pid)
        native_name, script, origin, _exp, _craft, _rate = NATIVE_NAMES.get(
            pid, (p["name"], "Latn", "Bengaluru", 5, "", 0)
        )
        db.add(
            Person(
                id=pid,
                code=p["persona"],
                name=p["name"],
                native_name=native_name,
                role=p["role"],
                title=p.get("title", ""),
                chip_label=p.get("chip_label", p["name"]),
                avatar=p.get("avatar", p["name"][:2].upper()),
                shop_id=p.get("shop_id"),
                lang=p["lang"],
                ui_lang=p.get("ui_lang", p["lang"]),
                script=script,
                city="Bengaluru",
                origin=origin,
                device="Android" if p["role"] == "karigar" else "Desktop",
                literacy="voice-first" if p["role"] == "karigar" else "high",
                organization=p.get("org"),
                pubkey_hex=kp.pubkey_hex,
            )
        )
    db.flush()

    norms_cfg = story["wastage_norms"]
    bp_map: dict[str, int] = norms_cfg["basis_points"]
    flag_tol = int(norms_cfg.get("flag_tolerance_mg", 50))
    agreed_on = str(norms_cfg.get("agreed_on", "2026-04-01"))

    for kp_raw in story["karigar_profiles"]:
        pid = kp_raw["person_id"]
        _native, _script, _origin, exp, craft, rate = NATIVE_NAMES.get(
            pid, ("", "Beng", "", 8, "plain", 12000)
        )
        db.add(
            KarigarProfile(
                person_id=pid,
                shop_id=shop_data["id"],
                craft=craft,
                experience_years=exp,
                rate_paise_per_gram=rate,
                vishwakarma_id=kp_raw.get("pm_vishwakarma_id"),
                voice_lang=kp_raw.get("voice_lang", "bn"),
                languages_json=json.dumps(kp_raw.get("languages", ["bn"])),
                other_jewellers_offline=int(kp_raw.get("other_jewellers_offline", 2)),
                upi_vpa_demo=kp_raw.get("upi_vpa_demo", "rafiq.demo@upi"),
                phone_display=kp_raw.get("phone_display", ""),
                gstin=kp_raw.get("gstin"),
            )
        )
        for otype, nbp in bp_map.items():
            db.add(
                WastageNorm(
                    id=f"norm-{pid}-{otype}",
                    shop_id=shop_data["id"],
                    karigar_id=pid,
                    order_type=otype,
                    norm_bp=int(nbp),
                    flag_tolerance_mg=flag_tol,
                    agreed_on=agreed_on,
                )
            )

    db.flush()

    # Seed synthetic history orders (H-01..H-32) and expand into chained events per karigar
    for h in story["history"]["orders"]:
        code = h["code"]
        oid = order_id_from_code(code)
        otype = h["type"]
        nbp = bp_map[otype]
        ret = h["return"]
        db.add(
            Order(
                id=oid,
                code=code,
                shop_id=shop_data["id"],
                karigar_id=h["karigar_id"],
                title=h["title"],
                order_type=otype,
                fineness=int(h["fineness"]),
                norm_bp=int(nbp),
                target_gross_mg=int(h["issued_gold_mg"]),
                stone_mg=int(h.get("stone_mg", 0)),
                labour_paise=int(h["labour_inr"]) * 100,
                issued_on=h["issued_on"],
                due_date=h["due_on"],
                returned_on=ret["returned_on"],
                return_gross_mg=int(ret["gross_mg"]),
                return_net_gold_mg=int(ret["net_gold_mg"]),
                return_scrap_mg=int(ret.get("scrap_mg", 0)),
                return_dust_mg=int(ret.get("dust_mg", 0)),
                occasion=None,
                status="SETTLED",
                is_history=True,
                photo_url=None,
            )
        )
        db.flush()

        karigar_id = h["karigar_id"]
        fineness = int(h["fineness"])
        issued_mg = int(h["issued_gold_mg"])
        append_chained_event(
            db,
            event_id=f"{code}-I",
            karigar_id=karigar_id,
            order_id=oid,
            event_type="ISSUE",
            timestamp=f"{h['issued_on']}T11:00:00+05:30",
            actor_id="p-suresh",
            jeweller_signer_id="p-suresh",
            payload={
                "order": code,
                "gold_mg": issued_mg,
                "fineness": fineness,
                "fine_mg": fine_mg(issued_mg, fineness),
                "stone_mg": int(h.get("stone_mg", 0)),
                "norm_bp": int(nbp),
                "allowed_mg": bp_of(issued_mg, int(nbp)),
            },
        )
        net_mg = int(ret["net_gold_mg"])
        append_chained_event(
            db,
            event_id=f"{code}-R",
            karigar_id=karigar_id,
            order_id=oid,
            event_type="RETURN",
            timestamp=f"{ret['returned_on']}T17:00:00+05:30",
            actor_id="p-lakshmi",
            jeweller_signer_id="p-lakshmi",
            payload={
                "order": code,
                "gross_mg": int(ret["gross_mg"]),
                "stone_mg": int(h.get("stone_mg", 0)),
                "net_gold_mg": net_mg,
                "fineness": fineness,
                "fine_mg": fine_mg(net_mg, fineness),
            },
        )
        scrap_mg = int(ret.get("scrap_mg", 0))
        if scrap_mg > 0:
            append_chained_event(
                db,
                event_id=f"{code}-S",
                karigar_id=karigar_id,
                order_id=oid,
                event_type="SCRAP_RETURN",
                timestamp=f"{ret['returned_on']}T17:01:00+05:30",
                actor_id="p-lakshmi",
                jeweller_signer_id="p-lakshmi",
                payload={
                    "order": code,
                    "gold_mg": scrap_mg,
                    "fineness": fineness,
                    "fine_mg": fine_mg(scrap_mg, fineness),
                },
            )
        dust_mg = int(ret.get("dust_mg", 0))
        if dust_mg > 0:
            append_chained_event(
                db,
                event_id=f"{code}-D",
                karigar_id=karigar_id,
                order_id=oid,
                event_type="DUST_CREDIT",
                timestamp=f"{ret['returned_on']}T17:02:00+05:30",
                actor_id="p-lakshmi",
                jeweller_signer_id="p-lakshmi",
                payload={
                    "order": code,
                    "gold_mg": dust_mg,
                    "fineness": fineness,
                    "fine_mg": fine_mg(dust_mg, fineness),
                },
            )

    # Seed active orders (#09, #11, #12, #13, #14, #15)
    for o in story["orders"]:
        code = o["code"]
        oid = order_id_from_code(code)
        otype = o["type"]
        nbp = bp_map[otype]
        ret = o.get("return")
        # At base reset (before S02/S04), #14 has not been issued or returned yet
        is_order_14 = code == "#14"
        if is_order_14:
            initial_status = "DRAFT"
            returned_on = None
            ret_gross = None
            ret_net = None
            ret_scrap = None
            ret_dust = None
        elif code == "#11":
            initial_status = "SETTLED"
            returned_on = ret["returned_on"] if ret else None
            ret_gross = int(ret["gross_mg"]) if ret else None
            ret_net = int(ret["net_gold_mg"]) if ret else None
            ret_scrap = int(ret.get("scrap_mg", 0)) if ret else None
            ret_dust = int(ret.get("dust_mg", 0)) if ret else None
        elif ret is not None:
            initial_status = "RETURNED"
            returned_on = ret["returned_on"]
            ret_gross = int(ret["gross_mg"])
            ret_net = int(ret["net_gold_mg"])
            ret_scrap = int(ret.get("scrap_mg", 0))
            ret_dust = int(ret.get("dust_mg", 0))
        else:
            initial_status = "IN_PROGRESS"
            returned_on = None
            ret_gross = None
            ret_net = None
            ret_scrap = None
            ret_dust = None

        db.add(
            Order(
                id=oid,
                code=code,
                shop_id=shop_data["id"],
                karigar_id=o["karigar_id"],
                title=o["title"],
                order_type=otype,
                fineness=int(o["fineness"]),
                norm_bp=int(nbp),
                target_gross_mg=int(o["issued_gold_mg"]),
                stone_mg=int(o.get("stone_mg", 0)),
                labour_paise=int(o["labour_inr"]) * 100,
                issued_on=o["issued_on"],
                due_date=o["due_on"],
                returned_on=returned_on,
                return_gross_mg=ret_gross,
                return_net_gold_mg=ret_net,
                return_scrap_mg=ret_scrap,
                return_dust_mg=ret_dust,
                occasion=o.get("occasion"),
                status=initial_status,
                is_history=False,
                photo_url="/v1/demo/photos/order14-bar.jpg" if is_order_14 else None,
            )
        )

    db.flush()

    # Preseeded events (R1..R4, R4s, M1..M5, S1..S4)
    for ev in story["preseeded_events"]["events"]:
        ref = ev["ref"]
        ev_type = ev["type"]
        karigar_id = ev["karigar_id"]
        order_code = ev.get("order")
        oid = order_id_from_code(order_code) if order_code else None
        signers = ev.get("signers", ["p-suresh", karigar_id])
        jeweller_signer = signers[0]
        timestamp = ev["occurred_at"]

        payload: dict[str, Any] = {}
        for k, v in ev.items():
            if k not in ("ref", "type", "karigar_id", "occurred_at", "signers"):
                payload[k] = v
        if "gold_mg" in payload and "fineness" in payload:
            payload["fine_mg"] = fine_mg(int(payload["gold_mg"]), int(payload["fineness"]))
        elif "net_gold_mg" in payload and "fineness" in payload:
            payload["fine_mg"] = fine_mg(int(payload["net_gold_mg"]), int(payload["fineness"]))

        append_chained_event(
            db,
            event_id=ref,
            karigar_id=karigar_id,
            order_id=oid,
            event_type=ev_type,
            timestamp=timestamp,
            actor_id=jeweller_signer,
            jeweller_signer_id=jeweller_signer,
            payload=payload,
        )

    db.add(DemoState(key="current_step", value="S00"))
    db.flush()


def apply_step_s01(db: Session) -> ScaleReading:
    existing = db.get(ScaleReading, "SR-S01")
    if existing:
        return existing
    reading = ScaleReading(
        id="SR-S01",
        shop_id="shop-shetty",
        order_id="order-14",
        weight_mg=40000,
        source="simulated",
        device_id="sim-balance-01",
        stable=True,
        raw_frame="ST,GS,+  40.000g",
        captured_at="2026-10-12T10:02:00+05:30",
    )
    db.add(reading)
    _set_demo_step(db, "S01")
    db.flush()
    return reading


def apply_step_s02(db: Session) -> LedgerEvent:
    apply_step_s01(db)
    existing = db.get(LedgerEvent, "R5")
    if existing:
        return existing
    payload = {
        "order": "#14",
        "gold_mg": 40000,
        "fineness": 916,
        "fine_mg": 36640,
        "stone_mg": 0,
        "norm_bp": 250,
        "norm_basis": "gross_issued",
        "allowed_mg": 1000,
        "photo": "seed/photos/order14-bar.jpg",
    }
    ev = append_chained_event(
        db,
        event_id="R5",
        karigar_id="p-rafiq",
        order_id="order-14",
        event_type="ISSUE",
        timestamp="2026-10-12T10:02:30+05:30",
        actor_id="p-suresh",
        jeweller_signer_id="p-suresh",
        payload=payload,
        sign_jeweller=True,
        sign_karigar=False,
    )
    order14 = db.get(Order, "order-14")
    if order14:
        order14.status = "ISSUED"
    _set_demo_step(db, "S02")
    db.flush()
    return ev


def apply_step_s03(db: Session) -> LedgerEvent:
    ev = apply_step_s02(db)
    if not ev.karigar_sig:
        k_kp = derive_demo_keypair("p-rafiq")
        ev.karigar_sig = sign_event_hash(k_kp.seed_hex, ev.event_hash)
        ev.status = "committed"
        db.add(
            EventSignature(
                id="sig-R5-p-rafiq",
                event_id="R5",
                signer_id="p-rafiq",
                role="karigar",
                sig_hex=ev.karigar_sig,
                signed_at="2026-10-12T10:03:00+05:30",
                readback_played=True,
            )
        )
        # Only on the signature itself: later steps re-run this idempotently and must not rewind the status.
        order14 = db.get(Order, "order-14")
        if order14:
            order14.status = "IN_PROGRESS"
    _set_demo_step(db, "S03")
    db.flush()
    return ev


def apply_step_s04(db: Session) -> tuple[LedgerEvent, LedgerEvent]:
    apply_step_s03(db)
    r6 = db.get(LedgerEvent, "R6")
    r7 = db.get(LedgerEvent, "R7")
    if r6 and r7:
        return r6, r7

    story = get_story_data()
    s04 = next(s for s in story["steps"] if s["id"] == "S04")

    if not db.get(ScaleReading, "SR-S04-PIECE"):
        db.add(
            ScaleReading(
                id="SR-S04-PIECE",
                shop_id="shop-shetty",
                order_id="order-14",
                weight_mg=38120,
                source="simulated",
                device_id="sim-balance-01",
                stable=True,
                raw_frame="ST,GS,+  38.120g",
                captured_at="2026-10-15T16:09:30+05:30",
            )
        )
    if not db.get(ScaleReading, "SR-S04-SCRAP"):
        db.add(
            ScaleReading(
                id="SR-S04-SCRAP",
                shop_id="shop-shetty",
                order_id="order-14",
                weight_mg=500,
                source="simulated",
                device_id="sim-balance-01",
                stable=True,
                raw_frame="ST,GS,+   0.500g",
                captured_at="2026-10-15T16:09:45+05:30",
            )
        )

    r6 = append_chained_event(
        db,
        event_id="R6",
        karigar_id="p-rafiq",
        order_id="order-14",
        event_type="RETURN",
        timestamp="2026-10-15T16:10:00+05:30",
        actor_id="p-lakshmi",
        jeweller_signer_id="p-lakshmi",
        payload={
            "order": "#14",
            "gross_mg": 38120,
            "stone_mg": 0,
            "net_gold_mg": 38120,
            "fineness": 916,
            "fine_mg": fine_mg(38120, 916),
        },
    )
    r7 = append_chained_event(
        db,
        event_id="R7",
        karigar_id="p-rafiq",
        order_id="order-14",
        event_type="SCRAP_RETURN",
        timestamp="2026-10-15T16:10:30+05:30",
        actor_id="p-lakshmi",
        jeweller_signer_id="p-lakshmi",
        payload={
            "order": "#14",
            "gold_mg": 500,
            "fineness": 916,
            "fine_mg": fine_mg(500, 916),
        },
    )

    if not db.get(VoiceNote, "VN-S04"):
        db.add(
            VoiceNote(
                id="VN-S04",
                event_id="R6",
                person_id="p-rafiq",
                lang="bn",
                audio_path="seed/audio/S04_return_note_bn.webm",
                transcript=s04["voice_note"]["transcript"],
                extracted_json=json.dumps(s04["intake_expected"], ensure_ascii=False),
                confidence=94,
                cached=True,
                created_at="2026-10-15T16:10:00+05:30",
            )
        )

    order14 = db.get(Order, "order-14")
    if order14:
        order14.returned_on = "2026-10-15"
        order14.return_gross_mg = 38120
        order14.return_net_gold_mg = 38120
        order14.return_scrap_mg = 500
        order14.return_dust_mg = 0
        order14.status = "RETURNED"

    _set_demo_step(db, "S04")
    db.flush()
    return r6, r7


def apply_step_s05(db: Session) -> ReconciliationRun:
    apply_step_s04(db)
    existing = db.get(ReconciliationRun, "RUN-2026-W42")
    if existing:
        return existing

    story = get_story_data()
    s05 = next(s for s in story["steps"] if s["id"] == "S05")

    rows = [
        reconcile_order(
            order_id="order-12",
            order_code="#12",
            karigar_id="p-manju",
            issued_mg=25000,
            piece_mg=24400,
            scrap_mg=50,
            dust_mg=30,
            norm_bp=250,
            fineness=916,
        ).to_story_row(),
        reconcile_order(
            order_id="order-13",
            order_code="#13",
            karigar_id="p-subrata",
            issued_mg=30000,
            piece_mg=28650,
            scrap_mg=100,
            dust_mg=120,
            norm_bp=400,
            fineness=916,
        ).to_story_row(),
        reconcile_order(
            order_id="order-14",
            order_code="#14",
            karigar_id="p-rafiq",
            issued_mg=40000,
            piece_mg=38120,
            scrap_mg=500,
            dust_mg=0,
            norm_bp=250,
            fineness=916,
        ).to_story_row(),
    ]

    run = ReconciliationRun(
        id="RUN-2026-W42",
        shop_id="shop-shetty",
        week="2026-W42",
        ran_at="2026-10-17T18:00:00+05:30",
        orders_checked=3,
        flags_count=1,
        rows_json=json.dumps(rows),
        explanation=s05["agent_explanation_en"],
        cached=True,
    )
    db.add(run)
    order14 = db.get(Order, "order-14")
    if order14:
        order14.status = "FLAGGED"
    _set_demo_step(db, "S05")
    db.flush()
    return run


def apply_step_s06(db: Session) -> Dispute:
    apply_step_s05(db)
    existing = db.get(Dispute, "D-14")
    if existing:
        return existing

    story = get_story_data()
    s06 = next(s for s in story["steps"] if s["id"] == "S06")

    r8 = append_chained_event(
        db,
        event_id="R8",
        karigar_id="p-rafiq",
        order_id="order-14",
        event_type="DISPUTE_OPEN",
        timestamp="2026-10-17T18:20:00+05:30",
        actor_id="p-rafiq",
        jeweller_signer_id="p-suresh",
        payload={
            "order": "#14",
            "disputed_variance_mg": 380,
            "reason_code": "REWORK",
        },
    )

    if not db.get(VoiceNote, "VN-S06"):
        db.add(
            VoiceNote(
                id="VN-S06",
                event_id="R8",
                person_id="p-rafiq",
                lang="bn",
                audio_path="seed/audio/S06_dispute_bn.webm",
                transcript=s06["voice_note"]["transcript"],
                extracted_json=json.dumps(
                    {
                        "order": "#14",
                        "disputed_variance_mg": 380,
                        "reason_code": "REWORK",
                        "en": s06["voice_note"]["en"],
                    },
                    ensure_ascii=False,
                ),
                confidence=93,
                cached=True,
                created_at="2026-10-17T18:20:00+05:30",
            )
        )

    messages = [
        {
            "id": "msg-d14-1",
            "dispute_id": "D-14",
            "author_id": "p-rafiq",
            "kind": "voice",
            "transcript": s06["voice_note"]["transcript"],
            "text": s06["voice_note"]["en"],
            "voice_note_id": "VN-S06",
            "created_at": "2026-10-17T18:20:00+05:30",
        }
    ]
    dispute = Dispute(
        id="D-14",
        order_id="order-14",
        karigar_id="p-rafiq",
        status="OPEN",
        disputed_variance_mg=380,
        reason_code="REWORK",
        Allowance_mg=None,
        resolved_variance_mg=None,
        open_event_id=r8.id,
        adjustment_event_id=None,
        resolve_event_id=None,
        opened_at="2026-10-17T18:20:00+05:30",
        resolved_at=None,
        messages_json=json.dumps(messages, ensure_ascii=False),
    )
    db.add(dispute)
    order14 = db.get(Order, "order-14")
    if order14:
        order14.status = "DISPUTED"
    _set_demo_step(db, "S06")
    db.flush()
    return dispute


def apply_step_s07(db: Session) -> Dispute:
    dispute = apply_step_s06(db)
    if dispute.status == "RESOLVED":
        return dispute

    r9 = append_chained_event(
        db,
        event_id="R9",
        karigar_id="p-rafiq",
        order_id="order-14",
        event_type="ADJUSTMENT",
        timestamp="2026-10-17T19:05:00+05:30",
        actor_id="p-suresh",
        jeweller_signer_id="p-suresh",
        payload={
            "order": "#14",
            "allowance_mg": 130,
            "fineness": 916,
            "fine_mg": fine_mg(130, 916),
            "reason_code": "REWORK_ALLOWANCE",
        },
    )
    r10 = append_chained_event(
        db,
        event_id="R10",
        karigar_id="p-rafiq",
        order_id="order-14",
        event_type="DISPUTE_RESOLVE",
        timestamp="2026-10-17T19:05:30+05:30",
        actor_id="p-suresh",
        jeweller_signer_id="p-suresh",
        payload={
            "order": "#14",
            "resolved_variance_mg": 250,
            "resolved_variance_fine_mg": fine_mg(250, 916),
        },
    )

    msgs = json.loads(dispute.messages_json)
    msgs.append(
        {
            "id": "msg-d14-2",
            "dispute_id": "D-14",
            "author_id": "p-suresh",
            "kind": "text",
            "text": (
                "Both accept 0.130 g as rework wastage. "
                "0.250 g gross (0.229 g fine) stays on Rafiq's balance."
            ),
            "transcript": None,
            "voice_note_id": None,
            "created_at": "2026-10-17T19:05:00+05:30",
        }
    )
    dispute.messages_json = json.dumps(msgs, ensure_ascii=False)
    dispute.status = "RESOLVED"
    dispute.Allowance_mg = 130
    dispute.resolved_variance_mg = 250
    dispute.adjustment_event_id = r9.id
    dispute.resolve_event_id = r10.id
    dispute.resolved_at = "2026-10-17T19:05:00+05:30"

    order14 = db.get(Order, "order-14")
    if order14:
        order14.status = "RECONCILED"
    _set_demo_step(db, "S07")
    db.flush()
    return dispute


def _settlement_summary() -> Any:
    return compute_settlement(
        karigar_id="p-rafiq",
        period_start="2026-10-12",
        period_end="2026-10-18",
        orders_closed=["#14"],
        opening_gold_with_karigar_mg=18000,
        issued_mg=40000,
        returned_net_gold_mg=38120,
        scrap_mg=500,
        dust_credit_mg=0,
        allowed_wastage_mg=1000,
        approved_adjustment_mg=130,
        labour_paise=480000,
        fineness=916,
        gst_rate_bp=500,
        karigar_gst_registered=True,
    )


SETTLEMENT_NARRATIVE = (
    "Week 42 settlement for Rafiq Sheikh: Order #14 closed with 40.000 g issued, "
    "38.620 g returned (piece + scrap), 1.000 g agreed wastage, and 0.130 g rework "
    "adjustment. Net 0.250 g (0.229 g fine) carries forward with open Order #09 "
    "(18.000 g) for a closing balance of 18.250 g (16.717 g fine). "
    "Labour payable: ₹4,800 + ₹240 GST (5%) = ₹5,040."
)


def create_settlement_draft(db: Session) -> Settlement:
    """S08 part 1: the SettleAgent's statement exists as a DRAFT; nobody has approved it yet."""
    apply_step_s07(db)
    existing = db.get(Settlement, "SET-2026-W42-RAFIQ")
    if existing:
        return existing
    summary = _settlement_summary()
    stl = Settlement(
        id="SET-2026-W42-RAFIQ",
        shop_id="shop-shetty",
        karigar_id="p-rafiq",
        period_start="2026-10-12",
        period_end="2026-10-18",
        summary_json=json.dumps(summary.to_expected_dict()),
        narrative=SETTLEMENT_NARRATIVE,
        jeweller_approved=False,
        karigar_approved=False,
        event_id=None,
        status="DRAFT",
    )
    db.add(stl)
    db.flush()
    return stl


def approve_settlement_party(db: Session, party: str) -> Settlement:
    """S08 part 2: one side approves. The SETTLEMENT event (R11) seals only when both have approved."""
    stl = create_settlement_draft(db)
    if party == "karigar":
        stl.karigar_approved = True
    else:
        stl.jeweller_approved = True
    if stl.jeweller_approved and stl.karigar_approved and stl.event_id is None:
        _seal_settlement(db, stl)
    db.flush()
    return stl


def apply_step_s08(db: Session) -> Settlement:
    approve_settlement_party(db, "jeweller")
    return approve_settlement_party(db, "karigar")


def _seal_settlement(db: Session, existing: Settlement) -> None:
    summary = _settlement_summary()
    r11 = append_chained_event(
        db,
        event_id="R11",
        karigar_id="p-rafiq",
        order_id="order-14",
        event_type="SETTLEMENT",
        timestamp="2026-10-18T11:00:00+05:30",
        actor_id="p-suresh",
        jeweller_signer_id="p-suresh",
        payload={
            "period": "2026-10-12/2026-10-18",
            "orders": ["#14"],
            "opening_gold_with_karigar_mg": summary.opening_gold_with_karigar_mg,
            "issued_mg": summary.issued_mg,
            "returned_net_gold_mg": summary.returned_net_gold_mg,
            "scrap_mg": summary.scrap_mg,
            "dust_credit_mg": summary.dust_credit_mg,
            "allowed_wastage_mg": summary.allowed_wastage_mg,
            "approved_adjustment_mg": summary.approved_adjustment_mg,
            "carried_shortfall_mg": summary.carried_shortfall_mg,
            "carried_shortfall_fine_mg": summary.carried_shortfall_fine_mg,
            "closing_gold_with_karigar_mg": summary.closing_gold_with_karigar_mg,
            "closing_fine_mg": summary.closing_fine_mg,
            "labour_paise": summary.labour_paise,
            "gst_paise": summary.gst_paise,
            "payable_paise": summary.payable_paise,
        },
    )

    existing.event_id = r11.id
    existing.status = "APPROVED"

    order14 = db.get(Order, "order-14")
    if order14:
        order14.status = "SETTLED"

    _set_demo_step(db, "S08")


def apply_step_s09(db: Session) -> PaymentIntent:
    stl = apply_step_s08(db)
    existing = db.get(PaymentIntent, "PI-2026-W42-RAFIQ")
    if existing:
        return existing

    vpa = settings.tola_upi_vpa
    pn = quote(settings.tola_upi_payee_name, safe="")
    upi_uri = f"upi://pay?pa={vpa}&pn={pn}&am=5040.00&cu=INR&tn=Tola%20wk42%20Order%2014"
    pi = PaymentIntent(
        id="PI-2026-W42-RAFIQ",
        settlement_id=stl.id,
        amount_paise=504000,
        upi_uri=upi_uri,
        status="simulated",
        created_at="2026-10-18T11:02:00+05:30",
    )
    db.add(pi)
    stl.status = "PAID"
    _set_demo_step(db, "S09")
    db.flush()
    return pi


def passport_summary_dict() -> dict[str, Any]:
    """Rafiq's Work Passport figures, computed from his chain (F-08). Deterministic."""
    story = get_story_data()
    all_orders = list(story["history"]["orders"]) + list(story["orders"])
    norms = story["wastage_norms"]["basis_points"]
    summary = compute_passport_summary(
        karigar_id="p-rafiq",
        window_start="2026-04-21",
        window_end="2026-10-18",
        orders=all_orders,
        norm_bps_by_type=norms,
        approved_adjustment_mg=130,
        disputes_opened=1,
        disputes_resolved=1,
        dispute_resolution_minutes=45,
        jewellers_on_tola=1,
        jewellers_total_declared=3,
    )

    return {
        "window": summary.window,
        "orders": summary.orders,
        "grams_handled_mg": summary.grams_handled_mg,
        "grams_handled_fine_mg": summary.grams_handled_fine_mg,
        "returned": summary.returned,
        "on_time": summary.on_time,
        "on_time_bps": summary.on_time_bps,
        "on_time_pct_x10": summary.on_time_pct_x10,
        "on_time_pct_str": f"{summary.on_time_pct_x10 // 10}.{summary.on_time_pct_x10 % 10}%",
        "allowed_wastage_mg": summary.allowed_wastage_mg,
        "actual_wastage_mg": summary.actual_wastage_mg,
        "approved_adjustment_mg": summary.approved_adjustment_mg,
        "net_variance_mg": summary.net_variance_mg,
        "allowance_used_bps": summary.allowance_used_bps,
        "allowance_used_pct_x10": summary.allowance_used_pct_x10,
        "allowance_used_pct_str": (
            f"{summary.allowance_used_pct_x10 // 10}.{summary.allowance_used_pct_x10 % 10}%"
        ),
        "disputes_opened": summary.disputes_opened,
        "disputes_resolved": summary.disputes_resolved,
        "dispute_resolution_minutes": summary.dispute_resolution_minutes,
        "jewellers_on_tola": summary.jewellers_on_tola,
        "jewellers_total_declared": summary.jewellers_total_declared,
    }


def apply_step_s10(db: Session) -> PassportShare:
    apply_step_s09(db)
    token = "ps-rafiq-w42-demo0001a"
    existing = db.get(PassportShare, token)
    if existing:
        return existing

    summary_dict = passport_summary_dict()

    share = PassportShare(
        token=token,
        karigar_id="p-rafiq",
        recipient_id="p-meera",
        scope_json=json.dumps(["grams_handled", "on_time", "variance_vs_norm", "disputes"]),
        summary_json=json.dumps(summary_dict),
        created_at="2026-10-18T11:10:00+05:30",
        expires_at="2026-10-25T11:10:00+05:30",
        revoked=False,
        views=0,
    )
    db.add(share)
    _set_demo_step(db, "S10")
    db.flush()
    return share


def _set_demo_step(db: Session, step_id: str) -> None:
    """Record the last completed story step. Only moves forward: replaying an earlier,
    idempotent step must not rewind the story."""
    st = db.get(DemoState, "current_step")
    if st is None:
        db.add(DemoState(key="current_step", value=step_id))
    elif int(step_id[1:]) > int(st.value[1:]):
        st.value = step_id


def mark_step_done(db: Session, step_id: str) -> None:
    _set_demo_step(db, step_id)


_reset_lock = threading.Lock()


def reset_to_step(db: Session, to_step: str | int | None = None) -> dict[str, Any]:
    """Drop all rows, re-seed base state from `seed/story.json`, and fast-forward to `to_step`."""
    from sqlalchemy import text

    with _reset_lock:
        db.expunge_all()
        Base.metadata.create_all(bind=db.get_bind())
        db.execute(text("PRAGMA foreign_keys=OFF;"))
        for table in reversed(Base.metadata.sorted_tables):
            db.execute(table.delete())
        db.execute(text("PRAGMA foreign_keys=ON;"))

        story = get_story_data()
        _seed_base(db, story)

        norm_step = normalize_step_id(to_step)
        if norm_step is not None:
            step_num = int(norm_step[1:])
            if step_num >= 1:
                apply_step_s01(db)
            if step_num >= 2:
                apply_step_s02(db)
            if step_num >= 3:
                apply_step_s03(db)
            if step_num >= 4:
                apply_step_s04(db)
            if step_num >= 5:
                apply_step_s05(db)
            if step_num >= 6:
                apply_step_s06(db)
            if step_num >= 7:
                apply_step_s07(db)
            if step_num >= 8:
                apply_step_s08(db)
            if step_num >= 9:
                apply_step_s09(db)
            if step_num >= 10:
                share = apply_step_s10(db)
                # S11 is the lender opening the link once; replay counts that view like the live step does.
                if step_num >= 11:
                    share.views = 1
            _set_demo_step(db, norm_step)

        db.commit()

        events_count = len(db.scalars(select(LedgerEvent)).all())
        orders_count = len(db.scalars(select(Order).where(Order.is_history.is_(False))).all())
        rafiq_head = db.scalar(
            select(LedgerEvent)
            .where(LedgerEvent.karigar_id == "p-rafiq")
            .order_by(LedgerEvent.seq.desc())
            .limit(1)
        )
        current_step_str = norm_step or "S01"
        step_num_out = int(current_step_str[1:]) if norm_step else 0
        steps = story.get("steps", [])
        step_obj = next((s for s in steps if s["id"] == current_step_str), steps[0] if steps else {})

        return {
            "status": "ok",
            "scenario": "story_week",
            "to_step": norm_step,
            "step": step_num_out,
            "current_step": current_step_str,
            "steps_total": len(steps),
            "step_label": step_obj.get("title", "Gold on the scale"),
            "events_count": events_count,
            "orders_count": orders_count,
            "head_hash_rafiq": rafiq_head.event_hash if rafiq_head else GENESIS_HASH,
        }


def main() -> int:
    parser = argparse.ArgumentParser(description="Seed or reset the Tola demo SQLite database.")
    parser.add_argument("--reset", action="store_true", help="Drop and rebuild the demo database")
    parser.add_argument("--if-empty", action="store_true", help="Seed only if no shop record exists")
    parser.add_argument("--to-step", type=str, default=None, help="Optional step S01..S13")
    args = parser.parse_args()

    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        if args.if_empty and not args.reset:
            has_shop = db.scalar(select(Shop).limit(1)) is not None
            if has_shop:
                print("Tola demo DB already seeded; skipping (--if-empty).")
                return 0
        res = reset_to_step(db, args.to_step)
        print(f"Seeded Tola demo DB: {json.dumps(res)}")
    return 0


cli = main


if __name__ == "__main__":
    raise SystemExit(main())
