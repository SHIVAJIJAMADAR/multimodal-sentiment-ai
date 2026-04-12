"""AIEngine — TF-IDF + LogisticRegression sentiment classifier."""

from __future__ import annotations

from typing import Optional

from models import Aspect, AnalysisResult
from ml_predictor import MLPredictor

from .ml_explanation import build_ml_explanation


class AIEngine:
    """Thin orchestration layer over the lightweight text classifier."""

    def __init__(self, predictor: Optional[MLPredictor] = None) -> None:
        self._predictor = predictor if predictor is not None else MLPredictor()

    def analyze(
        self,
        text: str,
        image_bytes: Optional[bytes] = None,
        *,
        explain: bool = False,
    ) -> AnalysisResult:
        payload = self._predictor.predict_payload(text, image_bytes, include_saliency=explain)

        if explain:
            sentiment = payload["label"]
            explanation = build_ml_explanation(text, payload)
        else:
            sentiment = payload["label"]
            explanation = None

        opinion = text.strip()
        if len(opinion) > 140:
            opinion = opinion[:140] + "…"

        aspect = Aspect(
            aspect="overall",
            opinion=opinion,
            text_score=float(payload["fused_score"]),
            image_score=0.0,
            fused_score=float(payload["fused_score"]),
            confidence=round(float(payload["confidence"]) * 100.0, 2),
            sentiment=sentiment,
        )
        return AnalysisResult(aspects=[aspect], explanation=explanation)
