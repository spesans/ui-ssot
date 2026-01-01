import { DEFAULT_ROUTE_LANGUAGE, toLocalePath, withTrailingSlash } from "@/lib/locale";

export default function Head() {
  const href = withTrailingSlash(toLocalePath("/legal", DEFAULT_ROUTE_LANGUAGE));
  return (
    <noscript>
      <meta httpEquiv="refresh" content={`0;url=${href}`} />
    </noscript>
  );
}
