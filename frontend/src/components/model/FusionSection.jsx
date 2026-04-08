import React from "react";
import { motion } from "framer-motion";

const THRESHOLDS = [
  { label: "Positive", condition: "fused > 0.2", color: "emerald" },
  { label: "Neutral", condition: "-0.2 ≤ fused ≤ 0.2", color: "amber" },
  { label: "Negative", condition: "fused < -0.2", color: "rose" }
];

const WEIGHTS = [
  { label: "Text Weight", value: "70%", color: "cyan" },
  { label: "Image Weight", value: "30%", color: "blue" }
];

export function FusionSection({ variants }) {
  return (
    <motion.div variants={variants}>
      <div className="card p-6">
        <SectionHeader
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
            </svg>
          }
          title="Decision Fusion Engine"
          subtitle="Combining text and image signals"
          color="purple"
        />

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-5">
          <div className="text-center mb-4">
            <div className="text-sm font-mono text-cyan-400 mb-2">Fusion Formula</div>
            <FormulaBlock>fused = 0.7 × text_score + 0.3 × image_score</FormulaBlock>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <WeightCard value="70%" label="Text Weight" color="cyan" />
            <div className="flex items-center justify-center">
              <span className="text-2xl font-bold text-purple-400">+</span>
            </div>
            <WeightCard value="30%" label="Image Weight" color="blue" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium text-slate-300 mb-2">Classification Thresholds</div>
          {THRESHOLDS.map((t) => (
            <ThresholdBar key={t.label} {...t} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function SectionHeader({ icon, title, subtitle, color }) {
  const colorMap = {
    cyan: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400",
    blue: "from-blue-500/20 to-purple-500/20 border-blue-500/30 text-blue-400",
    purple: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400",
    emerald: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400",
  };
  
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center border ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

function FormulaBlock({ children }) {
  return (
    <div className="inline-block bg-slate-900/80 rounded-lg px-6 py-3 border border-slate-700">
      <code className="text-white text-lg">{children}</code>
    </div>
  );
}

function WeightCard({ value, label, color }) {
  const colorMap = {
    cyan: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400"
  };
  
  return (
    <div className={`p-3 rounded-lg border ${colorMap[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}

function ThresholdBar({ label, condition, color }) {
  const colorMap = {
    emerald: "bg-emerald-500/20 border-emerald-500/30 text-emerald-400",
    amber: "bg-amber-500/20 border-amber-500/30 text-amber-400",
    rose: "bg-rose-500/20 border-rose-500/30 text-rose-400"
  };
  
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${colorMap[color]}`}>
      <span className="text-sm font-medium">{label}</span>
      <code className="text-xs opacity-80">{condition}</code>
    </div>
  );
}
