"""Integer unit helpers for milligrams (mg), fineness (‰), basis points (bp), and paise.

Strictly rejects floats and booleans via `type(x) is int`.
"""

from __future__ import annotations


def require_int(value: object, name: str = "value") -> int:
    """Ensure `value` is a strict Python `int` (rejecting float, bool, str, Decimal)."""
    if type(value) is not int:
        raise TypeError(f"{name} must be int, got {type(value).__name__}")
    return value


def require_non_neg_int(value: object, name: str = "value") -> int:
    """Ensure `value` is a non-negative Python `int`."""
    v = require_int(value, name)
    if v < 0:
        raise ValueError(f"{name} must be >= 0, got {v}")
    return v


def fine_mg(gross_mg: int, fineness: int) -> int:
    """Convert gross weight in mg at fineness (‰, e.g. 916 for 22K) to fine gold mg.

    Uses half-up integer rounding: `(gross_mg * fineness + 500) // 1000`.
    Canonical check:
    - `fine_mg(40000, 916) == 36640`
    - `fine_mg(380, 916) == 348`
    - `fine_mg(250, 916) == 229`
    - `fine_mg(18250, 916) == 16717`
    """
    require_non_neg_int(gross_mg, "gross_mg")
    require_int(fineness, "fineness")
    if not (1 <= fineness <= 1000):
        raise ValueError(f"fineness must be in 1..1000, got {fineness}")
    return (gross_mg * fineness + 500) // 1000


def signed_fine_mg(mg: int, fineness: int) -> int:
    """Signed version of `fine_mg` for variances that may be negative (under norm) or positive."""
    require_int(mg, "mg")
    if mg >= 0:
        return fine_mg(mg, fineness)
    return -fine_mg(-mg, fineness)


def bp_of(mg: int, bp: int) -> int:
    """Compute basis points of a weight in mg (`250 bp = 2.50%`), floored to integer mg.

    Canonical check: `bp_of(40000, 250) == 1000`.
    """
    require_non_neg_int(mg, "mg")
    require_non_neg_int(bp, "bp")
    if bp > 10000:
        raise ValueError(f"bp must be in 0..10000, got {bp}")
    return (mg * bp) // 10000


def gst_paise(labour_paise: int, rate_bp: int = 500) -> int:
    """Compute GST in paise on job-work labour charges (default 500 bp = 5% SAC 9988).

    Canonical check: `gst_paise(480000, 500) == 24000`.
    """
    require_non_neg_int(labour_paise, "labour_paise")
    require_non_neg_int(rate_bp, "rate_bp")
    if rate_bp > 10000:
        raise ValueError(f"rate_bp must be in 0..10000, got {rate_bp}")
    return (labour_paise * rate_bp) // 10000


def format_grams(mg: int) -> str:
    """Format integer milligrams as `XX.XXX g` (e.g. `40000 -> '40.000 g'`)."""
    require_int(mg, "mg")
    sign = "-" if mg < 0 else ""
    abs_mg = abs(mg)
    return f"{sign}{abs_mg // 1000}.{abs_mg % 1000:03d} g"
