import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { LanguageProvider } from "@/lib/LanguageContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import { Footer } from "@/components/Footer";
import { AppShell } from "@/components/AppShell";
import { SITE_NAME } from "@/lib/config/branding";
import { COMPANY_NAME_VARIANTS, buildStructuredData } from "@/lib/config/site";
import { getLanguageInitScript, getThemeInitScript } from "@/lib/inline-scripts";
import { DEFAULT_ROUTE_LANGUAGE, isRouteLanguage, ROUTE_LANGUAGES } from "@/lib/locale";
import { getNormalizedSiteUrl } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const normalizedSiteUrl = getNormalizedSiteUrl();
const structuredData = buildStructuredData();
const themeInitScript = getThemeInitScript();
const languageInitScript = getLanguageInitScript();

export const metadata: Metadata = {
  metadataBase: new URL(normalizedSiteUrl),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  keywords: COMPANY_NAME_VARIANTS,
  applicationName: SITE_NAME,
};

export const dynamic = "force-static";

export function generateStaticParams() {
  return ROUTE_LANGUAGES.map((lang) => ({ lang }));
}

type LangLayoutProps = {
  params: Promise<{
    lang: string;
  }>;
  children: React.ReactNode;
};

export default async function LangLayout({ children, params }: LangLayoutProps) {
  const resolvedParams = await params;
  const routeLang = isRouteLanguage(resolvedParams.lang)
    ? resolvedParams.lang
    : DEFAULT_ROUTE_LANGUAGE;

  return (
    <html lang={routeLang} className={inter.variable} suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
        <script
          dangerouslySetInnerHTML={{
            __html: themeInitScript,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: languageInitScript,
          }}
        />
      </head>
      <body className="bg-background text-foreground font-sans selection:bg-primary selection:text-white">
        <ThemeProvider>
          <LanguageProvider>
            <AppShell footer={<Footer />}>{children}</AppShell>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
