import React from "react";
import { NavLink } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function Navbar() {
  const linkBase =
    "px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/10 transition";
  const linkActive = "bg-gradient-to-r from-cyan-400 to-blue-500 text-black";
  return (
    <div className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/70 ring-1 ring-white/10">
      <div className="container-centered py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-600 grid place-items-center">
            <span className="text-black font-extrabold">AI</span>
          </div>
          <div className="text-lg font-semibold">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              LiveLib
            </span>
          </div>
        </div>
        <nav className="flex items-center gap-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : ""}`
            }
            end
          >
            Home
          </NavLink>
          <NavLink
            to="/features"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : ""}`
            }
          >
            Features
          </NavLink>
          <NavLink
            to="/demo"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : ""}`
            }
          >
            Demo
          </NavLink>
          <NavLink
            to="/model"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : ""}`
            }
          >
            Model
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : ""}`
            }
          >
            About
          </NavLink>
          <div className="ml-2">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </div>
  );
}
