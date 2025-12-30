import type { Metadata } from "next";
import { HomeContent } from "@/components/HomeContent";
import { DEFAULT_ROUTE_LANGUAGE, isRouteLanguage } from "@/lib/locale";
import { createLocalizedMetadata } from "@/lib/metadata";
import { getSeoEntry } from "@/lib/seo";

type HomePageProps = {
  params: Promise<{
    lang: string;
  }>;
};

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = isRouteLanguage(resolvedParams.lang) ? resolvedParams.lang : DEFAULT_ROUTE_LANGUAGE;
  const { description } = getSeoEntry(lang, "home");
  return createLocalizedMetadata({ lang, path: "/", description });
}

export default function Home() {
  return <HomeContent />;
}
