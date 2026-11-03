"""Unit and Hypothesis property tests for `tola_api.ledger_core.units`."""

from __future__ import annotations

import pytest
from hypothesis import given
from hypothesis import strategies as st

from tola_api.ledger_core.units import (
    bp_of,
    fine_mg,
    format_grams,
    gst_paise,
    require_int,
    require_non_neg_int,
    signed_fine_mg,
)


def test_canonical_unit_figures() -> None:
    assert fine_mg(40_000, 916) == 36_640
    assert fine_mg(380, 916) == 348
    assert fine_mg(250, 916) == 229
    assert fine_mg(18_250, 916) == 16_717
    assert bp_of(40_000, 250) == 1_000
    assert gst_paise(480_000, 500) == 24_000
    assert format_grams(40_000) == "40.000 g"
    assert format_grams(-250) == "-0.250 g"


def test_floats_and_bools_rejected() -> None:
    for bad in (40.0, 0.5, True, False, "40000"):
        with pytest.raises(TypeError):
            require_int(bad)
        with pytest.raises(TypeError):
            fine_mg(bad, 916)  # type: ignore[arg-type]
        with pytest.raises(TypeError):
            bp_of(bad, 250)  # type: ignore[arg-type]
        with pytest.raises(TypeError):
            gst_paise(bad, 500)  # type: ignore[arg-type]


def test_negative_rejected_for_non_neg() -> None:
    with pytest.raises(ValueError):
        require_non_neg_int(-1)
    assert signed_fine_mg(-250, 916) == -229


@given(
    a=st.integers(min_value=0, max_value=10_000_000),
    b=st.integers(min_value=0, max_value=10_000_000),
    fineness=st.sampled_from([999, 995, 916, 875, 750]),
)
def test_fine_mg_monotonic_and_nearly_additive(a: int, b: int, fineness: int) -> None:
    fa = fine_mg(a, fineness)
    fb = fine_mg(b, fineness)
    fab = fine_mg(a + b, fineness)
    if a <= b:
        assert fa <= fb
    assert abs((fa + fb) - fab) <= 1
