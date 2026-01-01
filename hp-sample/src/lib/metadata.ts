import type { Metadata } from "next";

import {
  DEFAULT_ROUTE_LANGUAGE,
  ROUTE_LANGUAGES,
  toLocalePath,
  type RouteLanguage,
} from "./locale";
import { getCanonicalUrl, getNormalizedSiteUrl } from "./site";
import { SITE_NAME } from "./config/branding";

const normalizedSiteUrl = getNormalizedSiteUrl();
const ogImageUrl = `${normalizedSiteUrl}/og-image.png`;

const OG_LOCALE: Record<RouteLanguage, string> = {
  en: "en_US",
  ja: "ja_JP",
  zh: "zh_CN",
  hi: "hi_IN",
  es: "es_ES",
  ar: "ar_AR",
  bn: "bn_BD",
  fr: "fr_FR",
  ru: "ru_RU",
  pt: "pt_PT",
  id: "id_ID",
  de: "de_DE",
  ko: "ko_KR",
};

const buildLanguageAlternates = (path: string) => {
  const alternates: Record<string, string> = {};
  for (const lang of ROUTE_LANGUAGES) {
    alternates[lang] = getCanonicalUrl(toLocalePath(path, lang));
  }
  alternates["x-default"] = getCanonicalUrl(toLocalePath(path, DEFAULT_ROUTE_LANGUAGE));
  return alternates;
};

export function createLocalizedMetadata({
  lang,
  path,
  title,
  description,
}: {
  lang: RouteLanguage;
  path: string;
  title?: string;
  description: string;
}): Metadata {
  const canonicalUrl = getCanonicalUrl(toLocalePath(path, lang));
  const ogTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const alternateLocale = ROUTE_LANGUAGES.filter((locale) => locale !== lang).map(
    (locale) => OG_LOCALE[locale],
  );

  return {
    ...(title ? { title } : { title: { absolute: SITE_NAME } }),
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: buildLanguageAlternates(path),
    },
    openGraph: {
      type: "website",
      title: ogTitle,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: OG_LOCALE[lang],
      alternateLocale,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [ogImageUrl],
    },
  };
}

export function createRedirectMetadata(path: string): Metadata {
  return {
    alternates: {
      canonical: getCanonicalUrl(toLocalePath(path, DEFAULT_ROUTE_LANGUAGE)),
      languages: buildLanguageAlternates(path),
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}
