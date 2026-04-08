import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SentimentGauge from "./SentimentGauge.jsx";
import { compareRuleVsMl, buildDisagreementBrief } from "../utils/compareModels.js";

function sentimentPillClass(sentiment) {
  if (sentiment === "Positive") return "bg-emerald-500/15 text-emerald-300 ring-emerald-500/40";
  if (sentiment === "Negative") return "bg-rose-500/15 text-rose-300 ring-rose-500/40";
  return "bg-amber-500/10 text-amber-200 ring-amber-500/35";
}

function buildAspectSummary(res) {
  const aspects = res?.aspects ?? [];
  if (!aspects.length) return "No aspect–opinion pairs detected.";
  return aspects
    .slice(0, 4)
    .map((a) => {
      const fs = typeof a.fused_score === "number" ? ` fused ${a.fused_score.toFixed(2)}` : "";
      return `${a.aspect} ← "${a.opinion}" (${a.sentiment}${fs})`;
    })
    .join(" · ");
}

export default function PredictionPanel({ ruleResult, mlResult, compare = false }) {
  const snapshot = useMemo(() => compareRuleVsMl(ruleResult, mlResult), [ruleResult, mlResult]);
  const brief = useMemo(() => buildDisagreementBrief(snapshot), [snapshot]);

  if (compare && !ruleResult && !mlResult) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Select <span className="text-slate-300 font-medium">Compare Both</span> and run analysis to see side-by-side
        outputs, agreement status, and disagreement diagnostics.
      </div>
    );
  }

  if (!compare) {
    const res = mlResult || ruleResult;
    const aspect = res?.aspects?.[0];
    const sentiment = aspect?.sentiment || "Neutral";
    const confidence =
      res?.explanation?.confidence ?? (typeof aspect?.confidence === "number" ? aspect.confidence : null);
    const reason = buildAspectSummary(res);
    const pipeline = mlResult && !ruleResult ? "AI model" : "Rule-based engine";

    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-tr from-cyan-400 to-blue-600 text-black font-bold">
            ✺
          </span>
          <div>
            <div className="text-lg font-semibold">Prediction</div>
            <div className="text-xs text-slate-500">{pipeline}</div>
          </div>
        </div>
        <SentimentGauge sentiment={sentiment} confidence={confidence} />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-1 ${sentimentPillClass(sentiment)}`}
          >
            {sentiment}
            {confidence != null ? ` · ${Math.round(confidence * 100)}%` : ""}
          </span>
        </div>
        {reason && (
          <div className="mt-4 rounded-xl ring-1 ring-white/10 bg-white/5 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Evidence summary</div>
            <div className="text-sm text-slate-300 leading-relaxed">{reason}</div>
          </div>
        )}
      </div>
    );
  }

  const ruleAspect = ruleResult?.aspects?.[0];
  const mlAspect = mlResult?.aspects?.[0];
  const mlConfidence =
    mlResult?.explanation?.confidence ??
    (typeof mlAspect?.confidence === "number" ? mlAspect.confidence : null);

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-tr from-cyan-400 to-violet-600 text-black font-bold">
            ⇄
          </span>
          <div>
            <div className="text-lg font-semibold">Compare mode</div>
            <div className="text-xs text-slate-500">Document-level labels · structured diagnostics</div>
          </div>
        </div>
        <motion.span
          layout
          className={`inline-flex items-center self-start rounded-full px-3 py-1.5 text-xs font-semibold ring-1 tabular-nums ${
            brief.badgeTone === "success"
              ? "bg-emerald-500/10 text-emerald-300 ring-emerald-500/35"
              : "bg-amber-500/10 text-amber-200 ring-amber-500/40"
          }`}
        >
          {brief.badgeTone === "success" ? "✓ " : "⚠ "}
          {brief.badgeLabel}
        </motion.span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          layout
          className="rounded-2xl ring-1 ring-cyan-500/25 bg-gradient-to-b from-cyan-950/40 to-slate-900/40 p-4 space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-cyan-200">Rule engine</span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${sentimentPillClass(snapshot.rule.label)}`}>
              {snapshot.rule.label}
            </span>
          </div>
          <SentimentGauge sentiment={snapshot.rule.label} confidence={null} />
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-slate-400 border-t border-white/10 pt-3">
            <dt className="text-slate-500">Aspect spans</dt>
            <dd className="text-slate-200 font-mono tabular-nums text-right">{snapshot.rule.aspectCount}</dd>
            {snapshot.rule.avgFused != null && (
              <>
                <dt className="text-slate-500">Avg fused score</dt>
                <dd className="text-slate-200 font-mono tabular-nums text-right">{snapshot.rule.avgFused.toFixed(3)}</dd>
              </>
            )}
            {snapshot.rule.imageScore != null && (
              <>
                <dt className="text-slate-500">Image heuristic</dt>
                <dd className="text-slate-200 font-mono tabular-nums text-right">{snapshot.rule.imageScore.toFixed(3)}</dd>
              </>
            )}
            {snapshot.rule.compound != null && (
              <>
                <dt className="text-slate-500">Doc VADER</dt>
                <dd className="text-slate-200 font-mono tabular-nums text-right">{snapshot.rule.compound.toFixed(3)}</dd>
              </>
            )}
          </dl>
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">{buildAspectSummary(ruleResult)}</p>
        </motion.div>

        <motion.div
          layout
          className="rounded-2xl ring-1 ring-violet-500/25 bg-gradient-to-b from-violet-950/35 to-slate-900/40 p-4 space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-violet-200">AI model</span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${sentimentPillClass(snapshot.ml.label)}`}>
              {snapshot.ml.label}
            </span>
          </div>
          <SentimentGauge sentiment={snapshot.ml.label} confidence={mlConfidence} />
          {snapshot.ml.probabilities && (
            <div className="space-y-1.5 border-t border-white/10 pt-3">
              <div className="text-xs text-slate-500 font-medium">Softmax head</div>
              {["Negative", "Neutral", "Positive"].map((k) => (
                <div key={k} className="flex items-center gap-2 text-xs">
                  <span className="w-16 text-slate-500">{k}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-violet-400/80 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (snapshot.ml.probabilities[k] ?? 0) * 100)}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono text-slate-300 tabular-nums">
                    {((snapshot.ml.probabilities[k] ?? 0) * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          )}
          {mlAspect?.opinion && (
            <p className="text-xs text-slate-400 leading-relaxed border-t border-white/10 pt-3 line-clamp-3">
              Span: {mlAspect.opinion}
            </p>
          )}
        </motion.div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-400 py-1">
        <span className="font-medium text-slate-300">{snapshot.rule.label}</span>
        <span className="text-slate-600">|</span>
        <span className="font-medium text-slate-300">{snapshot.ml.label}</span>
        {!snapshot.aligned && (
          <span className="ml-2 text-xs rounded-md bg-amber-500/10 text-amber-200/90 px-2 py-0.5 ring-1 ring-amber-500/25">
            Δ label
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={brief.status}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className={`rounded-2xl p-4 ring-1 ${
            brief.badgeTone === "success"
              ? "bg-emerald-950/25 ring-emerald-500/25"
              : "bg-amber-950/20 ring-amber-500/30"
          }`}
        >
          <div className="text-sm font-semibold text-slate-100 mb-1">{brief.title}</div>
          <p className="text-sm text-slate-300 mb-3">{brief.summary}</p>
          {brief.factors.length > 0 && (
            <ul className="space-y-3">
              {brief.factors.map((f) => (
                <li key={f.code} className="text-xs text-slate-400 leading-relaxed border-l-2 border-cyan-500/40 pl-3">
                  <span className="text-slate-200 font-medium">{f.title}.</span> {f.detail}
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
