import type { Metadata } from "next";
import StaticPage from "../(static)/StaticPage";
import { getStaticPage } from "@/i18n/pages";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/locales";

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale: Locale = isLocale(localeParam) ? localeParam : DEFAULT_LOCALE;
  const content = getStaticPage("contact", locale);

  return {
    title: { absolute: content.metaTitle },
    description: content.metaDescription,
  };
}

export default async function ContactPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale: localeParam } = await params;
  const locale: Locale = isLocale(localeParam) ? localeParam : DEFAULT_LOCALE;
  const content = getStaticPage("contact", locale);

  return <StaticPage content={content} />;
}
