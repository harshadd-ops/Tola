"""FastAPI application factory and Uvicorn entry point for the Tola demo API."""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from tola_api.config import settings
from tola_api.db import Base, SessionLocal, engine
from tola_api.models import Shop
from tola_api.routers import (
    demo,
    disputes,
    events,
    health,
    ledger,
    orders,
    passport,
    reconciliation,
    scale,
    settlements,
    shops,
    story,
    voice,
)
from tola_api.seed.loader import reset_to_step


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        has_shop = db.scalar(select(Shop).limit(1)) is not None
        if not has_shop:
            reset_to_step(db, to_step=None)
    yield


def create_app() -> FastAPI:
    application = FastAPI(
        title="Tola Demo API",
        version="0.1.0",
        description="Voice-first, cryptographically-signed gold & labour ledger for B2B job-work.",
        lifespan=lifespan,
    )

    origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
    application.add_middleware(
        CORSMiddleware,
        allow_origins=origins or ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(health.router)
    application.include_router(demo.router)
    application.include_router(story.router)
    application.include_router(shops.router)
    application.include_router(orders.router)
    application.include_router(scale.router)
    application.include_router(events.router)
    application.include_router(ledger.router)
    application.include_router(voice.router)
    application.include_router(reconciliation.router)
    application.include_router(disputes.router)
    application.include_router(settlements.router)
    application.include_router(passport.router)

    return application


app = create_app()


def run() -> None:
    uvicorn.run("tola_api.main:app", host="127.0.0.1", port=8000, reload=False)


if __name__ == "__main__":
    run()
