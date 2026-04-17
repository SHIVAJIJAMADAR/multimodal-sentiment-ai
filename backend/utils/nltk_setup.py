"""NLTK runtime helpers for production-safe resource loading."""

from __future__ import annotations

from functools import lru_cache
from typing import Any

import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer


class _NeutralSentimentAnalyzer:
    """Fallback analyzer when VADER lexicon is unavailable."""

    @staticmethod
    def polarity_scores(_: str) -> dict[str, float]:
        return {"neg": 0.0, "neu": 1.0, "pos": 0.0, "compound": 0.0}


@lru_cache(maxsize=1)
def get_vader_analyzer() -> Any:
    """Return a usable sentiment analyzer; auto-download VADER once if missing."""
    try:
        return SentimentIntensityAnalyzer()
    except LookupError:
        try:
            print("NLTK vader_lexicon missing; downloading...")
            nltk.download("vader_lexicon", quiet=True)
            return SentimentIntensityAnalyzer()
        except Exception as exc:
            print(f"NLTK vader_lexicon unavailable, using neutral fallback: {exc}")
            return _NeutralSentimentAnalyzer()
