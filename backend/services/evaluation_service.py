"""
Offline evaluation: rule engine vs AI vs gold labels on a benchmark JSON dataset.
"""

from __future__ import annotations

import json
import threading
import time
from pathlib import Path
from typing import List, Optional

from fastapi import HTTPException

from config import Settings, get_settings
from models import AnalysisResult, MultimodalInput
from models.metrics_schemas import (
    ClassMetrics,
    MetricsComparison,
    MetricsMeta,
    MetricsResponse,
    ModelMetricsReport,
)
from services.ai_engine import AIEngine
from services.fusion_engine import FusionEngine
from services.rule_engine import RuleEngine
from utils.metrics import (
    LABEL_ORDER,
    accuracy_from_cm,
    build_confusion_matrix,
    inter_model_agreement,
    macro_averages,
    normalize_sentiment_label,
    per_class_precision_recall_f1,
)

_lock = threading.Lock()

_metrics_cache_payload: Optional[MetricsResponse] = None
_metrics_cache_mtime: Optional[float] = None
_metrics_cache_at: float = 0.0


def _rule_document_sentiment(result: AnalysisResult, fusion: FusionEngine) -> str:
    aspects = result.aspects
    if not aspects:
        return "Neutral"
    avg = sum(a.fused_score for a in aspects) / len(aspects)
    return fusion.sentiment_from_aggregate_score(avg)


def _ai_document_sentiment(result: AnalysisResult) -> str:
    if not result.aspects:
        return "Neutral"
    return str(result.aspects[0].sentiment)


def _report_from_pairs(name: str, golds: List[str], preds: List[str]) -> ModelMetricsReport:
    labels = list(LABEL_ORDER)
    cm = build_confusion_matrix(golds, preds, labels)
    per = per_class_precision_recall_f1(cm, labels)
    p_macro, r_macro, f_macro = macro_averages(per, labels)
    return ModelMetricsReport(
        model_name=name,
        accuracy=accuracy_from_cm(cm),
        precision_macro=p_macro,
        recall_macro=r_macro,
        f1_macro=f_macro,
        per_class={k: ClassMetrics(**v) for k, v in per.items()},
        confusion_matrix=cm,
        labels=labels,
    )


class EvaluationService:
    """
    Loads a gold-label benchmark, runs both engines (text-only), returns metrics.
    Thread-safe in-process cache keyed by benchmark file mtime + TTL.
    """

    def __init__(
        self,
        rule_engine: RuleEngine,
        ai_engine: AIEngine,
        settings: Optional[Settings] = None,
    ) -> None:
        self._rule = rule_engine
        self._ai = ai_engine
        self._settings = settings or get_settings()
        self._fusion_math = FusionEngine()

    def get_metrics(self, force_refresh: bool = False) -> MetricsResponse:
        global _metrics_cache_payload, _metrics_cache_mtime, _metrics_cache_at

        path: Path = self._settings.benchmark_path
        if not path.is_file():
            raise HTTPException(
                status_code=503,
                detail=f"Benchmark dataset not found at {path}. Set LIVELIB_BENCHMARK_PATH or add data/benchmark.json.",
            )

        mtime = path.stat().st_mtime
        now = time.time()
        ttl = self._settings.metrics_cache_ttl_seconds

        with _lock:
            if (
                not force_refresh
                and _metrics_cache_payload is not None
                and _metrics_cache_mtime == mtime
                and (ttl == 0 or (now - _metrics_cache_at) < ttl)
            ):
                meta = _metrics_cache_payload.meta.model_copy(update={"cache_hit": True})
                return _metrics_cache_payload.model_copy(update={"meta": meta})

        t0 = time.time()
        try:
            raw = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=500, detail=f"Invalid benchmark JSON: {e}") from e

        if not isinstance(raw, list):
            raise HTTPException(status_code=500, detail="Benchmark file must be a JSON array.")

        items = raw[: self._settings.metrics_max_samples]

        gold_for_rule: List[str] = []
        pred_rule: List[str] = []
        gold_for_ai: List[str] = []
        pred_ai: List[str] = []
        gold_both: List[str] = []
        pr_both: List[str] = []
        pa_both: List[str] = []

        skipped_invalid = 0
        n_valid_gold = 0
        warnings: List[str] = []

        for row in items:
            if not isinstance(row, dict):
                skipped_invalid += 1
                continue
            text = row.get("text") or row.get("review")
            label = normalize_sentiment_label(row.get("label") or row.get("sentiment"))
            if not text or not isinstance(text, str) or not text.strip() or label is None:
                skipped_invalid += 1
                continue

            n_valid_gold += 1
            text_clean = text.strip()
            inp = MultimodalInput(text=text_clean, image_bytes=None)

            rp: Optional[str] = None
            try:
                rp = _rule_document_sentiment(self._rule.analyze(inp), self._fusion_math)
            except Exception:
                pass

            ap: Optional[str] = None
            try:
                ap = _ai_document_sentiment(self._ai.analyze(text_clean, None))
            except Exception:
                pass

            if rp is not None:
                gold_for_rule.append(label)
                pred_rule.append(rp)
            if ap is not None:
                gold_for_ai.append(label)
                pred_ai.append(ap)
            if rp is not None and ap is not None:
                gold_both.append(label)
                pr_both.append(rp)
                pa_both.append(ap)

        if len(gold_for_rule) < 5:
            warnings.append(
                "Very few rule-based predictions succeeded; check spaCy/VADER setup and benchmark text.",
            )
        if len(gold_for_ai) < 5:
            warnings.append(
                "Very few AI predictions succeeded; verify multimodal_model.pth and torch stack.",
            )

        if not gold_for_rule:
            raise HTTPException(
                status_code=503,
                detail="No benchmark rows produced rule-based predictions; cannot compute metrics.",
            )

        rule_report = _report_from_pairs("rule_based", gold_for_rule, pred_rule)

        ai_report: Optional[ModelMetricsReport] = None
        comparison: Optional[MetricsComparison] = None

        if gold_for_ai:
            ai_report = _report_from_pairs("ai_model", gold_for_ai, pred_ai)

        if gold_both:
            both_correct = both_wrong = rule_only = ai_only = 0
            for g, r, a in zip(gold_both, pr_both, pa_both):
                rc = r == g
                ac = a == g
                if rc and ac:
                    both_correct += 1
                elif not rc and not ac:
                    both_wrong += 1
                elif rc:
                    rule_only += 1
                else:
                    ai_only += 1
            comparison = MetricsComparison(
                inter_model_agreement=inter_model_agreement(pr_both, pa_both),
                both_correct=both_correct,
                rule_only_correct=rule_only,
                ai_only_correct=ai_only,
                both_wrong=both_wrong,
            )

        elapsed_ms = round((time.time() - t0) * 1000, 2)

        meta = MetricsMeta(
            dataset_path=str(path.resolve()),
            n_benchmark_rows=len(items),
            n_valid_gold_rows=n_valid_gold,
            n_rule_predictions=len(gold_for_rule),
            n_ai_predictions=len(gold_for_ai),
            n_paired_rows=len(gold_both),
            n_skipped_invalid=skipped_invalid,
            cache_hit=False,
            evaluation_ms=elapsed_ms,
        )

        payload = MetricsResponse(
            meta=meta,
            rule_based=rule_report,
            ai_model=ai_report,
            comparison=comparison,
            warnings=warnings,
        )

        with _lock:
            _metrics_cache_payload = payload
            _metrics_cache_mtime = mtime
            _metrics_cache_at = time.time()

        return payload
