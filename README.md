<<<<<<< HEAD
# LiveLib — Dynamic Multimodal Seating Intelligence (MABSA)

A lightweight **Multimodal Aspect-Based Sentiment Analysis (MABSA)** system that analyzes **text reviews and images together** to determine aspect-level sentiment.

The system extracts aspects from text, evaluates image mood using computer vision heuristics, and fuses both signals using a deterministic scoring model.

⚡ **Runs entirely on CPU. No deep learning frameworks required.**

---

# Features

• Aspect extraction using **spaCy dependency parsing**  
• Sentiment scoring with **NLTK VADER**  
• Image mood detection using **OpenCV HSV heuristics**  
• Deterministic multimodal fusion (no neural networks)  
• FastAPI backend with automatic API docs  
• React + Vite interactive dashboard  

---

# Tech Stack

| Layer | Technology |
|------|------------|
Backend | FastAPI |
NLP | spaCy |
Sentiment | NLTK VADER |
Vision | OpenCV |
Numerics | NumPy |
Frontend | React 18 + Vite |

---

# Architecture

```
backend/
    main.py            # FastAPI server (POST /api/analyze)
    engine.py          # MABSAEngine — pipeline orchestrator
    linguistic.py      # LinguisticAnalyzer — spaCy dep parsing + VADER
    vision.py          # VisualAnalyzer — OpenCV HSV heuristics
    fusion.py          # DecisionFusionEngine — weighted score fusion
    models.py          # Pydantic data models
    requirements.txt   # Python dependencies

frontend/
    src/
        App.jsx        # Main React component
        api.js         # HTTP client for /api/analyze
        main.jsx       # React entry point
    index.html         # HTML shell
    package.json       # npm dependencies
    vite.config.js     # Vite dev server config
```

---

# Quick Start

## Backend

```powershell
python -m venv venv
venv\Scripts\Activate.ps1

pip install -r backend\requirements.txt

python -m spacy download en_core_web_sm
python -c "import nltk; nltk.download('vader_lexicon')"

cd backend
uvicorn main:app --reload --port 8000
```

API available at `http://localhost:8000`.  
Interactive docs at `http://localhost:8000/docs`.

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:3000`.

---

# API

## POST /api/analyze

**Form data:**
- `text` (string, required) — review text
- `image` (file, optional) — JPEG or PNG image

**Response:**
```json
{
  "aspects": [
    {
      "aspect": "battery",
      "opinion": "bad",
      "text_score": -0.5423,
      "image_score": -0.12,
      "fused_score": -0.4156,
      "sentiment": "Negative"
    }
  ]
}
```

---

# Fusion Formula

```
FinalScore = 0.7 × TextScore + 0.3 × ImageScore

if score >  0.2 → Positive
if score < -0.2 → Negative
otherwise       → Neutral
```
=======
# multimodal-sentiment-ai
A full-stack multimodal sentiment analysis system using BERT and ResNet18, featuring rule-based vs AI comparison, explainable insights, and an interactive dashboard built with React and FastAPI.
>>>>>>> 7691ed4a2a0916b4b0461d55a4370ec63179d4e4
