import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./layout/Navbar.jsx";
import Footer from "./layout/Footer.jsx";
import AnimatedRoutes from "./layout/AnimatedRoutes.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { ToastProvider } from "./components/ui/Toast.jsx";

function Layout({ children }) {
  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-b from-[#0B1020] via-[#0A0F1E] to-[#05070D] text-slate-100 overflow-x-clip">
      <div className="pointer-events-none absolute inset-0 particles-bg opacity-60" />
      <Navbar />
      <main className="relative z-10 flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ToastProvider>
          <Layout>
            <AnimatedRoutes />
          </Layout>
        </ToastProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
