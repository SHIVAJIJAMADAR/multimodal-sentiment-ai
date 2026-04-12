"""
Pydantic schemas for the MABSA pipeline (API + internal processing).
"""

from __future__ import annotations

from typing import Dict, List, Optional, Literal
from pydantic import BaseModel, Field, ConfigDict


class MultimodalInput(BaseModel):
    """Review text plus optional raw image bytes."""

    text: str = Field(..., min_length=1)
    image_bytes: Optional[bytes] = None
    explain: bool = False

    model_config = ConfigDict(arbitrary_types_allowed=True)


class Aspect(BaseModel):
    """One extracted aspect with opinion and sentiment scores."""

    aspect: str
    opinion: str

    text_score: float = Field(
        default=0.0,
        ge=-1.0,
        le=1.0,
        description="Sentiment score from VADER",
    )

    image_score: float = Field(
        default=0.0,
        ge=-1.0,
        le=1.0,
        description="Visual heuristic sentiment score",
    )

    fused_score: float = Field(
        default=0.0,
        ge=-1.0,
        le=1.0,
        description="Weighted fusion of text and image sentiment",
    )

    confidence: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=100.0,
        description="Prediction confidence percentage",
    )

    sentiment: Literal["Positive", "Negative", "Neutral"] = "Neutral"

    model_config = ConfigDict(validate_assignment=True)


class TextSegment(BaseModel):
    """One reconstructible slice of the review for lexicon-based highlighting."""

    text: str
    polarity: Literal["positive", "negative", "neutral"]
    score: float = 0.0


class WordSaliency(BaseModel):
    """Occlusion-based importance: drop in predicted-class prob when token is masked."""

    word: str
    delta: float


class AnalysisExplanation(BaseModel):
    """Why the model predicted as it did + token-level cues."""

    pipeline: Literal["rule", "ml"]
    summary: str
    document_vader_compound: Optional[float] = None
    segments: List[TextSegment] = Field(default_factory=list)
    image_note: Optional[str] = None
    class_probabilities: Optional[Dict[str, float]] = None
    confidence: Optional[float] = None
    confidence_note: Optional[str] = None
    top_word_saliency: List[WordSaliency] = Field(default_factory=list)
    fusion_note: Optional[str] = None


class AnalysisResult(BaseModel):
    """API response: all aspects detected in the review."""

    aspects: List[Aspect] = Field(default_factory=list)
    explanation: Optional[AnalysisExplanation] = None

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "aspects": [
                    {
                        "aspect": "battery",
                        "opinion": "bad",
                        "text_score": -0.7,
                        "image_score": -0.2,
                        "fused_score": -0.55,
                        "confidence": 55.0,
                        "sentiment": "Negative",
                    }
                ]
            }
        }
    )
