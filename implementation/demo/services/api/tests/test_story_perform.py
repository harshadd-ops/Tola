"""Story mode: `POST /v1/demo/steps/{id}/perform` and `GET /v1/demo/state`.

A step performed live must land on exactly the same chain as the same step replayed by
`POST /v1/demo/reset` (SC-5), and GET endpoints must never create story data.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from tola_api.main import app


def _perform(client: TestClient, step: str, party: str | None = None) -> dict:
    body = {"party": party} if party else None
    r = client.post(f"/v1/demo/steps/{step}/perform", json=body)
    assert r.status_code == 200, r.text
    return r.json()


@pytest.mark.story
def test_perform_walks_the_week_and_matches_replay() -> None:
    with TestClient(app) as client:
        client.post("/v1/demo/reset", json={})
        s = client.get("/v1/demo/state").json()
        assert s["last_done"] == "S00" and s["done"] == []
        assert s["settlement"] is None and s["reconcile"] is None and s["passport"] is None

        # GETs before their step must 404, not invent data.
        assert client.get("/v1/settlements/SET-2026-W42-RAFIQ").status_code == 404
        assert client.get("/v1/reconciliation/runs/RUN-2026-W42").status_code == 404
        assert client.get("/v1/passport/ps-rafiq-w42-demo0001a").status_code == 404

        _perform(client, "S01")
        s = _perform(client, "S02")
        r5 = next(e for e in s["events"] if e["id"] == "R5")
        assert r5["weight_mg"] == 40000 and r5["jeweller_signed"] and not r5["karigar_signed"]

        s = _perform(client, "S03")
        assert next(e for e in s["events"] if e["id"] == "R5")["sealed"] is True

        s = _perform(client, "S04")
        o14 = next(o for o in s["orders"] if o["code"] == "#14")
        assert (o14["piece_mg"], o14["scrap_mg"], o14["returned_total_mg"], o14["loss_mg"]) == (
            38120,
            500,
            38620,
            1380,
        )

        s = _perform(client, "S05")
        row14 = next(r for r in s["reconcile"]["rows"] if r["order"] == "#14")
        assert row14["variance_mg"] == 380 and row14["flag"] is True

        s = _perform(client, "S06")
        assert s["dispute"]["status"] == "OPEN" and s["dispute"]["disputed_mg"] == 380

        s = _perform(client, "S07")
        assert (s["dispute"]["resolved_mg"], s["dispute"]["resolved_fine_mg"]) == (250, 229)

        s = _perform(client, "S08")
        assert s["settlement"]["status"] == "DRAFT" and s["settlement"]["sealed"] is False
        s = _perform(client, "S08", "jeweller")
        assert s["settlement"]["jeweller_approved"] and not s["settlement"]["sealed"]
        assert s["last_done"] == "S07"
        s = _perform(client, "S08", "karigar")
        assert s["settlement"]["sealed"] and s["settlement"]["event_id"] == "R11"
        assert s["settlement"]["summary"]["payable_paise"] == 504000
        assert s["last_done"] == "S08"

        s = _perform(client, "S09")
        assert s["payment"]["amount_paise"] == 504000 and "am=5040.00" in s["payment"]["upi_uri"]

        s = _perform(client, "S10")
        assert s["passport"]["summary"]["grams_handled_mg"] == 194000
        assert s["passport"]["summary"]["on_time_pct_str"] == "92.9%"

        for step in ("S11", "S12", "S13"):
            s = _perform(client, step)
        assert s["last_done"] == "S13" and len(s["done"]) == 13
        # Re-running earlier idempotent steps must not rewind order statuses.
        assert next(o for o in s["orders"] if o["code"] == "#14")["status"] == "SETTLED"
        rafiq = next(k for k in s["karigars"] if k["id"] == "p-rafiq")
        assert (rafiq["open_orders"], rafiq["open_mg"], rafiq["carried_mg"]) == (["#09"], 18000, 250)
        assert s["chain"]["valid"] is True
        live_head = s["chain"]["head_hash"]
        assert [e["id"] for e in s["events"]][-7:] == ["R5", "R6", "R7", "R8", "R9", "R10", "R11"]

        # Replaying the whole week from the seed lands on the identical chain head.
        client.post("/v1/demo/reset", json={"to_step": "S13"})
        assert client.get("/v1/demo/state").json()["chain"]["head_hash"] == live_head


@pytest.mark.story
def test_replaying_an_earlier_step_never_rewinds() -> None:
    with TestClient(app) as client:
        client.post("/v1/demo/reset", json={"to_step": "S05"})
        s = _perform(client, "S03")
        assert s["last_done"] == "S05"


def test_unknown_step_is_404() -> None:
    with TestClient(app) as client:
        assert client.post("/v1/demo/steps/S99/perform").status_code == 404
