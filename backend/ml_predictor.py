import io
import os
from typing import Any, Dict, List, Optional

import torch
import torch.nn as nn
from PIL import Image
from torchvision import transforms
from torchvision.models import resnet18, ResNet18_Weights
from transformers import AutoTokenizer, AutoModel


class _MultimodalSentimentModel(nn.Module):
    def __init__(
        self,
        text_model_name: str = "bert-base-uncased",
        hidden_dim: int = 256,
        num_classes: int = 3,
    ):
        super().__init__()
        self.text_encoder = AutoModel.from_pretrained(text_model_name)
        text_dim = int(self.text_encoder.config.hidden_size)

        weights = ResNet18_Weights.IMAGENET1K_V1
        self.image_encoder = resnet18(weights=weights)
        img_dim = self.image_encoder.fc.in_features
        self.image_encoder.fc = nn.Identity()

        self.fusion = nn.Sequential(
            nn.Linear(text_dim + img_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.1),
        )
        self.classifier = nn.Linear(hidden_dim, num_classes)

        for p in self.text_encoder.parameters():
            p.requires_grad = False
        for p in self.image_encoder.parameters():
            p.requires_grad = False

    def forward(self, input_ids: torch.Tensor, attention_mask: torch.Tensor, images: torch.Tensor):
        with torch.no_grad():
            text_outputs = self.text_encoder(input_ids=input_ids, attention_mask=attention_mask)
            if hasattr(text_outputs, "last_hidden_state"):
                cls = text_outputs.last_hidden_state[:, 0, :]
            else:
                cls = text_outputs[0][:, 0, :]
            img_feat = self.image_encoder(images)
        fused = torch.cat([cls, img_feat], dim=1)
        h = self.fusion(fused)
        logits = self.classifier(h)
        return logits


class MLPredictor:
    def __init__(
        self,
        model_path: Optional[str] = None,
        text_model_name: str = "bert-base-uncased",
        max_length: int = 128,
        image_size: int = 224,
    ) -> None:
        self.device = torch.device("cpu")
        self.tokenizer = AutoTokenizer.from_pretrained(text_model_name)
        self.model = _MultimodalSentimentModel(
            text_model_name=text_model_name,
            hidden_dim=256,
            num_classes=3,
        ).to(self.device)
        self.model.eval()

        if model_path is None:
            model_path = os.path.join(os.path.dirname(__file__), "multimodal_model.pth")
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found at: {model_path}")
        state = torch.load(model_path, map_location=self.device)
        self.model.load_state_dict(state, strict=False)

        self.max_length = max_length
        self.transform = transforms.Compose([
            transforms.Resize((image_size, image_size)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

    def _preprocess_text(self, text: str):
        enc = self.tokenizer(
            text,
            padding="max_length",
            truncation=True,
            max_length=self.max_length,
            return_tensors="pt",
        )
        input_ids = enc["input_ids"].to(self.device)
        attention_mask = enc["attention_mask"].to(self.device)
        return input_ids, attention_mask

    def _preprocess_image(self, image_bytes: Optional[bytes]) -> torch.Tensor:
        if image_bytes:
            try:
                img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            except Exception:
                img = Image.new("RGB", (224, 224), color=(0, 0, 0))
        else:
            img = Image.new("RGB", (224, 224), color=(0, 0, 0))
        return self.transform(img).unsqueeze(0).to(self.device)

    @staticmethod
    def _label_from_id(pred_id: int) -> str:
        if pred_id == 0:
            return "Negative"
        if pred_id == 1:
            return "Neutral"
        return "Positive"

    def _forward_probs(self, text: str, image_bytes: Optional[bytes]) -> torch.Tensor:
        input_ids, attention_mask = self._preprocess_text(text)
        image_tensor = self._preprocess_image(image_bytes)
        logits = self.model(input_ids=input_ids, attention_mask=attention_mask, images=image_tensor)
        return torch.softmax(logits, dim=1)[0]

    def predict(self, text: str, image_bytes: Optional[bytes]) -> str:
        self.model.eval()
        with torch.no_grad():
            probs = self._forward_probs(text, image_bytes)
            pred_id = int(torch.argmax(probs).item())
        return self._label_from_id(pred_id)

    def predict_with_explanation(
        self,
        text: str,
        image_bytes: Optional[bytes],
        max_occlusion_words: int = 40,
    ) -> Dict[str, Any]:
        """
        Softmax confidence plus simple word occlusion saliency (supports predicted class).
        """
        self.model.eval()
        words = text.split()
        saliency: List[Dict[str, Any]] = []
        n = min(len(words), max_occlusion_words)

        with torch.no_grad():
            probs = self._forward_probs(text, image_bytes)
            pred_id = int(torch.argmax(probs).item())
            confidence = float(probs[pred_id].item())
            for i in range(n):
                masked_words = words.copy()
                masked_words[i] = "."
                masked_text = " ".join(masked_words).strip() or "."
                p_masked = self._forward_probs(masked_text, image_bytes)
                delta = float((probs[pred_id] - p_masked[pred_id]).item())
                saliency.append({"word": words[i], "delta": round(delta, 6)})

        saliency.sort(key=lambda x: -abs(x["delta"]))
        top = saliency[:12]

        return {
            "label": self._label_from_id(pred_id),
            "probabilities": {
                "Negative": round(float(probs[0].item()), 6),
                "Neutral": round(float(probs[1].item()), 6),
                "Positive": round(float(probs[2].item()), 6),
            },
            "confidence": round(confidence, 6),
            "top_word_saliency": top,
        }
