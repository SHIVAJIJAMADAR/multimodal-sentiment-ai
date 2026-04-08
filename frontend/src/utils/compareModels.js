/**
 * Document-level comparison between rule-based MABSA and the neural pipeline.
 * Pure functions — safe for unit tests and reuse across panels / exports.
 */

const ORDER = ["Positive", "Neutral", "Negative"];

/**
 * @param {Array<{ sentiment?: string, fused_score?: number, text_score?: number }>} aspects
 * @returns {string}
 */
export function dominantSentimentFromAspects(aspects) {
  if (!aspects?.length) return "Neutral";
  const tally = { Positive: 0, Negative: 0, Neutral: 0 };
  for (const a of aspects) {
    const s = a?.sentiment;
    if (s && tally[s] !== undefined) tally[s] += 1;
  }
  const maxCount = Math.max(tally.Positive, tally.Negative, tally.Neutral);
  const tied = ORDER.filter((k) => tally[k] === maxCount);
  if (tied.length === 1) return tied[0];

  let best = tied[0];
  let bestAvg = -Infinity;
  for (const sent of tied) {
    const subset = aspects.filter((a) => a?.sentiment === sent);
    const avg =
      subset.reduce((sum, a) => sum + (typeof a.fused_score === "number" ? a.fused_score : a.text_score ?? 0), 0) /
      Math.max(1, subset.length);
    if (avg > bestAvg) {
      bestAvg = avg;
      best = sent;
    }
  }
  return best;
}

/**
 * @param {object|null|undefined} result — API AnalysisResult
 */
export function extractRuleSnapshot(result) {
  const aspects = result?.aspects ?? [];
  const label = dominantSentimentFromAspects(aspects);
  const fused = aspects
    .map((a) => (typeof a.fused_score === "number" ? a.fused_score : null))
    .filter((v) => v != null);
  const avgFused = fused.length ? fused.reduce((s, v) => s + v, 0) / fused.length : null;
  const imageScore = aspects.find((a) => typeof a.image_score === "number")?.image_score ?? null;
  const compound = result?.explanation?.document_vader_compound;

  return {
    label,
    aspectCount: aspects.length,
    avgFused,
    imageScore,
    compound,
    aspectsPreview: aspects.slice(0, 4).map((a) => ({
      aspect: a.aspect,
      opinion: a.opinion,
      sentiment: a.sentiment,
      fused_score: a.fused_score,
    })),
  };
}

/**
 * @param {object|null|undefined} result
 */
export function extractMlSnapshot(result) {
  const aspect = result?.aspects?.[0];
  const label = aspect?.sentiment ?? "Neutral";
  const exp = result?.explanation;
  return {
    label,
    confidence: typeof exp?.confidence === "number" ? exp.confidence : null,
    probabilities: exp?.class_probabilities ?? null,
    topSaliency: exp?.top_word_saliency?.slice(0, 5) ?? [],
  };
}

/**
 * @returns {{ aligned: boolean, rule: ReturnType<typeof extractRuleSnapshot>, ml: ReturnType<typeof extractMlSnapshot>, agreementLevel: 'full'|'none' }}
 */
export function compareRuleVsMl(ruleResult, mlResult) {
  const rule = extractRuleSnapshot(ruleResult);
  const ml = extractMlSnapshot(mlResult);
  const aligned = rule.label === ml.label;
  return {
    aligned,
    rule,
    ml,
    agreementLevel: aligned ? "full" : "none",
  };
}

/**
 * @param {ReturnType<typeof compareRuleVsMl>} snapshot
 */
export function buildDisagreementBrief(snapshot) {
  if (snapshot.aligned) {
    return {
      status: "agree",
      badgeLabel: "Models aligned",
      badgeTone: "success",
      title: "Agreement",
      summary: `Rule engine and AI both indicate ${snapshot.rule.label} sentiment at document level.`,
      factors: [],
    };
  }

  const factors = [];

  if (snapshot.rule.aspectCount === 0) {
    factors.push({
      code: "rule_no_aspects",
      title: "Sparse rule extraction",
      detail:
        "The dependency-based engine found no aspect–opinion spans, so the rule view is under-specified while the neural model still reads the full review holistically.",
    });
  }

  if (snapshot.ml.confidence != null && snapshot.ml.confidence < 0.55) {
    factors.push({
      code: "ml_low_confidence",
      title: "Low AI softmax margin",
      detail:
        "The classifier probability for the winning class is below ~55%. Near the decision boundary, small input changes or modality fusion effects commonly produce rule–neural disagreements.",
    });
  }

  if (typeof snapshot.rule.compound === "number" && snapshot.rule.aspectCount > 0) {
    const c = snapshot.rule.compound;
    const opposite =
      (snapshot.rule.label === "Positive" && c < -0.05) ||
      (snapshot.rule.label === "Negative" && c > 0.05);
    if (opposite) {
      factors.push({
        code: "lexicon_vs_aspect",
        title: "Lexicon vs. structured spans",
        detail:
          "Whole-review VADER compound disagrees in sign with the dominant fused aspect label — aspect-level fusion and document-level lexicon tone can diverge when opinions target different entities.",
      });
    }
  }

  if (snapshot.rule.imageScore != null && Math.abs(snapshot.rule.imageScore) > 0.12) {
    factors.push({
      code: "image_fusion_rule",
      title: "Image channel (rule only)",
      detail:
        "The rule pipeline fuses OpenCV heuristics (30% weight). The AI uses a learned image encoder — the two visual signals are not aligned by construction.",
    });
  }

  if (factors.length === 0) {
    factors.push({
      code: "generic",
      title: "Different inductive biases",
      detail:
        "Transparent linguistic rules + fusion differ from a trained BERT–ResNet ensemble. Disagreement often reflects methodology, not necessarily an error in either system.",
    });
  }

  return {
    status: "mismatch",
    badgeLabel: "Mismatch detected",
    badgeTone: "warning",
    title: "Disagreement analysis",
    summary: `Rule document label ${snapshot.rule.label} vs. AI ${snapshot.ml.label}.`,
    factors,
  };
}
