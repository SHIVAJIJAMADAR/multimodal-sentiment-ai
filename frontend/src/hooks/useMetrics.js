import { useState, useEffect, useCallback } from "react";
import { getMetrics } from "../services/api.js";

/**
 * Fetches GET /metrics with optional refresh; suitable for the Model Performance dashboard card.
 */
export function useMetrics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (refresh = false) => {
    setLoading(true);
    setError(null);
    try {
      setData(await getMetrics(refresh));
    } catch (e) {
      setError(e?.message || "Failed to load metrics.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  return {
    data,
    loading,
    error,
    refresh: () => load(true),
  };
}
