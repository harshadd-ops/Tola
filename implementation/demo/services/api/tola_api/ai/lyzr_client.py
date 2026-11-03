"""Lyzr Studio ADK client wrapper for Manager, Intake, Reconcile, and Settle agents."""

from __future__ import annotations

import json
from typing import Any

from tola_api.config import settings


def run_lyzr_agent(agent_role: str, payload: dict[str, Any], session_id: str = "tola-demo") -> dict[str, Any]:
    if not settings.lyzr_api_key:
        raise RuntimeError("LYZR_API_KEY not configured")

    agent_id_map = {
        "manager": settings.lyzr_agent_id_manager,
        "intake": settings.lyzr_agent_id_intake,
        "reconcile": settings.lyzr_agent_id_reconcile,
        "settle": settings.lyzr_agent_id_settle,
    }
    agent_id = agent_id_map.get(agent_role, "")
    if not agent_id:
        raise RuntimeError(f"Lyzr agent ID for role '{agent_role}' not configured")

    from lyzr import Studio  # type: ignore[import-untyped]

    studio = Studio(api_key=settings.lyzr_api_key)
    agent = studio.get_agent(agent_id)
    resp = agent.run(message=json.dumps(payload, ensure_ascii=False), session_id=session_id)
    raw_text = getattr(resp, "response", str(resp))
    try:
        parsed = json.loads(raw_text)
        if isinstance(parsed, dict):
            return parsed
        return {"text": str(parsed)}
    except Exception:
        return {"text": raw_text}
