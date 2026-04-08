"""Domain / API models (Pydantic)."""

from .schemas import (
    MultimodalInput,
    Aspect,
    AnalysisResult,
    AnalysisExplanation,
    TextSegment,
    WordSaliency,
)
from .metrics_schemas import (
    MetricsResponse,
    MetricsMeta,
    ModelMetricsReport,
    ClassMetrics,
    MetricsComparison,
)

__all__ = [
    "MultimodalInput",
    "Aspect",
    "AnalysisResult",
    "AnalysisExplanation",
    "TextSegment",
    "WordSaliency",
    "MetricsResponse",
    "MetricsMeta",
    "ModelMetricsReport",
    "ClassMetrics",
    "MetricsComparison",
]
