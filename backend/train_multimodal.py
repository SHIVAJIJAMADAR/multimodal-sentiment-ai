import argparse
import csv
import os
from typing import List, Tuple

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from torchvision.models import resnet18, ResNet18_Weights
from PIL import Image
from transformers import AutoTokenizer, AutoModel


class ReviewImageDataset(Dataset):
    def __init__(self, csv_path: str, image_size: int = 224):
        self.samples: List[Tuple[str, str, int]] = []
        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                text = (row.get("text") or "").strip()
                image_path = (row.get("image_path") or "").strip()
                label_raw = (row.get("label") or "").strip()
                if not text:
                    continue
                label = self._label_to_id(label_raw)
                self.samples.append((text, image_path, label))
        self.transform = transforms.Compose([
            transforms.Resize((image_size, image_size)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

    def _label_to_id(self, s: str) -> int:
        s_lower = s.lower()
        if s_lower in {"neg", "negative", "-1"}:
            return 0
        if s_lower in {"neu", "neutral", "0"}:
            return 1
        if s_lower in {"pos", "positive", "1"}:
            return 2
        try:
            v = int(s)
            if v < 0:
                return 0
            if v == 0:
                return 1
            if v > 0:
                return 2
        except Exception:
            pass
        return 1

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int):
        text, image_path, label = self.samples[idx]
        image_tensor = self._load_image(image_path)
        return text, image_tensor, label

    def _load_image(self, path: str) -> torch.Tensor:
        try:
            if path and os.path.exists(path):
                img = Image.open(path).convert("RGB")
            else:
                img = Image.new("RGB", (224, 224), color=(0, 0, 0))
        except Exception:
            img = Image.new("RGB", (224, 224), color=(0, 0, 0))
        return self.transform(img)


def make_collate(tokenizer: AutoTokenizer, max_length: int):
    def _collate(batch):
        texts = [b[0] for b in batch]
        images = torch.stack([b[1] for b in batch], dim=0)
        labels = torch.tensor([b[2] for b in batch], dtype=torch.long)
        enc = tokenizer(
            texts,
            padding=True,
            truncation=True,
            max_length=max_length,
            return_tensors="pt",
        )
        return enc["input_ids"], enc["attention_mask"], images, labels
    return _collate


class MultimodalSentimentModel(nn.Module):
    def __init__(
        self,
        text_model_name: str = "bert-base-uncased",
        finetune_text: bool = False,
        finetune_image: bool = False,
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
        if not finetune_text:
            for p in self.text_encoder.parameters():
                p.requires_grad = False
        if not finetune_image:
            for p in self.image_encoder.parameters():
                p.requires_grad = False
        self.fusion = nn.Sequential(
            nn.Linear(text_dim + img_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.1),
        )
        self.classifier = nn.Linear(hidden_dim, num_classes)

    def forward(self, input_ids: torch.Tensor, attention_mask: torch.Tensor, images: torch.Tensor):
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


def train(args):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    tokenizer = AutoTokenizer.from_pretrained(args.text_model)
    dataset = ReviewImageDataset(args.csv, image_size=args.image_size)
    collate_fn = make_collate(tokenizer, args.max_length)
    loader = DataLoader(
        dataset,
        batch_size=args.batch_size,
        shuffle=True,
        num_workers=args.workers,
        collate_fn=collate_fn,
        pin_memory=torch.cuda.is_available(),
    )
    model = MultimodalSentimentModel(
        text_model_name=args.text_model,
        finetune_text=args.finetune_text,
        finetune_image=args.finetune_image,
        hidden_dim=args.hidden_dim,
        num_classes=3,
    ).to(device)
    criterion = nn.CrossEntropyLoss()
    optim_params = [p for p in model.parameters() if p.requires_grad]
    optimizer = torch.optim.AdamW(optim_params, lr=args.lr, weight_decay=args.weight_decay)
    model.train()
    for epoch in range(args.epochs):
        total_loss = 0.0
        total = 0
        correct = 0
        for input_ids, attention_mask, images, labels in loader:
            input_ids = input_ids.to(device)
            attention_mask = attention_mask.to(device)
            images = images.to(device)
            labels = labels.to(device)
            optimizer.zero_grad()
            logits = model(input_ids, attention_mask, images)
            loss = criterion(logits, labels)
            loss.backward()
            optimizer.step()
            total_loss += float(loss.item()) * labels.size(0)
            preds = torch.argmax(logits, dim=1)
            correct += int((preds == labels).sum().item())
            total += int(labels.size(0))
        avg_loss = total_loss / max(1, total)
        acc = correct / max(1, total)
        print(f"epoch={epoch+1}/{args.epochs} loss={avg_loss:.4f} acc={acc:.4f}")
    torch.save(model.state_dict(), args.output)
    print(f"saved: {args.output}")


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--csv", required=True, help="path to dataset csv with columns: text,image_path,label")
    p.add_argument("--text-model", default="bert-base-uncased")
    p.add_argument("--image-size", type=int, default=224)
    p.add_argument("--max-length", type=int, default=128)
    p.add_argument("--batch-size", type=int, default=8)
    p.add_argument("--epochs", type=int, default=3)
    p.add_argument("--lr", type=float, default=2e-4)
    p.add_argument("--weight-decay", type=float, default=0.01)
    p.add_argument("--hidden-dim", type=int, default=256)
    p.add_argument("--finetune-text", action="store_true")
    p.add_argument("--finetune-image", action="store_true")
    p.add_argument("--workers", type=int, default=0)
    p.add_argument("--output", default="multimodal_model.pth")
    return p.parse_args()


if __name__ == "__main__":
    args = parse_args()
    train(args)
