import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

function labelFor(v) {
  if (v > 0) return "Positive";
  if (v < 0) return "Negative";
  return "Neutral";
}

export default function SentimentTimeline({ history = [] }) {
  const data = useMemo(() => {
    return history
      .slice()
      .reverse()
      .map((h, idx) => ({
        t: new Date(h.ts || Date.now() - idx * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        v: h.sentiment === "Positive" ? 1 : h.sentiment === "Negative" ? -1 : 0,
        label: h.sentiment || "Neutral",
      }));
  }, [history]);

  if (!data.length) return null;

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 mb-4"
      >
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">Sentiment Timeline</h3>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="h-64"
      >
        <ResponsiveContainer>
          <LineChart data={data}>
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis
              dataKey="t"
              stroke="#94a3b8"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            />
            <YAxis
              stroke="#94a3b8"
              ticks={[-1, 0, 1]}
              tickFormatter={labelFor}
              domain={[-1, 1]}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            />
            <Tooltip
              formatter={(val) => labelFor(val)}
              labelStyle={{ color: "#e2e8f0" }}
              contentStyle={{
                background: "rgba(15, 23, 42, 0.95)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                borderRadius: "0.75rem",
                boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
              }}
            />
            <Line
              type="monotone"
              dataKey="v"
              stroke="url(#lineGradient)"
              strokeWidth={3}
              dot={{
                r: 5,
                stroke: "#22d3ee",
                strokeWidth: 2,
                fill: "#0e7490",
              }}
              activeDot={{
                r: 7,
                stroke: "#22d3ee",
                strokeWidth: 3,
                fill: "#06b6d4",
              }}
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
