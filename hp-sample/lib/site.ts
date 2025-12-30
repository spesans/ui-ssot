import { publicEnv } from "./env/public";

export function getNormalizedSiteUrl(siteUrl: string = publicEnv.NEXT_PUBLIC_SITE_URL) {
  return siteUrl.endsWith("/") ? siteUrl.slice(0, -1) : siteUrl;
}

export function getCanonicalUrl(pathname: string) {
  const baseUrl = getNormalizedSiteUrl();
  const rawPath = pathname?.trim() || "/";
  const path = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  const withTrailingSlash = path.endsWith("/") ? path : `${path}/`;
  return `${baseUrl}${withTrailingSlash === "/" ? "/" : withTrailingSlash}`;
}
