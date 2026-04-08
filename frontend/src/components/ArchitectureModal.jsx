import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const TEXT_STEPS = [
  { label: "Review Text", sublabel: "Raw input" },
  { label: "spaCy Parser", sublabel: "Dependency tree" },
  { label: "Aspect Extraction", sublabel: "amod, nsubj patterns" },
  { label: "VADER Scoring", sublabel: "Compound polarity" }
];

const IMAGE_STEPS = [
  { label: "Product Image", sublabel: "JPEG/PNG" },
  { label: "HSV Convert", sublabel: "Color space" },
  { label: "Feature Extract", sublabel: "Brightness, saturation" },
  { label: "Edge Analysis", sublabel: "Canny density" }
];

const OUTPUT_STEPS = [
  { label: "Fusion Layer", sublabel: "Weighted combine" },
  { label: "Classification", sublabel: "Positive/Neutral/Negative" },
  { label: "Confidence", sublabel: "Fused score" },
  { label: "Aspect Details", sublabel: "Opinion pairs" }
];

export default function ArchitectureModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <Modal onClose={onClose}>
          <ModalHeader onClose={onClose} />
          <ModalBody />
        </Modal>
      )}
    </AnimatePresence>
  );
}

function Modal({ children, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-auto rounded-2xl bg-slate-900 ring-1 ring-white/10 shadow-2xl"
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function ModalHeader({ onClose }) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50">
      <div>
        <h2 className="text-xl font-semibold text-white">System Architecture</h2>
        <p className="text-sm text-slate-400 mt-1">Multimodal sentiment analysis pipeline</p>
      </div>
      <IconButton onClick={onClose}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </IconButton>
    </div>
  );
}

function ModalBody() {
  return (
    <div className="p-6 space-y-8">
      <InfoGrid />
      <FlowDiagram />
      <FormulaSection />
    </div>
  );
}

function InfoGrid() {
  const items = [
    { title: "Text Engine", value: "spaCy NLP", color: "cyan" },
    { title: "Sentiment", value: "VADER", color: "amber" },
    { title: "Vision", value: "OpenCV", color: "blue" },
    { title: "Fusion", value: "Weighted", color: "purple" }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {items.map((item) => (
        <InfoCard key={item.title} {...item} />
      ))}
    </div>
  );
}

function InfoCard({ title, value, color }) {
  const colorMap = {
    cyan: "border-cyan-500/30 bg-cyan-500/5 text-cyan-400",
    amber: "border-amber-500/30 bg-amber-500/5 text-amber-400",
    blue: "border-blue-500/30 bg-blue-500/5 text-blue-400",
    purple: "border-purple-500/30 bg-purple-500/5 text-purple-400"
  };

  return (
    <div className={`rounded-xl border p-4 ${colorMap[color]}`}>
      <div className="text-xs text-slate-400 mb-1">{title}</div>
      <div className={`text-lg font-semibold ${colorMap[color].split(" ")[2]}`}>{value}</div>
    </div>
  );
}

function FlowDiagram() {
  return (
    <div className="space-y-6">
      <div className="text-sm font-medium text-slate-300 mb-4">Processing Flow</div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FlowColumn title="Text Input" color="cyan" steps={TEXT_STEPS} />
        <FlowColumn title="Image Input" color="blue" steps={IMAGE_STEPS} />
        <FlowColumn title="Output" color="purple" steps={OUTPUT_STEPS} />
      </div>
    </div>
  );
}

function FlowColumn({ title, color, steps }) {
  const colorMap = {
    cyan: "border-cyan-500/30 text-cyan-400",
    blue: "border-blue-500/30 text-blue-400",
    purple: "border-purple-500/30 text-purple-400"
  };
  const bgMap = {
    cyan: "bg-cyan-500/10 border-cyan-500/30",
    blue: "bg-blue-500/10 border-blue-500/30",
    purple: "bg-purple-500/10 border-purple-500/30"
  };

  return (
    <div className="space-y-3">
      <div className={`text-sm font-medium text-center py-2 border-b ${colorMap[color]}`}>
        {title}
      </div>
      {steps.map((step, i) => (
        <motion.div
          key={step.label}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className={`flex items-center gap-3 p-3 rounded-lg ${bgMap[color]} border`}
        >
          <StepNumber number={i + 1} color={color} />
          <div>
            <div className="text-sm font-medium text-white">{step.label}</div>
            <div className="text-xs text-slate-500">{step.sublabel}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function StepNumber({ number, color }) {
  const colorMap = {
    cyan: "border-cyan-500/30 text-cyan-400 bg-cyan-500/10",
    blue: "border-blue-500/30 text-blue-400 bg-blue-500/10",
    purple: "border-purple-500/30 text-purple-400 bg-purple-500/10"
  };

  return (
    <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium ${colorMap[color]}`}>
      {number}
    </div>
  );
}

function FormulaSection() {
  return (
    <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4">
      <div className="text-sm font-medium text-white mb-3">Fusion Formula</div>
      <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
        <CodeChip color="cyan">0.7 × text_score</CodeChip>
        <span className="text-slate-500">+</span>
        <CodeChip color="blue">0.3 × image_score</CodeChip>
        <span className="text-slate-500">=</span>
        <CodeChip color="purple">fused</CodeChip>
      </div>
    </div>
  );
}

function CodeChip({ children, color }) {
  const colorMap = {
    cyan: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    blue: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    purple: "bg-purple-500/20 text-purple-300 border-purple-500/30"
  };

  return (
    <code className={`px-3 py-1.5 rounded-lg border font-mono text-sm ${colorMap[color]}`}>
      {children}
    </code>
  );
}

function IconButton({ children, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="h-10 w-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center border border-slate-700 transition-all"
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}
