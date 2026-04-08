"""
Word-level sentiment hints from the VADER lexicon (deterministic, CPU-only).
Used for explainability highlights independent of spaCy aspect patterns.
"""

from __future__ import annotations

import re
from typing import Any, Dict, List

from nltk.sentiment.vader import SentimentIntensityAnalyzer


def document_vader_compound(text: str, sia: SentimentIntensityAnalyzer) -> float:
    return float(sia.polarity_scores(text)["compound"])


def lexicon_word_segments(text: str, sia: SentimentIntensityAnalyzer) -> List[Dict[str, Any]]:
    """
    Split text into runs; score alphanumeric words against VADER's lexicon.
    Whitespace-only runs stay neutral (for faithful reconstruction).
    """
    if not text:
        return []
    segments: List[Dict[str, Any]] = []
    last = 0
    for m in re.finditer(r"\S+", text):
        if m.start() > last:
            segments.append({"text": text[last:m.start()], "polarity": "neutral", "score": 0.0})
        token = m.group(0)
        core = re.sub(r"^[^\w]+|[^\w]+$", "", token, flags=re.UNICODE)
        lw = core.lower()
        raw_score = sia.lexicon.get(lw) if lw else None
        if raw_score is None:
            polarity = "neutral"
            s = 0.0
        else:
            s = float(raw_score)
            if s > 0:
                polarity = "positive"
            elif s < 0:
                polarity = "negative"
            else:
                polarity = "neutral"
        segments.append({"text": token, "polarity": polarity, "score": round(s, 4)})
        last = m.end()
    if last < len(text):
        segments.append({"text": text[last:], "polarity": "neutral", "score": 0.0})
    return segments


def image_signal_note(image_score: float, has_image: bool) -> str:
    if not has_image:
        return "No image was provided; fusion used text only (image channel treated as neutral 0.0)."
    if abs(image_score) < 0.08:
        return (
            f"Visual score {image_score:.2f} is near neutral — brightness/saturation/edges did not swing sentiment strongly."
        )
    if image_score > 0.15:
        return (
            f"Visual score {image_score:.2f} is positive-leaning (brighter / more saturated / less cluttered cues)."
        )
    if image_score < -0.15:
        return (
            f"Visual score {image_score:.2f} is negative-leaning (darker / duller / busier visual cues)."
        )
    return f"Visual score {image_score:.2f} provides a mild multimodal nudge alongside text."
