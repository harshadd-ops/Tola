"""Application settings loaded from environment variables or `.env`."""

from __future__ import annotations

from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict

_DEFAULT_SEED_DIR = Path(__file__).resolve().parent.parent.parent.parent / "seed"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = "sqlite:///./tola-demo.db"
    ai_fallback_mode: Literal["live", "cached", "off"] = "cached"
    lyzr_api_key: str = ""
    lyzr_agent_id_manager: str = ""
    lyzr_agent_id_intake: str = ""
    lyzr_agent_id_reconcile: str = ""
    lyzr_agent_id_settle: str = ""
    sarvam_api_key: str = ""
    tola_server_signing_key: str = ""
    tola_upi_vpa: str = "rafiq.demo@upi"
    tola_upi_payee_name: str = "Rafiq Sheikh (demo)"
    demo_reset_token: str = ""
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    seed_dir: Path = _DEFAULT_SEED_DIR


settings = Settings()
