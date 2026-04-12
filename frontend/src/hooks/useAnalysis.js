import { useState, useEffect, useCallback, useRef } from "react";
import { analyzeRule, analyzeML, analyzeBoth, extractTextFromImage, getHealth } from "../services/api.js";
import { parseAnalysisResponse } from "../utils/highlight.js";

export function useAnalysis({ onAnalysisComplete } = {}) {
  const [text, setText] = useState("");
  const [model, setModel] = useState("compare");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [results, setResults] = useState(null);
  const [resultsML, setResultsML] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrMessage, setOcrMessage] = useState(null);
  const [error, setError] = useState(null);
  const [health, setHealth] = useState(null);

  const previewRef = useRef(null);
  previewRef.current = imagePreview;
  const onAnalysisCompleteRef = useRef(onAnalysisComplete);
  onAnalysisCompleteRef.current = onAnalysisComplete;
  const isAnalyzing = useRef(false);

  useEffect(() => {
    let mounted = true;
    let retryTimeout;
    
    const checkHealth = () => {
      getHealth()
        .then((h) => {
          if (mounted) setHealth(h);
        })
        .catch(() => {
          if (mounted) setHealth(false);
        });
    };
    
    checkHealth();
    retryTimeout = setInterval(checkHealth, 30000);
    
    return () => {
      mounted = false;
      clearInterval(retryTimeout);
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

  const handleImageChange = useCallback(async (e) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });

    if (!file) {
      setOcrMessage(null);
      return;
    }

    setOcrLoading(true);
    setOcrMessage("Extracting text from image...");
    try {
      const extractedText = await extractTextFromImage(file);
      if (extractedText) {
        setText(extractedText);
        setError(null);
        setOcrMessage("Text extracted from image");
      } else {
        setOcrMessage("Could not extract text, please type manually");
      }
    } catch (_err) {
      setOcrMessage("Could not extract text, please type manually");
    } finally {
      setOcrLoading(false);
    }
  }, []);

  const handleAnalyze = useCallback(
    async (submittedText, opts = {}) => {
      if (isAnalyzing.current) return false;
      
      const explain = opts.explain !== false;
      if (!submittedText?.trim()) {
        setError("Please enter a review.");
        return false;
      }
      
      isAnalyzing.current = true;
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
        const parsed = parseAnalysisResponse(primary);
        
        onAnalysisCompleteRef.current?.({
          text: submittedText,
          sentiment: parsed.sentiment,
          confidence: parsed.confidence,
          timestamp: Date.now()
        });

        return true;
      } catch (err) {
        const errorMsg = err.message || "Failed to analyze review.";
        setError(errorMsg);
        setResults(null);
        setResultsML(null);
        return false;
      } finally {
        setLoading(false);
        isAnalyzing.current = false;
      }
    },
    [image, model],
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
    ocrLoading,
    ocrMessage,
    error,
    health,
    handleModelChange,
    handleImageChange,
    handleAnalyze,
    clearResults,
  };
}
