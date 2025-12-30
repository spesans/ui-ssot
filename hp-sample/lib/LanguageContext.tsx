"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  DEFAULT_LANGUAGE,
  defaultTranslation,
  getCachedTranslation,
  loadTranslation,
  subscribeTranslations,
  type Language,
  type Translation,
  LANGUAGES,
  languageMetadata,
} from "./dictionary";
import {
  getRouteLanguageFromPath,
  isRouteLanguage,
  LANGUAGE_STORAGE_KEY,
  resolveBrowserRouteLanguage,
} from "./locale";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translation;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getStoredLanguage = (): Language | null => {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return saved && (saved === "en" || saved === "ja") && LANGUAGES.includes(saved) ? saved : null;
  } catch {
    return null;
  }
};

const getDocumentLanguage = (): Language | null => {
  if (typeof document === "undefined") return null;
  const current = document.documentElement.lang;
  if (current && (current === "en" || current === "ja") && LANGUAGES.includes(current))
    return current;
  return null;
};

const getInitialLanguage = (): Language => {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  const routeLang = getRouteLanguageFromPath(window.location.pathname);
  const stored = getStoredLanguage();
  if (routeLang && stored && isRouteLanguage(stored)) return routeLang;
  if (stored) return stored;
  if (routeLang) return routeLang;
  return getDocumentLanguage() ?? resolveBrowserRouteLanguage();
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Keep SSR and the first client render aligned to avoid hydration mismatch.
  const [preferredLanguage, setPreferredLanguage] = useState<Language>(() => getInitialLanguage());
  const pathname = usePathname();
  const routeLanguage = getRouteLanguageFromPath(pathname);
  const language =
    routeLanguage && isRouteLanguage(preferredLanguage) ? routeLanguage : preferredLanguage;
  const t = useSyncExternalStore(
    subscribeTranslations,
    () => getCachedTranslation(language) ?? defaultTranslation,
    () => getCachedTranslation(language) ?? defaultTranslation,
  );

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

  useEffect(() => {
    if (getCachedTranslation(language)) return;
    loadTranslation(language).catch(() => {
      // ignore translation load errors to avoid breaking the UI
    });
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
