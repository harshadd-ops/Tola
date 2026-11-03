"""Weekly settlement calculation for a shop-karigar pair.

Gold is always settled in grams (carried forward on the karigar's balance) and
never netted against rupee labour charges (EC-12).
"""

from __future__ import annotations

from dataclasses import dataclass

from tola_api.ledger_core.units import (
    fine_mg,
    gst_paise,
    require_int,
    require_non_neg_int,
    signed_fine_mg,
)


@dataclass(frozen=True)
class SettlementSummary:
    karigar_id: str
    period_start: str
    period_end: str
    orders_closed: list[str]
    fineness: int
    opening_gold_with_karigar_mg: int
    issued_mg: int
    returned_net_gold_mg: int
    scrap_mg: int
    dust_credit_mg: int
    allowed_wastage_mg: int
    approved_adjustment_mg: int
    carried_shortfall_mg: int
    carried_shortfall_fine_mg: int
    open_orders_mg: int
    closing_gold_with_karigar_mg: int
    closing_fine_mg: int
    labour_inr: int
    labour_paise: int
    gst_rate_bp: int
    gst_paise: int
    karigar_gst_registered: bool
    payable_paise: int

    def to_expected_dict(self) -> dict[str, object]:
        return {
            "karigar_id": self.karigar_id,
            "orders_closed": list(self.orders_closed),
            "opening_gold_with_karigar_mg": self.opening_gold_with_karigar_mg,
            "issued_mg": self.issued_mg,
            "returned_net_gold_mg": self.returned_net_gold_mg,
            "scrap_mg": self.scrap_mg,
            "dust_credit_mg": self.dust_credit_mg,
            "allowed_wastage_mg": self.allowed_wastage_mg,
            "approved_adjustment_mg": self.approved_adjustment_mg,
            "carried_shortfall_mg": self.carried_shortfall_mg,
            "carried_shortfall_fine_mg": self.carried_shortfall_fine_mg,
            "open_orders_mg": self.open_orders_mg,
            "closing_gold_with_karigar_mg": self.closing_gold_with_karigar_mg,
            "closing_fine_mg": self.closing_fine_mg,
            "labour_inr": self.labour_inr,
            "labour_paise": self.labour_paise,
            "gst_rate_bp": self.gst_rate_bp,
            "gst_paise": self.gst_paise,
            "karigar_gst_registered": self.karigar_gst_registered,
            "payable_paise": self.payable_paise,
            "gold_settled_in": "grams (carried forward), never netted against rupees (EC-12)",
        }


def compute_settlement(
    karigar_id: str,
    period_start: str,
    period_end: str,
    orders_closed: list[str],
    opening_gold_with_karigar_mg: int,
    issued_mg: int,
    returned_net_gold_mg: int,
    scrap_mg: int,
    dust_credit_mg: int,
    allowed_wastage_mg: int,
    approved_adjustment_mg: int,
    labour_paise: int,
    fineness: int = 916,
    gst_rate_bp: int = 500,
    karigar_gst_registered: bool = True,
) -> SettlementSummary:
    """Compute period gold balance and rupee labour + 5% GST payable."""
    require_non_neg_int(opening_gold_with_karigar_mg, "opening_gold_with_karigar_mg")
    require_non_neg_int(issued_mg, "issued_mg")
    require_non_neg_int(returned_net_gold_mg, "returned_net_gold_mg")
    require_non_neg_int(scrap_mg, "scrap_mg")
    require_non_neg_int(dust_credit_mg, "dust_credit_mg")
    require_non_neg_int(allowed_wastage_mg, "allowed_wastage_mg")
    require_non_neg_int(approved_adjustment_mg, "approved_adjustment_mg")
    require_non_neg_int(labour_paise, "labour_paise")
    require_int(fineness, "fineness")
    require_non_neg_int(gst_rate_bp, "gst_rate_bp")

    carried_shortfall_mg = (
        issued_mg
        - returned_net_gold_mg
        - scrap_mg
        - dust_credit_mg
        - allowed_wastage_mg
        - approved_adjustment_mg
    )
    carried_shortfall_fine_mg = signed_fine_mg(carried_shortfall_mg, fineness)
    open_orders_mg = opening_gold_with_karigar_mg
    closing_gold_with_karigar_mg = open_orders_mg + carried_shortfall_mg
    closing_fine_mg = signed_fine_mg(closing_gold_with_karigar_mg, fineness)

    computed_gst = gst_paise(labour_paise, gst_rate_bp) if karigar_gst_registered else 0
    payable_paise = labour_paise + computed_gst
    labour_inr = labour_paise // 100

    return SettlementSummary(
        karigar_id=karigar_id,
        period_start=period_start,
        period_end=period_end,
        orders_closed=list(orders_closed),
        fineness=fineness,
        opening_gold_with_karigar_mg=opening_gold_with_karigar_mg,
        issued_mg=issued_mg,
        returned_net_gold_mg=returned_net_gold_mg,
        scrap_mg=scrap_mg,
        dust_credit_mg=dust_credit_mg,
        allowed_wastage_mg=allowed_wastage_mg,
        approved_adjustment_mg=approved_adjustment_mg,
        carried_shortfall_mg=carried_shortfall_mg,
        carried_shortfall_fine_mg=carried_shortfall_fine_mg,
        open_orders_mg=open_orders_mg,
        closing_gold_with_karigar_mg=closing_gold_with_karigar_mg,
        closing_fine_mg=fine_mg(closing_gold_with_karigar_mg, fineness)
        if closing_gold_with_karigar_mg >= 0
        else closing_fine_mg,
        labour_inr=labour_inr,
        labour_paise=labour_paise,
        gst_rate_bp=gst_rate_bp if karigar_gst_registered else 0,
        gst_paise=computed_gst,
        karigar_gst_registered=karigar_gst_registered,
        payable_paise=payable_paise,
    )
