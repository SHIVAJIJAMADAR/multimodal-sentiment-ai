import config from "../config.js";

export const BASE_URL = config.api.baseUrl;

export function getApiBase() {
  return BASE_URL;
}

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export async function request(url, options = {}, timeout = null) {
  const controller = new AbortController();
  const ms = timeout || config.api.timeout;
  const id = setTimeout(() => controller.abort(), ms);

  try {
    console.log("Calling:", url);
    const response = await fetch(url, { ...options, signal: controller.signal });

    if (!response.ok) {
      let detail = "Request failed";
      let code = "UNKNOWN_ERROR";

      try {
        const body = await response.json();
        if (body?.detail) detail = body.detail;
        if (body?.code) code = body.code;
      } catch (_) {}

      const statusMessages = {
        400: "Invalid request",
        401: "Unauthorized",
        403: "Access forbidden",
        404: "Endpoint not found",
        422: "Validation error",
        429: "Too many requests",
        500: "Server error",
        502: "Bad gateway",
        503: "Service unavailable",
      };

      const prefix = statusMessages[response.status] || `HTTP ${response.status}`;
      throw new ApiError(`${prefix}: ${detail}`, response.status, code);
    }

    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text);

  } catch (err) {
    if (err.name === "AbortError") {
      throw new ApiError("Request timed out. Please try again.", 408, "TIMEOUT");
    }
    if (err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError") || err.message?.includes("network")) {
      throw new ApiError("Backend connection failed. Is the server running?", 0, "CONNECTION_ERROR");
    }
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message || "Unknown error occurred", 0, "UNKNOWN");
  } finally {
    clearTimeout(id);
  }
}
