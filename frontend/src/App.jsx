import React from "react";
import { BrowserRouter } from "react-router-dom";
import Navbar from "./layout/Navbar.jsx";
import Footer from "./layout/Footer.jsx";
import AnimatedRoutes from "./layout/AnimatedRoutes.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { ToastProvider } from "./components/ui/Toast.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B1020] via-[#0A0F1E] to-[#05070D] text-gray-100">
      <BrowserRouter>
        <ErrorBoundary>
          <ToastProvider>
            <Navbar />
            <AnimatedRoutes />
            <Footer />
          </ToastProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </div>
  );
}
