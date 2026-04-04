"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "destino_night_mode";

export default function ThemeToggle() {
  const [night, setNight] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load preference on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "true") {
        document.documentElement.classList.add("night");
        setNight(true);
      }
    } catch {}
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !night;
    setNight(next);
    if (next) {
      document.documentElement.classList.add("night");
    } else {
      document.documentElement.classList.remove("night");
    }
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {}
  };

  // Avoid hydration mismatch — render nothing until mounted
  if (!mounted) return <div className="w-8 h-8" />;

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-md transition-colors"
      style={{
        color: night ? "var(--seal-light)" : "var(--ink-light)",
      }}
      aria-label={night ? "야간 모드 끄기" : "야간 모드 켜기"}
      aria-pressed={night}
      title={night ? "야간 모드 끄기" : "야간 모드 켜기"}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        {night ? (
          /* Filled moon when night mode is active */
          <path
            d="M13.5 9.5a5.5 5.5 0 0 1-7-7A5.5 5.5 0 1 0 13.5 9.5Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          /* Outline moon when in day mode */
          <path
            d="M13.5 9.5a5.5 5.5 0 0 1-7-7A5.5 5.5 0 1 0 13.5 9.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  );
}
