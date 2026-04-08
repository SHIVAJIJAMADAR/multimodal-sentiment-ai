import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const features = [
  { title: "Rule-Based Engine", desc: "spaCy + VADER + OpenCV deterministic pipeline." },
  { title: "AI Model", desc: "BERT text encoder + ResNet18 image encoder + fusion." },
  { title: "Comparison Mode", desc: "Call both engines and compare side-by-side." },
  { title: "Batch Testing", desc: "Paste multiple reviews and export results." },
  { title: "Charts", desc: "Distribution and bar charts for quick insight." },
];

export default function Features() {
  return (
    <div className="container-centered py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card p-6 hover:border-cyan-500/30 transition-colors"
          >
            <div className="text-lg font-semibold text-white">{f.title}</div>
            <div className="text-slate-300 mt-2">{f.desc}</div>
          </motion.div>
        ))}
      </div>
      <div className="text-center mt-8">
        <Link
          to="/demo"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 font-semibold hover:shadow-lg hover:shadow-cyan-500/20 transition"
        >
          View Demo
        </Link>
      </div>
    </div>
  );
}
