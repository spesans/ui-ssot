import type { Metadata } from "next";
import { createLocalizedMetadata } from "@/lib/metadata";
import { DEFAULT_ROUTE_LANGUAGE, isRouteLanguage } from "@/lib/locale";
import { getSeoEntry } from "@/lib/seo";

type TermsLayoutProps = {
  params: Promise<{
    lang: string;
  }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: TermsLayoutProps): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = isRouteLanguage(resolvedParams.lang) ? resolvedParams.lang : DEFAULT_ROUTE_LANGUAGE;
  const { title, description } = getSeoEntry(lang, "terms");
  return createLocalizedMetadata({ lang, path: "/terms", title, description });
}

export default function TermsLayout({ children }: TermsLayoutProps) {
  return children;
}
