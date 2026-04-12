import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

function isValidImageType(file) {
  return ALLOWED_TYPES.includes(file.type);
}

export default function ReviewInput({
  value,
  onChange,
  onAnalyze,
  loading = false,
  error,
  onModelChange,
  model,
  onImageChange,
  imagePreview,
  ocrLoading = false,
  ocrMessage = null,
}) {
  const [localText, setLocalText] = useState(value || "");
  const [explainEnabled, setExplainEnabled] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  useEffect(() => {
    setLocalText(value || "");
  }, [value]);

  const handleFile = (file) => {
    setUploadError(null);
    setSelectedFileName(null);

    if (!file) return;

    if (!isValidImageType(file)) {
      setUploadError("Please upload a valid image (JPEG, PNG, or WebP)");
      return;
    }

    setSelectedFileName(file.name);
    const evt = { target: { files: [file] } };
    onImageChange?.(evt);
  };

  function onDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      handleFile(file);
    }
  }

  function onDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }

  function onDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget !== e.target) return;
    setIsDragOver(false);
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    e.target.value = "";
  }

  function clearImage() {
    setSelectedFileName(null);
    setUploadError(null);
    const evt = { target: { files: [null] } };
    onImageChange?.(evt);
  }

  const examples = [
    "Chair is amazing",
    "Table is broken",
    "Sofa looks good but uncomfortable",
  ];

  return (
    <div className="p-6 space-y-5">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3"
      >
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-white">Analyze Review</h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <textarea
          className="w-full rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 resize-none"
          rows={5}
          placeholder="e.g. The screen is amazing but the battery is terrible."
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-3"
      >
        <div
          ref={dropZoneRef}
          onClick={() => fileInputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragOver
              ? "border-cyan-500 bg-cyan-500/10"
              : "border-slate-700 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50"
          }`}
        >
          <motion.div
            animate={{ scale: isDragOver ? 1.1 : 1 }}
            className="flex flex-col items-center gap-3"
          >
            <div className={`h-14 w-14 rounded-xl flex items-center justify-center transition-colors duration-300 ${
              isDragOver ? "bg-cyan-500/20" : "bg-slate-700/50"
            }`}>
              <svg
                className={`w-7 h-7 transition-colors duration-300 ${isDragOver ? "text-cyan-400" : "text-slate-500"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-300">
                {isDragOver ? "Drop image here" : "Click or drag & drop to upload"}
              </p>
              <p className="text-xs text-slate-500">
                Supports JPEG, PNG, WebP
              </p>
            </div>
          </motion.div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        <AnimatePresence>
          {uploadError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 text-sm text-rose-400"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {uploadError}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {ocrLoading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 text-sm text-cyan-300"
            >
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Extracting text from image...
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!ocrLoading && ocrMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border ${
                ocrMessage === "Text extracted from image"
                  ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/25"
                  : "text-amber-300 bg-amber-500/10 border-amber-500/25"
              }`}
            >
              {ocrMessage === "Text extracted from image" ? (
                <>
                  <span className="text-base leading-none" role="img" aria-label="brain">🧠</span>
                  Text extracted from image
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {ocrMessage}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap items-center gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => fileInputRef.current?.click()}
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 text-sm font-medium border border-slate-700 hover:border-slate-600 transition-all duration-200 ripple-btn"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Upload Image</span>
        </motion.button>

        {selectedFileName && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm"
          >
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-emerald-300 max-w-[150px] truncate">{selectedFileName}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearImage();
              }}
              className="text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}

        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={explainEnabled}
            onChange={(e) => setExplainEnabled(e.target.checked)}
            className="rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-0"
          />
          Explain predictions
        </label>

        <div className="flex-1" />

        <motion.select
          whileFocus={{ scale: 1.02 }}
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-900/70 text-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200 cursor-pointer"
        >
          <option value="rule">Rule-Based Engine</option>
          <option value="ml">AI Model</option>
          <option value="compare">Compare Both</option>
        </motion.select>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white px-6 py-2.5 font-semibold shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 hover:animate-gradient ripple-btn disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:y-0"
          onClick={() => onAnalyze(localText, { explain: explainEnabled })}
          disabled={loading || ocrLoading}
          type="button"
        >
          {loading || ocrLoading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {ocrLoading ? "Extracting text..." : "Analyzing..."}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Analyze
            </span>
          )}
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="flex flex-wrap gap-2"
      >
        {examples.map((ex, i) => (
          <motion.button
            key={ex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.05 }}
            whileHover={loading ? {} : { scale: 1.05, y: -2 }}
            whileTap={loading ? {} : { scale: 0.95 }}
            type="button"
            disabled={loading || ocrLoading}
            onClick={() => {
              setLocalText(ex);
              onAnalyze?.(ex, { explain: explainEnabled });
            }}
            className="rounded-full px-4 py-1.5 text-sm bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 hover:border-cyan-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {ex}
          </motion.button>
        ))}
      </motion.div>

      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-56 rounded-xl border border-slate-700 object-contain mx-auto shadow-lg"
              />
              <button
                onClick={clearImage}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
