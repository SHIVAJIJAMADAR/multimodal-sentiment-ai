import React, { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import PageSkeleton from "../components/ui/PageSkeleton.jsx";

const Home = lazy(() => import("../pages/Home.jsx"));
const Features = lazy(() => import("../pages/Features.jsx"));
const Demo = lazy(() => import("../pages/Demo.jsx"));
const Model = lazy(() => import("../pages/Model.jsx"));
const About = lazy(() => import("../pages/About.jsx"));

export default function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        <Suspense fallback={<PageSkeleton title="Loading page" />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/model" element={<Model />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}
