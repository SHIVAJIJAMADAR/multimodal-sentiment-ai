"""
Classification metrics from a multi-class confusion matrix (no sklearn).
"""

from __future__ import annotations

from typing import Dict, List, Sequence, Tuple

# Row = gold label, column = predicted label (sklearn convention)
LABEL_ORDER: Tuple[str, ...] = ("Negative", "Neutral", "Positive")


def normalize_sentiment_label(raw: str) -> str | None:
    if not raw or not str(raw).strip():
        return None
    key = str(raw).strip().lower()
    mapping = {
        "positive": "Positive",
        "negative": "Negative",
        "neutral": "Neutral",
        "pos": "Positive",
        "neg": "Negative",
        "neu": "Neutral",
    }
    return mapping.get(key)


def build_confusion_matrix(
    y_true: Sequence[str],
    y_pred: Sequence[str],
    labels: Sequence[str] = LABEL_ORDER,
) -> List[List[int]]:
    idx = {lab: i for i, lab in enumerate(labels)}
    n = len(labels)
    cm = [[0 for _ in range(n)] for _ in range(n)]
    for t, p in zip(y_true, y_pred):
        if t not in idx or p not in idx:
            continue
        cm[idx[t]][idx[p]] += 1
    return cm


def accuracy_from_cm(cm: List[List[int]]) -> float:
    total = sum(sum(row) for row in cm)
    if total == 0:
        return 0.0
    correct = sum(cm[i][i] for i in range(len(cm)))
    return round(correct / total, 6)


def per_class_precision_recall_f1(
    cm: List[List[int]],
    labels: Sequence[str] = LABEL_ORDER,
) -> Dict[str, Dict[str, float]]:
    n = len(labels)
    out: Dict[str, Dict[str, float]] = {}
    for i, lab in enumerate(labels):
        tp = cm[i][i]
        fp = sum(cm[j][i] for j in range(n) if j != i)
        fn = sum(cm[i][j] for j in range(n) if j != i)
        prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = (2 * prec * rec / (prec + rec)) if (prec + rec) > 0 else 0.0
        out[lab] = {
            "precision": round(prec, 6),
            "recall": round(rec, 6),
            "f1_score": round(f1, 6),
        }
    return out


def macro_averages(per_class: Dict[str, Dict[str, float]], labels: Sequence[str] = LABEL_ORDER) -> Tuple[float, float, float]:
    p = sum(per_class[l]["precision"] for l in labels if l in per_class) / len(labels)
    r = sum(per_class[l]["recall"] for l in labels if l in per_class) / len(labels)
    f = sum(per_class[l]["f1_score"] for l in labels if l in per_class) / len(labels)
    return round(p, 6), round(r, 6), round(f, 6)


def inter_model_agreement(preds_a: Sequence[str], preds_b: Sequence[str]) -> float:
    if not preds_a or len(preds_a) != len(preds_b):
        return 0.0
    agree = sum(1 for x, y in zip(preds_a, preds_b) if x == y)
    return round(agree / len(preds_a), 6)
