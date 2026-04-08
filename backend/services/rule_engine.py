"""
RuleEngine — spaCy + VADER + OpenCV heuristics + FusionEngine.
"""

from __future__ import annotations

from models import AnalysisResult, MultimodalInput
from linguistic import LinguisticAnalyzer
from vision import VisualAnalyzer

from .fusion_engine import FusionEngine
from .rule_explanation import build_rule_explanation


class RuleEngine:
    """
    Stateless orchestrator for the rule-based multimodal pipeline.
    """

    def __init__(self) -> None:
        self._linguistic = LinguisticAnalyzer()
        self._visual = VisualAnalyzer()
        self._fusion = FusionEngine()

    def analyze(self, inp: MultimodalInput) -> AnalysisResult:
        aspects = self._linguistic.analyze(inp.text)

        image_score = 0.0
        has_image = bool(inp.image_bytes)
        if inp.image_bytes:
            try:
                image_score = self._visual.analyze(inp.image_bytes)
            except Exception:
                image_score = 0.0

        if not aspects:
            explanation = (
                build_rule_explanation(
                    inp.text,
                    [],
                    image_score,
                    has_image,
                    self._linguistic.vader,
                    self._fusion,
                )
                if inp.explain
                else None
            )
            return AnalysisResult(aspects=[], explanation=explanation)

        aspects = self._fusion.fuse_batch(aspects, image_score)
        explanation = (
            build_rule_explanation(
                inp.text,
                aspects,
                image_score,
                has_image,
                self._linguistic.vader,
                self._fusion,
            )
            if inp.explain
            else None
        )
        return AnalysisResult(aspects=aspects, explanation=explanation)
