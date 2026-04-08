import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { countSentiments } from "../services/api";

const COLORS = {
  Positive: "#16a34a",
  Negative: "#dc2626",
  Neutral: "#eab308",
};

export default function AnalyticsPanel({ aspects = [], mode = "pie" }) {
  const pieData = useMemo(() => {
    const c = countSentiments(aspects);
    return [
      { name: "Positive", value: c.Positive },
      { name: "Negative", value: c.Negative },
      { name: "Neutral", value: c.Neutral },
    ];
  }, [aspects]);

  const barData = useMemo(() => {
    const c = countSentiments(aspects);
    return [
      { name: "Positive", count: c.Positive },
      { name: "Negative", count: c.Negative },
      { name: "Neutral", count: c.Neutral },
    ];
  }, [aspects]);

  const total = pieData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 mb-4"
      >
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">
          {mode === "pie" ? "Sentiment Distribution" : "Sentiment Breakdown"}
        </h3>
      </motion.div>

      {total === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-slate-500 text-center py-12"
        >
          Run an analysis to populate charts.
        </motion.div>
      ) : mode === "pie" ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="h-64"
        >
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-out"
                label={(d) => `${d.name} (${d.value})`}
              >
                {pieData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[entry.name]}
                    stroke="transparent"
                    style={{ filter: "drop-shadow(0 0 8px rgba(0,0,0,0.3))" }}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  borderRadius: "0.75rem",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                }}
                itemStyle={{ color: "#e2e8f0" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="h-64"
        >
          <ResponsiveContainer>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  borderRadius: "0.75rem",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                }}
                itemStyle={{ color: "#e2e8f0" }}
              />
              <Bar
                dataKey="count"
                radius={[8, 8, 0, 0]}
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {barData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[entry.name]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}
