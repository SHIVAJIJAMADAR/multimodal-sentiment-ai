import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function ModelOverviewCard({ title, subtitle, icon, description, gradient, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.03, y: -4 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/80 border border-slate-700/50 p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/5"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />
      <div className="relative z-10">
        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
        <p className="text-xs font-medium text-slate-400 mb-3">{subtitle}</p>
        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const pageVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export default function Model() {
  const [activePipeline, setActivePipeline] = useState("compare");

  const modelOverviewCards = [
    {
      title: "Text Encoder",
      subtitle: "BERT-based",
      gradient: "from-cyan-500 to-blue-600",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      description: "Bidirectional encoder transforms text into 768-dimensional embeddings using transformer architecture.",
    },
    {
      title: "Image Encoder",
      subtitle: "ResNet18",
      gradient: "from-blue-500 to-purple-600",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      description: "Convolutional neural network extracts 512-dimensional visual features from input images.",
    },
    {
      title: "Fusion Layer",
      subtitle: "MLP + Softmax",
      gradient: "from-purple-500 to-pink-600",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>
      ),
      description: "Combines text and image features through concatenation and multi-layer perceptron for unified representation.",
    },
    {
      title: "Output Layer",
      subtitle: "3-class classification",
      gradient: "from-emerald-500 to-teal-600",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: "Softmax activation produces probability distributions over Positive, Neutral, and Negative classes.",
    },
  ];

  return (
    <div className="container-centered py-10">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-8"
      >
        <motion.div variants={itemVariants} className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              AI Model Overview
            </span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            LiveLib uses a multimodal deep learning architecture combining BERT for text analysis and ResNet18 for image understanding, fused through a neural network for comprehensive sentiment analysis.
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modelOverviewCards.map((card, index) => (
              <ModelOverviewCard key={card.title} {...card} delay={index * 0.1} />
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex justify-center">
          <PipelineToggle
            active={activePipeline}
            onChange={setActivePipeline}
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {activePipeline === "compare" && (
            <motion.div
              key="compare"
              variants={pageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <ComparisonView />
            </motion.div>
          )}
          {activePipeline === "rule" && (
            <motion.div
              key="rule-pipeline"
              variants={pageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <RulePipeline />
            </motion.div>
          )}
          {activePipeline === "ai" && (
            <motion.div
              key="ai-pipeline"
              variants={pageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <AIPipeline />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function PipelineToggle({ active, onChange }) {
  return (
    <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl bg-slate-800/80 border border-slate-700">
      <button
        onClick={() => onChange("compare")}
        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
          active === "compare"
            ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
            : "text-slate-400 hover:text-white"
        }`}
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Compare
        </span>
      </button>
      <button
        onClick={() => onChange("rule")}
        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
          active === "rule"
            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
            : "text-slate-400 hover:text-white"
        }`}
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Rule-Based
        </span>
      </button>
      <button
        onClick={() => onChange("ai")}
        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
          active === "ai"
            ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/25"
            : "text-slate-400 hover:text-white"
        }`}
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          AI Pipeline
        </span>
      </button>
    </div>
  );
}

function ComparisonView() {
  const comparisonData = [
    { feature: "Text Model", rule: "spaCy + VADER", ai: "BERT (768d)" },
    { feature: "Image Model", rule: "OpenCV HSV", ai: "ResNet18 (512d)" },
    { feature: "Fusion Method", rule: "Weighted Sum (0.7/0.3)", ai: "MLP (1280→256→3)" },
    { feature: "Hardware", rule: "CPU only", ai: "GPU Recommended" },
    { feature: "Speed", rule: "~50ms", ai: "~200ms" },
    { feature: "Accuracy", rule: "~75%", ai: "~85%" },
    { feature: "Deterministic", rule: "Yes", ai: "No (probabilistic)" },
    { feature: "Training Data", rule: "None", ai: "Required" },
    { feature: "Aspect Extraction", rule: "Pattern-based", ai: "Learned" },
    { feature: "Best For", rule: "Simple, fast reviews", ai: "Complex, nuanced text" },
  ];

  return (
    <>
      <motion.div variants={itemVariants} className="card p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Side-by-Side Comparison
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Feature</th>
                <th className="text-center py-3 px-4 text-cyan-400 font-medium text-sm">Rule-Based</th>
                <th className="text-center py-3 px-4 text-purple-400 font-medium text-sm">AI Pipeline</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, i) => (
                <motion.tr 
                  key={row.feature}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3 px-4 text-slate-300 text-sm">{row.feature}</td>
                  <td className="py-3 px-4 text-center text-cyan-300 text-sm">{row.rule}</td>
                  <td className="py-3 px-4 text-center text-purple-300 text-sm">{row.ai}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="card p-6">
        <div className="flex items-center justify-between gap-3 mb-5">
          <h3 className="text-lg font-semibold text-white">Performance Snapshot</h3>
          <span className="inline-flex items-center rounded-full bg-purple-500/15 text-purple-200 border border-purple-500/30 px-3 py-1 text-xs font-semibold">
            AI performs better on complex text
          </span>
        </div>
        <div className="space-y-4">
          {[
            { label: "Complex text accuracy", rule: 71, ai: 86 },
            { label: "Nuance handling", rule: 64, ai: 84 },
            { label: "Inference speed", rule: 95, ai: 68 },
          ].map((row, idx) => (
            <div key={row.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{row.label}</span>
                <span className="text-slate-500">Rule {row.rule}% / AI {row.ai}%</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${row.rule}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: idx * 0.1 }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                  />
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${row.ai}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: idx * 0.1 + 0.05 }}
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-600"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 border-cyan-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Rule-Based Benefits</h3>
          </div>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span>No training required — works out of the box</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span>Runs on any CPU — no GPU needed</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span>Fully deterministic — same input, same output</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span>Interpretable — every decision traceable</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span>Fast inference (~50ms per review)</span>
            </li>
          </ul>
        </div>

        <div className="card p-6 border-purple-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">AI Pipeline Benefits</h3>
          </div>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">•</span>
              <span>Higher accuracy on complex language</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">•</span>
              <span>Better handles sarcasm and nuance</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">•</span>
              <span>Learns subtle patterns from data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">•</span>
              <span>Continuously improvable with more data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">•</span>
              <span>Cross-lingual potential with multilingual models</span>
            </li>
          </ul>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="card p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80">
        <h3 className="text-lg font-semibold text-white mb-4 text-center">When to Use Which</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
            <div className="text-cyan-400 font-medium mb-2">Choose Rule-Based when:</div>
            <ul className="text-sm text-slate-400 space-y-1">
              <li>→ You need fast, simple deployment</li>
              <li>→ Hardware resources are limited</li>
              <li>→ You need explainable decisions</li>
              <li>→ Reviews are straightforward (hotels, restaurants)</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
            <div className="text-purple-400 font-medium mb-2">Choose AI Pipeline when:</div>
            <ul className="text-sm text-slate-400 space-y-1">
              <li>→ Accuracy is critical</li>
              <li>→ Text has complex language patterns</li>
              <li>→ GPU resources are available</li>
              <li>→ You have labeled training data</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function RulePipeline() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Text Processing</h3>
              <p className="text-xs text-slate-400">spaCy + VADER</p>
            </div>
          </div>
          <div className="space-y-3">
            <StepItem number={1} title="Dependency Parsing" description="Extract grammatical relationships" color="cyan" />
            <StepItem number={2} title="Aspect Extraction" description="Find noun-adjective pairs (amod)" color="cyan" />
            <StepItem number={3} title="Sentiment Scoring" description="VADER compound polarity" color="cyan" />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Image Processing</h3>
              <p className="text-xs text-slate-400">OpenCV HSV Heuristics</p>
            </div>
          </div>
          <div className="space-y-3">
            <StepItem number={1} title="Preprocessing" description="Resize to 512px, convert to HSV" color="blue" />
            <StepItem number={2} title="Color Analysis" description="Brightness & saturation" color="blue" />
            <StepItem number={3} title="Edge Density" description="Canny edge detection" color="blue" />
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Fusion Engine</h3>
            <p className="text-xs text-slate-400">Weighted Decision</p>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div className="text-center mb-4">
            <div className="text-sm font-medium text-cyan-400 mb-2">Fusion Formula</div>
            <code className="text-white text-lg font-mono bg-slate-900/50 px-4 py-2 rounded-lg inline-block">
              fused = 0.7 × text + 0.3 × image
            </code>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <div className="text-2xl font-bold text-cyan-400">70%</div>
              <div className="text-xs text-slate-400">Text Weight</div>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="text-2xl font-bold text-purple-400">+</div>
              <div className="text-xs text-slate-400">Fusion</div>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-400">30%</div>
              <div className="text-xs text-slate-400">Image Weight</div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <ThresholdPill label="Positive" threshold="fused &gt; 0.2" color="emerald" />
          <ThresholdPill label="Neutral" threshold="-0.2 ≤ fused ≤ 0.2" color="amber" />
          <ThresholdPill label="Negative" threshold="fused &lt; -0.2" color="rose" />
        </div>
      </motion.div>
    </>
  );
}

function AIPipeline() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Text Encoder</h3>
              <p className="text-xs text-slate-400">BERT-based</p>
            </div>
          </div>
          <div className="space-y-3">
            <StepItem number={1} title="Tokenization" description="BERT tokenizer (128 max)" color="cyan" />
            <StepItem number={2} title="Encoding" description="Bidirectional transformer" color="cyan" />
            <StepItem number={3} title="CLS Token" description="768-dim embedding" color="cyan" />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Image Encoder</h3>
              <p className="text-xs text-slate-400">ResNet18</p>
            </div>
          </div>
          <div className="space-y-3">
            <StepItem number={1} title="Preprocessing" description="Resize to 224x224, normalize" color="blue" />
            <StepItem number={2} title="Conv Layers" description="ResNet architecture" color="blue" />
            <StepItem number={3} title="Pooling" description="512-dim feature vector" color="blue" />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Fusion Layer</h3>
              <p className="text-xs text-slate-400">MLP + Softmax</p>
            </div>
          </div>
          <div className="space-y-3">
            <StepItem number={1} title="Concatenate" description="1280-dim vector (768+512)" color="purple" />
            <StepItem number={2} title="MLP Head" description="256 hidden, ReLU, Dropout" color="purple" />
            <StepItem number={3} title="Output" description="3-class softmax" color="purple" />
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Architecture Flow</h3>
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <FlowBox label="Text" sublabel="Review" color="slate" />
            <Arrow />
            <FlowBox label="BERT" sublabel="768d" color="cyan" />
            <Arrow />
            <div className="px-3 py-2 rounded-lg bg-slate-700/50 text-slate-400 text-sm">+</div>
            <FlowBox label="Image" sublabel="224x224" color="slate" />
            <Arrow />
            <FlowBox label="ResNet" sublabel="512d" color="blue" />
            <Arrow />
            <FlowBox label="Concat" sublabel="1280d" color="purple" />
            <Arrow />
            <FlowBox label="MLP" sublabel="256" color="purple" />
            <Arrow />
            <FlowBox label="Softmax" sublabel="3 classes" color="emerald" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <OutputCard label="Positive" score="~85%" color="emerald" />
          <OutputCard label="Neutral" score="~80%" color="amber" />
          <OutputCard label="Negative" score="~83%" color="rose" />
        </div>
      </motion.div>
    </>
  );
}

function StepItem({ number, title, description, color }) {
  const colorMap = {
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  };

  return (
    <div className="flex items-start gap-3">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${colorMap[color]}`}>
        {number}
      </div>
      <div>
        <div className="text-sm font-medium text-white">{title}</div>
        <div className="text-xs text-slate-500">{description}</div>
      </div>
    </div>
  );
}

function ThresholdPill({ label, threshold, color }) {
  const colorMap = {
    emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    amber: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    rose: "bg-rose-500/10 border-rose-500/30 text-rose-400",
  };

  return (
    <div className={`rounded-lg border p-3 text-center ${colorMap[color]}`}>
      <div className="text-sm font-semibold">{label}</div>
      <code className="text-xs opacity-70">{threshold}</code>
    </div>
  );
}

function OutputCard({ label, score, color }) {
  const colorMap = {
    emerald: "bg-emerald-500/10 border-emerald-500/30",
    amber: "bg-amber-500/10 border-amber-500/30",
    rose: "bg-rose-500/10 border-rose-500/30",
  };

  return (
    <div className={`rounded-lg border p-4 text-center ${colorMap[color]}`}>
      <div className="text-lg font-bold">{label}</div>
      <div className="text-sm opacity-70">Accuracy: {score}</div>
    </div>
  );
}

function FlowBox({ label, sublabel, color }) {
  const colorMap = {
    slate: "bg-slate-700/50 border-slate-600 text-slate-300",
    cyan: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300",
    blue: "bg-blue-500/10 border-blue-500/30 text-blue-300",
    purple: "bg-purple-500/10 border-purple-500/30 text-purple-300",
    emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
  };

  return (
    <div className={`px-3 py-2 rounded-lg border text-center min-w-[80px] ${colorMap[color]}`}>
      <div className="text-xs font-medium">{label}</div>
      {sublabel && <div className="text-[10px] opacity-60">{sublabel}</div>}
    </div>
  );
}

function Arrow() {
  return (
    <svg className="w-5 h-5 text-slate-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}
