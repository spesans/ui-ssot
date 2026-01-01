import type { Metadata } from "next";
import { createLocalizedMetadata } from "@/lib/metadata";
import { DEFAULT_ROUTE_LANGUAGE, isRouteLanguage } from "@/lib/locale";
import { getSeoEntry } from "@/lib/seo";

type LegalLayoutProps = {
  params: Promise<{
    lang: string;
  }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: LegalLayoutProps): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = isRouteLanguage(resolvedParams.lang) ? resolvedParams.lang : DEFAULT_ROUTE_LANGUAGE;
  const { title, description } = getSeoEntry(lang, "legal");
  return createLocalizedMetadata({ lang, path: "/legal", title, description });
}

export default function LegalLayout({ children }: LegalLayoutProps) {
  return children;
}
