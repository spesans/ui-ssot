"use client";

import React from "react";
import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { DEFAULT_ROUTE_LANGUAGE, getRouteLanguageFromPath, toLocalePath } from "@/lib/locale";

type PanelLinkProps = LinkProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: React.ReactNode;
  };

export function PanelLink({ href, onClick, children, ...rest }: PanelLinkProps) {
  const pathname = usePathname();
  const routeLanguage = getRouteLanguageFromPath(pathname) ?? DEFAULT_ROUTE_LANGUAGE;
  const { scroll: scrollProp, ...restProps } = rest;
  const scroll = scrollProp ?? true;
  const localizedHref =
    typeof href === "string" && href.startsWith("/") && !/^https?:\/\//.test(href)
      ? toLocalePath(href, routeLanguage)
      : href;

  return (
    <Link
      href={localizedHref}
      scroll={scroll}
      onClick={(e) => {
        onClick?.(e);
      }}
      {...restProps}
    >
      {children}
    </Link>
  );
}
