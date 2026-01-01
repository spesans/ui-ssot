import type { MetadataRoute } from "next";
import { getNormalizedSiteUrl } from "@/lib/site";

export const dynamic = "force-static";

const normalizedSiteUrl = getNormalizedSiteUrl();
const { host } = new URL(normalizedSiteUrl);

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${normalizedSiteUrl}/sitemap.xml`,
    host,
  };
}
