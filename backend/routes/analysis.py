"""Analysis endpoints: rule-based and ML pipelines."""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile

from models import AnalysisResult, MultimodalInput
from services.ai_engine import AIEngine
from services.rule_engine import RuleEngine
from deps import get_ai_engine, get_rule_engine
from utils.multipart import read_multimodal_form

router = APIRouter(tags=["analysis"])


@router.post("/api/analyze", response_model=AnalysisResult)
async def analyze(
    text: str = Form(...),
    image: Optional[UploadFile] = File(None),
    explain: bool = Form(False),
    engine: RuleEngine = Depends(get_rule_engine),
) -> AnalysisResult:
    text, image_bytes = await read_multimodal_form(text, image)
    inp = MultimodalInput(text=text, image_bytes=image_bytes, explain=explain)
    return engine.analyze(inp)


@router.post("/api/analyze-ml", response_model=AnalysisResult)
async def analyze_ml(
    text: str = Form(...),
    image: Optional[UploadFile] = File(None),
    explain: bool = Form(False),
    engine: AIEngine = Depends(get_ai_engine),
) -> AnalysisResult:
    text, image_bytes = await read_multimodal_form(text, image)
    return engine.analyze(text, image_bytes, explain=explain)
