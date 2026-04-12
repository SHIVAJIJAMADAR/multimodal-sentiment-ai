import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

function SectionCard({ icon, title, children, gradient = "from-cyan-500 to-blue-600" }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, scale: 1.01 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/80 border border-slate-700/50 p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/5"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.03]`} />
      <div className="relative z-10">
        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
        <div className="text-slate-400 text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

function FeatureBadge({ children, color = "cyan" }) {
  const colors = {
    cyan: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    blue: "bg-blue-500/10 text-blue-300 border-blue-500/30",
    purple: "bg-purple-500/10 text-purple-300 border-purple-500/30",
    emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  };
  
  return (
    <span className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium border ${colors[color]}`}>
      {children}
    </span>
  );
}

function TechItem({ name, icon, description }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-200"
    >
      <div className="text-2xl">{icon}</div>
      <div>
        <div className="text-sm font-semibold text-white">{name}</div>
        <div className="text-xs text-slate-500">{description}</div>
      </div>
    </motion.div>
  );
}

export default function About() {
  return (
    <div className="container-centered py-10">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-10"
      >
        <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              LiveLib
            </span>
          </motion.h1>
          <p className="text-lg text-slate-400 mb-2">
            Dynamic Multimodal Sentiment Intelligence
          </p>
          <p className="text-slate-500">
            A production-ready MABSA system combining rule-based NLP with deep learning for comprehensive aspect-level sentiment analysis.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SectionCard
            gradient="from-cyan-500 to-blue-600"
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="Project Overview"
          >
            <p className="mb-4">
              LiveLib is a deterministic Multimodal Aspect-Based Sentiment Analysis (MABSA) system that extracts aspect-opinion pairs from text and evaluates image mood to provide comprehensive sentiment insights.
            </p>
            <div className="flex flex-wrap gap-2">
              <FeatureBadge color="cyan">MABSA</FeatureBadge>
              <FeatureBadge color="blue">Multimodal</FeatureBadge>
              <FeatureBadge color="purple">Real-time</FeatureBadge>
              <FeatureBadge color="emerald">CPU-Optimized</FeatureBadge>
            </div>
          </SectionCard>

          <SectionCard
            gradient="from-purple-500 to-pink-600"
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            }
            title="OOPS Concepts Used"
          >
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">▹</span>
                <div>
                  <span className="font-medium text-slate-200">Encapsulation</span>
                  <p className="text-xs text-slate-500 mt-0.5">Separate analyzers with private state</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">▹</span>
                <div>
                  <span className="font-medium text-slate-200">Abstraction</span>
                  <p className="text-xs text-slate-500 mt-0.5">Clean interfaces via Pydantic models</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">▹</span>
                <div>
                  <span className="font-medium text-slate-200">Composition</span>
                  <p className="text-xs text-slate-500 mt-0.5">MABSAEngine orchestrates sub-modules</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">▹</span>
                <div>
                  <span className="font-medium text-slate-200">Polymorphism</span>
                  <p className="text-xs text-slate-500 mt-0.5">Unified analyze() for all pipelines</p>
                </div>
              </li>
            </ul>
          </SectionCard>

          <SectionCard
            gradient="from-emerald-500 to-teal-600"
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            }
            title="Tech Stack"
          >
            <div className="grid grid-cols-2 gap-3">
              <TechItem name="React + Vite" icon="⚛️" description="Frontend framework" />
              <TechItem name="FastAPI" icon="🚀" description="Backend API" />
              <TechItem name="spaCy" icon="📝" description="NLP processing" />
              <TechItem name="PyTorch" icon="🔥" description="Deep learning" />
              <TechItem name="VADER" icon="💬" description="Sentiment scoring" />
              <TechItem name="OpenCV" icon="🖼️" description="Image processing" />
              <TechItem name="BERT" icon="🤖" description="Text encoding" />
              <TechItem name="ResNet18" icon="🧠" description="Image encoding" />
            </div>
          </SectionCard>

          <SectionCard
            gradient="from-amber-500 to-orange-600"
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            }
            title="Key Features"
          >
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-slate-300">Dual pipeline: Rule-based + AI models</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-slate-300">Aspect-opinion pair extraction</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-slate-300">Multimodal fusion (text + image)</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-slate-300">Real-time analysis dashboard</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-slate-300">Explainable predictions</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-slate-300">Batch processing support</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-slate-300">Live review feed simulation</span>
              </li>
            </ul>
          </SectionCard>
        </div>

        <motion.div variants={itemVariants} className="text-center">
          <div className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-slate-700/50">
            <h3 className="text-xl font-semibold text-white">Ready to explore?</h3>
            <p className="text-sm text-slate-500 max-w-md">
              Try the live demo to experience multimodal sentiment analysis in action.
            </p>
            <Link
              to="/demo"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 font-semibold shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Try the Demo
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
