import React from "react";

export default function ImagePreview({ src, score }) {
  if (!src) return null;
  return (
    <div className="card p-4">
      <div className="text-sm font-medium mb-2 text-white">Image Preview</div>
      <img
        src={src}
        alt="Preview"
        className="max-h-72 w-full object-contain rounded-lg border border-slate-700"
      />
      {typeof score === "number" && (
        <div className="mt-2 text-sm text-slate-300">
          Image Score: <span className="font-semibold text-cyan-400">{score.toFixed(3)}</span>
        </div>
      )}
    </div>
  );
}
