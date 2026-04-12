"""Analysis endpoints: rule-based and ML pipelines."""

from __future__ import annotations

import json
import os
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from PIL import Image, ImageEnhance, ImageOps
import pytesseract

from models import AnalysisResult, MultimodalInput
from services.ai_engine import AIEngine
from services.rule_engine import RuleEngine
from deps import get_ai_engine, get_rule_engine
from utils.multipart import read_multimodal_form

router = APIRouter(tags=["analysis"])


def _configure_tesseract_if_needed() -> None:
    if getattr(pytesseract.pytesseract, "tesseract_cmd", None):
        cmd = pytesseract.pytesseract.tesseract_cmd
        if isinstance(cmd, str) and os.path.exists(cmd):
            return

    candidates = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    ]
    for path in candidates:
        if os.path.exists(path):
            pytesseract.pytesseract.tesseract_cmd = path
            return


def extract_text_from_image(image_file):
    _configure_tesseract_if_needed()
    image = Image.open(image_file).convert("RGB")
    gray = ImageOps.grayscale(image)
    boosted = ImageEnhance.Contrast(gray).enhance(2.0)
    bw = boosted.point(lambda p: 255 if p > 160 else 0)
    text = pytesseract.image_to_string(
        bw,
        config="--oem 3 --psm 6",
    )
    if not text.strip():
        text = pytesseract.image_to_string(
            gray,
            config="--oem 3 --psm 6",
        )
    return text.strip()


@router.post("/api/analyze", response_model=AnalysisResult)
async def analyze(
    request: Request,
    text: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    explain: Optional[bool] = Form(None),
    engine: RuleEngine = Depends(get_rule_engine),
) -> AnalysisResult:
    try:
        content_type = (request.headers.get("content-type") or "").lower()

        if "application/json" in content_type:
            raw_body = await request.body()
            payload = json.loads(raw_body.decode("utf-8") or "{}")
            print("API HIT: /api/analyze")
            print("Incoming request body:", payload)
            text_value = str(payload.get("text") or "")
            explain_value = bool(payload.get("explain", False))
            image_bytes = None
            if not text_value.strip():
                raise HTTPException(status_code=400, detail="Text input cannot be empty")
        else:
            print("API HIT: /api/analyze")
            print(
                "Incoming request body:",
                {
                    "text": text,
                    "explain": explain,
                    "has_image": image is not None,
                    "image_type": image.content_type if image is not None else None,
                },
            )
            text_value = text or ""
            explain_value = bool(explain)
            text_value, image_bytes = await read_multimodal_form(text_value, image)

        inp = MultimodalInput(text=text_value, image_bytes=image_bytes, explain=explain_value)
        return engine.analyze(inp)
    except HTTPException:
        raise
    except Exception as exc:
        print("Error in /api/analyze:", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/analyze-ml", response_model=AnalysisResult)
async def analyze_ml(
    request: Request,
    text: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    explain: Optional[bool] = Form(None),
    engine: AIEngine = Depends(get_ai_engine),
) -> AnalysisResult:
    try:
        content_type = (request.headers.get("content-type") or "").lower()

        if "application/json" in content_type:
            raw_body = await request.body()
            payload = json.loads(raw_body.decode("utf-8") or "{}")
            print("API HIT: /api/analyze-ml")
            print("Incoming request body:", payload)
            text_value = str(payload.get("text") or "")
            explain_value = bool(payload.get("explain", False))
            image_bytes = None
            if not text_value.strip():
                raise HTTPException(status_code=400, detail="Text input cannot be empty")
        else:
            print("API HIT: /api/analyze-ml")
            print(
                "Incoming request body:",
                {
                    "text": text,
                    "explain": explain,
                    "has_image": image is not None,
                    "image_type": image.content_type if image is not None else None,
                },
            )
            text_value = text or ""
            explain_value = bool(explain)
            text_value, image_bytes = await read_multimodal_form(text_value, image)

        return engine.analyze(text_value, image_bytes, explain=explain_value)
    except HTTPException:
        raise
    except Exception as exc:
        print("Error in /api/analyze-ml:", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/extract-text")
async def extract_text(image: UploadFile = File(...)):
    try:
        if image.content_type not in ["image/jpeg", "image/png", "image/webp", "image/jpg"]:
            raise HTTPException(status_code=400, detail="Only JPEG, PNG, or WebP images are supported")

        print("API HIT: /api/extract-text")
        print("Incoming request body:", {"filename": image.filename, "content_type": image.content_type})
        extracted = extract_text_from_image(image.file)
        return {"extracted_text": extracted}
    except HTTPException:
        raise
    except Exception as exc:
        print("Error in /api/extract-text:", exc)
        detail = str(exc)
        if "tesseract is not installed" in detail.lower() or "tesseractnotfounderror" in type(exc).__name__.lower():
            detail = "Tesseract OCR engine is not installed. Install Tesseract and restart backend."
        raise HTTPException(status_code=500, detail=detail)
