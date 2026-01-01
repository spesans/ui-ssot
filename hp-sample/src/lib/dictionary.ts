import { en } from "./translations/en";
import { ja } from "./translations/ja";

export const LANGUAGES = ["en", "ja"] as const;
export type Language = (typeof LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = "en";

export const languageMetadata: Record<
  Language,
  { name: string; nativeName: string; rtl?: boolean }
> = {
  ja: { name: "Japanese", nativeName: "日本語" },
  en: { name: "English", nativeName: "English" },
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
};
