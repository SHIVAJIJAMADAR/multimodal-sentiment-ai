"""
Application configuration (environment-driven, production-style defaults).
"""

from __future__ import annotations

from pathlib import Path

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_ROOT = Path(__file__).resolve().parent


class Settings(BaseSettings):
    """LiveLib backend settings — override via environment variables."""

    model_config = SettingsConfigDict(
        env_prefix="LIVELIB_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    benchmark_path: Path = Field(
        default=_BACKEND_ROOT / "data" / "benchmark.json",
        description="JSON array of {text, label} gold-standard items.",
    )
    metrics_cache_ttl_seconds: int = Field(
        default=120,
        ge=0,
        description="In-process cache TTL for GET /metrics (0 = no time-based cache).",
    )
    metrics_max_samples: int = Field(
        default=500,
        ge=1,
        le=5000,
        description="Safety cap on benchmark rows evaluated per request.",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
