"""SQLAlchemy 2.0 ORM models covering entities E-01 through E-14 plus DemoState."""

from __future__ import annotations

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from tola_api.db import Base


class Shop(Base):  # E-01
    __tablename__ = "shops"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    city: Mapped[str] = mapped_column(String(64), default="Bengaluru")
    address: Mapped[str] = mapped_column(String(200), default="")
    gstin: Mapped[str] = mapped_column(String(15))
    upi_vpa: Mapped[str] = mapped_column(String(120), default="shetty.demo@upi")
    default_lang: Mapped[str] = mapped_column(String(8), default="en")


class Person(Base):  # E-02
    __tablename__ = "persons"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    code: Mapped[str] = mapped_column(String(16))  # P-01..P-05
    name: Mapped[str] = mapped_column(String(120))
    native_name: Mapped[str] = mapped_column(String(120), default="")
    role: Mapped[str] = mapped_column(String(32))  # jeweller | jeweller_staff | karigar | lender
    title: Mapped[str] = mapped_column(String(120), default="")
    chip_label: Mapped[str] = mapped_column(String(80), default="")
    avatar: Mapped[str] = mapped_column(String(8), default="")
    shop_id: Mapped[str | None] = mapped_column(ForeignKey("shops.id"), nullable=True)
    lang: Mapped[str] = mapped_column(String(8))  # en | hi | kn | bn
    ui_lang: Mapped[str] = mapped_column(String(8), default="en")
    script: Mapped[str] = mapped_column(String(16), default="Latn")
    city: Mapped[str] = mapped_column(String(64), default="Bengaluru")
    origin: Mapped[str | None] = mapped_column(String(120), nullable=True)
    device: Mapped[str] = mapped_column(String(64), default="")
    literacy: Mapped[str] = mapped_column(String(32), default="high")
    organization: Mapped[str | None] = mapped_column(String(120), nullable=True)
    pubkey_hex: Mapped[str] = mapped_column(String(64))


class KarigarProfile(Base):  # E-03
    __tablename__ = "karigar_profiles"

    person_id: Mapped[str] = mapped_column(ForeignKey("persons.id"), primary_key=True)
    shop_id: Mapped[str] = mapped_column(ForeignKey("shops.id"))
    craft: Mapped[str] = mapped_column(String(64), default="plain")
    experience_years: Mapped[int] = mapped_column(Integer, default=5)
    rate_paise_per_gram: Mapped[int] = mapped_column(Integer, default=12000)
    vishwakarma_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    voice_lang: Mapped[str] = mapped_column(String(8), default="bn")
    languages_json: Mapped[str] = mapped_column(Text, default='["bn"]')
    other_jewellers_offline: Mapped[int] = mapped_column(Integer, default=2)
    upi_vpa_demo: Mapped[str] = mapped_column(String(120), default="rafiq.demo@upi")
    phone_display: Mapped[str] = mapped_column(String(32), default="")
    gstin: Mapped[str | None] = mapped_column(String(15), nullable=True)


class WastageNorm(Base):  # E-05
    __tablename__ = "wastage_norms"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    shop_id: Mapped[str] = mapped_column(ForeignKey("shops.id"))
    karigar_id: Mapped[str] = mapped_column(ForeignKey("persons.id"))
    order_type: Mapped[str] = mapped_column(String(32))  # plain | studded | antique
    norm_bp: Mapped[int] = mapped_column(Integer)  # 250 = 2.50%
    flag_tolerance_mg: Mapped[int] = mapped_column(Integer, default=50)
    agreed_on: Mapped[str] = mapped_column(String(32), default="2026-04-01")


