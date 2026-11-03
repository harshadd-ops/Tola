"""Deterministic order reconciliation, variance calculation, and outlier detection."""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass

from tola_api.ledger_core.units import (
    bp_of,
    require_int,
    require_non_neg_int,
    signed_fine_mg,
)


@dataclass(frozen=True)
class OrderReconcileRow:
    order_id: str
    order_code: str
    karigar_id: str
    fineness: int
    issued_mg: int
    piece_mg: int
    scrap_mg: int
    dust_mg: int
    returned_mg: int
    loss_mg: int
    norm_bp: int
    adjustments_mg: int
    allowed_mg: int
    variance_mg: int
    variance_fine_mg: int
    variance_inr: int
    variance_paise: int
    flagged: bool

    def to_story_row(self) -> dict[str, object]:
        """Return dict matching `seed/story.json` S05.expected.rows format."""
        return {
            "order": self.order_code,
            "order_code": self.order_code,
            "order_id": self.order_id,
            "karigar_id": self.karigar_id,
            "issued_gold_mg": self.issued_mg,
            "issued_mg": self.issued_mg,
            "returned_gold_mg": self.returned_mg,
            "returned_mg": self.returned_mg,
            "piece_mg": self.piece_mg,
            "scrap_mg": self.scrap_mg,
            "dust_mg": self.dust_mg,
            "loss_mg": self.loss_mg,
            "norm_bp": self.norm_bp,
            "adjustments_mg": self.adjustments_mg,
            "allowed_mg": self.allowed_mg,
            "variance_mg": self.variance_mg,
            "variance_fine_mg": self.variance_fine_mg,
            "variance_inr": self.variance_inr,
            "variance_paise": self.variance_paise,
            "flag": self.flagged,
            "flagged": self.flagged,
        }


def reconcile_order(
    order_id: str,
    order_code: str,
    karigar_id: str,
    issued_mg: int,
    piece_mg: int,
    scrap_mg: int,
    dust_mg: int,
    norm_bp: int,
    fineness: int = 916,
    adjustments_mg: int = 0,
    flag_tolerance_mg: int = 50,
    gold_24k_inr_per_g: int = 14904,
) -> OrderReconcileRow:
    """Compute gross loss, allowed wastage, variance, and flag status for an order."""
    require_non_neg_int(issued_mg, "issued_mg")
    require_non_neg_int(piece_mg, "piece_mg")
    require_non_neg_int(scrap_mg, "scrap_mg")
    require_non_neg_int(dust_mg, "dust_mg")
    require_non_neg_int(norm_bp, "norm_bp")
    require_int(fineness, "fineness")
    require_non_neg_int(adjustments_mg, "adjustments_mg")
    require_non_neg_int(flag_tolerance_mg, "flag_tolerance_mg")
    require_non_neg_int(gold_24k_inr_per_g, "gold_24k_inr_per_g")

    returned_mg = piece_mg + scrap_mg + dust_mg
    loss_mg = issued_mg - returned_mg
    allowed_mg = bp_of(issued_mg, norm_bp) + adjustments_mg
    variance_mg = loss_mg - allowed_mg
    variance_fine_mg = signed_fine_mg(variance_mg, fineness)

    sign = -1 if variance_mg < 0 else 1
    abs_var = abs(variance_mg)
    abs_inr = (abs_var * fineness * gold_24k_inr_per_g + 500_000) // 1_000_000
    variance_inr = sign * abs_inr
    variance_paise = variance_inr * 100
    flagged = variance_mg > flag_tolerance_mg

    return OrderReconcileRow(
        order_id=order_id,
        order_code=order_code,
        karigar_id=karigar_id,
        fineness=fineness,
        issued_mg=issued_mg,
        piece_mg=piece_mg,
        scrap_mg=scrap_mg,
        dust_mg=dust_mg,
        returned_mg=returned_mg,
        loss_mg=loss_mg,
        norm_bp=norm_bp,
        adjustments_mg=adjustments_mg,
        allowed_mg=allowed_mg,
        variance_mg=variance_mg,
        variance_fine_mg=variance_fine_mg,
        variance_inr=variance_inr,
        variance_paise=variance_paise,
        flagged=flagged,
    )


def _median_int(values: Sequence[int]) -> int:
    s = sorted(values)
    n = len(s)
    if n == 0:
        return 0
    mid = n // 2
    if n % 2 == 1:
        return s[mid]
    return (s[mid - 1] + s[mid]) // 2


def robust_z_score_x100(value_bp: int, history_bps: Sequence[int]) -> int:
    """Compute integer robust z-score * 100 using median and MAD in basis points."""
    require_int(value_bp, "value_bp")
    if len(history_bps) < 3:
        return 0
    med = _median_int(history_bps)
    deviations = [abs(x - med) for x in history_bps]
    mad = max(1, _median_int(deviations))
    # 0.6745 * (value - med) / mad -> scaled by 100: (6745 * (value - med)) // (100 * mad)
    return (6745 * (value_bp - med)) // (100 * mad)
