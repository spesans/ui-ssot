"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BRAND } from "@/lib/branding";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_COOKIE_NAME,
  LOCALE_LABELS,
  isLocale,
  type Locale,
} from "@/i18n/locales";

function baseLanguage(tag: string) {
  const normalized = tag.trim().replaceAll("_", "-").toLowerCase();
  const primary = normalized.split("-")[0];
  return primary === "in" ? "id" : primary;
}

function pickLocaleFromNavigator(): Locale {
  const languages = navigator.languages.length ? navigator.languages : [navigator.language];

  for (const language of languages) {
    const base = baseLanguage(language);
    if (isLocale(base)) return base;
  }

  return DEFAULT_LOCALE;
}

export default function IndexPage() {
  const router = useRouter();

  const localeLinks = useMemo(() => {
    return LOCALES.map((locale) => ({
      locale,
      href: `/${locale}/`,
      label: LOCALE_LABELS[locale],
    }));
  }, []);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(LOCALE_COOKIE_NAME);
    } catch {
      stored = null;
    }

    const locale = isLocale(stored) ? stored : pickLocaleFromNavigator();
    router.replace(`/${locale}/`);
  }, [router]);

  return (
    <main className="container" style={{ paddingBlock: "48px" }}>
      <h1 style={{ margin: 0 }}>{BRAND.name}</h1>
      <p aria-live="polite" style={{ marginTop: 12 }}>
        Redirecting…
      </p>

      <noscript>
        <p>JavaScript is required for automatic locale selection.</p>
        <p>Please choose your language:</p>
        <ul>
          {localeLinks.map((link) => (
            <li key={link.locale}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </noscript>
    </main>
  );
}