class Order(Base):  # E-04
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    code: Mapped[str] = mapped_column(String(16), unique=True, index=True)  # "#14", "H-01", etc.
    shop_id: Mapped[str] = mapped_column(ForeignKey("shops.id"))
    karigar_id: Mapped[str] = mapped_column(ForeignKey("persons.id"), index=True)
    title: Mapped[str] = mapped_column(String(160))
    order_type: Mapped[str] = mapped_column(String(32))  # plain | studded | antique
    fineness: Mapped[int] = mapped_column(Integer, default=916)
    norm_bp: Mapped[int] = mapped_column(Integer)
    target_gross_mg: Mapped[int] = mapped_column(Integer)
    stone_mg: Mapped[int] = mapped_column(Integer, default=0)
    labour_paise: Mapped[int] = mapped_column(Integer)
    issued_on: Mapped[str] = mapped_column(String(32))
    due_date: Mapped[str] = mapped_column(String(32))
    returned_on: Mapped[str | None] = mapped_column(String(32), nullable=True)
    return_gross_mg: Mapped[int | None] = mapped_column(Integer, nullable=True)
    return_net_gold_mg: Mapped[int | None] = mapped_column(Integer, nullable=True)
    return_scrap_mg: Mapped[int | None] = mapped_column(Integer, nullable=True)
    return_dust_mg: Mapped[int | None] = mapped_column(Integer, nullable=True)
    occasion: Mapped[str | None] = mapped_column(String(160), nullable=True)
    status: Mapped[str] = mapped_column(String(32))
    is_history: Mapped[bool] = mapped_column(Boolean, default=False)
    photo_url: Mapped[str | None] = mapped_column(String(200), nullable=True)


class ScaleReading(Base):  # E-08
    __tablename__ = "scale_readings"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    shop_id: Mapped[str] = mapped_column(String(64), default="shop-shetty")
    order_id: Mapped[str | None] = mapped_column(ForeignKey("orders.id"), nullable=True)
    weight_mg: Mapped[int] = mapped_column(Integer)
    source: Mapped[str] = mapped_column(String(24))  # simulated | serial | manual_dual
    device_id: Mapped[str] = mapped_column(String(64), default="sim-balance-01")
    stable: Mapped[bool] = mapped_column(Boolean, default=True)
    raw_frame: Mapped[str] = mapped_column(String(120), default="")
    captured_at: Mapped[str] = mapped_column(String(40))


class LedgerEvent(Base):  # E-06
    __tablename__ = "ledger_events"
    __table_args__ = (UniqueConstraint("karigar_id", "seq", name="uq_karigar_seq"),)

    id: Mapped[str] = mapped_column(
        String(64), primary_key=True
    )  # "R1".."R11", "M1".."M5", "S1".."S4", "H-01-I", etc.
    seq: Mapped[int] = mapped_column(Integer)
    karigar_id: Mapped[str] = mapped_column(ForeignKey("persons.id"), index=True)
    order_id: Mapped[str | None] = mapped_column(ForeignKey("orders.id"), nullable=True, index=True)
    event_type: Mapped[str] = mapped_column(String(32))
    timestamp: Mapped[str] = mapped_column(String(40))
    actor_id: Mapped[str] = mapped_column(ForeignKey("persons.id"))
    jeweller_signer_id: Mapped[str] = mapped_column(String(64), default="p-suresh")
    payload_json: Mapped[str] = mapped_column(Text)  # canonical JSON string
    prev_hash: Mapped[str] = mapped_column(String(64))
    event_hash: Mapped[str] = mapped_column(String(64))
    jeweller_sig: Mapped[str | None] = mapped_column(String(160), nullable=True)
    karigar_sig: Mapped[str | None] = mapped_column(String(160), nullable=True)
    server_sig: Mapped[str] = mapped_column(String(160))
    status: Mapped[str] = mapped_column(String(32), default="committed")


class EventSignature(Base):  # E-07
    __tablename__ = "event_signatures"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    event_id: Mapped[str] = mapped_column(ForeignKey("ledger_events.id"), index=True)
    signer_id: Mapped[str] = mapped_column(ForeignKey("persons.id"))
    role: Mapped[str] = mapped_column(String(24))  # jeweller | karigar | server
    sig_hex: Mapped[str] = mapped_column(String(160))
    signed_at: Mapped[str] = mapped_column(String(40))
    readback_played: Mapped[bool] = mapped_column(Boolean, default=False)


