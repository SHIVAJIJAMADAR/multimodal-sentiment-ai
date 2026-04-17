"""Analysis endpoints: rule-based and ML pipelines."""

from __future__ import annotations

import os
import shutil
import traceback
from io import BytesIO
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse
from PIL import Image, ImageEnhance, ImageOps
import pytesseract

from models import AnalysisResult, MultimodalInput
from services.ai_engine import AIEngine
from services.rule_engine import RuleEngine
from deps import get_ai_engine, get_rule_engine
from utils.multipart import read_multimodal_form

router = APIRouter(tags=["analysis"])


def _response_payload(result: AnalysisResult) -> Dict[str, Any]:
    aspects = [aspect.model_dump() for aspect in result.aspects]

    sentiment = "Neutral"
    confidence = 0.0
    if result.aspects:
        first = result.aspects[0]
        sentiment = first.sentiment
        confidence = float((first.confidence or 0.0) / 100.0)

    explanation: Any = ""
    if result.explanation is not None:
        if hasattr(result.explanation, "model_dump"):
            explanation = result.explanation.model_dump()
        else:
            explanation = str(result.explanation)

    return {
        "sentiment": sentiment,
        "confidence": round(min(max(confidence, 0.0), 1.0), 6),
        "aspects": aspects,
        "explanation": explanation,
    }


def _error_payload(error_message: str) -> Dict[str, Any]:
    return {
        "sentiment": "Neutral",
        "confidence": 0.0,
        "aspects": [],
        "explanation": "",
        "error": error_message,
    }


async def _read_text_inputs(
    request: Request,
    text: Optional[str],
    image: Optional[UploadFile],
    explain: Optional[bool],
) -> tuple[str, Optional[bytes], bool]:
    content_type = (request.headers.get("content-type") or "").lower()

    if "application/json" in content_type:
        try:
            payload = await request.json()
        except Exception as exc:
            raise HTTPException(status_code=400, detail="Invalid JSON payload") from exc
        print("Incoming request body:", payload)
        text_value = str(payload.get("text") or "")
        explain_value = bool(payload.get("explain", False))
        return text_value, None, explain_value

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
    return text_value, image_bytes, explain_value


def _configure_tesseract_if_needed() -> None:
    if getattr(pytesseract.pytesseract, "tesseract_cmd", None):
        cmd = pytesseract.pytesseract.tesseract_cmd
        if isinstance(cmd, str) and os.path.exists(cmd):
            return

    discovered = shutil.which("tesseract")
    if discovered:
        pytesseract.pytesseract.tesseract_cmd = discovered
        return

    candidates = [
        "/usr/bin/tesseract",
        "/usr/local/bin/tesseract",
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    ]
    for path in candidates:
        if os.path.exists(path):
            pytesseract.pytesseract.tesseract_cmd = path
            return


def _assert_tesseract_ready() -> None:
    _configure_tesseract_if_needed()
    try:
        version = str(pytesseract.get_tesseract_version())
        print("Tesseract version:", version)
    except Exception as exc:
        diag = _tesseract_diagnostics()
        raise RuntimeError(
            "Tesseract OCR engine is unavailable in runtime. Install system package 'tesseract-ocr' and language data 'tesseract-ocr-eng'. "
            + diag
        ) from exc


def _tesseract_diagnostics() -> str:
    configured = str(getattr(pytesseract.pytesseract, "tesseract_cmd", ""))
    discovered = shutil.which("tesseract") or "<not-found>"
    return f"configured_cmd={configured}, which={discovered}"


def _normalize_ocr_text(text: str) -> str:
    return " ".join((text or "").split())


def extract_text_from_image(image_file):
    _configure_tesseract_if_needed()
    image = Image.open(image_file).convert("RGB")

    width, height = image.size
    scale = 2 if max(width, height) < 1800 else 1
    if scale > 1:
        image = image.resize((width * scale, height * scale), Image.Resampling.LANCZOS)

    gray = ImageOps.grayscale(image)
    auto = ImageOps.autocontrast(gray)
    boosted = ImageEnhance.Contrast(auto).enhance(2.2)
    bw = boosted.point(lambda p: 255 if p > 170 else 0)
    inv_bw = ImageOps.invert(bw)

    variants = [image, gray, auto, boosted, bw, inv_bw]
    configs = [
        "--oem 3 --psm 6 -l eng",
        "--oem 3 --psm 7 -l eng",
        "--oem 3 --psm 11 -l eng",
    ]

    best_text = ""
    best_score = -1
    executed_any_ocr = False
    for variant in variants:
        for cfg in configs:
            try:
                raw = pytesseract.image_to_string(variant, config=cfg)
                executed_any_ocr = True
            except pytesseract.TesseractNotFoundError:
                raise
            except Exception:
                continue
            normalized = _normalize_ocr_text(raw)
            score = sum(ch.isalnum() for ch in normalized)
            if score > best_score:
                best_score = score
                best_text = normalized

    if not executed_any_ocr:
        raise RuntimeError("OCR pipeline did not execute any successful tesseract call")

    return best_text


