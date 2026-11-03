"""Pydantic v2 request and response schemas for the Tola demo API."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class ResetRequest(BaseModel):
    to_step: str | int | None = None
    step: int | None = None
    scenario: str = "story_week"


class ScaleReadingCreate(BaseModel):
    shop_id: str = "shop-shetty"
    order_id: str | None = None
    weight_mg: int
    source: str = "simulated"
    device_id: str = "sim-balance-01"
    stable: bool = True
    raw_frame: str = ""
    second_entry_mg: int | None = None
    second_person_id: str | None = None


class EventCreateRequest(BaseModel):
    id: str | None = None
    ref: str | None = None
    event_id: str | None = None
    karigar_id: str = "p-rafiq"
    pair_id: str | None = None
    order_id: str | None = None
    order: str | None = None
    event_type: str | None = None
    type: str | None = None
    actor_id: str = "p-suresh"
    jeweller_signer_id: str | None = None
    timestamp: str | None = None
    weight_mg: int | None = None
    gold_mg: int | None = None
    gross_mg: int | None = None
    stone_mg: int = 0
    net_gold_mg: int | None = None
    fineness: int = 916
    fineness_ppt: int | None = None
    fine_mg: int | None = None
    norm_bp: int | None = None
    allowed_mg: int | None = None
    allowance_mg: int | None = None
    reading_id: str | None = None
    reading_ids: list[str] = Field(default_factory=list)
    note: str | None = None
    photo: str | None = None
    payload: dict[str, Any] | None = None
    jeweller_sig: str | None = None
    karigar_sig: str | None = None
    auto_sign_jeweller: bool = False
    auto_sign_karigar: bool = False


class SignatureCreateRequest(BaseModel):
    signer_id: str
    role: str | None = None
    sig_hex: str | None = None
    sig: str | None = None
    decision: str = "approve"
    readback_played: bool = True
    signed_at: str | None = None
    auto_demo_sign: bool = False


class ReadbackRequestModel(BaseModel):
    event_id: str | None = None
    subject_type: str = "event"
    subject_id: str | None = None
    step_id: str | None = None
    template_id: str | None = None
    lang: str = "bn"
    vars: dict[str, Any] = Field(default_factory=dict)


class IntakeJsonRequest(BaseModel):
    lang: str = "bn"
    order_id: str | None = "order-14"
    karigar_id: str = "p-rafiq"
    pair_id: str | None = None
    demo_clip_id: str | None = None
    audio_clip: str | None = None
    piece_gross_mg: int | None = None
    scrap_mg: int | None = None
    dust_mg: int = 0
    reading_ids: list[str] = Field(default_factory=list)


class ReconcileRunCreate(BaseModel):
    shop_id: str = "shop-shetty"
    week: str = "2026-W42"
    period_from: str = "2026-10-12"
    period_to: str = "2026-10-18"
    explain: bool = True


class DisputeOpenCreate(BaseModel):
    order_id: str = "order-14"
    order: str | None = None
    karigar_id: str = "p-rafiq"
    pair_id: str | None = None
    flag_id: str | None = None
    disputed_variance_mg: int = 380
    reason_code: str = "REWORK"
    transcript: str | None = None
    text: str | None = None
    audio_clip: str | None = None


class DisputeMessageCreate(BaseModel):
    author_id: str = "p-rafiq"
    kind: str = "text"
    text: str | None = None
    transcript: str | None = None
    voice_note_id: str | None = None


class DisputeResolveCreate(BaseModel):
    actor_id: str = "p-suresh"
    allowance_mg: int = 130
    rework_allowance_mg: int | None = None
    resolved_variance_mg: int | None = None
    reason_code: str = "REWORK_ALLOWANCE"
    note: str | None = None
    auto_sign_both: bool = True


class SettlementCreateRequest(BaseModel):
    shop_id: str = "shop-shetty"
    karigar_id: str = "p-rafiq"
    pair_id: str | None = None
    period_start: str = "2026-10-12"
    period_end: str = "2026-10-18"
    period_from: str | None = None
    period_to: str | None = None
    orders_closed: list[str] = Field(default_factory=lambda: ["#14"])


class SettlementApproveRequest(BaseModel):
    signer_id: str
    role: str | None = None
    sig_hex: str | None = None
    sig: str | None = None
    auto_demo_sign: bool = False


class PassportShareCreateRequest(BaseModel):
    karigar_id: str = "p-rafiq"
    recipient_id: str = "p-meera"
    recipient_label: str = "Meera Rao · Sahyadri Co-operative Credit Society"
    purpose: str = "working_capital_loan"
    scope: list[str] | str = Field(
        default_factory=lambda: [
            "grams_handled",
            "on_time",
            "variance_vs_norm",
            "disputes",
        ]
    )
    window_days: int = 180
    expires_in_days: int = 7


class AddKarigarCreateRequest(BaseModel):
    id: str | None = None
    name: str | None = None
    display_name: str | None = None
    native_name: str = ""
    lang: str = "bn"
    languages: list[str] = Field(default_factory=lambda: ["bn"])
    craft: str = "plain"
    rate_paise_per_gram: int = 12000
    vishwakarma_id: str | None = None
    public_key: str | None = None


class CreateOrderBody(BaseModel):
    id: str | None = None
    code: str | None = None
    shop_id: str = "shop-shetty"
    karigar_id: str = "p-rafiq"
    title: str
    order_type: str = "plain"
    fineness: int = 916
    target_fineness_ppt: int | None = None
    target_gross_mg: int = 20000
    stone_mg: int = 0
    labour_paise: int = 240000
    issued_on: str = "2026-10-18"
    due_date: str = "2026-10-25"
    occasion: str | None = None
