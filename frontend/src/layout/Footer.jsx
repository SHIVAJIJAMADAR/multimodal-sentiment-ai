import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const githubUrl = import.meta?.env?.VITE_GITHUB_URL || "";
  const contactEmail = import.meta?.env?.VITE_CONTACT_EMAIL || "contact@example.com";

  return (
    <footer className="mt-10 border-t border-white/10 bg-slate-900/70">
      <div className="container-centered py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="text-lg font-semibold text-white">LiveLib</div>
          <div className="text-slate-300 text-sm mt-2">
            Multimodal sentiment analysis with text + image using rule-based and
            AI models.
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold text-white">Links</div>
          <ul className="mt-2 text-slate-300 text-sm space-y-1">
            <li>
              <Link to="/demo" className="hover:text-white transition">
                Try Demo
              </Link>
            </li>
            <li>
              <Link to="/features" className="hover:text-white transition">
                Features
              </Link>
            </li>
            <li>
              <Link to="/model" className="hover:text-white transition">
                Model
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold text-white">Project</div>
          <ul className="mt-2 text-slate-300 text-sm space-y-1">
            <li>
              {githubUrl ? (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition"
                >
                  GitHub
                </a>
              ) : (
                <span className="text-slate-500 cursor-not-allowed" title="Set VITE_GITHUB_URL to enable">
                  GitHub (not configured)
                </span>
              )}
            </li>
            <li>
              <a
                href={`mailto:${contactEmail}`}
                className="hover:text-white transition"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-centered py-4 text-xs text-slate-400">
          © {new Date().getFullYear()} LiveLib. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
