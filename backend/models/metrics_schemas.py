"""API models for evaluation / metrics responses."""

from __future__ import annotations

from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class MetricsMeta(BaseModel):
    dataset_path: str
    dataset_version: str = "1.0"
    n_benchmark_rows: int = Field(..., description="Rows read from the benchmark file (after max-samples cap).")
    n_valid_gold_rows: int = Field(..., description="Rows with parseable text + gold label.")
    n_rule_predictions: int = Field(..., description="Rows where the rule engine returned a prediction.")
    n_ai_predictions: int = Field(..., description="Rows where the AI engine returned a prediction.")
    n_paired_rows: int = Field(
        ...,
        description="Rows used for inter-model comparison (both engines succeeded).",
    )
    n_skipped_invalid: int = 0
    cache_hit: bool = False
    evaluation_ms: float = Field(0.0, description="Wall time to compute this payload.")


class ClassMetrics(BaseModel):
    precision: float
    recall: float
    f1_score: float


class ModelMetricsReport(BaseModel):
    model_name: str
    accuracy: float
    precision_macro: float
    recall_macro: float
    f1_macro: float
    per_class: Dict[str, ClassMetrics]
    confusion_matrix: List[List[int]]
    labels: List[str]


class MetricsComparison(BaseModel):
    inter_model_agreement: float
    both_correct: int
    rule_only_correct: int
    ai_only_correct: int
    both_wrong: int


class MetricsResponse(BaseModel):
    meta: MetricsMeta
    rule_based: ModelMetricsReport
    ai_model: Optional[ModelMetricsReport] = None
    comparison: Optional[MetricsComparison] = None
    warnings: List[str] = Field(default_factory=list)
