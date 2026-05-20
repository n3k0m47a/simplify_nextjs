"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system" | "contrast";

const STORAGE_KEY = "theme";

const ALL_THEMES: Theme[] = ["light", "dark", "system", "contrast"];

function resolveAndApply(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("dark", "contrast");

  if (theme === "dark") {
    root.classList.add("dark");
  } else if (theme === "contrast") {
    root.classList.add("contrast");
  } else if (theme === "system") {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      root.classList.add("dark");
    }
  }
}

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: readonly Theme[];
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const initial = stored && (ALL_THEMES as string[]).includes(stored) ? stored : "system";
    setThemeState(initial);
    resolveAndApply(initial);
  }, []);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => resolveAndApply("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
    resolveAndApply(t);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: ALL_THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme muss innerhalb von ThemeProvider verwendet werden");
  return ctx;
}
