import type { Metadata } from "next";
import { createLocalizedMetadata } from "@/lib/metadata";
import { DEFAULT_ROUTE_LANGUAGE, isRouteLanguage } from "@/lib/locale";
import { getSeoEntry } from "@/lib/seo";

type AboutLayoutProps = {
  params: Promise<{
    lang: string;
  }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: AboutLayoutProps): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = isRouteLanguage(resolvedParams.lang) ? resolvedParams.lang : DEFAULT_ROUTE_LANGUAGE;
  const { title, description } = getSeoEntry(lang, "about");
  return createLocalizedMetadata({ lang, path: "/about", title, description });
}

export default function AboutLayout({ children }: AboutLayoutProps) {
  return children;
}
