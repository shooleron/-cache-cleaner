"use client";

import { useEffect, useState } from "react";

const LIGHT_VARS: Record<string, string> = {
  "--ur-canvas-0": "#f5f5f7",
  "--ur-canvas-1": "#ebebed",
  "--ur-canvas-2": "#e1e1e4",
  "--ur-canvas-gradient": "linear-gradient(140deg, #f5f5f7 0%, #ebebed 55%, #e1e1e4 100%)",
  "--ur-fg-1": "#1c0c00",
  "--ur-fg-2": "rgba(28,12,0,0.85)",
  "--ur-fg-3": "rgba(28,12,0,0.6)",
  "--ur-fg-4": "rgba(28,12,0,0.4)",
  "--ur-fg-5": "rgba(28,12,0,0.10)",
  "--ur-surface-glass": "rgba(255,255,255,0.65)",
  "--ur-surface-glass-border": "rgba(28,12,0,0.08)",
  "--ur-surface-glass-hover": "rgba(255,255,255,0.85)",
  "--ur-surface-item": "rgba(255,255,255,0.45)",
  "--ur-surface-item-border": "rgba(28,12,0,0.06)",
  "--ur-surface-active": "rgba(255,92,0,0.10)",
  "--ur-surface-active-border": "rgba(255,92,0,0.40)",
  "--ur-surface-sunken": "rgba(28,12,0,0.05)",
  "--ur-shadow-card": "0 16px 48px rgba(255,92,0,0.12)",
  "--ur-shadow-sm": "0 4px 16px rgba(255,92,0,0.08)",
  "--background": "var(--ur-canvas-0)",
  "--foreground": "var(--ur-fg-1)",
};

const DARK_VARS: Record<string, string> = {
  "--ur-canvas-0": "#060300",
  "--ur-canvas-1": "#110800",
  "--ur-canvas-2": "#1c0c00",
  "--ur-canvas-gradient": "linear-gradient(140deg, #060300 0%, #110800 55%, #1c0c00 100%)",
  "--ur-fg-1": "#ffffff",
  "--ur-fg-2": "rgba(255,255,255,0.8)",
  "--ur-fg-3": "rgba(255,255,255,0.55)",
  "--ur-fg-4": "rgba(255,255,255,0.35)",
  "--ur-fg-5": "rgba(255,255,255,0.1)",
  "--ur-surface-glass": "rgba(255,255,255,0.04)",
  "--ur-surface-glass-border": "rgba(255,255,255,0.08)",
  "--ur-surface-glass-hover": "rgba(255,255,255,0.07)",
  "--ur-surface-item": "rgba(255,255,255,0.03)",
  "--ur-surface-item-border": "rgba(255,255,255,0.06)",
  "--ur-surface-active": "rgba(255,92,0,0.12)",
  "--ur-surface-active-border": "rgba(255,92,0,0.30)",
  "--ur-surface-sunken": "rgba(0,0,0,0.5)",
  "--ur-shadow-card": "0 24px 64px rgba(0,0,0,0.7)",
  "--ur-shadow-sm": "0 4px 16px rgba(0,0,0,0.4)",
  "--background": "var(--ur-canvas-0)",
  "--foreground": "var(--ur-fg-1)",
};

function applyTheme(theme: "light" | "dark") {
  const vars = theme === "light" ? LIGHT_VARS : DARK_VARS;
  const el = document.documentElement;
  // Clear previous overrides first
  const allKeys = [...Object.keys(LIGHT_VARS), ...Object.keys(DARK_VARS)];
  for (const k of allKeys) el.style.removeProperty(k);
  for (const [k, v] of Object.entries(vars)) el.style.setProperty(k, v);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    const sys = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    const current = stored ?? sys;
    setTheme(current);
    applyTheme(current);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  }

  if (!theme) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="ur-btn-ghost rounded-full w-8 h-8 flex items-center justify-center text-base"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
