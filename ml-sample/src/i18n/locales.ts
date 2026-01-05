export const LOCALES = [
  "en",
  "ja",
  "zh",
  "hi",
  "es",
  "ar",
  "bn",
  "fr",
  "ru",
  "pt",
  "id",
  "de",
  "ko",
] as const;

export type Locale = (typeof LOCALES)[number];

export const LOCALE_COOKIE_NAME = "locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ja: "日本語",
  zh: "中文",
  hi: "हिन्दी",
  es: "Español",
  ar: "العربية",
  bn: "বাংলা",
  fr: "Français",
  ru: "Русский",
  pt: "Português",
  id: "Bahasa Indonesia",
  de: "Deutsch",
  ko: "한국어",
};

export function isLocale(value: string | null | undefined): value is Locale {
  if (!value) return false;
  return (LOCALES as readonly string[]).includes(value);
}

const envDefault = process.env.NEXT_PUBLIC_DEFAULT_LOCALE;
export const DEFAULT_LOCALE: Locale = isLocale(envDefault) ? envDefault : "ja";

export function isRtlLocale(locale: Locale) {
  return locale === "ar";
}

export function localeFromPathname(pathname: string): Locale | null {
  const segment = pathname.split("/")[1];
  return isLocale(segment) ? segment : null;
}
