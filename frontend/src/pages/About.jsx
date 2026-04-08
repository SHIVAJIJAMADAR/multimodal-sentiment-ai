import React from "react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="container-centered py-10">
      <div className="card p-6 space-y-3">
        <div className="text-xl font-semibold text-white">About Project</div>
        <div className="text-slate-300">
          LiveLib is a multimodal sentiment analysis system combining a
          rule-based pipeline with a trainable AI model. The backend runs on
          FastAPI and exposes endpoints for both engines.
        </div>
        <div className="pt-2">
          <Link
            to="/demo"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 font-semibold hover:shadow-lg hover:shadow-cyan-500/20 transition"
          >
            Try the Demo
          </Link>
        </div>
      </div>
    </div>
  );
}
