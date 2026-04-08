import React from "react";
import { motion } from "framer-motion";

const TEXT_STEPS = [
  {
    title: "Dependency Parsing",
    description: "spaCy analyzes sentence structure and extracts grammatical relationships",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    )
  },
  {
    title: "Aspect Extraction",
    description: "Identifies noun phrases modified by adjectives (amod) and subject-attribute patterns",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    )
  },
  {
    title: "Sentiment Scoring",
    description: "NLTK VADER calculates compound polarity score from -1 (negative) to +1 (positive)",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
];

const ICON_SVG = {
  header: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  image: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
};

const IMAGE_STEPS = [
  {
    title: "Image Preprocessing",
    description: "Decode bytes, resize to max 512px, convert to HSV color space",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
      </svg>
    )
  },
  {
    title: "Color Analysis",
    description: "Extract brightness (V) and saturation (S) channel statistics",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    )
  },
  {
    title: "Edge Density",
    description: "Canny edge detection measures visual complexity as negative signal",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  }
];

export function TextPipelineSection({ variants }) {
  return (
    <motion.div variants={variants}>
      <div className="card p-6 h-full">
        <SectionHeader
          icon={ICON_SVG.header}
          title="Text Pipeline"
          subtitle="Natural Language Processing"
          color="cyan"
        />
        <div className="space-y-4">
          {TEXT_STEPS.map((step, i) => (
            <FlowStep
              key={step.title}
              number={i + 1}
              title={step.title}
              description={step.description}
              icon={step.icon}
              delay={i * 0.1}
            />
          ))}
        </div>
        <OutputBadge
          label="Output"
          description="Aspect-opinion pairs with sentiment labels and text scores"
          color="cyan"
        />
      </div>
    </motion.div>
  );
}

export function ImagePipelineSection({ variants }) {
  return (
    <motion.div variants={variants}>
      <div className="card p-6 h-full">
        <SectionHeader
          icon={ICON_SVG.image}
          title="Image Pipeline"
          subtitle="Computer Vision Analysis"
          color="blue"
        />
        <div className="space-y-4">
          {IMAGE_STEPS.map((step, i) => (
            <FlowStep
              key={step.title}
              number={i + 1}
              title={step.title}
              description={step.description}
              icon={step.icon}
              delay={i * 0.1}
            />
          ))}
        </div>
        <OutputBadge
          label="Output"
          description="Image mood score from HSV heuristics (-1 to +1)"
          color="blue"
        />
      </div>
    </motion.div>
  );
}

function SectionHeader({ icon, title, subtitle, color }) {
  const colorMap = {
    cyan: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400",
    blue: "from-blue-500/20 to-purple-500/20 border-blue-500/30 text-blue-400",
    purple: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400",
  };
  
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center border ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

function FlowStep({ number, title, description, icon, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex gap-4"
    >
      <div className="flex-shrink-0">
        <div className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
          {icon}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-cyan-400 font-medium">{number}.</span>
          <span className="text-sm font-medium text-white">{title}</span>
        </div>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
    </motion.div>
  );
}

function OutputBadge({ label, description, color }) {
  const colorMap = {
    cyan: "bg-cyan-500/5 border-cyan-500/20 text-cyan-400",
    blue: "bg-blue-500/5 border-blue-500/20 text-blue-400",
    purple: "bg-purple-500/5 border-purple-500/20 text-purple-400",
  };
  
  return (
    <div className={`mt-5 p-3 rounded-lg border ${colorMap[color]}`}>
      <div className="text-xs font-medium">{label}</div>
      <div className="text-sm text-slate-300 mt-1">{description}</div>
    </div>
  );
}
