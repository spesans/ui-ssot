import { DEFAULT_ROUTE_LANGUAGE, isRouteLanguage, toLocalePath } from "@/lib/locale";
import { getSeoEntry } from "@/lib/seo";
import { getCanonicalUrl, getNormalizedSiteUrl } from "@/lib/site";

const normalizedSiteUrl = getNormalizedSiteUrl();

type AboutHeadProps = {
  params: Promise<{
    lang: string;
  }>;
};

export default async function Head({ params }: AboutHeadProps) {
  const resolvedParams = await params;
  const lang = isRouteLanguage(resolvedParams.lang) ? resolvedParams.lang : DEFAULT_ROUTE_LANGUAGE;
  const { title, description } = getSeoEntry(lang, "about");
  const canonicalUrl = getCanonicalUrl(toLocalePath("/about", lang));
  const name = title ?? "About";
  const inLanguage = lang === "ja" ? "ja-JP" : "en-US";

  const aboutPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${canonicalUrl}#aboutpage`,
    url: canonicalUrl,
    name,
    description,
    about: {
      "@id": `${normalizedSiteUrl}/#organization`,
    },
    inLanguage,
    isPartOf: {
      "@id": `${normalizedSiteUrl}/#website`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd) }}
    />
  );
}
