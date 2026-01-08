"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";

type UseScrollResponsiveHeaderArgs = {
  sidebarOpen: boolean;
  sidebarHeaderRef: RefObject<HTMLElement | null>;
  topControlsRef: RefObject<HTMLElement | null>;
};

export function useScrollResponsiveHeader({
  sidebarOpen,
  sidebarHeaderRef,
  topControlsRef,
}: UseScrollResponsiveHeaderArgs) {
  const previousSidebarOpenRef = useRef(sidebarOpen);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const wasSidebarOpen = previousSidebarOpenRef.current;
    previousSidebarOpenRef.current = sidebarOpen;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const prefersMobileLayout = window.matchMedia("(max-width: 767px)");
    let isMobileLayout = prefersMobileLayout.matches;
    let rafId = 0;
    let latestScrollY = window.scrollY;
    let lastAppliedScrollY = window.scrollY;
    let lastMobileStage: "1" | "3" = wasSidebarOpen && !sidebarOpen ? "1" : "3";

    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

    const setInteractiveHidden = (element: HTMLElement | null, hidden: boolean) => {
      if (!element) return;

      const isHidden = element.getAttribute("aria-hidden") === "true";
      if (isHidden === hidden) return;

      if (hidden) {
        element.setAttribute("aria-hidden", "true");
        element.setAttribute("inert", "");
        element.style.pointerEvents = "none";
      } else {
        element.removeAttribute("aria-hidden");
        element.removeAttribute("inert");
        element.style.pointerEvents = "";
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

      if (sidebarHeader.dataset.scrollReady !== "true") {
        sidebarHeader.dataset.scrollReady = "true";
      }
      const topControls = topControlsRef.current;
      if (topControls && topControls.dataset.scrollReady !== "true") {
        topControls.dataset.scrollReady = "true";
      }

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

      let stage: "1" | "2" | "3" = "1";
      if (isMobileLayout) {
        if (deltaY > 0) {
          stage = "3";
        } else if (deltaY < 0) {
          stage = "1";
        } else {
          stage = lastMobileStage;
        }
      } else {
        if (scrollY >= desktopStage3Threshold) {
          stage = "3";
        } else if (scrollY >= stage2Threshold) {
          stage = "2";
        }

        if (stage === "3" && deltaY < 0) {
          stage = "2";
        }
      }

      if (isMobileLayout) {
        lastMobileStage = stage === "3" ? "3" : "1";
      }

      const headerStage = sidebarOpen ? "1" : stage;
      const headerProgress = sidebarOpen || isMobileLayout ? 0 : progress;
      sidebarHeader.style.setProperty("--scroll-progress", headerProgress.toString());

      setStages({
        topControlsStage: stage,
        headerStage,
      });

      setInteractiveHidden(sidebarHeader, headerStage === "3");
      setInteractiveHidden(topControlsRef.current, stage === "3");
    };

    update();

    const onScroll = () => {
      latestScrollY = window.scrollY;
      if (rafId) return;
      rafId = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    const onMotionChange = () => {
      onScroll();
    };
    prefersReducedMotion.addEventListener("change", onMotionChange);

    const onViewportChange = (event: MediaQueryListEvent) => {
      isMobileLayout = event.matches;
      onScroll();
    };
    prefersMobileLayout.addEventListener("change", onViewportChange);

    return () => {
      window.removeEventListener("scroll", onScroll);
      prefersReducedMotion.removeEventListener("change", onMotionChange);
      prefersMobileLayout.removeEventListener("change", onViewportChange);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [sidebarOpen, sidebarHeaderRef, topControlsRef]);
}
