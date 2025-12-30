"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
  useLayoutEffect,
} from "react";

import { THEME_STORAGE_KEY } from "./storage-keys";

type Theme = "dark" | "light";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const resolveInitialTheme = (): Theme => {
  if (typeof document !== "undefined") {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "dark" || current === "light") return current;
  }

  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    // ignore read errors (privacy mode / disabled storage)
  }

  return "dark";
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("dark");
  const [initialized, setInitialized] = useState(false);

  useLayoutEffect(() => {
    const initial = resolveInitialTheme();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initialize from persisted preference before paint
    setTheme((current) => (current === initial ? current : initial));
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore write errors (privacy mode / disabled storage)
    }
  }, [theme, initialized]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
