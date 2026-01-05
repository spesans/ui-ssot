"use client";

import { useMemo } from "react";
import styles from "./Waveform.module.css";

type Props = {
  trackId: string;
  progress?: number;
  duration?: number;
  bars?: number;
  height?: number;
  className?: string;
};

function hashString(input: string) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  return function rand() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function buildHeights(trackId: string, count: number) {
  const rand = mulberry32(hashString(trackId));
  const values = Array.from({ length: count }, () => 0.2 + rand() * 0.8);

  for (let pass = 0; pass < 2; pass += 1) {
    for (let i = 1; i < values.length - 1; i += 1) {
      values[i] = (values[i - 1] + values[i] + values[i + 1]) / 3;
    }
  }

  return values;
}

export default function Waveform({
  trackId,
  progress = 0,
  duration = 0,
  bars = 56,
  height = 26,
  className,
}: Props) {
  const heights = useMemo(() => buildHeights(trackId, bars), [trackId, bars]);

  const ratio = duration > 0 ? clamp(progress / duration, 0, 1) : 0;
  const activeBars = Math.round(ratio * bars);

  const barWidth = 2;
  const barGap = 1;
  const viewWidth = bars * (barWidth + barGap) - barGap;
  const viewHeight = 24;
  const maxBarHeight = 20;
  const viewBox = ["0", "0", String(viewWidth), String(viewHeight)].join(" ");

  return (
    <svg
      className={`${styles.svg} ${className ?? ""}`}
      viewBox={viewBox}
      width="100%"
      height={height}
      role="img"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      {heights.map((value, index) => {
        const barHeight = Math.max(2, Math.round(value * maxBarHeight));
        const x = index * (barWidth + barGap);
        const y = Math.round((viewHeight - barHeight) / 2);
        const isActive = index < activeBars;
        return (
          <rect
            key={index}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            rx={1}
            className={isActive ? styles.barActive : styles.bar}
          />
        );
      })}
    </svg>
  );
}
