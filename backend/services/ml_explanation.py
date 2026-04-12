"""Assemble ML-pipeline explanations (softmax + occlusion saliency + VADER lexicon overlay)."""

from __future__ import annotations

from typing import Any, Dict, List

from nltk.sentiment.vader import SentimentIntensityAnalyzer

from models import AnalysisExplanation, TextSegment, WordSaliency
from utils.vader_highlights import document_vader_compound, lexicon_word_segments


def build_ml_explanation(text: str, explain_payload: Dict[str, Any]) -> AnalysisExplanation:
    sia = SentimentIntensityAnalyzer()
    segments = [TextSegment(**s) for s in lexicon_word_segments(text, sia)]
    compound = document_vader_compound(text, sia)

    probs = explain_payload["probabilities"]
    label = explain_payload["label"]
    conf = explain_payload["confidence"]
    sal_raw: List[dict] = explain_payload.get("top_word_saliency") or []
    sal = [WordSaliency(word=s["word"], delta=s["delta"]) for s in sal_raw]

    summary = (
        f"Classifier predicted {label} with confidence {conf:.1%}. "
        f"Saliency ranks TF-IDF terms with strongest linear contribution to the predicted class (higher |Δ| = stronger impact). "
        f"VADER lexicon coloring is an independent dictionary signal; whole-review compound: {compound:+.3f}."
    )

    return AnalysisExplanation(
        pipeline="ml",
        summary=summary,
        document_vader_compound=round(compound, 6),
        segments=segments,
        image_note=None,
        class_probabilities=probs,
        confidence=round(conf, 6),
        confidence_note="Predicted-class probability from LogisticRegression (not a calibrated uncertainty estimate).",
        top_word_saliency=sal,
        fusion_note="Text-only TF-IDF features are fed to a LogisticRegression classifier.",
    )
