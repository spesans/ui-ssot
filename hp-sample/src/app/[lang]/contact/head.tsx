import { DEFAULT_ROUTE_LANGUAGE, getBcp47Tag, isRouteLanguage, toLocalePath } from "@/lib/locale";
import { getSeoEntry } from "@/lib/seo";
import { getCanonicalUrl, getNormalizedSiteUrl } from "@/lib/site";

const normalizedSiteUrl = getNormalizedSiteUrl();

type ContactHeadProps = {
  params: Promise<{
    lang: string;
  }>;
};

export default async function Head({ params }: ContactHeadProps) {
  const resolvedParams = await params;
  const lang = isRouteLanguage(resolvedParams.lang) ? resolvedParams.lang : DEFAULT_ROUTE_LANGUAGE;
  const { title, description } = getSeoEntry(lang, "contact");
  const canonicalUrl = getCanonicalUrl(toLocalePath("/contact", lang));
  const name = title ?? "Contact";
  const inLanguage = getBcp47Tag(lang);

  const contactPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${canonicalUrl}#contactpage`,
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJsonLd) }}
    />
  );
}
