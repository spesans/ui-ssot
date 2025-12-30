export type NavigationItemKey =
  | "home"
  | "business"
  | "about"
  | "contact"
  | "privacy"
  | "terms"
  | "legal";

export type NavigationItem = {
  key: NavigationItemKey;
  href: string;
  external?: boolean;
};

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { key: "home", href: "/" },
  { key: "business", href: "/#business" },
  { key: "about", href: "/#company" },
  { key: "contact", href: "/#contact" },
  { key: "privacy", href: "/privacy" },
  { key: "terms", href: "/terms" },
  { key: "legal", href: "/legal" },
];
