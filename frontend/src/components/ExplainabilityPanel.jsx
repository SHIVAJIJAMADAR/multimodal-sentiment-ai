import React from "react";

function ProbBars({ probs }) {
  if (!probs) return null;
  const order = ["Negative", "Neutral", "Positive"];
  const colors = {
    Negative: "bg-rose-500",
    Neutral: "bg-amber-400",
    Positive: "bg-emerald-500",
  };
  return (
    <div className="space-y-2">
      {order.map((k) => (
        <div key={k}>
          <div className="flex justify-between text-xs text-slate-400">
            <span>{k}</span>
            <span className="tabular-nums">{((probs[k] ?? 0) * 100).toFixed(1)}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full ${colors[k]} transition-all duration-500`}
              style={{ width: `${Math.min(100, (probs[k] ?? 0) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ExplainabilityPanel({ explanation }) {
  if (!explanation) {
    return (
      <div className="mt-4 rounded-lg border border-white/10 bg-slate-900/40 p-4 text-sm text-slate-500">
        Enable “Explain predictions” and run analysis to see confidence, lexicon highlights, and saliency.
      </div>
    );
  }

  const isMl = explanation.pipeline === "ml";

  return (
    <div className="mt-4 space-y-4 rounded-xl border border-cyan-500/20 bg-slate-900/50 p-4 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-cyan-400 font-semibold">Why this prediction?</span>
        <span className="text-xs rounded-full px-2 py-0.5 bg-white/10 text-slate-300">
          {isMl ? "AI pipeline" : "Rule pipeline"}
        </span>
      </div>

      <p className="text-slate-300 leading-relaxed">{explanation.summary}</p>

      {explanation.document_vader_compound != null && (
        <div className="text-xs text-slate-400">
          Whole-review VADER compound:{" "}
          <span className="text-slate-200 font-mono tabular-nums">
            {explanation.document_vader_compound >= 0 ? "+" : ""}
            {explanation.document_vader_compound.toFixed(3)}
          </span>
        </div>
      )}

      {explanation.image_note && (
        <div className="rounded-lg bg-white/5 ring-1 ring-white/10 p-3 text-slate-300 text-xs leading-relaxed">
          <span className="text-slate-500 font-medium uppercase tracking-wide">Image</span>
          <div className="mt-1">{explanation.image_note}</div>
        </div>
      )}

      {explanation.fusion_note && (
        <div className="text-xs text-slate-500 leading-relaxed">{explanation.fusion_note}</div>
      )}

      {isMl && explanation.class_probabilities && (
        <div>
          <div className="text-xs font-medium text-slate-400 mb-2">Class probabilities (softmax)</div>
          <ProbBars probs={explanation.class_probabilities} />
          {explanation.confidence != null && (
            <div className="mt-3 text-xs text-slate-400">
              Argmax confidence:{" "}
              <span className="text-cyan-300 font-mono tabular-nums">
                {(explanation.confidence * 100).toFixed(1)}%
              </span>
              {explanation.confidence_note && (
                <span className="block mt-1 text-slate-500">{explanation.confidence_note}</span>
              )}
            </div>
          )}
        </div>
      )}

      {isMl && explanation.top_word_saliency?.length > 0 && (
        <div>
          <div className="text-xs font-medium text-slate-400 mb-2">
            Word saliency (occlusion — support for predicted class)
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500 border-b border-white/10">
                  <th className="py-1 pr-3">Token</th>
                  <th className="py-1 pr-3">Δ prob (pred class)</th>
                </tr>
              </thead>
              <tbody>
                {explanation.top_word_saliency.map((row, i) => (
                  <tr key={`${row.word}-${i}`} className="border-b border-white/5 last:border-0">
                    <td className="py-1.5 pr-3 text-slate-200 font-medium">{row.word}</td>
                    <td className="py-1.5 pr-3 font-mono tabular-nums text-cyan-300/90">
                      {row.delta >= 0 ? "+" : ""}
                      {row.delta.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
