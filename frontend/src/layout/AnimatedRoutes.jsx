import React, { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import PageSkeleton from "../components/ui/PageSkeleton.jsx";

const Home = lazy(() => import("../pages/Home.jsx"));
const Features = lazy(() => import("../pages/Features.jsx"));
const Demo = lazy(() => import("../pages/Demo.jsx"));
const Model = lazy(() => import("../pages/Model.jsx"));
const About = lazy(() => import("../pages/About.jsx"));

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

const pageTransition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
};

function PageWrapper({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}

function LoadingFallback() {
  return <PageSkeleton title="Loading page" />;
}

export default function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <PageWrapper>
                <Home />
              </PageWrapper>
            </Suspense>
          }
        />
        <Route
          path="/features"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <PageWrapper>
                <Features />
              </PageWrapper>
            </Suspense>
          }
        />
        <Route
          path="/demo"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <PageWrapper>
                <Demo />
              </PageWrapper>
            </Suspense>
          }
        />
        <Route
          path="/model"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <PageWrapper>
                <Model />
              </PageWrapper>
            </Suspense>
          }
        />
        <Route
          path="/about"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <PageWrapper>
                <About />
              </PageWrapper>
            </Suspense>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}
