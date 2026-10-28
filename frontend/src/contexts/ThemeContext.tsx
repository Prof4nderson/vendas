import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "holographic" | "cyberpunk";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  themeLabel: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children, defaultTheme = "holographic" }: { children: React.ReactNode; defaultTheme?: Theme }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("vendaflow-theme");
    return stored === "cyberpunk" || stored === "holographic" ? stored : defaultTheme;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("theme-cyberpunk", theme === "cyberpunk");
    root.classList.toggle("theme-holographic", theme === "holographic");
    root.dataset.theme = theme;
    localStorage.setItem("vendaflow-theme", theme);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme(current => current === "holographic" ? "cyberpunk" : "holographic"), themeLabel: theme === "holographic" ? "Modo holográfico" : "Modo cyberpunk" }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