@router.post("/api/analyze", response_model=Dict[str, Any])
async def analyze(
    request: Request,
    text: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    explain: Optional[bool] = Form(None),
    engine: RuleEngine = Depends(get_rule_engine),
) -> Dict[str, Any]:
    try:
        print("API HIT: /api/analyze")
        text_value, image_bytes, explain_value = await _read_text_inputs(request, text, image, explain)

        if not text_value.strip():
            return JSONResponse(status_code=400, content=_error_payload("Text input cannot be empty"))

        inp = MultimodalInput(text=text_value, image_bytes=image_bytes, explain=explain_value)
        result = engine.analyze(inp)
        response = _response_payload(result)
        print("INPUT:", text_value)
        print("OUTPUT:", response)
        return response
    except HTTPException as exc:
        print("ERROR:", str(exc))
        print(traceback.format_exc())
        return JSONResponse(status_code=exc.status_code, content=_error_payload(str(exc.detail)))
    except Exception as exc:
        print("ERROR:", str(exc))
        print(traceback.format_exc())
        return JSONResponse(status_code=500, content=_error_payload(str(exc)))


@router.post("/api/analyze-ml", response_model=Dict[str, Any])
async def analyze_ml(
    request: Request,
    text: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    explain: Optional[bool] = Form(None),
    engine: AIEngine = Depends(get_ai_engine),
) -> Dict[str, Any]:
    try:
        print("API HIT: /api/analyze-ml")
        text_value, image_bytes, explain_value = await _read_text_inputs(request, text, image, explain)

        if not text_value.strip():
            return JSONResponse(status_code=400, content=_error_payload("Text input cannot be empty"))

        result = engine.analyze(text_value, image_bytes, explain=explain_value)
        response = _response_payload(result)
        print("INPUT:", text_value)
        print("OUTPUT:", response)
        return response
    except HTTPException as exc:
        print("ERROR:", str(exc))
        print(traceback.format_exc())
        return JSONResponse(status_code=exc.status_code, content=_error_payload(str(exc.detail)))
    except Exception as exc:
        print("ERROR:", str(exc))
        print(traceback.format_exc())
        return JSONResponse(status_code=500, content=_error_payload(str(exc)))


@router.post("/api/extract-text")
async def extract_text(image: UploadFile = File(...)):
    try:
        if image.content_type not in ["image/jpeg", "image/png", "image/webp", "image/jpg"]:
            raise HTTPException(status_code=400, detail="Only JPEG, PNG, or WebP images are supported")

        print("API HIT: /api/extract-text")
        print("Incoming request body:", {"filename": image.filename, "content_type": image.content_type})
        _assert_tesseract_ready()
        image_bytes = await image.read()
        try:
            extracted = extract_text_from_image(BytesIO(image_bytes))
        except pytesseract.TesseractNotFoundError as exc:
            diag = _tesseract_diagnostics()
            raise RuntimeError(
                "Tesseract OCR engine is unavailable in runtime. Install system package 'tesseract-ocr' and language data 'tesseract-ocr-eng'. "
                + diag
            ) from exc
        if not extracted:
            raise HTTPException(
                status_code=422,
                detail="OCR could not read text from image. Upload a clearer image with higher contrast or type manually.",
            )
        return {"extracted_text": extracted}
    except RuntimeError as exc:
        print("Error in /api/extract-text:", exc)
        raise HTTPException(status_code=503, detail=str(exc))
    except HTTPException:
        raise
    except Exception as exc:
        print("Error in /api/extract-text:", exc)
        detail = str(exc)
        if "tesseract is not installed" in detail.lower() or "tesseractnotfounderror" in type(exc).__name__.lower():
            detail = "Tesseract OCR engine is not installed. Install Tesseract and restart backend."
        raise HTTPException(status_code=500, detail=detail)
