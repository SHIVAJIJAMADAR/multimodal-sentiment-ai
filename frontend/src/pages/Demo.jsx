import React, { useMemo, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import ReviewInput from "../components/ReviewInput.jsx";
import AnalyticsPanel from "../components/AnalyticsPanel.jsx";
import HistoryPanel from "../components/HistoryPanel.jsx";
import PredictionPanel from "../components/PredictionPanel.jsx";
import DatasetTester from "../components/DatasetTester.jsx";
import LiveReviewFeed from "../components/LiveReviewFeed.jsx";
import SentimentTimeline from "../components/SentimentTimeline.jsx";
import ModelPerformancePanel from "../components/ModelPerformancePanel.jsx";
import ExplainabilityPanel from "../components/ExplainabilityPanel.jsx";
import { useAnalysis } from "../hooks/useAnalysis.js";
import { useToast } from "../components/ui/Toast.jsx";
import { highlightText, heatmapStyle, segmentsToHtml } from "../utils/highlight.js";
import config from "../config.js";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }
};

export default function Demo() {
  const [history, setHistory] = useState([]);
  const [explainTab, setExplainTab] = useState("rule");
  const toast = useToast();

  const onAnalysisComplete = useCallback(({ text, sentiment, confidence }) => {
    setHistory((prev) => {
      const newHistory = [{ text, sentiment, confidence, ts: Date.now() }, ...prev];
      return newHistory.slice(0, config.ui.maxHistoryItems);
    });
    toast.success(`Analysis complete: ${sentiment}`);
  }, [toast]);

  const onAnalysisError = useCallback((error) => {
    toast.error(error || "Analysis failed");
  }, [toast]);

  const {
    text,
    setText,
    model,
    imagePreview,
    results,
    resultsML,
    loading,
    error,
    health,
    handleModelChange,
    handleImageChange,
    handleAnalyze,
  } = useAnalysis({ onAnalysisComplete });

  useEffect(() => {
    if (error) {
      onAnalysisError(error);
    }
  }, [error, onAnalysisError]);

  useEffect(() => {
    setExplainTab("rule");
  }, [model]);

  const aspects = (results || resultsML)?.aspects || [];

  const activeExplanation = useMemo(() => {
    if (model === "compare") {
      return explainTab === "rule" ? results?.explanation : resultsML?.explanation;
    }
    if (model === "ml") return resultsML?.explanation;
    return results?.explanation;
  }, [model, explainTab, results, resultsML]);

  const highlighted = useMemo(() => {
    if (activeExplanation?.segments?.length) {
      return segmentsToHtml(activeExplanation.segments);
    }
    return highlightText(text, aspects.map((a) => a.opinion), aspects);
  }, [activeExplanation, text, aspects]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container-centered py-8 space-y-6"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">LiveLib</span>
            </h1>
            <p className="text-xs text-slate-400">Multimodal Sentiment AI</p>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700"
        >
          <span className={`w-2 h-2 rounded-full ${health ? "bg-emerald-400" : "bg-rose-400"} ${health ? "animate-pulse" : ""}`} />
          <span className={health ? "text-emerald-400" : "text-rose-400"}>
            Backend {health ? "Online" : "Offline"}
          </span>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="card">
            <ReviewInput
              value={text}
              onChange={setText}
              onAnalyze={handleAnalyze}
              loading={loading}
              error={error}
              onModelChange={handleModelChange}
              model={model}
              onImageChange={handleImageChange}
              imagePreview={imagePreview}
            />
          </div>
          {imagePreview && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <ImagePreviewComponent src={imagePreview} score={results?.aspects?.[0]?.image_score} />
            </motion.div>
          )}
        </motion.div>
        <motion.div variants={itemVariants}>
          <div className="card">
            <PredictionPanel
              ruleResult={results}
              mlResult={resultsML}
              compare={model === "compare"}
              loading={loading}
            />
          </div>
        </motion.div>
      </motion.div>

      {text && (
        <motion.div
          variants={itemVariants}
          className="card p-6 transition-colors"
          style={heatmapStyle(aspects)}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white">Highlighted Review</h2>
            </div>
            {model === "compare" && (results || resultsML) && (
              <div className="flex rounded-lg bg-slate-800/80 p-1 ring-1 ring-white/10">
                <button
                  type="button"
                  onClick={() => setExplainTab("rule")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                    explainTab === "rule"
                      ? "bg-cyan-500/20 text-cyan-200 ring-1 ring-cyan-500/40"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                  }`}
                >
                  Rule engine
                </button>
                <button
                  type="button"
                  onClick={() => setExplainTab("ml")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                    explainTab === "ml"
                      ? "bg-violet-500/20 text-violet-200 ring-1 ring-violet-500/40"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                  }`}
                >
                  AI model
                </button>
              </div>
            )}
          </div>
          <p className="leading-relaxed text-slate-200" dangerouslySetInnerHTML={{ __html: highlighted }} />
          <p className="text-xs text-slate-500 mt-3">
            Emerald / rose highlights use VADER lexicon polarity (dictionary hits). Words outside the lexicon stay neutral gray.
          </p>
          <ExplainabilityPanel explanation={activeExplanation} />
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <div className="card">
          <ModelPerformancePanel />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <AnalyticsPanel aspects={aspects} mode="pie" />
        </div>
        <div className="card">
          <AnalyticsPanel aspects={aspects} mode="bar" />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveReviewFeed maxItems={6} intervalMs={config.ui.liveFeedInterval} />
        <HistoryPanel history={history} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="card">
          <SentimentTimeline history={history} />
        </div>
      </motion.div>
    </motion.div>
  );
}

function ImagePreviewComponent({ src, score }) {
  return (
    <div className="p-4">
      <div className="text-sm font-medium mb-2 text-white">Image Preview</div>
      <img
        src={src}
        alt="Preview"
        className="max-h-72 w-full object-contain rounded-lg border border-slate-700"
      />
      {typeof score === "number" && (
        <div className="mt-2 text-sm text-slate-300">
          Image Score: <span className="font-semibold text-cyan-400">{score.toFixed(3)}</span>
        </div>
      )}
    </div>
  );
}
