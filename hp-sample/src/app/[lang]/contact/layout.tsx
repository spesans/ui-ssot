import type { Metadata } from "next";
import { createLocalizedMetadata } from "@/lib/metadata";
import { DEFAULT_ROUTE_LANGUAGE, isRouteLanguage } from "@/lib/locale";
import { getSeoEntry } from "@/lib/seo";

type ContactLayoutProps = {
  params: Promise<{
    lang: string;
  }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: ContactLayoutProps): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = isRouteLanguage(resolvedParams.lang) ? resolvedParams.lang : DEFAULT_ROUTE_LANGUAGE;
  const { title, description } = getSeoEntry(lang, "contact");
  return createLocalizedMetadata({ lang, path: "/contact", title, description });
}

export default function ContactLayout({ children }: ContactLayoutProps) {
  return children;
}
