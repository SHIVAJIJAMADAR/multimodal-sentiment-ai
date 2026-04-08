"""
linguistic.py — Aspect-level text sentiment analysis.
=====================================================

Uses spaCy dependency parsing to extract (aspect, opinion) pairs and
NLTK VADER to score sentiment.

Designed for lightweight CPU environments and deterministic outputs.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List

import spacy
from nltk.sentiment.vader import SentimentIntensityAnalyzer

from models import Aspect


# ---------------------------------------------------------------------
# Internal structure
# ---------------------------------------------------------------------

@dataclass
class _AspectOpinion:
    """Internal container used during dependency traversal."""
    aspect: str
    opinion: str


# ---------------------------------------------------------------------
# Linguistic Analyzer
# ---------------------------------------------------------------------

class LinguisticAnalyzer:
    """
    Extracts aspect–opinion pairs from text and scores them using VADER.

    Steps
    -----
    1. Parse text using spaCy dependency parser.
    2. Identify noun aspects with adjective modifiers.
    3. Detect "X is Y" constructions.
    4. Score opinion words using VADER.
    """

    def __init__(self) -> None:

        try:
            self._nlp = spacy.load("en_core_web_sm")
        except OSError:
            raise RuntimeError(
                "spaCy model not found. Run: python -m spacy download en_core_web_sm"
            )

        self._vader = SentimentIntensityAnalyzer()

    @property
    def vader(self) -> SentimentIntensityAnalyzer:
        return self._vader

    # ------------------------------------------------------------------
    # Dependency extraction
    # ------------------------------------------------------------------

    def _extract_pairs(self, text: str) -> List[_AspectOpinion]:

        doc = self._nlp(text)

        pairs: List[_AspectOpinion] = []
        seen = set()

        for token in doc:

            # Pattern 1: adjectival modifier
            # "great screen", "bad battery"

            if token.pos_ in {"NOUN", "PROPN"}:

                for child in token.children:

                    if child.dep_ == "amod" and child.pos_ == "ADJ":

                        key = (token.lemma_.lower(), child.lemma_.lower())

                        if key not in seen:
                            seen.add(key)

                            pairs.append(
                                _AspectOpinion(
                                    aspect=token.lemma_.lower(),
                                    opinion=child.lemma_.lower(),
                                )
                            )

            # Pattern 2: subject-complement structure
            # "battery is terrible", also handles conjunctions
            # ("screen is great but battery is terrible")

            if token.dep_ in {"ROOT", "conj"} and token.pos_ in {"AUX", "VERB"}:

                subjects = [
                    c for c in token.children
                    if c.dep_ == "nsubj" and c.pos_ in {"NOUN", "PROPN"}
                ]

                complements = [
                    c for c in token.children
                    if c.dep_ in {"acomp", "attr"} and c.pos_ == "ADJ"
                ]

                for subj in subjects:
                    for comp in complements:

                        key = (subj.lemma_.lower(), comp.lemma_.lower())

                        if key not in seen:
                            seen.add(key)

                            pairs.append(
                                _AspectOpinion(
                                    aspect=subj.lemma_.lower(),
                                    opinion=comp.lemma_.lower(),
                                )
                            )

        return pairs

    # ------------------------------------------------------------------
    # Sentiment scoring
    # ------------------------------------------------------------------

    def _score_opinion(self, opinion: str) -> float:
        """Return VADER compound sentiment score."""
        return float(self._vader.polarity_scores(opinion)["compound"])

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def analyze(self, text: str) -> List[Aspect]:
        """
        Analyse review text and return Aspect objects.

        Returns
        -------
        List[Aspect]
            Structured aspect results ready for fusion engine.
        """

        pairs = self._extract_pairs(text)

        aspects: List[Aspect] = []

        for pair in pairs:

            text_score = self._score_opinion(pair.opinion)

            aspects.append(
                Aspect(
                    aspect=pair.aspect,
                    opinion=pair.opinion,
                    text_score=text_score,
                )
            )

        return aspects