import React, { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(
    typeof window !== "undefined" &&
      localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button
      className="btn-secondary"
      onClick={() => setDark((v) => !v)}
      type="button"
      title={dark ? "Light Mode" : "Dark Mode"}
    >
      {dark ? "🌙 Dark" : "☀ Light"}
    </button>
  );
}
