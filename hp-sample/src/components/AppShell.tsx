"use client";

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Globe, Moon, PanelLeft, PanelLeftClose, Sun } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { LANGUAGES, languageMetadata, type Language } from "@/lib/dictionary";
import { NAVIGATION_ITEMS } from "@/lib/config/navigation";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { useTheme } from "@/lib/ThemeContext";
import {
  DEFAULT_ROUTE_LANGUAGE,
  getRouteLanguageFromPath,
  isRouteLanguage,
  normalizePath,
  stripLocaleFromPath,
  toLocalePath,
} from "@/lib/locale";
import { SITE_NAME, SITE_NAME_SHORT } from "@/lib/config/branding";
import {
  clearUiNavigationState,
  readUiNavigationState,
  writeUiNavigationState,
} from "./app-shell/ui-navigation-state";
import { useScrollResponsiveHeader } from "./app-shell/useScrollResponsiveHeader";

type AppShellProps = {
  children: React.ReactNode;
  footer?: React.ReactNode;
};

type MenuItem = {
  label: string;
  href?: string;
  external?: boolean;
};

const getHashFromHref = (href: string) => {
  const hashIndex = href.indexOf("#");
  return hashIndex === -1 ? "" : href.slice(hashIndex);
};

const getPathFromHref = (href: string) => {
  const hashIndex = href.indexOf("#");
  const path = hashIndex === -1 ? href : href.slice(0, hashIndex);
  return normalizePath(path || "/");
};

const NAVIGATION_HASHES = new Set(
  NAVIGATION_ITEMS.map((item) => getHashFromHref(item.href)).filter((hash) => hash.length > 0),
);

