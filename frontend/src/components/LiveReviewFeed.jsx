import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_REVIEWS = [
  { text: "Absolutely love this product! Exceeded my expectations.", sentiment: "Positive", confidence: 0.92 },
  { text: "The quality is decent but shipping was slow.", sentiment: "Neutral", confidence: 0.45 },
  { text: "Terrible experience. Arrived broken and customer service was unhelpful.", sentiment: "Negative", confidence: 0.89 },
  { text: "Best purchase I've made this year. Highly recommend!", sentiment: "Positive", confidence: 0.95 },
  { text: "It's okay, nothing special. Does the job but nothing more.", sentiment: "Neutral", confidence: 0.52 },
  { text: "Worst buy ever. Complete waste of money.", sentiment: "Negative", confidence: 0.87 },
  { text: "Amazing value for money. Will buy again!", sentiment: "Positive", confidence: 0.94 },
  { text: "Mediocre at best. Expected more for this price.", sentiment: "Neutral", confidence: 0.48 },
  { text: "Disappointed with the quality. Not worth it.", sentiment: "Negative", confidence: 0.78 },
  { text: "Fantastic! Works perfectly and arrived quickly.", sentiment: "Positive", confidence: 0.91 },
  { text: "Average product. Nothing to complain about but nothing special either.", sentiment: "Neutral", confidence: 0.55 },
  { text: "Horrible quality control. Got a defective unit.", sentiment: "Negative", confidence: 0.85 },
];

const PRODUCT_IMAGES = [
  { emoji: "📱", label: "Electronics" },
  { emoji: "👕", label: "Clothing" },
  { emoji: "🏠", label: "Home" },
  { emoji: "🎮", label: "Gaming" },
  { emoji: "💄", label: "Beauty" },
  { emoji: "📚", label: "Books" },
];

function generateReview() {
  const review = MOCK_REVIEWS[Math.floor(Math.random() * MOCK_REVIEWS.length)];
  const image = PRODUCT_IMAGES[Math.floor(Math.random() * PRODUCT_IMAGES.length)];
  return {
    id: Date.now() + Math.random(),
    text: review.text,
    sentiment: review.sentiment,
    confidence: review.confidence,
    product: image.emoji,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  };
}

export default function LiveReviewFeed({ maxItems = 8, intervalMs = 4000 }) {
  const [reviews, setReviews] = useState([]);
  const [isRunning, setIsRunning] = useState(true);
  const [stats, setStats] = useState({ positive: 0, neutral: 0, negative: 0 });

  const addReview = useCallback(() => {
    const newReview = generateReview();
    setReviews((prev) => [newReview, ...prev].slice(0, maxItems));
    setStats((prev) => ({
      ...prev,
      [newReview.sentiment.toLowerCase()]: prev[newReview.sentiment.toLowerCase()] + 1,
    }));
  }, [maxItems]);

  useEffect(() => {
    if (!isRunning) return;
    
    const initialReview = generateReview();
    setReviews([initialReview]);
    setStats({
      positive: initialReview.sentiment === "Positive" ? 1 : 0,
      neutral: initialReview.sentiment === "Neutral" ? 1 : 0,
      negative: initialReview.sentiment === "Negative" ? 1 : 0,
    });

    const interval = setInterval(addReview, intervalMs);
    return () => clearInterval(interval);
  }, [isRunning, addReview, intervalMs]);

  const toggleFeed = () => setIsRunning((prev) => !prev);

  return (
    <div className="card overflow-hidden">
      <LiveFeedHeader
        isRunning={isRunning}
        onToggle={toggleFeed}
        total={stats.positive + stats.neutral + stats.negative}
        stats={stats}
      />
      <div className="max-h-96 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </AnimatePresence>
        {reviews.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            Waiting for incoming reviews...
          </div>
        )}
      </div>
    </div>
  );
}

function LiveFeedHeader({ isRunning, onToggle, total, stats }) {
  return (
    <div className="p-4 border-b border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            {isRunning && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Live Review Feed</h3>
            <p className="text-xs text-slate-400">{total} reviews analyzed</p>
          </div>
        </div>
        <ToggleButton isRunning={isRunning} onToggle={onToggle} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatPill label="Positive" value={stats.positive} color="emerald" />
        <StatPill label="Neutral" value={stats.neutral} color="amber" />
        <StatPill label="Negative" value={stats.negative} color="rose" />
      </div>
    </div>
  );
}

function ToggleButton({ isRunning, onToggle }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        isRunning
          ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
          : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
      }`}
    >
      {isRunning ? (
        <>
          <span className="w-2 h-2 bg-rose-400 rounded-full animate-pulse" />
          Pause
        </>
      ) : (
        <>
          <span className="w-2 h-2 bg-emerald-400 rounded-full" />
          Resume
        </>
      )}
    </motion.button>
  );
}

function StatPill({ label, value, color }) {
  const colors = {
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  return (
    <div className={`rounded-lg border px-3 py-2 text-center ${colors[color]}`}>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs opacity-70">{label}</div>
    </div>
  );
}

function ReviewItem({ review }) {
  const sentimentConfig = {
    Positive: {
      color: "emerald",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      dot: "bg-emerald-400",
      text: "text-emerald-400",
    },
    Neutral: {
      color: "amber",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      dot: "bg-amber-400",
      text: "text-amber-400",
    },
    Negative: {
      color: "rose",
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
      dot: "bg-rose-400",
      text: "text-rose-400",
    },
  };

  const config = sentimentConfig[review.sentiment];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20, height: 0 }}
      animate={{ opacity: 1, x: 0, height: "auto" }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`p-4 border-b border-slate-700/30 last:border-b-0 hover:bg-slate-800/30 transition-colors ${config.bg}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-lg">
          {review.product}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.border} ${config.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
              {review.sentiment}
            </span>
            <span className="text-xs text-slate-500">{review.timestamp}</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed mb-2">
            &quot;{review.text}&quot;
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${review.confidence * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  review.sentiment === "Positive"
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                    : review.sentiment === "Negative"
                    ? "bg-gradient-to-r from-rose-500 to-rose-400"
                    : "bg-gradient-to-r from-amber-500 to-amber-400"
                }`}
              />
            </div>
            <span className="text-xs font-mono text-slate-400 w-12 text-right">
              {(review.confidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
