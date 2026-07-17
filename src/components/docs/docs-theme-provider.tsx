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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ThemeContext.Provider value={{ dark: true, mounted, toggle: () => {} }}>
      <div id="docs-root" className="docs-dark min-h-screen" suppressHydrationWarning>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
