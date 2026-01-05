"use client";

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, PanelLeft, PanelLeftClose } from "lucide-react";
import {
  clearUiNavigationState,
  readUiNavigationState,
  writeUiNavigationState,
} from "./app-shell/ui-navigation-state";
import { useScrollResponsiveHeader } from "./app-shell/useScrollResponsiveHeader";
import { BRAND } from "@/lib/branding";
import {
  LOCALE_COOKIE_NAME,
  LOCALE_LABELS,
  LOCALES,
  type Locale,
  localeFromPathname,
} from "@/i18n/locales";
import type { UIStrings } from "@/i18n/ui";
import ThemeToggle from "@/components/ThemeToggle";
import styles from "./AppShell.module.css";

type AppShellProps = {
  locale: Locale;
  ui: UIStrings;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

type MenuItem = {
  label: string;
  href: string;
  external?: boolean;
};

function normalizePathname(pathname: string) {
  if (!pathname) return "/";
  const trimmed = pathname.trim();
  if (trimmed === "/") return "/";
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
}

function replaceLocaleInPathname(pathname: string, nextLocale: Locale) {
  const currentLocale = localeFromPathname(pathname);
  if (!currentLocale) {
    const nextPath = pathname === "/" ? `/${nextLocale}` : `/${nextLocale}${pathname}`;
    return nextPath.endsWith("/") ? nextPath : `${nextPath}/`;
  }

  const prefix = `/${currentLocale}`;
  const rest = pathname === prefix ? "" : pathname.slice(prefix.length);
  const nextPath = `/${nextLocale}${rest}`;
  return nextPath.endsWith("/") ? nextPath : `${nextPath}/`;
}

export default function AppShell({ locale, ui, children, footer }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const sidebarHeaderRef = useRef<HTMLDivElement>(null);
  const topControlsRef = useRef<HTMLDivElement>(null);

  useScrollResponsiveHeader({
    sidebarOpen,
    sidebarHeaderRef,
    topControlsRef,
  });

  const activePath = normalizePathname(pathname);

  // Map navigation items using the `ui` prop
  const menuItems = useMemo<MenuItem[]>(
    () => [
      { label: ui.home, href: `/${locale}/` },
      { label: ui.about, href: `/${locale}/about/` },
      { label: ui.privacyPolicy, href: `/${locale}/privacy/` },
      { label: ui.terms, href: `/${locale}/terms/` },
      { label: ui.contact, href: `/${locale}/contact/` },
    ],
    [locale, ui],
  );

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
    setLangMenuOpen(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleNavigate = useCallback(() => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      closeSidebar();
    }
  }, [closeSidebar]);

  const handleLanguageSelect = (nextLocale: Locale) => {
    if (nextLocale === locale) {
      setLangMenuOpen(false);
      return;
    }

    writeUiNavigationState({
      sidebarOpen,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    });

    const basePathname = pathname;
    const nextPath = replaceLocaleInPathname(basePathname, nextLocale);

    try {
      window.localStorage.setItem(LOCALE_COOKIE_NAME, nextLocale);
    } catch {
      // ignore
    }

    setLangMenuOpen(false);
    router.push(nextPath, { scroll: false });
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

  useEffect(() => {
    if (!sidebarOpen) return;

    const media = window.matchMedia("(max-width: 767px)");
    if (!media.matches) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

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

  const renderMenuItems = (items: MenuItem[], onNavigate?: () => void) => {
    return items.map((item) => {
      const isActive = activePath === normalizePathname(item.href);

      const className = `${styles.navItem} ${isActive ? styles.navItemActive : ""}`;

      return (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive ? "page" : undefined}
          onClick={() => {
            onNavigate?.();
          }}
          className={className}
        >
          {item.label}
        </Link>
      );
    });
  };

  return (
    <div className={styles.shell}>
      <a href="#main-content" className={styles.skipLink}>
        {ui.skipToContent}
      </a>

      <aside
        id="site-sidebar"
        className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}
      >
        <div className={styles.sidebarInner}>
          <div
            ref={sidebarHeaderRef}
            className={`${styles.sidebarHeader} sidebar-header`}
            data-stage="1"
            style={{ "--scroll-progress": 0 } as React.CSSProperties}
          >
            <div className={`${styles.sidebarHeaderRow} sidebar-header__row`}>
              <Link
                href={`/${locale}/`}
                className={styles.brandLink}
                aria-label={`${BRAND.name} home`}
              >
                <span className={`${styles.logoFull} logo-full`}>{BRAND.wordmark}</span>
                <span className={`${styles.logoSquare} logo-square`}>{BRAND.monogram}</span>
              </Link>

              <button
                type="button"
                onClick={toggleSidebar}
                className={`${styles.sidebarToggle} sidebar-toggle`}
                aria-label={sidebarOpen ? ui.closeNavigation : ui.openNavigation}
                aria-expanded={sidebarOpen}
                aria-controls="site-sidebar"
              >
                {sidebarOpen ? (
                  <PanelLeftClose className={styles.icon} aria-hidden="true" />
                ) : (
                  <PanelLeft className={styles.icon} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {sidebarOpen && (
            <div className={styles.sidebarContent}>
              <nav className={styles.nav}>{renderMenuItems(menuItems, handleNavigate)}</nav>

              <div className={styles.languageArea}>
                <div className={styles.languageRoot} data-lang-menu>
                  <button
                    type="button"
                    onClick={() => {
                      setLangMenuOpen(!langMenuOpen);
                    }}
                    className={`${styles.languageButton} ${langMenuOpen ? styles.languageButtonOpen : ""}`}
                    aria-expanded={langMenuOpen}
                    aria-haspopup="listbox"
                    aria-label={ui.selectLanguage}
                  >
                    <span className={styles.languageButtonLeft}>
                      <span className={styles.languageLabel}>{LOCALE_LABELS[locale]}</span>
                    </span>
                    <ChevronDown
                      className={`${styles.languageChevron} ${langMenuOpen ? styles.languageChevronOpen : ""}`}
                      aria-hidden="true"
                    />
                  </button>

                  {langMenuOpen && (
                    <div
                      className={styles.languageMenu}
                      role="listbox"
                      aria-label={ui.selectLanguage}
                    >
                      {LOCALES.map((optionLocale) => (
                        <button
                          key={optionLocale}
                          type="button"
                          role="option"
                          aria-selected={locale === optionLocale}
                          onClick={() => {
                            handleLanguageSelect(optionLocale);
                          }}
                          className={`${styles.languageOption} ${
                            locale === optionLocale ? styles.languageOptionActive : ""
                          }`}
                        >
                          {LOCALE_LABELS[optionLocale]}
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

      {sidebarOpen && <div aria-hidden="true" onClick={closeSidebar} className={styles.overlay} />}

      <div ref={topControlsRef} className={`${styles.topControls} top-controls`} data-stage="1">
        <ThemeToggle ariaLabel={ui.toggleTheme} />
      </div>

      <div className={`${styles.content} ${sidebarOpen ? styles.contentShifted : ""}`}>
        <main id="main-content" tabIndex={-1} className={styles.main}>
          {children}
        </main>
        {footer}
      </div>
    </div>
  );
}