export function AppShell({ children, footer }: AppShellProps) {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");

  const sidebarHeaderRef = useRef<HTMLDivElement>(null);
  const topControlsRef = useRef<HTMLDivElement>(null);

  useScrollResponsiveHeader({
    sidebarOpen,
    sidebarHeaderRef,
    topControlsRef,
  });

  const isMobileViewport = useMediaQuery("(max-width: 767px)");
  const normalizedPathname = normalizePath(stripLocaleFromPath(pathname));
  const routeLanguage = getRouteLanguageFromPath(pathname) ?? DEFAULT_ROUTE_LANGUAGE;

  const menuItems = useMemo<MenuItem[]>(
    () =>
      NAVIGATION_ITEMS.map((item) => ({
        href: item.href,
        label: item.key === "business" ? t.home.businessTitle : t.nav[item.key],
        external: item.external,
      })),
    [t],
  );

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
    setLangMenuOpen(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleNavigate = useCallback(() => {
    if (isMobileViewport) {
      closeSidebar();
    }
  }, [closeSidebar, isMobileViewport]);

  const isHrefActive = (href?: string) => {
    if (!href) return false;

    const hrefHash = getHashFromHref(href);
    const hrefPath = getPathFromHref(href);

    if (hrefHash) {
      return normalizedPathname === hrefPath && activeHash === hrefHash;
    }

    if (hrefPath === "/" && normalizedPathname === "/" && NAVIGATION_HASHES.has(activeHash)) {
      return false;
    }

    return normalizedPathname === hrefPath;
  };

  const renderMenuItems = (
    variant: "desktop" | "mobile",
    items: MenuItem[],
    onNavigate?: () => void,
  ) => {
    return items.map((item) => {
      const isActive = isHrefActive(item.href);

      const baseClasses =
        variant === "mobile"
          ? "relative flex items-center gap-2 justify-between w-full py-3 text-2xl font-medium tracking-tight transition-colors"
          : "relative flex items-center gap-2 justify-between w-full px-4 py-2.5 min-h-[40px] rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-indicator)]";

      const activeClasses =
        variant === "mobile"
          ? isActive
            ? "text-[var(--foreground)] font-semibold"
            : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
          : isActive
            ? "text-[var(--foreground)] bg-[var(--surface-2)]"
            : "text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]";

      const className = `${baseClasses} ${activeClasses}`;

      if (!item.href) {
        return (
          <div key={item.label} className={className} aria-disabled="true">
            {item.label}
          </div>
        );
      }

      const itemHref = item.href;
      const isExternal = item.external === true || /^https?:\/\//.test(itemHref);

      if (isExternal) {
        return (
          <a
            key={item.label}
            href={itemHref}
            target="_blank"
            rel="noreferrer"
            onClick={onNavigate}
            className={className}
          >
            <span className="flex-1 text-start">{item.label}</span>
            <span className="text-[var(--text-subtle)] text-sm" aria-hidden>
              ↗
            </span>
          </a>
        );
      }

      const localizedHref = toLocalePath(itemHref, routeLanguage);

      return (
        <Link
          key={itemHref}
          href={localizedHref}
          aria-current={isActive ? "page" : undefined}
          onClick={() => {
            setActiveHash(getHashFromHref(itemHref));
            onNavigate?.();
          }}
          className={className}
        >
          {item.label}
        </Link>
      );
    });
  };

  useEffect(() => {
    if (!langMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const { target } = event;
      if (!(target instanceof HTMLElement)) return;
      if (!target.closest("[data-lang-menu]")) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [langMenuOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setActiveHash(window.location.hash);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncHash = () => {
      setActiveHash(window.location.hash);
    };
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);
    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", syncHash);
    };
  }, []);

  useEffect(() => {
    if (!sidebarOpen && !langMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      closeSidebar();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeSidebar, langMenuOpen, sidebarOpen]);

  useLayoutEffect(() => {
    const pending = readUiNavigationState();
    if (!pending) return;

    if (pending.sidebarOpen) {
      setSidebarOpen(true);
    }

    const shouldRestoreScroll =
      Math.abs(window.scrollX - pending.scrollX) > 2 ||
      Math.abs(window.scrollY - pending.scrollY) > 2;
    if (shouldRestoreScroll) {
      const previousScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      try {
        window.scrollTo(pending.scrollX, pending.scrollY);
      } finally {
        document.documentElement.style.scrollBehavior = previousScrollBehavior;
      }
    }

    clearUiNavigationState();
  }, [pathname]);

  const handleLanguageSelect = (lang: Language) => {
    const shouldNavigateToRouteLanguage = isRouteLanguage(lang);
    const nextPath = shouldNavigateToRouteLanguage ? toLocalePath(normalizedPathname, lang) : null;
    const shouldNavigate =
      Boolean(nextPath) && normalizePath(pathname) !== normalizePath(nextPath ?? "/");

    if (shouldNavigate) {
      writeUiNavigationState({
        sidebarOpen,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
      });
    }

    setLanguage(lang);
    setLangMenuOpen(false);

    if (shouldNavigate && nextPath) {
      router.push(nextPath, { scroll: false });
    }
  };

  const renderControls = () => (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggleTheme}
        className="flex items-center justify-center w-9 h-9 md:w-8 md:h-8 rounded-full text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent-subtle)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-indicator)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
        aria-label={t.a11y.toggleTheme}
      >
        {theme === "dark" ? (
          <Sun className="w-[18px] h-[18px]" />
        ) : (
          <Moon className="w-[18px] h-[18px]" />
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[var(--background)] text-[var(--foreground)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-[var(--background)] focus:text-[var(--foreground)] focus:px-3 focus:py-2 focus:rounded-md focus:ring-2 focus:ring-[var(--accent-indicator)]"
      >
        {t.a11y.skipToContent}
      </a>

      <aside
        id="site-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex flex-col ${
          sidebarOpen
            ? "w-[var(--sidebar-width)] border-r border-[var(--border-color)] bg-[var(--background)]"
            : "w-0 border-r-0 bg-transparent"
        }`}
      >
        <div className="flex h-full flex-col py-3 md:py-4">
          <div
            ref={sidebarHeaderRef}
            className="sidebar-header w-[var(--sidebar-width)] overflow-x-visible overflow-y-hidden shrink-0"
            data-stage="1"
            style={{ "--scroll-progress": 0 } as React.CSSProperties}
          >
            <div className="sidebar-header__row pl-4 pr-3 flex items-center justify-between gap-2">
              <Link
                href={toLocalePath("/", routeLanguage)}
                className="min-w-0 flex-1 text-sm md:text-base font-semibold tracking-tight whitespace-nowrap relative"
                aria-label={`${SITE_NAME} ${t.nav.home}`}
              >
                <span className="logo-full relative flex items-center h-[var(--brand-logo-height)] w-[min(var(--brand-logo-full-max-width),calc(100vw-var(--brand-logo-viewport-safe-offset)))] max-w-full text-[length:var(--brand-logo-font-size)] font-bold tracking-tighter">
                  {SITE_NAME}
                </span>
                <span className="logo-square absolute left-0 top-1/2 opacity-0 pointer-events-none inline-flex items-center justify-center h-[var(--brand-logo-square-size)] w-[var(--brand-logo-square-size)] text-[length:var(--brand-logo-font-size)] font-bold tracking-tighter">
                  {SITE_NAME_SHORT}
                </span>
              </Link>

              <button
                type="button"
                onClick={toggleSidebar}
                className="sidebar-toggle shrink-0 flex items-center justify-center w-9 h-9 md:w-8 md:h-8 rounded-lg text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent-subtle)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-indicator)]"
                aria-label={sidebarOpen ? t.a11y.closeNavigation : t.a11y.openNavigation}
                aria-expanded={sidebarOpen}
                aria-controls="site-sidebar"
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="w-[18px] h-[18px]" />
                ) : (
                  <PanelLeft className="w-[18px] h-[18px]" />
                )}
              </button>
            </div>
          </div>

          {sidebarOpen && (
            <div className="pl-4 pr-3 flex-1 flex flex-col">
              <div className="flex-1 flex items-center">
                <nav className="flex flex-col gap-0.5 w-full">
                  {renderMenuItems("desktop", menuItems, handleNavigate)}
                </nav>
              </div>

              <div className="pt-6 pb-1">
                <div className="relative" data-lang-menu>
                  <button
                    type="button"
                    onClick={() => {
                      setLangMenuOpen(!langMenuOpen);
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 min-h-[40px] rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-indicator)] ${
                      langMenuOpen
                        ? "bg-[var(--surface-2)] text-[var(--foreground)]"
                        : "text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                    }`}
                    aria-expanded={langMenuOpen}
                    aria-haspopup="listbox"
                    aria-label={t.a11y.selectLanguage}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <Globe className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{languageMetadata[language].nativeName}</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 flex-shrink-0 transition-transform ${langMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {langMenuOpen && (
                    <div
                      className="absolute bottom-full left-0 mb-2 py-2 bg-[var(--surface-2)] border border-[var(--border-color)] rounded-xl shadow-lg w-full max-h-[min(320px,calc(100vh-6rem))] overflow-y-auto overflow-x-hidden z-50"
                      role="listbox"
                      aria-label={t.a11y.selectLanguage}
                    >
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          role="option"
                          aria-selected={language === lang}
                          onClick={() => {
                            handleLanguageSelect(lang);
                          }}
                          className={`w-full px-4 py-2 text-start text-sm transition-colors ${
                            language === lang
                              ? "bg-[var(--accent-subtle)] text-[var(--foreground)] font-medium"
                              : "text-[var(--text-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--foreground)]"
                          }`}
                        >
                          {languageMetadata[lang].nativeName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {sidebarOpen && (
        <div
          aria-hidden="true"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-[var(--overlay)] backdrop-blur-sm md:hidden"
        />
      )}

      <div
        ref={topControlsRef}
        className="top-controls fixed top-[calc(env(safe-area-inset-top)+0.5rem)] right-[calc(env(safe-area-inset-right)+0.5rem)] md:top-4 md:right-4 z-40 flex items-center will-change-transform transition-transform transition-opacity duration-200 ease-out translate-y-0 opacity-100"
        data-stage="1"
      >
        {renderControls()}
      </div>

      <div
        className={`flex flex-col flex-1 ${sidebarOpen ? "md:pl-[var(--sidebar-width)]" : "pl-0"}`}
      >
        <main id="main-content" tabIndex={-1} className="flex-1 relative">
          {children}
        </main>
        {footer}
      </div>
    </div>
  );
}
