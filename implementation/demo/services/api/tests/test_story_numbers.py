"""Pin every canonical number from `DEMO_SPEC.md §8` and `seed/story.json`."""

from __future__ import annotations

import pytest

from tola_api.ledger_core.passport import compute_passport_summary
from tola_api.ledger_core.reconcile import reconcile_order
from tola_api.ledger_core.settle import compute_settlement
from tola_api.ledger_core.units import bp_of, fine_mg, gst_paise
from tola_api.seed.story import get_story_data


@pytest.mark.story
def test_canonical_story_numbers() -> None:
    # S01-S03: Issue Order #14
    assert fine_mg(40_000, 916) == 36_640
    assert bp_of(40_000, 250) == 1_000

    # S04-S05: Return Order #14 (38,120 mg piece + 500 mg scrap = 38,620 mg) & Reconcile
    row12 = reconcile_order("order-12", "#12", "p-manju", 25_000, 24_400, 50, 30, 250, 916)
    row13 = reconcile_order("order-13", "#13", "p-subrata", 30_000, 28_650, 100, 120, 400, 916)
    row14 = reconcile_order("order-14", "#14", "p-rafiq", 40_000, 38_120, 500, 0, 250, 916)

    assert row12.variance_mg == -105
    assert row12.flagged is False
    assert row13.variance_mg == -70
    assert row13.flagged is False
    assert row14.returned_mg == 38_620
    assert row14.loss_mg == 1_380
    assert row14.allowed_mg == 1_000
    assert row14.variance_mg == 380
    assert row14.variance_fine_mg == 348
    assert row14.variance_inr == 5_188
    assert row14.flagged is True

    # S07-S09: Dispute resolution (130 mg rework allowance -> 250 mg / 229 mg fine carried) & Settlement
    stl = compute_settlement(
        karigar_id="p-rafiq",
        period_start="2026-10-12",
        period_end="2026-10-18",
        orders_closed=["#14"],
        opening_gold_with_karigar_mg=18_000,
        issued_mg=40_000,
        returned_net_gold_mg=38_120,
        scrap_mg=500,
        dust_credit_mg=0,
        allowed_wastage_mg=1_000,
        approved_adjustment_mg=130,
        labour_paise=480_000,
        fineness=916,
        gst_rate_bp=500,
        karigar_gst_registered=True,
    )
    assert stl.carried_shortfall_mg == 250
    assert stl.carried_shortfall_fine_mg == 229
    assert stl.closing_gold_with_karigar_mg == 18_250
    assert stl.closing_fine_mg == 16_717
    assert gst_paise(480_000, 500) == 24_000
    assert stl.gst_paise == 24_000
    assert stl.payable_paise == 504_000

    # S10-S11: Work Passport summary over 6-month history
    story = get_story_data()
    all_orders = list(story["history"]["orders"]) + list(story["orders"])
    norms = story["wastage_norms"]["basis_points"]
    passport = compute_passport_summary(
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
    assert passport.orders == 15
    assert passport.grams_handled_mg == 194_000
    assert passport.returned == 14
    assert passport.on_time == 13
    assert passport.on_time_bps == 9286
    assert passport.allowed_wastage_mg == 8_794
    assert passport.actual_wastage_mg == 7_490
    assert passport.approved_adjustment_mg == 130
    assert passport.net_variance_mg == -1_434
    assert passport.allowance_used_bps == 8369
    assert passport.allowance_used_pct_x10 == 837
