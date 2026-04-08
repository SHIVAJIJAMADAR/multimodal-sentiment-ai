import React from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useMetrics } from "../hooks/useMetrics.js";

function MetricCard({ title, value, subtitle }) {
  return (
    <div className="rounded-xl ring-1 ring-white/10 bg-slate-900/60 p-4">
      <div className="text-xs uppercase tracking-wide text-slate-400">{title}</div>
      <div className="mt-1 text-2xl font-bold text-white tabular-nums">{value}</div>
      {subtitle && <div className="mt-1 text-xs text-slate-500">{subtitle}</div>}
    </div>
  );
}

function SkeletonBlock() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-1/3 rounded bg-slate-700/80" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-slate-700/60" />
        ))}
      </div>
      <div className="h-56 rounded-xl bg-slate-700/50" />
    </div>
  );
}

function ConfusionTable({ matrix, labels, title }) {
  const flat = matrix?.flat?.() || [];
  const maxVal = Math.max(1, ...flat);

  return (
    <div className="rounded-xl ring-1 ring-white/10 bg-slate-900/40 p-3 overflow-x-auto">
      <div className="text-sm font-medium text-slate-200 mb-2">{title}</div>
      <table className="text-xs text-slate-200 min-w-full border-collapse">
        <thead>
          <tr>
            <th className="p-1 text-left text-slate-400">Gold / Pred</th>
            {labels.map((l) => (
              <th key={l} className="p-1 text-center text-slate-400 font-normal">
                {l.slice(0, 4)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {labels.map((rowLab, i) => (
            <tr key={rowLab}>
              <td className="p-1 pr-2 text-slate-400 whitespace-nowrap">{rowLab}</td>
              {labels.map((_, j) => {
                const v = matrix[i]?.[j] ?? 0;
                const intensity = v / maxVal;
                return (
                  <td
                    key={j}
                    className="p-2 text-center font-mono tabular-nums"
                    style={{
                      backgroundColor: `rgba(34, 211, 238, ${0.12 + intensity * 0.45})`,
                    }}
                  >
                    {v}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function fmtPct(x) {
  if (x == null || Number.isNaN(x)) return "—";
  return `${(x * 100).toFixed(1)}%`;
}

export default function ModelPerformancePanel() {
  const { data, loading, error, refresh } = useMetrics();

  const f1Compare =
    data?.rule_based && data?.ai_model
      ? [
          { name: "Rule (macro F1)", f1: data.rule_based.f1_macro },
          { name: "AI (macro F1)", f1: data.ai_model.f1_macro },
        ]
      : data?.rule_based
        ? [{ name: "Rule (macro F1)", f1: data.rule_based.f1_macro }]
        : [];

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-tr from-violet-400 to-cyan-500 text-black font-bold">
            📊
          </span>
          <div>
            <div className="text-lg font-semibold text-white">Model Performance</div>
            <div className="text-sm text-slate-400">
              Offline benchmark vs gold labels — rule engine vs AI (text-only cohort).
            </div>
          </div>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => refresh()}
          className="inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-50 transition px-4 py-2 text-sm font-medium text-slate-100 ring-1 ring-white/15"
        >
          {loading ? "Computing…" : "Refresh metrics"}
        </button>
      </div>

      {loading && !data && <div className="mt-6"><SkeletonBlock /></div>}

      {error && (
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          {error}
        </div>
      )}

      {data && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className={`mt-6 space-y-6 transition-opacity ${loading ? "opacity-70" : "opacity-100"}`}
        >
          <div className="flex flex-wrap gap-2 text-xs text-slate-400">
            <span className="rounded-lg bg-slate-800/80 px-2 py-1 ring-1 ring-white/10">
              Rows: {data.meta.n_benchmark_rows}
            </span>
            <span className="rounded-lg bg-slate-800/80 px-2 py-1 ring-1 ring-white/10">
              Gold-valid: {data.meta.n_valid_gold_rows}
            </span>
            <span className="rounded-lg bg-slate-800/80 px-2 py-1 ring-1 ring-white/10">
              Rule preds: {data.meta.n_rule_predictions}
            </span>
            <span className="rounded-lg bg-slate-800/80 px-2 py-1 ring-1 ring-white/10">
              AI preds: {data.meta.n_ai_predictions}
            </span>
            <span className="rounded-lg bg-slate-800/80 px-2 py-1 ring-1 ring-white/10">
              Paired: {data.meta.n_paired_rows}
            </span>
            {data.meta.cache_hit && (
              <span className="rounded-lg bg-cyan-900/40 px-2 py-1 ring-1 ring-cyan-500/30 text-cyan-200">
                Cached response
              </span>
            )}
            <span className="rounded-lg bg-slate-800/80 px-2 py-1 ring-1 ring-white/10">
              {data.meta.evaluation_ms} ms
            </span>
          </div>

          {data.warnings?.length > 0 && (
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 text-sm text-amber-100/90">
              {data.warnings.map((w, i) => (
                <div key={i}>• {w}</div>
              ))}
            </div>
          )}

          <div>
            <div className="text-sm font-medium text-slate-300 mb-2">Rule-based engine</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricCard title="Accuracy" value={fmtPct(data.rule_based.accuracy)} />
              <MetricCard title="Precision (macro)" value={fmtPct(data.rule_based.precision_macro)} />
              <MetricCard title="Recall (macro)" value={fmtPct(data.rule_based.recall_macro)} />
              <MetricCard title="F1 (macro)" value={fmtPct(data.rule_based.f1_macro)} />
            </div>
          </div>

          {data.ai_model && (
            <div>
              <div className="text-sm font-medium text-slate-300 mb-2">AI model</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard title="Accuracy" value={fmtPct(data.ai_model.accuracy)} />
                <MetricCard title="Precision (macro)" value={fmtPct(data.ai_model.precision_macro)} />
                <MetricCard title="Recall (macro)" value={fmtPct(data.ai_model.recall_macro)} />
                <MetricCard title="F1 (macro)" value={fmtPct(data.ai_model.f1_macro)} />
              </div>
            </div>
          )}

          {f1Compare.length > 0 && (
            <div>
              <div className="text-sm font-medium text-slate-300 mb-2">Macro F1 comparison</div>
              <div className="h-56">
                <ResponsiveContainer>
                  <BarChart data={f1Compare} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 1]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.12)" }}
                      formatter={(v) => [fmtPct(v), "F1"]}
                    />
                    <Legend />
                    <Bar dataKey="f1" name="Macro F1" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {data.comparison && (
            <div className="rounded-xl ring-1 ring-white/10 bg-slate-900/50 p-4">
              <div className="text-sm font-semibold text-white mb-3">Rule vs AI (paired rows)</div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                <MetricCard
                  title="Agreement"
                  value={fmtPct(data.comparison.inter_model_agreement)}
                  subtitle="same predicted label"
                />
                <MetricCard title="Both correct" value={String(data.comparison.both_correct)} />
                <MetricCard title="Rule only" value={String(data.comparison.rule_only_correct)} />
                <MetricCard title="AI only" value={String(data.comparison.ai_only_correct)} />
                <MetricCard title="Both wrong" value={String(data.comparison.both_wrong)} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ConfusionTable
              matrix={data.rule_based.confusion_matrix}
              labels={data.rule_based.labels}
              title="Rule — confusion matrix (rows = gold)"
            />
            {data.ai_model ? (
              <ConfusionTable
                matrix={data.ai_model.confusion_matrix}
                labels={data.ai_model.labels}
                title="AI — confusion matrix (rows = gold)"
              />
            ) : (
              <div className="rounded-xl ring-1 ring-white/10 bg-slate-900/30 p-6 text-sm text-slate-500 flex items-center justify-center">
                AI metrics unavailable (model errors or missing weights).
              </div>
            )}
          </div>

          <div className="text-xs text-slate-500 break-all">
            Dataset: {data.meta.dataset_path}
          </div>
        </motion.div>
      )}
    </div>
  );
}
