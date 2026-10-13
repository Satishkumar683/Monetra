"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle({ className = "" }) {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Read current theme from DOM or localStorage
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");

    setTheme(initialTheme);
    applyTheme(initialTheme);

    // Listen for storage changes across tabs
    const handleStorage = (e) => {
      if (e.key === "theme" && e.newValue) {
        setTheme(e.newValue);
        applyTheme(e.newValue);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const applyTheme = (t) => {
    const root = document.documentElement;
    if (t === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }

    // Update meta color-scheme
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) {
      meta.content = t;
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  if (!mounted) {
    // Render placeholder with same dimensions to avoid layout shift
    return (
      <div
        className={`w-10 h-10 rounded-full border-2 border-black bg-white shadow-solid-sm opacity-60 ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`relative w-10 h-10 rounded-full border-2 border-black flex items-center justify-center transition-all hover:scale-105 active:translate-y-0.5 cursor-pointer shadow-solid-sm overflow-hidden ${
        isDark
          ? "bg-slate-900 text-amber-300 border-white hover:bg-slate-800"
          : "bg-white text-slate-900 border-black hover:bg-slate-50"
      } ${className}`}
    >
      <span className="sr-only">
        {isDark ? "Switch to light mode" : "Switch to dark mode"}
      </span>

      {isDark ? (
        // Moon Icon with glowing stars
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5 transition-transform duration-300 rotate-0 hover:-rotate-12"
        >
          <path
            fillRule="evenodd"
            d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        // Sun Icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-amber-500 transition-transform duration-300 hover:rotate-45"
        >
          <circle cx="12" cy="12" r="4" fill="#f59e0b" fillOpacity="0.2" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      )}
    </button>
  );
}
