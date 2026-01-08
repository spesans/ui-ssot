"use client";

import { useEffect, useRef } from "react";

type MatrixColumn = {
  x: number;
  y: number;
  speed: number;
  tailLength: number;
};

type Rgb = {
  r: number;
  g: number;
  b: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

const randomInt = (min: number, max: number) => Math.floor(randomBetween(min, max + 1));

const parseHexColor = (value: string): Rgb | null => {
  const trimmed = value.trim();
  if (!trimmed.startsWith("#")) return null;

  const hex = trimmed.slice(1);
  if (hex.length === 3) {
    const r = Number.parseInt(hex[0] + hex[0], 16);
    const g = Number.parseInt(hex[1] + hex[1], 16);
    const b = Number.parseInt(hex[2] + hex[2], 16);
    if ([r, g, b].some((channel) => Number.isNaN(channel))) return null;
    return { r, g, b };
  }

  if (hex.length === 6) {
    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);
    if ([r, g, b].some((channel) => Number.isNaN(channel))) return null;
    return { r, g, b };
  }

  return null;
};

const getMatrixColor = (): Rgb => {
  const fallback: Rgb = { r: 52, g: 211, b: 153 };
  if (typeof window === "undefined") return fallback;

  const value = getComputedStyle(document.documentElement).getPropertyValue("--hero-matrix-color");
  return parseHexColor(value) ?? fallback;
};

const createColumns = ({
  width,
  height,
  columnWidth,
  lineHeight,
  prefill = false,
}: {
  width: number;
  height: number;
  columnWidth: number;
  lineHeight: number;
  prefill?: boolean;
}): MatrixColumn[] => {
  const count = Math.max(1, Math.ceil(width / columnWidth));
  return Array.from({ length: count }, (_, index) => {
    const x = index * columnWidth;
    const tailLength = randomInt(14, 34);
    let y: number;
    if (prefill) {
      // Seed columns across the full viewport height so streams appear immediately.
      // ~60% start within visible area, ~40% start above for staggered entry.
      y =
        Math.random() < 0.6
          ? randomBetween(tailLength * lineHeight * 0.3, height + tailLength * lineHeight * 0.5)
          : -randomBetween(0, height * 0.4);
    } else {
      y = -randomBetween(0, height + tailLength * lineHeight);
    }
    const speed = randomBetween(1.4, 3.4);
    return { x, y, speed, tailLength };
  });
};

export function HeroMatrixBackground() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const root = document.documentElement;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let width = 0;
    let height = 0;
    let fontSize = 16;
    let columnWidth = 20;
    let lineHeight = 20;
    let columns: MatrixColumn[] = [];
    let matrixColor: Rgb = getMatrixColor();
    let headColor: Rgb = matrixColor;

    let rafId = 0;
    let running = false;
    let lastTime = 0;
    let initialRender = true;
    const targetFrameMs = 1000 / 30;

    const refreshTheme = () => {
      matrixColor = getMatrixColor();
      headColor = {
        r: Math.round(matrixColor.r + (255 - matrixColor.r) * 0.75),
        g: Math.round(matrixColor.g + (255 - matrixColor.g) * 0.75),
        b: Math.round(matrixColor.b + (255 - matrixColor.b) * 0.75),
      };
    };

    const resize = () => {
      const rect = wrapper.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));

      const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${String(width)}px`;
      canvas.style.height = `${String(height)}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      fontSize = width < 480 ? 12 : width < 768 ? 14 : 16;
      lineHeight = Math.round(fontSize * 1.25);
      columnWidth = Math.round(fontSize * 1.25);
      columns = createColumns({ width, height, columnWidth, lineHeight, prefill: initialRender });
      initialRender = false;
    };

    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);

      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.font =
        `${String(fontSize)}px ui-monospace, SFMono-Regular, Menlo, Monaco, ` +
        `Consolas, "Liberation Mono", "Courier New", monospace`;

      ctx.shadowColor = `rgba(${String(matrixColor.r)}, ${String(matrixColor.g)}, ${String(matrixColor.b)}, 0.55)`;
      ctx.shadowBlur = Math.round(fontSize * 0.55);

      for (const column of columns) {
        const x = column.x + columnWidth / 2;

        for (let i = 0; i < column.tailLength; i += 1) {
          const y = column.y - i * lineHeight;
          if (y < -lineHeight || y > height + lineHeight) continue;

          const t = i / column.tailLength;
          const alpha = 0.9 * Math.pow(1 - t, 1.7);
          const char = Math.random() < 0.5 ? "0" : "1";

          if (i === 0) {
            ctx.fillStyle =
              `rgba(${String(headColor.r)}, ${String(headColor.g)}, ${String(headColor.b)}, ` +
              `${String(Math.min(1, alpha))})`;
          } else {
            ctx.fillStyle =
              `rgba(${String(matrixColor.r)}, ${String(matrixColor.g)}, ${String(matrixColor.b)}, ` +
              `${String(alpha)})`;
          }

          ctx.fillText(char, x, y);
        }

        column.y += column.speed;
        if (column.y - column.tailLength * lineHeight > height + lineHeight) {
          column.y = -randomBetween(0, height * 0.6);
          column.speed = randomBetween(1.4, 3.4);
          column.tailLength = randomInt(14, 34);
        }
      }
    };

    const tick = (time: number) => {
      if (!running) return;

      rafId = window.requestAnimationFrame(tick);
      if (time - lastTime < targetFrameMs) return;
      lastTime = time;
      drawFrame();
    };

    const start = () => {
      if (running) return;
      running = true;
      lastTime = 0;
      rafId = window.requestAnimationFrame(tick);
    };

    const stop = () => {
      running = false;
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = 0;
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        stop();
        return;
      }

      if (!prefersReducedMotion.matches) start();
    };

    const onMotionChange = () => {
      if (prefersReducedMotion.matches) {
        stop();
        drawFrame();
        return;
      }

      if (!document.hidden) start();
    };

    const onResize = () => {
      resize();
      drawFrame();
    };

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(wrapper);

    const themeObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== "attributes") continue;
        if (mutation.attributeName !== "data-theme") continue;
        refreshTheme();
        drawFrame();
      }
    });
    themeObserver.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    document.addEventListener("visibilitychange", onVisibilityChange);
    prefersReducedMotion.addEventListener("change", onMotionChange);

    refreshTheme();
    resize();
    drawFrame();
    if (!prefersReducedMotion.matches && !document.hidden) start();

    return () => {
      stop();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      prefersReducedMotion.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="hero-matrix" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
