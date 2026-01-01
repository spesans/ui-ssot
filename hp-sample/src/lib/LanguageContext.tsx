"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { TRANSLATIONS, type Language, languageMetadata } from "./dictionary";
import {
  DEFAULT_ROUTE_LANGUAGE,
  getRouteLanguageFromPath,
  isRouteLanguage,
  LANGUAGE_STORAGE_KEY,
  resolveBrowserRouteLanguage,
} from "./locale";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (typeof TRANSLATIONS)[Language];
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getStoredLanguage = (): Language | null => {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return saved === "en" || saved === "ja" ? saved : null;
  } catch {
    return null;
  }
};

const getDocumentLanguage = (): Language | null => {
  if (typeof document === "undefined") return null;
  const current = document.documentElement.lang;
  return current === "en" || current === "ja" ? current : null;
};

const getInitialLanguage = (): Language => {
  if (typeof window === "undefined") return DEFAULT_ROUTE_LANGUAGE;

  const routeLang = getRouteLanguageFromPath(window.location.pathname);
  const stored = getStoredLanguage();

  if (routeLang && stored && isRouteLanguage(stored)) return routeLang;
  if (stored) return stored;
  if (routeLang) return routeLang;
  return getDocumentLanguage() ?? resolveBrowserRouteLanguage();
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [preferredLanguage, setPreferredLanguage] = useState<Language>(() => getInitialLanguage());
  const pathname = usePathname();
  const routeLanguage = getRouteLanguageFromPath(pathname);
  const language =
    routeLanguage && isRouteLanguage(preferredLanguage) ? routeLanguage : preferredLanguage;
  const t = TRANSLATIONS[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = languageMetadata[language].rtl ? "rtl" : "ltr";
  }, [language]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (isRouteLanguage(stored)) return;
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // ignore write errors (privacy mode / disabled storage)
    }
  }, [language]);

  const persistLanguage = (next: Language) => {
    setPreferredLanguage(next);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      // ignore write errors (privacy mode / disabled storage)
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: persistLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
