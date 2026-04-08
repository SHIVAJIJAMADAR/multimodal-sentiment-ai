import { useState, useEffect, useCallback, useRef } from "react";
import { analyzeRule, analyzeML, analyzeBoth, getHealth } from "../services/api.js";

export function useAnalysis({ onAnalysisComplete } = {}) {
  const [text, setText] = useState("");
  const [model, setModel] = useState("compare");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [results, setResults] = useState(null);
  const [resultsML, setResultsML] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [health, setHealth] = useState(null);

  const previewRef = useRef(null);
  previewRef.current = imagePreview;

  useEffect(() => {
    let mounted = true;
    getHealth()
      .then((h) => {
        if (mounted) setHealth(h);
      })
      .catch(() => {
        if (mounted) setHealth(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  const handleModelChange = useCallback((m) => {
    setModel(m);
  }, []);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }, []);

  const handleAnalyze = useCallback(
    async (submittedText, opts = {}) => {
      const explain = opts.explain !== false;
      if (!submittedText?.trim()) {
        setError("Please enter a review.");
        return false;
      }
      setText(submittedText);
      setError(null);
      setLoading(true);

      try {
        let ruleData = null;
        let mlData = null;

        if (model === "compare") {
          const pair = await analyzeBoth({ text: submittedText, imageFile: image, explain });
          ruleData = pair.rule;
          mlData = pair.ml;
          setResults(ruleData);
          setResultsML(mlData);
        } else if (model === "ml") {
          mlData = await analyzeML(submittedText, image, { explain });
          setResultsML(mlData);
          setResults(null);
        } else {
          ruleData = await analyzeRule(submittedText, image, { explain });
          setResults(ruleData);
          setResultsML(null);
        }

        const primary = model === "compare" ? mlData || ruleData : model === "ml" ? mlData : ruleData;
        const sentiment = primary?.aspects?.[0]?.sentiment || "Neutral";
        const confidence = primary?.aspects?.[0]?.text_score;
        
        onAnalysisComplete?.({
          text: submittedText,
          sentiment,
          confidence,
          timestamp: Date.now()
        });

        return true;
      } catch (err) {
        setError(err.message || "Failed to analyze review.");
        setResults(null);
        setResultsML(null);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [image, model, onAnalysisComplete],
  );

  const clearResults = useCallback(() => {
    setResults(null);
    setResultsML(null);
    setError(null);
    setText("");
  }, []);

  return {
    text,
    setText,
    model,
    setModel,
    image,
    imagePreview,
    results,
    resultsML,
    loading,
    error,
    health,
    handleModelChange,
    handleImageChange,
    handleAnalyze,
    clearResults,
  };
}
