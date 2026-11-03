"""End-to-end HTTP story test driving all 13 steps (`S01`–`S13`) through FastAPI TestClient."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from tola_api.main import app


@pytest.mark.story
def test_full_13_step_http_story() -> None:
    with TestClient(app) as client:
        # 0. Reset to clean S01 base state
        r_reset = client.post("/v1/demo/reset", json={})
        assert r_reset.status_code == 200
        assert r_reset.json()["status"] == "ok"

        # S01: Scale reading 40,000 mg
        r_s01 = client.post(
            "/v1/scale/readings",
            json={"order_id": "order-14", "weight_mg": 40000, "source": "simulated"},
        )
        assert r_s01.status_code == 201
        assert r_s01.json()["weight_mg"] == 40000
        assert r_s01.json()["fine_mg"] == 36640

        # Non-integer float weight is rejected with 422
        r_bad = client.post(
            "/v1/scale/readings",
            json={"order_id": "order-14", "weight_mg": 40.5, "source": "simulated"},
        )
        assert r_bad.status_code == 422

        # S02: Create ISSUE event R5 (signed by Suresh, awaiting Rafiq)
        r_s02 = client.post(
            "/v1/events",
            json={
                "event_type": "ISSUE",
                "order": "#14",
                "karigar_id": "p-rafiq",
                "gold_mg": 40000,
                "fineness": 916,
            },
        )
        assert r_s02.status_code == 201
        ev_r5 = r_s02.json()
        assert ev_r5["id"] == "R5"
        assert ev_r5["sealed"] is False

        # S03: Bengali voice readback + Karigar signature
        r_tts = client.post("/v1/voice/readback", json={"event_id": "R5", "lang": "bn"})
        assert r_tts.status_code == 200
        assert "অর্ডার" in r_tts.json()["text"]
        assert r_tts.json()["audio_b64"]

        r_s03 = client.post(
            "/v1/events/R5/signatures",
            json={"signer_id": "p-rafiq", "auto_demo_sign": True, "readback_played": True},
        )
        assert r_s03.status_code == 200
        assert r_s03.json()["sealed"] is True
        assert r_s03.json()["signatures_count"] == 2

        # S04: Voice intake + RETURN R6 (38,120 mg) & SCRAP_RETURN R7 (500 mg)
        r_intake = client.post(
            "/v1/voice/intake",
            json={"lang": "bn", "piece_gross_mg": 38120, "scrap_mg": 500},
        )
        assert r_intake.status_code == 200
        assert r_intake.json()["extracted"]["piece_gross_mg"] == 38120
        assert r_intake.json()["extracted"]["scrap_mg"] == 500

        r_s04 = client.post(
            "/v1/events",
            json={"event_type": "RETURN", "order": "#14", "karigar_id": "p-rafiq"},
        )
        assert r_s04.status_code == 201
        assert r_s04.json()["id"] == "R6"

        # S05: Weekly reconciliation run -> 3 orders checked, 1 flag (+380 mg on #14)
        r_s05 = client.post("/v1/reconciliation/runs", json={"week": "2026-W42"})
        assert r_s05.status_code == 201
        rec = r_s05.json()
        assert rec["orders_checked"] == 3
        assert rec["flags_count"] == 1
        row14 = next(r for r in rec["rows"] if r["order"] == "#14")
        assert row14["variance_mg"] == 380
        assert row14["variance_fine_mg"] == 348
        assert row14["flag"] is True

        # S06: Open dispute D-14
        r_s06 = client.post("/v1/disputes", json={"order_id": "order-14"})
        assert r_s06.status_code == 201
        assert r_s06.json()["id"] == "D-14"
        assert r_s06.json()["status"] == "OPEN"

        # S07: Resolve dispute D-14 with 130 mg rework allowance -> 250 mg carried
        r_s07 = client.post("/v1/disputes/D-14/resolve", json={"allowance_mg": 130})
        assert r_s07.status_code == 200
        assert r_s07.json()["status"] == "RESOLVED"
        assert r_s07.json()["allowance_mg"] == 130
        assert r_s07.json()["resolved_variance_mg"] == 250

        # S08: Create and approve weekly settlement -> closing 18,250 mg, payable 504,000 paise
        r_s08 = client.post("/v1/settlements", json={"karigar_id": "p-rafiq"})
        assert r_s08.status_code == 201
        stl = r_s08.json()
        assert stl["summary"]["closing_gold_with_karigar_mg"] == 18250
        assert stl["summary"]["carried_shortfall_mg"] == 250
        assert stl["summary"]["carried_shortfall_fine_mg"] == 229
        assert stl["summary"]["payable_paise"] == 504000
        assert stl["status"] == "DRAFT" and stl["sealed"] is False

        # Payment stays locked until both sides approve (F-07)
        assert client.post(f"/v1/settlements/{stl['id']}/payment-intent").status_code == 409
        url = f"/v1/settlements/{stl['id']}/approve"
        a1 = client.post(url, json={"signer_id": "p-suresh", "role": "jeweller"})
        assert a1.json()["sealed"] is False
        a2 = client.post(url, json={"signer_id": "p-rafiq", "role": "karigar"})
        assert a2.json()["sealed"] is True and a2.json()["event_id"] == "R11"

        # S09: Simulated UPI payment intent
        r_s09 = client.post(f"/v1/settlements/{stl['id']}/payment-intent")
        assert r_s09.status_code == 201
        pi = r_s09.json()
        assert pi["amount_paise"] == 504000
        assert "am=5040.00" in pi["upi_uri"]
        assert pi["status"] == "simulated"

        # S10 & S11: Share & verify Work Passport
        r_s10 = client.post("/v1/passport/shares", json={"karigar_id": "p-rafiq"})
        assert r_s10.status_code == 201
        token = r_s10.json()["token"]

        r_s11 = client.get(f"/v1/passport/{token}")
        assert r_s11.status_code == 200
        pp = r_s11.json()
        assert pp["summary"]["grams_handled_mg"] == 194000
        assert pp["summary"]["on_time"] == 13
        assert pp["summary"]["returned"] == 14
        assert pp["verification"]["verified"] is True

        # S12: GST Rule 55 challan & SAC 9988 labour invoice draft PDF
        r_s12 = client.get(f"/v1/settlements/{stl['id']}/gst-draft")
        assert r_s12.status_code == 200
        assert r_s12.headers["content-type"] == "application/pdf"
        assert b"DRAFT, for your CA. Not filed." in r_s12.content

        # S13: Chain valid + Tamper sandbox detects broken at R6 without mutating DB
        r_s13_ok = client.get("/v1/ledger?karigarId=p-rafiq")
        assert r_s13_ok.status_code == 200
        assert r_s13_ok.json()["chain"]["valid"] is True

        r_s13_tamper = client.get("/v1/ledger?karigarId=p-rafiq&sandbox=tamper:R6")
        assert r_s13_tamper.status_code == 200
        assert r_s13_tamper.json()["chain"]["valid"] is False
        assert r_s13_tamper.json()["chain"]["broken_at"] == "R6"

        # Verify DB is still valid after sandbox tamper
        r_s13_after = client.get("/v1/ledger?karigarId=p-rafiq")
        assert r_s13_after.json()["chain"]["valid"] is True
