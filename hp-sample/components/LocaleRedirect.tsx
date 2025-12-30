"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { resolvePreferredRouteLanguage, stripLocaleFromPath, toLocalePath } from "@/lib/locale";

type LocaleRedirectProps = {
  targetPath?: string;
};

export function LocaleRedirect({ targetPath }: LocaleRedirectProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const basePath = targetPath ?? stripLocaleFromPath(pathname);
    const preferred = resolvePreferredRouteLanguage();
    const nextPath = toLocalePath(basePath, preferred);
    const suffix =
      typeof window === "undefined" ? "" : `${window.location.search}${window.location.hash}`;
    router.replace(`${nextPath}${suffix}`);
  }, [router, pathname, targetPath]);

  return null;
}
