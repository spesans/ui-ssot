"use client";

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Moon, Sun, PanelLeft, PanelLeftClose, Globe, ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { LANGUAGES, languageMetadata, type Language } from "@/lib/dictionary";
import { NAVIGATION_ITEMS } from "@/lib/config/navigation";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { useTheme } from "@/lib/ThemeContext";
import { UI_NAVIGATION_STATE_KEY } from "@/lib/storage-keys";
import {
  DEFAULT_ROUTE_LANGUAGE,
  getRouteLanguageFromPath,
  isRouteLanguage,
  normalizePath,
  stripLocaleFromPath,
  toLocalePath,
} from "@/lib/locale";
import { SITE_NAME, SITE_NAME_SHORT } from "@/lib/config/branding";

type AppShellProps = {
  children: React.ReactNode;
  footer?: React.ReactNode;
};

type MenuItem = {
  label: string;
  href?: string;
  external?: boolean;
  children?: MenuItem[];
};

const UI_NAVIGATION_STATE_TTL_MS = 10_000;

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

type UiNavigationState = {
  sidebarOpen: boolean;
  scrollX: number;
  scrollY: number;
  createdAt: number;
};

const readUiNavigationState = (): UiNavigationState | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(UI_NAVIGATION_STATE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<UiNavigationState> | null;
    if (!parsed || typeof parsed.createdAt !== "number") return null;

    if (Date.now() - parsed.createdAt > UI_NAVIGATION_STATE_TTL_MS) {
      window.sessionStorage.removeItem(UI_NAVIGATION_STATE_KEY);
      return null;
    }

    if (
      typeof parsed.sidebarOpen !== "boolean" ||
      typeof parsed.scrollX !== "number" ||
      typeof parsed.scrollY !== "number"
    ) {
      window.sessionStorage.removeItem(UI_NAVIGATION_STATE_KEY);
      return null;
    }

    return parsed as UiNavigationState;
  } catch {
    return null;
  }
};

const writeUiNavigationState = (state: Omit<UiNavigationState, "createdAt">) => {
  if (typeof window === "undefined") return;
  try {
    const payload: UiNavigationState = { ...state, createdAt: Date.now() };
    window.sessionStorage.setItem(UI_NAVIGATION_STATE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
};

const clearUiNavigationState = () => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(UI_NAVIGATION_STATE_KEY);
  } catch {
    // ignore
  }
};

