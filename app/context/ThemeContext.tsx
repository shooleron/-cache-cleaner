"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const themes = {
  dark: {
    "--bg": "#0a0a0a",
    "--surface": "#111111",
    "--border": "#1f1f1f",
    "--accent": "#6366f1",
    "--accent-glow": "rgba(99, 102, 241, 0.15)",
    "--text": "#f5f5f5",
    "--muted": "#888888",
  },
  light: {
    "--bg": "#ffffff",
    "--surface": "#f4f4f5",
    "--border": "#e4e4e7",
    "--accent": "#6366f1",
    "--accent-glow": "rgba(99, 102, 241, 0.1)",
    "--text": "#09090b",
    "--muted": "#71717a",
  },
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const vars = themes[theme];
    const root = document.documentElement;
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
