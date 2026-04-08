import React, { useState } from "react";
import { motion } from "framer-motion";
import ArchitectureModal from "../ArchitectureModal.jsx";

const STATS = [
  { label: "Text Pipeline", value: "spaCy + VADER", color: "cyan" },
  { label: "Image Pipeline", value: "OpenCV HSV", color: "blue" },
  { label: "Fusion Engine", value: "Weighted Decision", color: "purple" }
];

export function SystemOverview({ variants }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div variants={variants}>
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">System Overview</h2>
              <p className="text-sm text-slate-400">Complete pipeline architecture</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-5 py-2.5 font-medium shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all"
            onClick={() => setOpen(true)}
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Architecture Diagram
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STATS.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>

      <ArchitectureModal open={open} onClose={() => setOpen(false)} />
    </motion.div>
  );
}

function StatCard({ label, value, color }) {
  const colorMap = {
    cyan: "border-cyan-500/30 bg-cyan-500/5",
    blue: "border-blue-500/30 bg-blue-500/5",
    purple: "border-purple-500/30 bg-purple-500/5"
  };
  
  const valueColorMap = {
    cyan: "text-cyan-400",
    blue: "text-blue-400",
    purple: "text-purple-400"
  };
  
  return (
    <div className={`rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border ${colorMap[color]} p-4`}>
      <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-sm font-medium ${valueColorMap[color]}`}>{value}</div>
    </div>
  );
}
