"""
RuleEngine — spaCy + VADER + OpenCV heuristics + FusionEngine.
Single source of truth for rule-based sentiment analysis.
"""

from __future__ import annotations

import re
import logging

from nltk.sentiment.vader import SentimentIntensityAnalyzer

from models import AnalysisResult, MultimodalInput, Aspect
from linguistic import LinguisticAnalyzer
from vision import VisualAnalyzer

from .fusion_engine import FusionEngine
from .rule_explanation import build_rule_explanation

logger = logging.getLogger(__name__)


def _classify_sentiment(score: float) -> str:
    """Classify VADER compound score into sentiment label."""
    if score >= 0.05:
        return "Positive"
    elif score <= -0.05:
        return "Negative"
    return "Neutral"


def compute_rule_sentiment(text: str) -> dict:
    """
    Single source of truth for rule-based sentiment analysis.
    Computes sentiment using sentence-level VADER averaging.
    
    Returns:
        dict with keys: label, confidence, final_score, scores, sentence_count
    """
    # Debug: print when function is used
    print("RULE ENGINE USED")
    
    vader = SentimentIntensityAnalyzer()
    
    # Split sentences
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]

    if not sentences:
        return {
            "label": "Neutral",
            "confidence": 0,
            "final_score": 0,
            "scores": [],
            "sentence_count": 0
        }

    # Compute VADER score for each sentence
    scores = []
    for s in sentences:
        score = float(vader.polarity_scores(s)["compound"])
        scores.append(score)

    # Classify each sentence and count sentiment buckets
    pos_count = 0
    neg_count = 0
    neu_count = 0
    for score in scores:
        if score >= 0.05:
            pos_count += 1
        elif score <= -0.05:
            neg_count += 1
        else:
            neu_count += 1

    # Mixed sentiment handling: force Neutral when both positive and negative exist
    mixed_sentiment = pos_count > 0 and neg_count > 0
    if mixed_sentiment:
        label = "Neutral"
        final_score = 0.0
        confidence = 50.0
    else:
        # Fallback to average score logic
        final_score = sum(scores) / len(scores) if scores else 0.0
        if final_score >= 0.05:
            label = "Positive"
        elif final_score <= -0.05:
            label = "Negative"
        else:
            label = "Neutral"

        if label == "Neutral":
            confidence = 30.0
        else:
            confidence = round(abs(final_score) * 100, 2)

    print("Sentence scores:", scores)
    print("Counts:", pos_count, neg_count, neu_count)
    print("Final sentiment:", label)
    print("Final confidence:", confidence)

    result = {
        "label": label,
        "confidence": confidence,
        "final_score": round(final_score, 4),
        "scores": [round(s, 4) for s in scores],
        "sentence_count": len(sentences)
    }

    # Debug logging
    print("RULE DEBUG:", result)
    logger.debug("RULE DEBUG: %s", result)

    return result


class RuleEngine:
    """
    Stateless orchestrator for the rule-based multimodal pipeline.
    Uses compute_rule_sentiment as single source of truth.
    """

    def __init__(self) -> None:
        self._linguistic = None
        self._vader = SentimentIntensityAnalyzer()
        try:
            self._linguistic = LinguisticAnalyzer()
            self._vader = self._linguistic.vader
        except Exception as exc:
            logger.warning("LinguisticAnalyzer unavailable, using VADER-only fallback: %s", exc)
        self._visual = VisualAnalyzer()
        self._fusion = FusionEngine()

    def _build_aspect_from_sentiment(self, text: str, image_score: float, has_image: bool) -> tuple[Aspect, dict]:
        """
        Build Aspect object from sentence-level sentiment computation.
        Uses compute_rule_sentiment as single source of truth.
        Returns (Aspect, sentiment_result).
        """
        # Use sentence-level VADER as single source of truth
        sentiment_result = compute_rule_sentiment(text)
        
        # Use image score if available, otherwise just text sentiment
        if has_image:
            fused = 0.7 * sentiment_result["final_score"] + 0.3 * image_score
        else:
            fused = sentiment_result["final_score"]
        
        sentiment_label = _classify_sentiment(fused)
        
        aspect = Aspect(
            aspect="overall",
            opinion="document",
            text_score=sentiment_result["final_score"],
            image_score=round(image_score, 4) if has_image else 0.0,
            fused_score=round(fused, 4),
            confidence=sentiment_result["confidence"],
            sentiment=sentiment_label,
        )
        
        return aspect, sentiment_result

    def analyze(self, inp: MultimodalInput) -> AnalysisResult:
        image_score = 0.0
        has_image = bool(inp.image_bytes)
        if inp.image_bytes:
            try:
                image_score = self._visual.analyze(inp.image_bytes)
            except Exception:
                image_score = 0.0

        # Use sentence-level VADER as single source of truth
        aspect, sentiment_result = self._build_aspect_from_sentiment(
            inp.text, image_score, has_image
        )

        # Disabled aspect fusion to stabilize core sentiment (can re-enable later)
        # Always use sentence-level computation for consistent results
        aspects = [aspect]

        explanation = (
            build_rule_explanation(
                inp.text,
                aspects,
                image_score,
                has_image,
                self._vader,
                self._fusion,
            )
            if inp.explain
            else None
        )

        return AnalysisResult(aspects=aspects, explanation=explanation)
