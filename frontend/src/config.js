export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000",
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || "15000", 10),
  },
  features: {
    enableBatchExport: import.meta.env.VITE_ENABLE_BATCH_EXPORT !== "false",
    enableLiveFeed: import.meta.env.VITE_ENABLE_LIVE_FEED !== "false",
    enableModelComparison: import.meta.env.VITE_ENABLE_MODEL_COMPARISON !== "false",
  },
  ui: {
    defaultModel: import.meta.env.VITE_DEFAULT_MODEL || "compare",
    maxHistoryItems: parseInt(import.meta.env.VITE_MAX_HISTORY || "10", 10),
    liveFeedInterval: parseInt(import.meta.env.VITE_LIVE_FEED_INTERVAL || "5000", 10),
  },
  env: import.meta.env.MODE,
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
};

export default config;
