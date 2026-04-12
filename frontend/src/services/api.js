import { BASE_URL, request } from "./httpClient.js";
import { parseAnalysisResponse } from "../utils/highlight.js";

const API_BASE = BASE_URL;

export async function analyzeRule(text, imageFile = null, { explain = true } = {}) {
  if (!text || !text.trim()) throw new Error("Review text cannot be empty.");
  const formData = new FormData();
  formData.append("text", text.trim());
  formData.append("explain", explain ? "true" : "false");
  if (imageFile) {
    if (!["image/jpeg", "image/png"].includes(imageFile.type)) {
      throw new Error("Only JPEG or PNG images are supported.");
    }
    formData.append("image", imageFile);
  }
  return request(`${API_BASE}/api/analyze`, { method: "POST", body: formData });
}

export async function analyzeML(text, imageFile = null, { explain = true } = {}) {
  if (!text || !text.trim()) throw new Error("Review text cannot be empty.");
  const formData = new FormData();
  formData.append("text", text.trim());
  formData.append("explain", explain ? "true" : "false");
  if (imageFile) {
    if (!["image/jpeg", "image/png"].includes(imageFile.type)) {
      throw new Error("Only JPEG or PNG images are supported.");
    }
    formData.append("image", imageFile);
  }
  return request(`${API_BASE}/api/analyze-ml`, { method: "POST", body: formData });
}

export async function analyze({ text, imageFile = null, model = "rule", explain = true }) {
  if (!text || !text.trim()) throw new Error("Review text cannot be empty.");
  const formData = new FormData();
  formData.append("text", text.trim());
  formData.append("explain", explain ? "true" : "false");
  if (imageFile) {
    if (!["image/jpeg", "image/png"].includes(imageFile.type)) {
      throw new Error("Only JPEG or PNG images are supported.");
    }
    formData.append("image", imageFile);
  }
  const endpoint = model === "ml" ? "/api/analyze-ml" : "/api/analyze";
  return request(`${API_BASE}${endpoint}`, { method: "POST", body: formData });
}

export function countSentiments(aspects = []) {
  const tally = { Positive: 0, Negative: 0, Neutral: 0 };
  for (const a of aspects) {
    if (tally[a.sentiment] !== undefined) tally[a.sentiment]++;
  }
  return tally;
}

export async function analyzeBoth({ text, imageFile = null, explain = true }) {
  const [rule, ml] = await Promise.all([
    analyzeRule(text, imageFile, { explain }),
    analyzeML(text, imageFile, { explain }),
  ]);
  return { rule, ml };
}

export async function extractTextFromImage(imageFile) {
  if (!imageFile) throw new Error("Image file is required.");
  if (!imageFile.type?.startsWith("image/")) {
    throw new Error("Please upload a valid image file.");
  }

  const formData = new FormData();
  formData.append("image", imageFile);

  const res = await request(`${API_BASE}/api/extract-text`, { method: "POST", body: formData }, 20000);
  return (res?.extracted_text || "").trim();
}

export async function analyzeBatch({ lines = [], model = "rule" }) {
  const results = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    try {
      const res = model === "ml" ? await analyzeML(t) : await analyzeRule(t);
      const parsed = parseAnalysisResponse(res);
      const sentiment = parsed.sentiment;
      const confidence = parsed.confidence;
      results.push({ text: t, result: res, sentiment, confidence });
    } catch (e) {
      results.push({ text: t, error: e?.message || "error", sentiment: "Error", confidence: 0 });
    }
  }
  const summary = { Positive: 0, Neutral: 0, Negative: 0 };
  for (const r of results) {
    if (r.sentiment && summary[r.sentiment] !== undefined) summary[r.sentiment] += 1;
  }
  return { results, summary };
}

/** Offline benchmark metrics (can take 30–90s on CPU with the AI model). */
export async function getMetrics(refresh = false) {
  const q = refresh ? "?refresh=true" : "";
  return request(`${API_BASE}/metrics${q}`, { method: "GET" }, 120000);
}

export async function getHealth() {
  const url = `${API_BASE}/openapi.json`;
  console.log("Calling:", url);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, { method: "GET", signal: controller.signal });

    // 404 can mean wrong probe path while backend is still reachable.
    if (response.ok || response.status === 404) {
      return { online: true, status: response.status };
    }

    return null;
  } catch (e) {
    // Mark offline only for network/timeout/fetch failures.
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function exportJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportCSV(filename, rows) {
  const headers = Object.keys(rows[0] || {});
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => safeCSV(r[h])).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function safeCSV(v) {
  if (v == null) return "";
  const s = String(v).replace(/"/g, '""');
  if (/[",\n]/.test(s)) return `"${s}"`;
  return s;
}
