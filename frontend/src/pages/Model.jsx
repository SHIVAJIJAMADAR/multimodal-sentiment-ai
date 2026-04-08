import React from "react";
import { motion } from "framer-motion";
import { SystemOverview } from "../components/model/SystemOverview.jsx";
import { TextPipelineSection, ImagePipelineSection } from "../components/model/PipelineSections.jsx";
import { FusionSection } from "../components/model/FusionSection.jsx";
import { AdvantagesSection } from "../components/model/AdvantagesSection.jsx";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function Model() {
  return (
    <div className="container-centered py-10">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-8"
      >
        <ModelHeader variants={itemVariants} />
        <SystemOverview variants={itemVariants} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TextPipelineSection variants={itemVariants} />
          <ImagePipelineSection variants={itemVariants} />
        </div>
        
        <FusionSection variants={itemVariants} />
        <AdvantagesSection variants={itemVariants} />
      </motion.div>
    </div>
  );
}

function ModelHeader({ variants }) {
  return (
    <motion.div variants={variants} className="text-center mb-10">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Model Architecture
        </span>
      </h1>
      <p className="text-slate-400 max-w-xl mx-auto">
        Deterministic multimodal sentiment analysis using spaCy NLP, VADER sentiment, and OpenCV vision.
      </p>
    </motion.div>
  );
}
