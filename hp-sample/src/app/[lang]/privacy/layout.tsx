import type { Metadata } from "next";
import { createLocalizedMetadata } from "@/lib/metadata";
import { DEFAULT_ROUTE_LANGUAGE, isRouteLanguage } from "@/lib/locale";
import { getSeoEntry } from "@/lib/seo";

type PrivacyLayoutProps = {
  params: Promise<{
    lang: string;
  }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: PrivacyLayoutProps): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = isRouteLanguage(resolvedParams.lang) ? resolvedParams.lang : DEFAULT_ROUTE_LANGUAGE;
  const { title, description } = getSeoEntry(lang, "privacy");
  return createLocalizedMetadata({ lang, path: "/privacy", title, description });
}

export default function PrivacyLayout({ children }: PrivacyLayoutProps) {
  return children;
}
