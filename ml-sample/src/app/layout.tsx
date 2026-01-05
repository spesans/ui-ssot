import type { Metadata } from "next";
import { ThemeProvider } from "@/lib/ThemeContext";
import "./globals.css";
import { BRAND } from "@/lib/branding";
import { DEFAULT_LOCALE, isLocale, isRtlLocale, type Locale } from "@/i18n/locales";
import { getThemeInitScript } from "@/lib/inline-scripts";

export const metadata: Metadata = {
  title: {
    default: BRAND.name,
    template: `%s | ${BRAND.name}`,
  },
  description: "A template-ready music library UI sample.",
  icons: {
    icon: [
      {
        url: "/brand/icon-dark.svg",
        type: "image/svg+xml",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/brand/icon-light.svg",
        type: "image/svg+xml",
        media: "(prefers-color-scheme: light)",
      },
    ],
  },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params?: Promise<{ locale?: string }>;
}>) {
  const resolvedParams = params ? await params : undefined;
  const localeParam = resolvedParams?.locale;
  const locale: Locale =
    typeof localeParam === "string" && isLocale(localeParam) ? localeParam : DEFAULT_LOCALE;

  const themeInitScript = getThemeInitScript();

  return (
    <html
      lang={locale}
      dir={isRtlLocale(locale) ? "rtl" : "ltr"}
      data-theme="dark"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
