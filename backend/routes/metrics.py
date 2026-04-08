"""Model evaluation metrics (offline benchmark)."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from models import MetricsResponse
from services.evaluation_service import EvaluationService
from deps import get_evaluation_service

router = APIRouter(tags=["metrics"])


@router.get("/metrics", response_model=MetricsResponse)
def get_metrics(
    refresh: bool = False,
    service: EvaluationService = Depends(get_evaluation_service),
) -> MetricsResponse:
    """
    Evaluate rule-based and AI pipelines against `data/benchmark.json` (or `LIVELIB_BENCHMARK_PATH`).

    Results are cached in-process for `LIVELIB_METRICS_CACHE_TTL_SECONDS` unless `refresh=true`.
    """
    return service.get_metrics(force_refresh=refresh)
