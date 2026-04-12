"""
FusionEngine — weighted fusion of text and image sentiment (rule-based).
Uses same thresholds as compute_rule_sentiment for consistency.
"""

from __future__ import annotations

from typing import List
import numpy as np

from models import Aspect


class FusionEngine:
    """
    fused_score = TEXT_WEIGHT * text_score + IMAGE_WEIGHT * image_score

    Classification: >= POS_THRESHOLD → Positive; <= NEG_THRESHOLD → Negative; else Neutral.
    Same thresholds as compute_rule_sentiment for consistency.
    """

    TEXT_WEIGHT: float = 0.7
    IMAGE_WEIGHT: float = 0.3

    # Same thresholds as compute_rule_sentiment for consistency
    POS_THRESHOLD: float = 0.05
    NEG_THRESHOLD: float = -0.05

    def fuse(self, aspect: Aspect, image_score: float) -> Aspect:
        image_score = float(np.clip(image_score, -1.0, 1.0))

        fused = self.TEXT_WEIGHT * aspect.text_score + self.IMAGE_WEIGHT * image_score
        fused = float(np.clip(fused, -1.0, 1.0))

        aspect.image_score = round(image_score, 4)
        aspect.fused_score = round(fused, 4)
        aspect.sentiment = self._classify(fused)

        return aspect

    def fuse_batch(self, aspects: List[Aspect], image_score: float) -> List[Aspect]:
        return [self.fuse(a, image_score) for a in aspects]

    def sentiment_from_aggregate_score(self, score: float) -> str:
        """Map a pooled numeric score to the same labels as per-aspect fusion."""
        score = float(np.clip(score, -1.0, 1.0))
        return self._classify(score)

    def _classify(self, score: float) -> str:
        """Same classification logic as compute_rule_sentiment."""
        if score >= self.POS_THRESHOLD:
            return "Positive"
        if score <= self.NEG_THRESHOLD:
            return "Negative"
        return "Neutral"
