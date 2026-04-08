"""
FastAPI application entrypoint — wires middleware and routers.
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import analysis_router, health_router, metrics_router

app = FastAPI(
    title="LiveLib Multimodal Sentiment API",
    description="Lightweight Multimodal Aspect-Based Sentiment Analysis (MABSA)",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(analysis_router)
app.include_router(metrics_router)
