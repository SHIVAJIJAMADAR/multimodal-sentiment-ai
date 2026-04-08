# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**LiveLib: Dynamic Multimodal Seating Intelligence** — A deterministic MABSA system. Extracts aspect–opinion pairs from text via spaCy dependency parsing, scores text sentiment with NLTK VADER, evaluates image mood via OpenCV HSV heuristics, and fuses both with a weighted formula. No deep learning — runs on any CPU.

## Build & Run Commands

### Backend

```powershell
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
python -m spacy download en_core_web_sm
python -c "import nltk; nltk.download('vader_lexicon')"
cd backend
uvicorn main:app --reload --port 8000
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

No test suite or linter is configured yet.

## Architecture

Two-tier: FastAPI backend + React/Vite frontend.

### backend/ — MABSA Pipeline (strict OOP)

All modules use relative imports and must be run from within the `backend/` directory.

- **`models.py`** — Pydantic models: `MultimodalInput` (text + optional image bytes), `Aspect` (aspect/opinion/scores/sentiment with `Literal` type), `AnalysisResult` (list of aspects).

- **`linguistic.py`** — `LinguisticAnalyzer`: loads `en_core_web_sm`, walks the dependency tree for two patterns: (1) NOUN with `amod` ADJ child, (2) `nsubj ← ROOT → acomp/attr`. Uses token lemmas for normalisation. Scores each opinion with VADER compound. Returns `List[Aspect]` with `text_score` populated. Raises `RuntimeError` if spaCy model is missing.

- **`vision.py`** — `VisualAnalyzer`: decodes image bytes via OpenCV, resizes to max 512px, converts to HSV. Score = `0.5 * brightness + 0.3 * saturation - 0.2 * edge_density` (Canny), mapped from [0,1] to [-1,1].

- **`fusion.py`** — `DecisionFusionEngine`: `fused = 0.7 * text_score + 0.3 * image_score`, clipped to [-1,1]. Classification: >0.2 Positive, <-0.2 Negative, else Neutral. Has `fuse()` and `fuse_batch()` methods.

- **`engine.py`** — `MABSAEngine`: stateless orchestrator. Calls linguistic → visual → fusion. Returns early if no aspects detected. Catches image exceptions gracefully (defaults image_score to 0.0).

- **`main.py`** — FastAPI app. `POST /api/analyze` (Form text + optional UploadFile image, JPEG/PNG only). `GET /health`. CORS open. Engine instantiated once at startup.

### frontend/ — React + Vite

- **`src/api.js`** — `analyzeReview(text, imageFile)` sends multipart form to `/api/analyze`. Client-side validation + 10s `AbortController` timeout. API base configurable via `VITE_API_BASE`.
- **`src/App.jsx`** — Textarea, file input, Analyze button, results table with colour-coded sentiment.
- **`vite.config.js`** — Port 3000, proxies `/api` to `localhost:8000`.

## Key Design Decisions

- **No deep learning**: Replaced PyTorch/Transformers with spaCy + VADER + OpenCV for deterministic, CPU-only inference.
- **Lemmatization**: Aspects/opinions use spaCy lemmas for normalisation ("chairs" → "chair").
- **Edge density as negative signal**: Canny edge density is subtracted — cluttered images score lower.
- **Stateless engine**: Each `analyze()` call is independent, no shared mutable state.
- **Separate fusion class**: Weights/thresholds can be tuned without touching NLP or vision code.