export function AppShell({ children, footer }: AppShellProps) {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  // Sidebar state (unified for mobile and desktop)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");

  const sidebarHeaderRef = useRef<HTMLDivElement>(null);
  const topControlsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const prefersMobileLayout = window.matchMedia("(max-width: 767px)");
    let isMobileLayout = prefersMobileLayout.matches;
    let rafId = 0;
    let latestScrollY = window.scrollY;
    let lastAppliedScrollY = window.scrollY;

    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

    const setInteractiveHidden = (element: HTMLElement | null, hidden: boolean) => {
      if (!element) return;

      const isHidden = element.getAttribute("aria-hidden") === "true";
      if (isHidden === hidden) return;

      if (hidden) {
        element.setAttribute("aria-hidden", "true");
        element.setAttribute("inert", "");
      } else {
        element.removeAttribute("aria-hidden");
        element.removeAttribute("inert");
      }

      const focusables = element.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]",
      );

      focusables.forEach((node) => {
        if (hidden) {
          if (node.hasAttribute("data-prev-tabindex")) return;
          const previousTabIndex = node.getAttribute("tabindex") ?? "";
          node.setAttribute("data-prev-tabindex", previousTabIndex);
          node.setAttribute("tabindex", "-1");
          return;
        }

        const previousTabIndex = node.getAttribute("data-prev-tabindex");
        if (previousTabIndex === null) return;
        node.removeAttribute("data-prev-tabindex");

        if (previousTabIndex === "") {
          node.removeAttribute("tabindex");
        } else {
          node.setAttribute("tabindex", previousTabIndex);
        }
      });

      if (hidden) {
        const active = document.activeElement;
        if (active instanceof HTMLElement && element.contains(active)) {
          active.blur();
        }
      }
    };

    const setStages = ({
      headerStage,
      topControlsStage,
    }: {
      headerStage: string;
      topControlsStage: string;
    }) => {
      const sidebarHeader = sidebarHeaderRef.current;
      if (sidebarHeader && sidebarHeader.dataset.stage !== headerStage) {
        sidebarHeader.dataset.stage = headerStage;
      }

      const topControls = topControlsRef.current;
      if (topControls && topControls.dataset.stage !== topControlsStage) {
        topControls.dataset.stage = topControlsStage;
      }
    };

    const update = () => {
      rafId = 0;

      const sidebarHeader = sidebarHeaderRef.current;
      if (!sidebarHeader) return;

      if (prefersReducedMotion.matches) {
        sidebarHeader.style.setProperty("--scroll-progress", "0");
        setStages({ headerStage: "1", topControlsStage: "1" });
        setInteractiveHidden(sidebarHeader, false);
        setInteractiveHidden(topControlsRef.current, false);
        lastAppliedScrollY = latestScrollY;
        return;
      }

      const scrollY = Math.max(0, latestScrollY);
      const deltaY = scrollY - lastAppliedScrollY;
      lastAppliedScrollY = scrollY;

      const progress = clamp(scrollY / 120, 0, 1);

      const stage2Threshold = 40;
      const desktopStage3Threshold = Math.max(480, Math.round(window.innerHeight * 1.2));
      const stage3Threshold = isMobileLayout ? stage2Threshold : desktopStage3Threshold;

      // Desktop: 1 (<40px) -> 2 (icon) -> 3 (hidden).
      // Mobile: 1 (wordmark) -> 3 (hidden).
      let stage: "1" | "2" | "3" = "1";
      if (scrollY >= stage3Threshold) {
        stage = "3";
      } else if (!isMobileLayout && scrollY >= stage2Threshold) {
        stage = "2";
      }

      // If the user scrolls up even slightly, immediately reveal again.
      if (stage === "3" && deltaY < 0) {
        stage = isMobileLayout ? "1" : "2";
      }

      const headerStage = sidebarOpen ? "1" : stage;
      const headerProgress = sidebarOpen ? 0 : progress;
      sidebarHeader.style.setProperty("--scroll-progress", headerProgress.toString());

      setStages({
        topControlsStage: stage,
        headerStage,
      });

      setInteractiveHidden(sidebarHeader, headerStage === "3");
      setInteractiveHidden(topControlsRef.current, stage === "3");
    };

    const onScroll = () => {
      latestScrollY = window.scrollY;
      if (rafId) return;
      rafId = window.requestAnimationFrame(update);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const onMotionChange = () => onScroll();
    if (prefersReducedMotion.addEventListener) {
      prefersReducedMotion.addEventListener("change", onMotionChange);
    } else {
      prefersReducedMotion.addListener(onMotionChange);
    }

    const onViewportChange = (event: MediaQueryListEvent) => {
      isMobileLayout = event.matches;
      onScroll();
    };
    if (prefersMobileLayout.addEventListener) {
      prefersMobileLayout.addEventListener("change", onViewportChange);
    } else {
      prefersMobileLayout.addListener(onViewportChange);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (prefersReducedMotion.removeEventListener) {
        prefersReducedMotion.removeEventListener("change", onMotionChange);
      } else {
        prefersReducedMotion.removeListener(onMotionChange);
      }
      if (prefersMobileLayout.removeEventListener) {
        prefersMobileLayout.removeEventListener("change", onViewportChange);
      } else {
        prefersMobileLayout.removeListener(onViewportChange);
      }
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [sidebarOpen]);

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

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
    setLangMenuOpen(false);
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
          : "relative flex items-center gap-2 justify-between w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all";
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

      if (itemHref === "/") {
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
      }

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

  // Close language menu when clicking outside
  useEffect(() => {
    if (!langMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-lang-menu]")) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [langMenuOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setActiveHash(window.location.hash);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncHash = () => setActiveHash(window.location.hash);
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);
    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", syncHash);
    };
  }, []);

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

  // Language/Theme controls
  const renderControls = () => (
    <div className="flex items-center gap-2">
      {/* Theme toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        className="flex items-center justify-center w-8 h-8 pointer-coarse:w-10 pointer-coarse:h-10 rounded-full text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent-subtle)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-indicator)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <Sun className="w-[18px] h-[18px] pointer-coarse:w-[20px] pointer-coarse:h-[20px]" />
        ) : (
          <Moon className="w-[18px] h-[18px] pointer-coarse:w-[20px] pointer-coarse:h-[20px]" />
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[var(--background)] text-[var(--foreground)]">
      {/* Sidebar (same for mobile and desktop) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col ${
          sidebarOpen
            ? "w-[var(--sidebar-width)] border-r border-[var(--border-color)] bg-[var(--background)]"
            : "w-0 border-r-0 bg-transparent"
        }`}
      >
        <div className="flex h-full flex-col py-3 md:py-4">
          {/* Top: Site title + toggle */}
          <div
            ref={sidebarHeaderRef}
            className="sidebar-header w-[var(--sidebar-width)] overflow-x-visible overflow-y-hidden shrink-0"
            data-stage="1"
            style={
              {
                "--scroll-progress": 0,
              } as React.CSSProperties
            }
          >
            <div className="sidebar-header__row pl-4 pr-3 flex items-center justify-between gap-2">
              <Link
                href={toLocalePath("/", routeLanguage)}
                className="min-w-0 flex-1 text-sm md:text-base font-semibold tracking-tight whitespace-nowrap relative"
                aria-label={`${SITE_NAME} home`}
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
                className="sidebar-toggle shrink-0 flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-lg text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent-subtle)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-indicator)]"
                aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={sidebarOpen}
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" />
                ) : (
                  <PanelLeft className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" />
                )}
              </button>
            </div>
          </div>

          {/* Navigation + language (only when expanded) */}
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
                    onClick={() => setLangMenuOpen(!langMenuOpen)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-[var(--surface-2)] rounded-lg text-[var(--text-muted)] hover:text-[var(--foreground)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-indicator)]"
                    aria-expanded={langMenuOpen}
                    aria-haspopup="listbox"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <Globe className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs font-medium truncate">
                        {languageMetadata[language].nativeName}
                      </span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 flex-shrink-0 transition-transform ${langMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {langMenuOpen && (
                    <div
                      className="absolute bottom-full left-0 mb-2 py-2 bg-[var(--surface-2)] border border-[var(--border-color)] rounded-xl shadow-lg w-full max-h-[min(320px,calc(100vh-6rem))] overflow-y-auto overflow-x-hidden z-50"
                      role="listbox"
                      aria-label="Select language"
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

      {/* Top-right controls */}
      <div
        ref={topControlsRef}
        className="top-controls fixed top-[calc(env(safe-area-inset-top)+0.5rem)] right-[calc(env(safe-area-inset-right)+0.5rem)] md:top-4 md:right-4 z-40 flex items-center will-change-transform transition-transform transition-opacity duration-200 ease-out translate-y-0 opacity-100"
        data-stage="1"
      >
        {renderControls()}
      </div>

      {/* Main content area */}
      <div
        className={`flex flex-col flex-1 ${sidebarOpen ? "md:pl-[var(--sidebar-width)]" : "pl-0"}`}
      >
        <main className="flex-1 relative">{children}</main>
        {footer}
      </div>
    </div>
  );
}
