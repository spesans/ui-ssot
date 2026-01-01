import { DEFAULT_LANGUAGE, LANGUAGES, type Language } from "./dictionary";

export type RouteLanguage = Language;
export const ROUTE_LANGUAGES = LANGUAGES;

export const DEFAULT_ROUTE_LANGUAGE: RouteLanguage = DEFAULT_LANGUAGE;
export const LANGUAGE_STORAGE_KEY = "sample-site-lang";

export const resolveBrowserRouteLanguage = (): RouteLanguage => {
  if (typeof window === "undefined") return DEFAULT_ROUTE_LANGUAGE;

  const candidates =
    Array.isArray(navigator.languages) && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language];

  for (const candidate of candidates) {
    if (typeof candidate !== "string") continue;
    const normalized = candidate.toLowerCase();
    if (normalized.startsWith("ja")) return "ja";
    if (normalized.startsWith("en")) return "en";
  }

  return DEFAULT_ROUTE_LANGUAGE;
};

export const normalizePath = (path: string) => {
  if (!path) return "/";
  const trimmed = path.trim();
  if (!trimmed || trimmed === "/") return "/";
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withSlash !== "/" && withSlash.endsWith("/") ? withSlash.slice(0, -1) : withSlash;
};

export const withTrailingSlash = (path: string) => {
  const normalized = normalizePath(path);
  return normalized === "/" ? "/" : `${normalized}/`;
};

export const isRouteLanguage = (value: string | null | undefined): value is RouteLanguage => {
  return !!value && (LANGUAGES as readonly string[]).includes(value);
};

export const getRouteLanguageFromPath = (path: string): RouteLanguage | null => {
  const normalized = normalizePath(path);
  const segment = normalized.split("/").find(Boolean);
  return isRouteLanguage(segment) ? segment : null;
};

export const stripLocaleFromPath = (path: string) => {
  const normalized = normalizePath(path);
  const segments = normalized.split("/").filter(Boolean);
  if (segments.length === 0) return "/";
  if (isRouteLanguage(segments[0])) {
    const rest = segments.slice(1);
    return rest.length ? `/${rest.join("/")}` : "/";
  }
  return normalized;
};

export const toLocalePath = (path: string, lang: RouteLanguage) => {
  const basePath = stripLocaleFromPath(path);
  return basePath === "/" ? `/${lang}` : `/${lang}${basePath}`;
};

export const resolvePreferredRouteLanguage = (): RouteLanguage => {
  if (typeof window === "undefined") return DEFAULT_ROUTE_LANGUAGE;

  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isRouteLanguage(stored)) return stored;
  } catch {
    // ignore read errors
  }

  const resolved = resolveBrowserRouteLanguage();
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, resolved);
  } catch {
    // ignore write errors
  }

  return resolved;
};
