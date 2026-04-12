import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { compareRuleVsMl, buildDisagreementBrief } from "../utils/compareModels.js";
import { parseAnalysisResponse } from "../utils/highlight.js";

const SENTIMENT_COLORS = {
  Positive: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-300",
    badge: "bg-emerald-500/20 text-emerald-300 ring-emerald-500/40",
    bar: "bg-gradient-to-r from-emerald-500 to-teal-400",
  },
  Negative: {
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    text: "text-rose-300",
    badge: "bg-rose-500/20 text-rose-300 ring-rose-500/40",
    bar: "bg-gradient-to-r from-rose-500 to-red-400",
  },
  Neutral: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-200",
    badge: "bg-amber-500/20 text-amber-200 ring-amber-500/40",
    bar: "bg-gradient-to-r from-amber-500 to-yellow-400",
  },
};

function ConfidenceBar({ confidence, color }) {
  const percent = confidence != null ? Math.min(100, Math.max(0, confidence)) : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">Confidence</span>
        <span className="font-semibold text-white tabular-nums">{percent.toFixed(0)}%</span>
      </div>
      <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

function ResultCard({ title, subtitle, sentiment, confidence, details, gradient, delay = 0 }) {
  const colors = SENTIMENT_COLORS[sentiment] || SENTIMENT_COLORS.Neutral;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`relative overflow-hidden rounded-2xl backdrop-blur-xl ${colors.bg} ${colors.border} border p-5 shadow-lg transition-shadow hover:shadow-xl`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />
      
      <div className="relative z-10 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className={`font-semibold ${colors.text}`}>{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          </div>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${colors.badge}`}>
            {sentiment}
          </span>
        </div>
        
        <ConfidenceBar confidence={confidence} color={colors.bar} />
        
        {details && (
          <div className="pt-3 border-t border-white/10">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              {details.map((d, i) => (
                <React.Fragment key={i}>
                  <dt className="text-slate-500">{d.label}</dt>
                  <dd className="text-slate-200 font-mono tabular-nums text-right">{d.value}</dd>
                </React.Fragment>
              ))}
            </dl>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function AgreementIndicator({ ruleLabel, mlLabel, aligned }) {
  const agrees = aligned;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className={`flex items-center justify-center gap-3 rounded-xl py-3 px-4 ${
        agrees 
          ? "bg-emerald-500/10 border border-emerald-500/30" 
          : "bg-amber-500/10 border border-amber-500/30"
      }`}
    >
      {agrees ? (
        <>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-emerald-300">Models Agree</div>
            <div className="text-xs text-slate-400">Both pipelines detected the same sentiment</div>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-amber-300">Models Disagree</div>
            <div className="text-xs text-slate-400">{ruleLabel} vs {mlLabel}</div>
          </div>
        </>
      )}
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-2">Enter a review to start analysis</h3>
      <p className="text-sm text-slate-500 max-w-xs">
        Type or paste a review in the input field above, then click Analyze to see sentiment insights.
      </p>
    </motion.div>
  );
}

function SingleResultCard({ result, isRule }) {
  const parsed = parseAnalysisResponse(result);
  const aspect = result?.aspects?.[0];
  const sentiment = parsed.sentiment;
  const confidence = parsed.confidence;
  
  return (
      <ResultCard
        title={isRule ? "Rule-Based Engine" : "AI Model"}
        subtitle={isRule ? "spaCy + VADER" : "TF-IDF + Logistic Regression"}
        sentiment={sentiment}
        confidence={confidence}
        gradient={isRule ? "from-cyan-500 to-blue-600" : "from-purple-500 to-pink-600"}
      delay={0.1}
      details={[
        { label: "Aspects", value: result?.aspects?.length || 0 },
        { label: "Fused Score", value: aspect?.fused_score?.toFixed(3) ?? "N/A" },
      ]}
    />
  );
}

export default function PredictionPanel({ ruleResult, mlResult, compare = false, loading = false }) {
  const snapshot = useMemo(() => compareRuleVsMl(ruleResult, mlResult), [ruleResult, mlResult]);
  const brief = useMemo(() => buildDisagreementBrief(snapshot), [snapshot]);
  const parsedRule = useMemo(() => parseAnalysisResponse(ruleResult), [ruleResult]);
  const parsedMl = useMemo(() => parseAnalysisResponse(mlResult), [mlResult]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-slate-800 animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-32 bg-slate-800 rounded animate-pulse" />
            <div className="h-3 w-24 bg-slate-800 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-48 bg-slate-800/50 rounded-2xl animate-pulse" />
          <div className="h-48 bg-slate-800/50 rounded-2xl animate-pulse" />
        </div>
        <div className="text-sm text-cyan-300/90">Analyzing text + image...</div>
      </div>
    );
  }

  if (!compare) {
    const res = mlResult || ruleResult;
    if (!res) return <EmptyState />;
    
    return (
      <div className="p-6">
        <SingleResultCard result={res} isRule={!mlResult && !!ruleResult} />
      </div>
    );
  }

  if (!ruleResult && !mlResult) {
    return <EmptyState />;
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3"
      >
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Analysis Results</h2>
          <p className="text-xs text-slate-500">Side-by-side comparison</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ResultCard
          title="Rule-Based Engine"
          subtitle="spaCy + VADER + OpenCV"
          sentiment={parsedRule.sentiment}
          confidence={parsedRule.confidence}
          gradient="from-cyan-500 to-blue-600"
          delay={0.1}
          details={[
            { label: "Aspect spans", value: snapshot.rule.aspectCount },
            { label: "Avg fused", value: snapshot.rule.avgFused?.toFixed(3) ?? "N/A" },
            { label: "Image score", value: snapshot.rule.imageScore?.toFixed(3) ?? "N/A" },
            { label: "VADER compound", value: snapshot.rule.compound?.toFixed(3) ?? "N/A" },
          ]}
        />
        
        <ResultCard
          title="AI Model"
          subtitle="TF-IDF + Logistic Regression"
          sentiment={parsedMl.sentiment}
          confidence={parsedMl.confidence}
          gradient="from-purple-500 to-pink-600"
          delay={0.2}
          details={snapshot.ml.probabilities ? [
            { label: "Positive", value: `${(snapshot.ml.probabilities.Positive * 100).toFixed(0)}%` },
            { label: "Neutral", value: `${(snapshot.ml.probabilities.Neutral * 100).toFixed(0)}%` },
            { label: "Negative", value: `${(snapshot.ml.probabilities.Negative * 100).toFixed(0)}%` },
          ] : []}
        />
      </div>

      <AgreementIndicator 
        ruleLabel={snapshot.rule.label} 
        mlLabel={snapshot.ml.label} 
        aligned={snapshot.aligned} 
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={brief.status}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
          className={`rounded-xl p-4 ${
            brief.badgeTone === "success"
              ? "bg-cyan-500/10 border border-cyan-500/20"
              : "bg-violet-500/10 border border-violet-500/20"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${brief.badgeTone === "success" ? "bg-cyan-400" : "bg-violet-400"}`} />
            <span className="text-sm font-semibold text-white">{brief.title}</span>
          </div>
          <p className="text-sm text-slate-400">{brief.summary}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