class VoiceNote(Base):  # E-09
    __tablename__ = "voice_notes"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    event_id: Mapped[str | None] = mapped_column(ForeignKey("ledger_events.id"), nullable=True)
    person_id: Mapped[str] = mapped_column(String(64), default="p-rafiq")
    lang: Mapped[str] = mapped_column(String(8))
    audio_path: Mapped[str] = mapped_column(String(200))
    transcript: Mapped[str] = mapped_column(Text)
    extracted_json: Mapped[str] = mapped_column(Text)
    confidence: Mapped[int] = mapped_column(Integer, default=94)  # basis points 0..100
    cached: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[str] = mapped_column(String(40), default="2026-10-15T16:10:00+05:30")


class ReconciliationRun(Base):  # E-10
    __tablename__ = "reconciliation_runs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    shop_id: Mapped[str] = mapped_column(ForeignKey("shops.id"))
    week: Mapped[str] = mapped_column(String(16))  # "2026-W42"
    ran_at: Mapped[str] = mapped_column(String(40))
    orders_checked: Mapped[int] = mapped_column(Integer)
    flags_count: Mapped[int] = mapped_column(Integer)
    rows_json: Mapped[str] = mapped_column(Text)
    explanation: Mapped[str] = mapped_column(Text)
    cached: Mapped[bool] = mapped_column(Boolean, default=True)


class Dispute(Base):  # E-11
    __tablename__ = "disputes"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    order_id: Mapped[str] = mapped_column(ForeignKey("orders.id"), index=True)
    karigar_id: Mapped[str] = mapped_column(ForeignKey("persons.id"))
    status: Mapped[str] = mapped_column(String(24))  # OPEN | PROPOSED | RESOLVED
    disputed_variance_mg: Mapped[int] = mapped_column(Integer)
    reason_code: Mapped[str] = mapped_column(String(32))
    Allowance_mg: Mapped[int | None] = mapped_column("allowance_mg", Integer, nullable=True)
    resolved_variance_mg: Mapped[int | None] = mapped_column(Integer, nullable=True)
    open_event_id: Mapped[str] = mapped_column(String(64))
    adjustment_event_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    resolve_event_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    opened_at: Mapped[str] = mapped_column(String(40), default="2026-10-17T18:20:00+05:30")
    resolved_at: Mapped[str | None] = mapped_column(String(40), nullable=True)
    messages_json: Mapped[str] = mapped_column(Text, default="[]")


class Settlement(Base):  # E-12
    __tablename__ = "settlements"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    shop_id: Mapped[str] = mapped_column(ForeignKey("shops.id"))
    karigar_id: Mapped[str] = mapped_column(ForeignKey("persons.id"), index=True)
    period_start: Mapped[str] = mapped_column(String(32))
    period_end: Mapped[str] = mapped_column(String(32))
    summary_json: Mapped[str] = mapped_column(Text)
    narrative: Mapped[str] = mapped_column(Text)
    jeweller_approved: Mapped[bool] = mapped_column(Boolean, default=False)
    karigar_approved: Mapped[bool] = mapped_column(Boolean, default=False)
    event_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    status: Mapped[str] = mapped_column(String(24))  # DRAFT | APPROVED | PAID


class PaymentIntent(Base):  # E-13
    __tablename__ = "payment_intents"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    settlement_id: Mapped[str] = mapped_column(ForeignKey("settlements.id"), index=True)
    amount_paise: Mapped[int] = mapped_column(Integer)
    upi_uri: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(24), default="simulated")
    created_at: Mapped[str] = mapped_column(String(40))


class PassportShare(Base):  # E-14
    __tablename__ = "passport_shares"

    token: Mapped[str] = mapped_column(String(64), primary_key=True)
    karigar_id: Mapped[str] = mapped_column(ForeignKey("persons.id"))
    recipient_id: Mapped[str] = mapped_column(ForeignKey("persons.id"))
    scope_json: Mapped[str] = mapped_column(Text)
    summary_json: Mapped[str] = mapped_column(Text)
    created_at: Mapped[str] = mapped_column(String(40))
    expires_at: Mapped[str] = mapped_column(String(40))
    revoked: Mapped[bool] = mapped_column(Boolean, default=False)
    views: Mapped[int] = mapped_column(Integer, default=0)


class DemoState(Base):
    __tablename__ = "demo_state"

    key: Mapped[str] = mapped_column(String(32), primary_key=True)
    value: Mapped[str] = mapped_column(String(120))
