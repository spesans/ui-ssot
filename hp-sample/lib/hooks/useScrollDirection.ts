import { useEffect, useRef, useState } from "react";

type ScrollDirection = "up" | "down";

type ScrollDirectionOptions = {
  enabled?: boolean;
  threshold?: number;
  initialDirection?: ScrollDirection;
};

export const useScrollDirection = ({
  enabled = true,
  threshold = 10,
  initialDirection = "up",
}: ScrollDirectionOptions = {}) => {
  const [direction, setDirection] = useState<ScrollDirection>(initialDirection);
  const [scrollY, setScrollY] = useState(0);
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    lastScrollYRef.current = window.scrollY;
    tickingRef.current = false;

    const handleScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      window.requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const deltaY = currentY - lastScrollYRef.current;

        if (Math.abs(deltaY) >= threshold) {
          setDirection(deltaY > 0 ? "down" : "up");
          lastScrollYRef.current = currentY;
        }

        setScrollY(currentY);
        tickingRef.current = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [enabled, threshold]);

  return { direction, scrollY };
};
