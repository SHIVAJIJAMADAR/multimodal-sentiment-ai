import os
import pickle
from typing import Any, Dict, List, Optional, Tuple

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression


LABEL_TO_ID = {
    "Negative": 0,
    "Neutral": 1,
    "Positive": 2,
}

ID_TO_LABEL = {
    0: "Negative",
    1: "Neutral",
    2: "Positive",
}


BALANCED_DATASET: List[Tuple[str, str]] = [
    ("I love this product", "Positive"),
    ("Amazing experience", "Positive"),
    ("Works perfectly", "Positive"),
    ("This is terrible", "Negative"),
    ("Battery is very bad", "Negative"),
    ("Worst purchase ever", "Negative"),
    ("It is okay", "Neutral"),
    ("Average product", "Neutral"),
    ("Nothing special", "Neutral"),
    ("Good but expensive", "Neutral"),
    ("Love design but poor battery", "Neutral"),
]


class MLPredictor:
    """
    Lightweight sentiment predictor using TF-IDF + LogisticRegression.
    Image bytes are accepted for API compatibility but not used by this text model.
    """

    def __init__(
        self,
        model_path: Optional[str] = None,
        vectorizer_path: Optional[str] = None,
        retrain: bool = False,
    ) -> None:
        base_dir = os.path.dirname(__file__)
        self.model_path = model_path or os.path.join(base_dir, "model.pkl")
        self.vectorizer_path = vectorizer_path or os.path.join(base_dir, "vectorizer.pkl")

        if retrain:
            self._train_and_save()
            return

        if self._artifacts_exist():
            try:
                self._load_artifacts()
                return
            except Exception:
                pass

        self._train_and_save()

    def _artifacts_exist(self) -> bool:
        return os.path.exists(self.model_path) and os.path.exists(self.vectorizer_path)

    def _load_artifacts(self) -> None:
        with open(self.model_path, "rb") as f:
            self.model = pickle.load(f)
        with open(self.vectorizer_path, "rb") as f:
            self.vectorizer = pickle.load(f)

    def _train_and_save(self) -> None:
        texts = [row[0] for row in BALANCED_DATASET]
        labels = [LABEL_TO_ID[row[1]] for row in BALANCED_DATASET]

        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2))
        x_train = self.vectorizer.fit_transform(texts)

        self.model = LogisticRegression(max_iter=2000, class_weight="balanced", random_state=42, C=10.0)
        self.model.fit(x_train, labels)

        with open(self.model_path, "wb") as f:
            pickle.dump(self.model, f)
        with open(self.vectorizer_path, "wb") as f:
            pickle.dump(self.vectorizer, f)

    @staticmethod
    def _label_from_id(pred_id: int) -> str:
        return ID_TO_LABEL.get(pred_id, "Neutral")

    @staticmethod
    def _fused_score_from_probs(probabilities: Dict[str, float]) -> float:
        return float(probabilities["Positive"] - probabilities["Negative"])

    def _word_saliency(self, text: str, pred_id: int, top_k: int = 12) -> List[Dict[str, Any]]:
        row = self.vectorizer.transform([text])
        if row.nnz == 0:
            return []

        coef = self.model.coef_[pred_id]
        feature_names = self.vectorizer.get_feature_names_out()
        coo = row.tocoo()
        contribution_by_term: Dict[str, float] = {}

        for col_idx, value in zip(coo.col, coo.data):
            term = str(feature_names[col_idx])
            delta = float(value * coef[col_idx])
            contribution_by_term[term] = contribution_by_term.get(term, 0.0) + delta

        ranked = sorted(contribution_by_term.items(), key=lambda item: abs(item[1]), reverse=True)[:top_k]
        return [{"word": term, "delta": round(delta, 6)} for term, delta in ranked]

    def predict_payload(
        self,
        text: str,
        image_bytes: Optional[bytes] = None,
        *,
        include_saliency: bool = False,
    ) -> Dict[str, Any]:
        del image_bytes

        clean_text = (text or "").strip() or "."
        text_vec = self.vectorizer.transform([clean_text])

        probs = self.model.predict_proba(text_vec)[0]
        pred_id = int(max(range(len(probs)), key=lambda i: probs[i]))

        probabilities = {
            "Negative": round(float(probs[0]), 6),
            "Neutral": round(float(probs[1]), 6),
            "Positive": round(float(probs[2]), 6),
        }

        confidence = float(max(probs))
        fused_score = self._fused_score_from_probs(probabilities)

        payload: Dict[str, Any] = {
            "label": self._label_from_id(pred_id),
            "probabilities": probabilities,
            "confidence": round(confidence, 6),
            "fused_score": round(fused_score, 6),
            "top_word_saliency": [],
        }

        if include_saliency:
            payload["top_word_saliency"] = self._word_saliency(clean_text, pred_id)

        return payload

    def predict(self, text: str, image_bytes: Optional[bytes]) -> str:
        payload = self.predict_payload(text, image_bytes, include_saliency=False)
        return str(payload["label"])

    def predict_with_explanation(
        self,
        text: str,
        image_bytes: Optional[bytes],
        max_occlusion_words: int = 40,
    ) -> Dict[str, Any]:
        del max_occlusion_words
        return self.predict_payload(text, image_bytes, include_saliency=True)
