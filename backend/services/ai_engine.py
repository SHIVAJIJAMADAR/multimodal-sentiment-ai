"""
AIEngine — BERT + ResNet18 multimodal classifier (wrapped MLPredictor).
"""

from __future__ import annotations

from typing import Optional

from models import Aspect, AnalysisResult
from ml_predictor import MLPredictor

from .ml_explanation import build_ml_explanation


class AIEngine:
    """Thin orchestration layer over the PyTorch multimodal model."""

    def __init__(self, predictor: Optional[MLPredictor] = None) -> None:
        self._predictor = predictor if predictor is not None else MLPredictor()

    def analyze(
        self,
        text: str,
        image_bytes: Optional[bytes] = None,
        *,
        explain: bool = False,
    ) -> AnalysisResult:
        if explain:
            payload = self._predictor.predict_with_explanation(text, image_bytes)
            sentiment = payload["label"]
            explanation = build_ml_explanation(text, payload)
        else:
            sentiment = self._predictor.predict(text, image_bytes)
            explanation = None

        opinion = text.strip()
        if len(opinion) > 140:
            opinion = opinion[:140] + "…"

        aspect = Aspect(
            aspect="overall",
            opinion=opinion,
            sentiment=sentiment,
        )
        return AnalysisResult(aspects=[aspect], explanation=explanation)
