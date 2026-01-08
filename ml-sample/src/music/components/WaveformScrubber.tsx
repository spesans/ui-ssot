"use client";

import { useEffect, useRef, useState } from "react";
import Waveform from "@/music/components/Waveform";
import styles from "./WaveformScrubber.module.css";

type Props = {
  trackId: string;
  progress: number;
  duration: number;
  isCurrent?: boolean;
  bars?: number;
  height?: number;
  disabled?: boolean;
  onSeekRatio: (ratio: number) => void;
  ariaLabel?: string;
  className?: string;
};

const LONG_PRESS_MS = 160;
const CANCEL_MOVE_PX = 6;
const KEYBOARD_STEP_SEC = 5;
const FALLBACK_STEP_RATIO = 0.08;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function distanceSq(ax: number, ay: number, bx: number, by: number) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

export default function WaveformScrubber({
  trackId,
  progress,
  duration,
  isCurrent = false,
  bars,
  height,
  disabled = false,
  onSeekRatio,
  ariaLabel = "Seek",
  className,
}: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pressTimerRef = useRef<number | null>(null);
  const pendingPointerRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
  } | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const [scrubbing, setScrubbing] = useState(false);
  const [previewRatio, setPreviewRatio] = useState(0);

  const canScrub = !disabled;

  const seekFromClientX = (clientX: number) => {
    if (!canScrub) return;
    const root = rootRef.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    if (rect.width <= 0) return;
    const x = clamp(clientX - rect.left, 0, rect.width);
    const ratio = x / rect.width;
    setPreviewRatio(ratio);
    onSeekRatio(ratio);
  };

  const clearPressTimer = () => {
    if (pressTimerRef.current === null) return;
    window.clearTimeout(pressTimerRef.current);
    pressTimerRef.current = null;
  };

  const stopScrub = (pointerId?: number) => {
    clearPressTimer();
    pendingPointerRef.current = null;

    if (pointerId !== undefined && activePointerIdRef.current !== pointerId) {
      return;
    }

    if (activePointerIdRef.current !== null) {
      const root = rootRef.current;
      if (root?.hasPointerCapture(activePointerIdRef.current)) {
        root.releasePointerCapture(activePointerIdRef.current);
      }
    }

    activePointerIdRef.current = null;
    setScrubbing(false);
  };

  const startScrub = (pointerId: number, clientX: number) => {
    if (!canScrub) return;
    const root = rootRef.current;
    if (!root) return;

    activePointerIdRef.current = pointerId;
    pendingPointerRef.current = null;
    setScrubbing(true);
    root.setPointerCapture(pointerId);
    seekFromClientX(clientX);
  };

  useEffect(() => {
    const root = rootRef.current;
    return () => {
      clearPressTimer();
      pendingPointerRef.current = null;
      const activePointerId = activePointerIdRef.current;
      if (activePointerId !== null && root?.hasPointerCapture(activePointerId)) {
        root.releasePointerCapture(activePointerId);
      }
      activePointerIdRef.current = null;
    };
  }, []);

  const isActive = scrubbing || isCurrent;
  const ratioFromProgress =
    duration > 0 ? clamp(progress / duration, 0, 1) : isActive ? previewRatio : 0;
  const ariaValueText =
    duration > 0
      ? `${String(Math.round(progress))}s / ${String(Math.round(duration))}s`
      : undefined;

  return (
    <div
      ref={rootRef}
      className={[
        styles.root,
        scrubbing ? styles.scrubbing : "",
        !canScrub ? styles.disabled : "",
        className ?? "",
      ].join(" ")}
      role="slider"
      tabIndex={canScrub ? 0 : -1}
      aria-label={ariaLabel}
      aria-orientation="horizontal"
      aria-valuemin={0}
      aria-valuemax={1}
      aria-valuenow={ratioFromProgress}
      aria-valuetext={ariaValueText}
      aria-disabled={!canScrub}
      onPointerDown={(e) => {
        if (!canScrub) return;
        if (e.pointerType === "mouse" && e.button !== 0) return;

        e.currentTarget.focus({ preventScroll: true });
        stopScrub();

        if (e.pointerType === "mouse") {
          startScrub(e.pointerId, e.clientX);
          return;
        }

        pendingPointerRef.current = {
          pointerId: e.pointerId,
          startX: e.clientX,
          startY: e.clientY,
        };
        pressTimerRef.current = window.setTimeout(() => {
          const pending = pendingPointerRef.current;
          if (pending?.pointerId !== e.pointerId) return;
          startScrub(e.pointerId, pending.startX);
        }, LONG_PRESS_MS);
      }}
      onPointerMove={(e) => {
        if (!canScrub) return;

        if (activePointerIdRef.current === e.pointerId) {
          e.preventDefault();
          seekFromClientX(e.clientX);
          return;
        }

        const pending = pendingPointerRef.current;
        if (pending?.pointerId !== e.pointerId) return;

        const cancelDistanceSq = CANCEL_MOVE_PX * CANCEL_MOVE_PX;
        if (distanceSq(pending.startX, pending.startY, e.clientX, e.clientY) > cancelDistanceSq) {
          clearPressTimer();
          pendingPointerRef.current = null;
        }
      }}
      onPointerUp={(e) => {
        stopScrub(e.pointerId);
      }}
      onPointerCancel={(e) => {
        stopScrub(e.pointerId);
      }}
      onKeyDown={(e) => {
        if (!canScrub) return;
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();

        const stepRatio = duration > 0 ? KEYBOARD_STEP_SEC / duration : FALLBACK_STEP_RATIO;
        const nextRatio =
          e.key === "ArrowLeft"
            ? clamp(ratioFromProgress - stepRatio, 0, 1)
            : clamp(ratioFromProgress + stepRatio, 0, 1);
        setPreviewRatio(nextRatio);
        onSeekRatio(nextRatio);
      }}
    >
      <Waveform
        trackId={trackId}
        progress={duration > 0 ? progress : isActive ? previewRatio : 0}
        duration={duration > 0 ? duration : 1}
        bars={bars}
        height={height}
      />
    </div>
  );
}
