import AppShell from "@/components/AppShell";
import Footer from "@/components/Footer";
import { DEFAULT_LOCALE, LOCALES, isLocale, isRtlLocale, type Locale } from "@/i18n/locales";
import { getUIStrings } from "@/i18n/ui";

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: localeParam } = await params;
  const locale: Locale = isLocale(localeParam) ? localeParam : DEFAULT_LOCALE;
  const ui = getUIStrings(locale);

  return (
    <div lang={locale} dir={isRtlLocale(locale) ? "rtl" : "ltr"}>
      <AppShell locale={locale} ui={ui} footer={<Footer />}>
        {children}
      </AppShell>
    </div>
  );
}
