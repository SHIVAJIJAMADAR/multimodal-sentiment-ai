"""Assemble rule-pipeline explanations (VADER + fusion + lexicon segments)."""

from __future__ import annotations

from typing import List

from models import AnalysisExplanation, Aspect, TextSegment
from services.fusion_engine import FusionEngine
from utils.vader_highlights import document_vader_compound, image_signal_note, lexicon_word_segments


def _dominant_from_aspects(aspects: List[Aspect]) -> str:
    if not aspects:
        return "Neutral"
    tally = {"Positive": 0, "Negative": 0, "Neutral": 0}
    for a in aspects:
        if a.sentiment in tally:
            tally[a.sentiment] += 1
    return max(tally, key=tally.get)


def build_rule_explanation(
    text: str,
    aspects: List[Aspect],
    image_score: float,
    has_image: bool,
    sia,
    fusion: FusionEngine,
) -> AnalysisExplanation:
    compound = document_vader_compound(text, sia)
    segments_raw = lexicon_word_segments(text, sia)
    segments = [TextSegment(**s) for s in segments_raw]

    dom = _dominant_from_aspects(aspects)
    img_note = image_signal_note(image_score, has_image)

    if not aspects:
        pooled = fusion.sentiment_from_aggregate_score(compound)
        summary = (
            f"No aspect–opinion pairs were extracted from dependencies. "
            f"Whole-review VADER compound is {compound:+.3f} (mapped to {pooled} for document-level view). "
            f"{img_note}"
        )
    else:
        summary = (
            f"Detected {len(aspects)} aspect–opinion span(s). "
            f"Dominant fused label among spans: {dom}. "
            f"Whole-review VADER compound: {compound:+.3f}. "
            f"{img_note}"
        )

    fusion_note = (
        "Aspect-level scores use VADER on opinion lemmas; "
        "multimodal fusion applies 70% text + 30% image with ±0.2 sentiment thresholds."
    )

    return AnalysisExplanation(
        pipeline="rule",
        summary=summary,
        document_vader_compound=round(compound, 6),
        segments=segments,
        image_note=img_note,
        class_probabilities=None,
        confidence=None,
        confidence_note=None,
        top_word_saliency=[],
        fusion_note=fusion_note,
    )
