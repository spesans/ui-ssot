import type { MetadataRoute } from "next";
import { ROUTE_LANGUAGES, toLocalePath } from "@/lib/locale";
import { getCanonicalUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/", "/about", "/contact", "/legal", "/privacy", "/terms"];

  return ROUTE_LANGUAGES.flatMap((lang) =>
    routes.map((route) => ({
      url: getCanonicalUrl(toLocalePath(route, lang)),
    })),
  );
}
