import { ar } from "./translations/ar";
import { bn } from "./translations/bn";
import { de } from "./translations/de";
import { en } from "./translations/en";
import { es } from "./translations/es";
import { fr } from "./translations/fr";
import { hi } from "./translations/hi";
import { id } from "./translations/id";
import { ja } from "./translations/ja";
import { ko } from "./translations/ko";
import { pt } from "./translations/pt";
import { ru } from "./translations/ru";
import { zh } from "./translations/zh";

export const LANGUAGES = [
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
export type Language = (typeof LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = "en";

export const languageMetadata: Record<
  Language,
  { name: string; nativeName: string; rtl?: boolean }
> = {
  en: { name: "English", nativeName: "English" },
  ja: { name: "Japanese", nativeName: "日本語" },
  zh: { name: "Chinese", nativeName: "中文" },
  hi: { name: "Hindi", nativeName: "हिन्दी" },
  es: { name: "Spanish", nativeName: "Español" },
  ar: { name: "Arabic", nativeName: "العربية", rtl: true },
  bn: { name: "Bengali", nativeName: "বাংলা" },
  fr: { name: "French", nativeName: "Français" },
  ru: { name: "Russian", nativeName: "Русский" },
  pt: { name: "Portuguese", nativeName: "Português" },
  id: { name: "Indonesian", nativeName: "Bahasa Indonesia" },
  de: { name: "German", nativeName: "Deutsch" },
  ko: { name: "Korean", nativeName: "한국어" },
};

type DeepStringify<T> = T extends string
  ? string
  : T extends (infer U)[]
    ? DeepStringify<U>[]
    : T extends object
      ? { [K in keyof T]: DeepStringify<T[K]> }
      : T;

export type Translation = DeepStringify<typeof en>;

export const TRANSLATIONS: Record<Language, Translation> = {
  en,
  ja,
  zh,
  hi,
  es,
  ar,
  bn,
  fr,
  ru,
  pt,
  id,
  de,
  ko,
};
