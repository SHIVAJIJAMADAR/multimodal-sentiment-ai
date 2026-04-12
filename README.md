# LiveLib - Multimodal Sentiment Analysis

LiveLib is a full-stack multimodal sentiment analysis project that combines:
- a deterministic **rule-based pipeline** (spaCy + VADER + OpenCV heuristics), and
- a lightweight **ML pipeline** (TF-IDF + Logistic Regression),

with a modern React dashboard for single-mode prediction, side-by-side comparison, explainability, and OCR-assisted input.

## Why this project

- **Explainable:** every prediction returns interpretable fields (scores, labels, confidence, explanation metadata).
- **Practical:** CPU-friendly, no heavy GPU requirement for inference.
- **Production-ready:** split frontend/backend deployment (Vercel + Render), health checks, safe parsing, and fallback handling.

## Key Features

- Rule-based multimodal sentiment (`/api/analyze`)
- ML-based sentiment (`/api/analyze-ml`)
- OCR text extraction from uploaded images (`/api/extract-text`)
- Compare mode (Rule vs ML) in frontend
- Confidence bars, disagreement diagnostics, and explainability panel
- Robust frontend parser with safe fallback values

## Tech Stack

### Backend
- FastAPI
- spaCy
- NLTK VADER
- OpenCV
- scikit-learn
- pytesseract + Pillow

### Frontend
- React + Vite
- Tailwind CSS
- Framer Motion

## Project Structure

```text
.
|- backend/
|  |- main.py                  # FastAPI app + middleware + routers
|  |- routes/
|  |  |- analysis.py           # /api/analyze, /api/analyze-ml, /api/extract-text
|  |  |- health.py             # /health
|  |- services/
|  |  |- rule_engine.py        # Rule pipeline orchestration
|  |  |- ai_engine.py          # ML pipeline orchestration
|  |- models/
|  |  |- schemas.py            # Pydantic response models
|  |- ml_predictor.py          # TF-IDF + LogisticRegression inference
|  |- requirements.txt
|  |- Dockerfile               # Render docker deployment (includes tesseract)
|
|- frontend/
|  |- src/
|  |  |- pages/                # Home, Demo, Features, Model, About
|  |  |- components/           # Input, prediction, explainability, analytics UI
|  |  |- hooks/useAnalysis.js  # Main frontend state + API orchestration
|  |  |- services/api.js       # API client
|  |- vite.config.js
|
|- render.yaml                 # Render blueprint config
```

## API Endpoints

### 1) Rule pipeline
`POST /api/analyze`

Accepts:
- JSON: `{ "text": "...", "explain": true }`
- or multipart form-data with `text` and optional `image`

### 2) ML pipeline
`POST /api/analyze-ml`

Accepts:
- JSON: `{ "text": "...", "explain": true }`
- or multipart form-data with `text` and optional `image`

### 3) OCR
`POST /api/extract-text`

Multipart form-data:
- `image` (jpeg/png/webp)

Response:

```json
{
  "extracted_text": "Camera is good but battery is not good"
}
```

### 4) Health
`GET /health`

Response:

```json
{ "status": "ok" }
```

## Example Analysis Response

```json
{
  "aspects": [
    {
      "aspect": "overall",
      "opinion": "document",
      "text_score": 0.123,
      "image_score": 0.0,
      "fused_score": 0.123,
      "confidence": 61.2,
      "sentiment": "Positive"
    }
  ],
  "explanation": {
    "pipeline": "rule",
    "document_vader_compound": 0.123
  }
}
```

## Local Setup

## 1) Backend

From project root:

```powershell
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
python -m spacy download en_core_web_sm
python -c "import nltk; nltk.download('vader_lexicon')"
cd backend
uvicorn main:app --reload --port 8000
```

Backend runs on `http://127.0.0.1:8000`.

## 2) Frontend

In a new terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

## Deployment

### Frontend (Vercel)
- Deploy `frontend` app.
- Set environment variable:
  - `VITE_API_BASE=https://<your-backend-domain>`

### Backend (Render)
- Uses `render.yaml` + `backend/Dockerfile`.
- Docker image installs Tesseract + Python deps and starts FastAPI with uvicorn.

## Notes

- On Render free tier, first request after inactivity can be slow (cold start).
- OCR quality depends on image clarity and text contrast.
- For reproducibility, backend uses fixed ML artifacts (`model.pkl`, `vectorizer.pkl`).

## License

Add your preferred license (MIT/Apache-2.0/etc.) in a `LICENSE` file.
