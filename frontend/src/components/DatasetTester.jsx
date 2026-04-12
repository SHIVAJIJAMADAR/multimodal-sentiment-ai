import React, { useState } from "react";
import { analyzeBatch, exportCSV } from "../services/api";

const sentimentConfig = {
  Positive: { color: "emerald", bg: "bg-emerald-500/15", border: "border-emerald-500/30", text: "text-emerald-400" },
  Negative: { color: "rose", bg: "bg-rose-500/15", border: "border-rose-500/30", text: "text-rose-400" },
  Neutral: { color: "amber", bg: "bg-amber-500/15", border: "border-amber-500/30", text: "text-amber-400" },
  Error: { color: "slate", bg: "bg-slate-500/15", border: "border-slate-500/30", text: "text-slate-400" }
};

function SentimentBadge({ sentiment }) {
  const config = sentimentConfig[sentiment] || sentimentConfig.Neutral;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.border} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current`} />
      {sentiment}
    </span>
  );
}

export default function DatasetTester({ model = "rule" }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);

  async function run() {
    const lines = text
      .split("\n")
      .map((s) => s.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean);
    if (!lines.length) {
      setError("Paste multiple reviews, one per line.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { results, summary } = await analyzeBatch({ lines, model });
      setSummary(summary);
      setRows(results);
    } catch (e) {
      setError(e?.message || "Failed to run batch.");
    } finally {
      setLoading(false);
    }
  }

  function handleExportCSV() {
    const csvRows = rows.map((r) => ({
      Review: r.text,
      Sentiment: r.sentiment,
      Confidence: r.confidence != null ? `${r.confidence.toFixed(2)}%` : "N/A"
    }));
    exportCSV("batch_results.csv", csvRows);
  }

  const total = summary ? summary.Positive + summary.Negative + summary.Neutral : 0;
  const avgConfidence = rows.length
    ? (rows.reduce((sum, r) => sum + Math.abs(r.confidence || 0), 0) / rows.length).toFixed(2)
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <div className="text-lg font-semibold text-white">Batch Review Testing</div>
            <div className="text-xs text-slate-400">Analyze multiple reviews at once</div>
          </div>
        </div>
        <div className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          Model: {model === "ml" ? "AI Model" : "Rule-Based"}
        </div>
      </div>

      <textarea
        className="w-full rounded-xl border border-slate-700 bg-slate-900/50 text-slate-200 placeholder:text-slate-500 p-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition resize-none"
        rows={5}
        placeholder="Paste reviews here, one per line:&#10;Chair is amazing and very comfortable&#10;Table arrived broken&#10;The sofa looks great but is uncomfortable"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="flex items-center gap-3">
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-5 py-2.5 font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={run}
          disabled={loading}
          type="button"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Run Analysis
            </>
          )}
        </button>
        {rows.length > 0 && (
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 text-sm font-medium border border-slate-700 transition"
            onClick={handleExportCSV}
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
            <div className="text-2xl font-bold text-white">{total}</div>
            <div className="text-xs text-slate-400 mt-1">Total Reviews</div>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="text-2xl font-bold text-emerald-400">{summary.Positive}</div>
            <div className="text-xs text-slate-400 mt-1">
              Positive ({total ? Math.round((summary.Positive / total) * 100) : 0}%)
            </div>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="text-2xl font-bold text-amber-400">{summary.Neutral}</div>
            <div className="text-xs text-slate-400 mt-1">
              Neutral ({total ? Math.round((summary.Neutral / total) * 100) : 0}%)
            </div>
          </div>
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
            <div className="text-2xl font-bold text-rose-400">{summary.Negative}</div>
            <div className="text-xs text-slate-400 mt-1">
              Negative ({total ? Math.round((summary.Negative / total) * 100) : 0}%)
            </div>
          </div>
        </div>
      )}

      {rows.length > 0 && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/30 overflow-hidden">
          <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
            <div className="text-sm font-medium text-white">Results ({rows.length})</div>
            <div className="text-xs text-slate-400">Avg. Confidence: {avgConfidence}%</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 text-xs border-b border-slate-700/50">
                  <th className="px-4 py-3 font-medium">Review</th>
                  <th className="px-4 py-3 font-medium w-32">Sentiment</th>
                  <th className="px-4 py-3 font-medium w-24 text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {rows.map((r, i) => {
                  const config = sentimentConfig[r.sentiment] || sentimentConfig.Neutral;
                  return (
                    <tr key={i} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3 text-slate-200 max-w-md truncate" title={r.text}>
                        {r.text}
                      </td>
                      <td className="px-4 py-3">
                        <SentimentBadge sentiment={r.sentiment} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {r.confidence !== undefined && r.confidence !== 0 ? (
                          <span className={`font-medium ${config.text}`}>
                            {r.confidence.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
