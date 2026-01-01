import { getCanonicalUrl, getNormalizedSiteUrl } from "@/lib/site";
import { ROUTE_LANGUAGES, getBcp47Tag } from "@/lib/locale";

export const COMPANY_NAME_VARIANTS = ["Sample", "Sample Inc."];

const ORGANIZATION_NAME = "Sample";
const ORGANIZATION_LEGAL_NAME = "Sample Inc.";

export const buildStructuredData = () => {
  const normalizedSiteUrl = getNormalizedSiteUrl();
  const canonicalUrl = getCanonicalUrl("/");
  const iconUrl = `${normalizedSiteUrl}/favicon.ico`;

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${canonicalUrl}#organization`,
    url: canonicalUrl,
    name: ORGANIZATION_NAME,
    legalName: ORGANIZATION_LEGAL_NAME,
    alternateName: COMPANY_NAME_VARIANTS,
    logo: iconUrl,
    foundingDate: "202X-01-01",
    founder: {
      "@type": "Person",
      name: "Representative Name",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "123 Example Street",
      addressLocality: "Example City",
      addressRegion: "CA",
      postalCode: "12345",
      addressCountry: "US",
    },
    sameAs: [canonicalUrl],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${canonicalUrl}#website`,
    url: canonicalUrl,
    name: ORGANIZATION_NAME,
    alternateName: COMPANY_NAME_VARIANTS,
    inLanguage: ROUTE_LANGUAGES.map(getBcp47Tag),
    publisher: {
      "@id": `${canonicalUrl}#organization`,
    },
  };

  return JSON.stringify([organizationJsonLd, websiteJsonLd]);
};
