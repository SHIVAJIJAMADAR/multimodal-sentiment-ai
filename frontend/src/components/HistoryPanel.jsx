import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const sentimentColors = {
  Positive: "text-emerald-400",
  Negative: "text-rose-400",
  Neutral: "text-amber-400",
};

export default function HistoryPanel({ history = [] }) {
  if (!history.length) return null;

  return (
    <div className="card p-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 mb-4"
      >
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">Recent History</h3>
      </motion.div>

      <motion.div className="space-y-2">
        <AnimatePresence>
          {history.map((h, i) => (
            <motion.div
              key={`${h.ts}-${i}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              whileHover={{ scale: 1.01, backgroundColor: "rgba(51, 65, 85, 0.5)" }}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors cursor-default"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05, type: "spring", stiffness: 500 }}
                className={`mt-1 h-2 w-2 rounded-full ${
                  h.sentiment === "Positive"
                    ? "bg-emerald-400"
                    : h.sentiment === "Negative"
                    ? "bg-rose-400"
                    : "bg-amber-400"
                }`}
              />
              <div className="flex-1 min-w-0">
                <span className="font-medium text-slate-200">&quot;{truncate(h.text)}&quot;</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-sm font-medium ${sentimentColors[h.sentiment] || "text-slate-400"}`}>
                    {h.sentiment}
                  </span>
                  {h.confidence !== undefined && h.confidence !== null && (
                    <span className="text-xs text-slate-500">
                      ({h.confidence > 0 ? "+" : ""}
                      {h.confidence.toFixed(2)})
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function truncate(s, max = 60) {
  if (!s) return "";
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}
