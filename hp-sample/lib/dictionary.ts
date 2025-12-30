import { ja } from "./translations/ja";
import { en } from "./translations/en";

export type Language = "ja" | "en";

export const LANGUAGES: Language[] = ["en", "ja"];

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

export const DEFAULT_LANGUAGE: Language = "en";
export type Translation = DeepStringify<typeof ja>;
export const defaultTranslation = en;

const translationCache: Partial<Record<Language, Translation>> = {
  en,
  ja,
};

const translationListeners = new Set<() => void>();
const translationPromises: Partial<Record<Language, Promise<Translation>>> = {};

const translationLoaders: Record<Language, () => Promise<Translation>> = {
  ja: () => Promise.resolve(ja),
  en: () => Promise.resolve(en),
};

export const getCachedTranslation = (language: Language) => translationCache[language];

export const subscribeTranslations = (listener: () => void) => {
  translationListeners.add(listener);
  return () => translationListeners.delete(listener);
};

export const loadTranslation = async (language: Language) => {
  const cached = translationCache[language];
  if (cached) return cached;
  const pending = translationPromises[language];
  if (pending) return pending;

  const promise = translationLoaders[language]()
    .then((translation) => {
      translationCache[language] = translation;
      translationPromises[language] = undefined;
      translationListeners.forEach((listener) => listener());
      return translation;
    })
    .catch((error) => {
      translationPromises[language] = undefined;
      throw error;
    });

  translationPromises[language] = promise;
  return promise;
};
