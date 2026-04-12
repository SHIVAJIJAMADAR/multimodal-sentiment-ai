import React from "react";
import { motion, AnimatePresence } from "framer-motion";

function KeywordHighlight({ segments }) {
  if (!segments || segments.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">Text Keywords</div>
      <div className="flex flex-wrap gap-2">
        {segments
          .filter((s) => s.polarity !== "neutral")
          .map((seg, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
                seg.polarity === "positive"
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${seg.polarity === "positive" ? "bg-emerald-400" : "bg-rose-400"}`} />
              {seg.text}
              <span className="text-xs opacity-70 font-mono">
                {seg.score >= 0 ? "+" : ""}{seg.score.toFixed(2)}
              </span>
            </motion.span>
          ))}
      </div>
    </div>
  );
}

function ConfidenceMeter({ confidence, label }) {
  const percent = confidence != null ? Math.min(100, Math.max(0, confidence * 100)) : 0;
  
  const getColor = () => {
    if (percent >= 70) return { bar: "bg-gradient-to-r from-emerald-500 to-teal-400", text: "text-emerald-400" };
    if (percent >= 40) return { bar: "bg-gradient-to-r from-amber-500 to-yellow-400", text: "text-amber-400" };
    return { bar: "bg-gradient-to-r from-rose-500 to-red-400", text: "text-rose-400" };
  };

  const colors = getColor();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium">{label || "Confidence"}</span>
        <span className={`font-bold tabular-nums ${colors.text}`}>{percent.toFixed(1)}%</span>
      </div>
      <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={`h-full rounded-full ${colors.bar}`}
        />
      </div>
    </div>
  );
}

function ProbBars({ probs }) {
  if (!probs) return null;
  const order = ["Negative", "Neutral", "Positive"];
  const colors = {
    Negative: "from-rose-500 to-red-400",
    Neutral: "from-amber-500 to-yellow-400",
    Positive: "from-emerald-500 to-teal-400",
  };

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">Class Probabilities</div>
      {order.map((k) => (
        <div key={k}>
          <div className="flex justify-between text-xs text-slate-400">
            <span>{k}</span>
            <span className="tabular-nums">{((probs[k] ?? 0) * 100).toFixed(1)}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (probs[k] ?? 0) * 100)}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`h-full bg-gradient-to-r ${colors[k]} rounded-full`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ImageExplanation({ note }) {
  if (!note) return null;

  const isPositive = note.toLowerCase().includes("positive") && !note.toLowerCase().includes("not positive");
  const isNegative = note.toLowerCase().includes("negative") && !note.toLowerCase().includes("not negative");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-4 ${
        isPositive
          ? "bg-emerald-500/10 border border-emerald-500/20"
          : isNegative
          ? "bg-rose-500/10 border border-rose-500/20"
          : "bg-slate-800/50 border border-slate-700/50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          isPositive
            ? "bg-emerald-500/20"
            : isNegative
            ? "bg-rose-500/20"
            : "bg-slate-700"
        }`}>
          <svg className={`w-5 h-5 ${
            isPositive
              ? "text-emerald-400"
              : isNegative
              ? "text-rose-400"
              : "text-slate-400"
          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Image Analysis</div>
          <p className="text-sm text-slate-300 leading-relaxed">{note}</p>
        </div>
      </div>
    </motion.div>
  );
}

function SaliencyTable({ saliency }) {
  if (!saliency || saliency.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">
        Word Saliency (Occlusion-based)
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-700/50">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-800/50 text-left text-slate-500 border-b border-slate-700/50">
              <th className="py-2 px-3 font-medium">Token</th>
              <th className="py-2 px-3 font-medium text-right">Impact</th>
            </tr>
          </thead>
          <tbody>
            {saliency.slice(0, 8).map((row, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors"
              >
                <td className="py-2 px-3 text-slate-200 font-medium">{row.word}</td>
                <td className={`py-2 px-3 font-mono tabular-nums text-right ${
                  row.delta >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}>
                  {row.delta >= 0 ? "+" : ""}{row.delta.toFixed(4)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FusionNote({ note }) {
  if (!note) return null;

  return (
    <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-800/30 rounded-lg p-3">
      <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="leading-relaxed">{note}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-8 px-4 text-center rounded-xl border border-dashed border-slate-700/50 bg-slate-800/20"
    >
      <div className="w-14 h-14 rounded-xl bg-slate-800/80 flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <p className="text-sm text-slate-500 mb-1">No explanation available</p>
      <p className="text-xs text-slate-600">Enable "Explain Predictions" and run analysis</p>
    </motion.div>
  );
}

export default function ExplainabilityPanel({ explanation }) {
  if (!explanation) {
    return <EmptyState />;
  }

  const isMl = explanation.pipeline === "ml";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-6 space-y-5 rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-5 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-white">Explanation</span>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
          isMl
            ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
            : "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
        }`}>
          {isMl ? "AI Pipeline" : "Rule-Based"}
        </span>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed">{explanation.summary}</p>

      <KeywordHighlight segments={explanation.segments} />

      {explanation.document_vader_compound != null && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <div className="text-xs text-slate-500 font-medium">VADER Score:</div>
          <div className={`text-sm font-bold font-mono ${
            explanation.document_vader_compound > 0 ? "text-emerald-400" :
            explanation.document_vader_compound < 0 ? "text-rose-400" : "text-slate-400"
          }`}>
            {explanation.document_vader_compound >= 0 ? "+" : ""}{explanation.document_vader_compound.toFixed(3)}
          </div>
        </div>
      )}

      <ImageExplanation note={explanation.image_note} />

      <AnimatePresence mode="wait">
        {isMl && explanation.class_probabilities && (
          <motion.div
            key="probs"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ProbBars probs={explanation.class_probabilities} />
            {explanation.confidence != null && (
              <div className="mt-4">
                <ConfidenceMeter confidence={explanation.confidence} label="Prediction Confidence" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <SaliencyTable saliency={explanation.top_word_saliency} />

      <FusionNote note={explanation.fusion_note} />
    </motion.div>
  );
}
