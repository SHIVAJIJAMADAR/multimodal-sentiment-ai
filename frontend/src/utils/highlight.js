/**
 * HTML highlighting and heatmap helpers for the demo review panel.
 */

export function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Parse API response to extract sentiment and confidence.
 * SINGLE SOURCE OF TRUTH for parsing API responses.
 * 
 * @param {Object} result - API response from /api/analyze or /api/analyze-ml
 * @returns {{ sentiment: string, confidence: number, fusedScore: number, textScore: number }}
 */
export function parseAnalysisResponse(result) {
  // Debug log
  console.log("API RESPONSE:", result);

  // Safe defaults
  const fallback = {
    sentiment: "Neutral",
    confidence: 0,
    fusedScore: 0,
    textScore: 0,
  };

  // Check for valid response
  if (!result || !result.aspects || !Array.isArray(result.aspects) || result.aspects.length === 0) {
    console.log("API RESPONSE: No aspects found, using fallback");
    return fallback;
  }

  // Get first aspect (our main result)
  const aspect = result.aspects[0];

  if (!aspect) {
    console.log("API RESPONSE: First aspect missing, using fallback");
    return fallback;
  }

  // Extract sentiment from aspect
  const sentiment = aspect.sentiment || "Neutral";

  // Extract fused score (final combined score)
  const fusedScore = typeof aspect.fused_score === "number" ? aspect.fused_score : 0;

  // Extract text score (VADER compound)
  const textScore = typeof aspect.text_score === "number" ? aspect.text_score : 0;

  // Use backend confidence when provided; fallback to fused score
  const confidence = aspect.confidence ?? (Math.abs(fusedScore) * 100);

  const parsed = {
    sentiment,
    confidence,
    fusedScore,
    textScore,
  };

  console.log("API RESPONSE PARSED:", parsed);

  return parsed;
}

/** Render server-provided VADER lexicon segments (positive / negative / neutral). */
export function segmentsToHtml(segments) {
  if (!segments?.length) return "";
  return segments
    .map((seg) => {
      const t = escapeHtml(seg.text ?? "");
      let cls = "text-slate-300";
      if (seg.polarity === "positive") {
        cls =
          "text-emerald-400 font-semibold underline decoration-emerald-400/40 underline-offset-2";
      } else if (seg.polarity === "negative") {
        cls = "text-rose-400 font-semibold underline decoration-rose-400/40 underline-offset-2";
      }
      return `<span class="${cls}">${t}</span>`;
    })
    .join("");
}

export function highlightText(text, opinions = [], aspects = []) {
  if (!text) return escapeHtml(text || "");
  const escaped = escapeHtml(text);
  const map = {};
  aspects.forEach((a) => {
    if (a?.opinion) map[a.opinion.toLowerCase()] = a.sentiment;
  });
  const uniq = [...new Set(opinions.filter(Boolean))];
  let out = escaped;
  for (const w of uniq) {
    const pattern = new RegExp(`\\b(${escapeRegExp(w)})\\b`, "gi");
    const sent = map[w.toLowerCase()] || "Neutral";
    const cls =
      sent === "Positive"
        ? "text-emerald-400"
        : sent === "Negative"
          ? "text-rose-400"
          : "text-amber-400";
    const emoji = sent === "Positive" ? "🟢" : sent === "Negative" ? "🔴" : "🟡";
    out = out.replace(pattern, `<span class="${cls} font-semibold">${emoji}$1</span>`);
  }
  return out;
}

export function heatmapStyle(aspects) {
  if (!aspects?.length) return {};
  const fs = aspects
    .map((a) => (typeof a.fused_score === "number" ? a.fused_score : 0))
    .filter((v) => !Number.isNaN(v));
  const avg = fs.length ? fs.reduce((s, v) => s + v, 0) / fs.length : 0;
  const intensity = Math.min(1, Math.max(-1, avg));
  const pos = `rgba(22, 163, 74, ${Math.abs(intensity) * (intensity > 0 ? 0.12 : 0)})`;
  const neg = `rgba(220, 38, 38, ${Math.abs(intensity) * (intensity < 0 ? 0.12 : 0)})`;
  const bg = intensity >= 0 ? pos : neg;
  return { backgroundColor: bg };
}
