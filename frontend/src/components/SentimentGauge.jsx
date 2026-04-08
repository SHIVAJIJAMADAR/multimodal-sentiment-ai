import React, { useMemo, useId } from "react";
import { motion } from "framer-motion";
import GaugeChart from "react-gauge-chart";

export default function SentimentGauge({ sentiment = "Neutral", confidence = null }) {
  const uid = useId().replace(/:/g, "");
  const value = useMemo(() => {
    if (sentiment === "Positive") return 0.85;
    if (sentiment === "Negative") return 0.15;
    return 0.5;
  }, [sentiment]);

  const pct = confidence != null ? Math.round(confidence * 100) : null;

  const gaugeColors = useMemo(() => {
    if (sentiment === "Positive") return ["#eab308", "#eab308", "#16a34a"];
    if (sentiment === "Negative") return ["#dc2626", "#eab308", "#eab308"];
    return ["#dc2626", "#eab308", "#16a34a"];
  }, [sentiment]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="p-2"
    >
      <motion.div
        animate={{
          scale: [1, 1.02, 1],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="flex items-center justify-center"
      >
        <div className="w-full max-w-xl">
          <GaugeChart
            id={`sentiment-gauge-${uid}`}
            nrOfLevels={24}
            colors={gaugeColors}
            arcWidth={0.18}
            percent={value}
            animate={true}
            needleColor="#e5e7eb"
            hideText={true}
            style={{ width: "100%" }}
          />
        </div>
      </motion.div>
      {pct != null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <div className="text-sm font-medium mb-2 text-center text-slate-300">Confidence</div>
          <div className="w-full max-w-md mx-auto bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
              className={`h-full rounded-full ${
                sentiment === "Positive"
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                  : sentiment === "Negative"
                  ? "bg-gradient-to-r from-rose-500 to-rose-400"
                  : "bg-gradient-to-r from-amber-500 to-amber-400"
              }`}
            />
          </div>
          <div className="text-center mt-1 text-sm font-mono text-slate-400">{pct}%</div>
        </motion.div>
      )}
    </motion.div>
  );
}
