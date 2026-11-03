"""Work Passport summary computation from verified order & event history."""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from typing import Any

from tola_api.ledger_core.units import bp_of, fine_mg, require_int, require_non_neg_int


@dataclass(frozen=True)
class PassportSummary:
    karigar_id: str
    window: str
    window_start: str
    window_end: str
    orders: int
    grams_handled_mg: int
    grams_handled_fine_mg: int
    returned: int
    on_time: int
    on_time_bps: int
    on_time_pct_x10: int
    allowed_wastage_mg: int
    actual_wastage_mg: int
    approved_adjustment_mg: int
    net_variance_mg: int
    allowance_used_bps: int
    allowance_used_pct_x10: int
    disputes_opened: int
    disputes_resolved: int
    dispute_resolution_minutes: int
    jewellers_on_tola: int
    jewellers_total_declared: int


def compute_passport_summary(
    karigar_id: str,
    window_start: str,
    window_end: str,
    orders: Sequence[dict[str, Any]],
    norm_bps_by_type: dict[str, int],
    approved_adjustment_mg: int = 0,
    disputes_opened: int = 0,
    disputes_resolved: int = 0,
    dispute_resolution_minutes: int = 0,
    jewellers_on_tola: int = 1,
    jewellers_total_declared: int = 3,
) -> PassportSummary:
    """Aggregate a karigar's Work Passport metrics over `[window_start, window_end]`."""
    require_non_neg_int(approved_adjustment_mg, "approved_adjustment_mg")
    require_non_neg_int(disputes_opened, "disputes_opened")
    require_non_neg_int(disputes_resolved, "disputes_resolved")
    require_non_neg_int(dispute_resolution_minutes, "dispute_resolution_minutes")
    require_non_neg_int(jewellers_on_tola, "jewellers_on_tola")
    require_non_neg_int(jewellers_total_declared, "jewellers_total_declared")

    in_window = [
        o
        for o in orders
        if o.get("karigar_id") == karigar_id and window_start <= str(o.get("issued_on", "")) <= window_end
    ]

    orders_count = len(in_window)
    grams_handled_mg = 0
    grams_handled_fine_mg = 0
    returned_count = 0
    on_time_count = 0
    allowed_wastage_mg = 0
    actual_wastage_mg = 0

    for o in in_window:
        issued_mg = require_non_neg_int(o["issued_gold_mg"], "issued_gold_mg")
        fineness = require_int(o.get("fineness", 916), "fineness")
        grams_handled_mg += issued_mg
        grams_handled_fine_mg += fine_mg(issued_mg, fineness)

        ret = o.get("return")
        if ret is not None:
            returned_count += 1
            if str(ret.get("returned_on", "")) <= str(o.get("due_on", "")):
                on_time_count += 1
            order_type = str(o.get("type", "plain"))
            norm_bp = require_non_neg_int(norm_bps_by_type[order_type], "norm_bp")
            allowed_wastage_mg += bp_of(issued_mg, norm_bp)
            net_gold_mg = require_non_neg_int(ret["net_gold_mg"], "net_gold_mg")
            scrap_mg = require_non_neg_int(ret.get("scrap_mg", 0), "scrap_mg")
            dust_mg = require_non_neg_int(ret.get("dust_mg", 0), "dust_mg")
            actual_wastage_mg += issued_mg - (net_gold_mg + scrap_mg + dust_mg)

    if returned_count > 0:
        on_time_bps = (on_time_count * 10000 + (returned_count // 2)) // returned_count
        on_time_pct_x10 = (on_time_count * 1000 + (returned_count // 2)) // returned_count
    else:
        on_time_bps = 10000
        on_time_pct_x10 = 1000

    net_variance_mg = actual_wastage_mg - allowed_wastage_mg - approved_adjustment_mg
    effective_used_mg = actual_wastage_mg - approved_adjustment_mg
    if allowed_wastage_mg > 0:
        allowance_used_bps = (effective_used_mg * 10000 + (allowed_wastage_mg // 2)) // allowed_wastage_mg
        allowance_used_pct_x10 = (effective_used_mg * 1000 + (allowed_wastage_mg // 2)) // allowed_wastage_mg
    else:
        allowance_used_bps = 0
        allowance_used_pct_x10 = 0

    return PassportSummary(
        karigar_id=karigar_id,
        window=f"{window_start}/{window_end}",
        window_start=window_start,
        window_end=window_end,
        orders=orders_count,
        grams_handled_mg=grams_handled_mg,
        grams_handled_fine_mg=grams_handled_fine_mg,
        returned=returned_count,
        on_time=on_time_count,
        on_time_bps=on_time_bps,
        on_time_pct_x10=on_time_pct_x10,
        allowed_wastage_mg=allowed_wastage_mg,
        actual_wastage_mg=actual_wastage_mg,
        approved_adjustment_mg=approved_adjustment_mg,
        net_variance_mg=net_variance_mg,
        allowance_used_bps=allowance_used_bps,
        allowance_used_pct_x10=allowance_used_pct_x10,
        disputes_opened=disputes_opened,
        disputes_resolved=disputes_resolved,
        dispute_resolution_minutes=dispute_resolution_minutes,
        jewellers_on_tola=jewellers_on_tola,
        jewellers_total_declared=jewellers_total_declared,
    )
