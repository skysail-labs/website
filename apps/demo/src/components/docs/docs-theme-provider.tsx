"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "nyx-docs-theme";

const ThemeContext = createContext<{ dark: boolean; mounted: boolean; toggle: () => void }>({
  dark: false,
  mounted: false,
  toggle: () => {},
});

export function useDocsTheme() {
  return useContext(ThemeContext);
}

export function DocsThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
  }, [dark]);

  const toggle = () => setDark((d) => !d);

  return (
    <ThemeContext.Provider value={{ dark, mounted, toggle }}>
      <div id="docs-root" className={dark ? "docs-dark min-h-screen" : "docs-light min-h-screen"} suppressHydrationWarning>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
