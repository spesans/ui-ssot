"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import WaveformScrubber from "@/music/components/WaveformScrubber";
import TagPills from "@/music/components/TagPills";
import { getUIStrings } from "@/i18n/ui";
import type { Locale } from "@/i18n/locales";
import { BRAND } from "@/lib/branding";
import type { Tag, Track } from "@/music/types";
import { usePlayer } from "@/music/PlayerProvider";
import styles from "./TrackModal.module.css";

type Props = {
  track: Track | null;
  tagsById: Record<string, Tag>;
  locale: Locale;
  isOpen: boolean;
  onClose: () => void;
  onRequestDownload: () => void;
};

type ShareState = "idle" | "copied" | "shared";

const DEFAULT_ARTIST = BRAND.shortName;

function formatTime(seconds: number, fallback: string) {
  if (!Number.isFinite(seconds) || seconds < 0) return fallback;
  const whole = Math.floor(seconds);
  const minutes = Math.floor(whole / 60);
  const remaining = whole % 60;
  return `${String(minutes)}:${String(remaining).padStart(2, "0")}`;
}

function PlayIcon({ isPlaying }: { isPlaying: boolean }) {
  if (isPlaying) {
    return (
      <svg className={styles.actionIcon} viewBox="0 0 24 24" role="img" aria-hidden="true">
        <path fill="currentColor" d="M7 5h4v14H7V5Zm6 0h4v14h-4V5Z" />
      </svg>
    );
  }

  return (
    <svg className={styles.actionIcon} viewBox="0 0 24 24" role="img" aria-hidden="true">
      <path fill="currentColor" d="M8 5v14l11-7L8 5Z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className={styles.actionIcon} viewBox="0 0 24 24" role="img" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 3a1 1 0 0 1 1 1v9.6l2.3-2.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L11 13.6V4a1 1 0 0 1 1-1Zm-7 16a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1Z"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg className={styles.actionIcon} viewBox="0 0 24 24" role="img" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 3a1 1 0 0 1 .7.3l4 4a1 1 0 1 1-1.4 1.4L13 6.4V15a1 1 0 1 1-2 0V6.4L8.7 8.7A1 1 0 0 1 7.3 7.3l4-4A1 1 0 0 1 12 3Zm-7 14a1 1 0 0 1 1 1v1h12v-1a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z"
      />
    </svg>
  );
}

export default function TrackModal({
  track,
  tagsById,
  locale,
  isOpen,
  onClose,
  onRequestDownload,
}: Props) {
  const player = usePlayer();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const shareResetTimerRef = useRef<number | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const [shareState, setShareState] = useState<ShareState>("idle");

  const ui = useMemo(() => getUIStrings(locale), [locale]);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      const previousFocus = previouslyFocusedRef.current;
      if (previousFocus && document.contains(previousFocus)) {
        previousFocus.focus();
      }
      previouslyFocusedRef.current = null;
      if (shareResetTimerRef.current !== null) {
        window.clearTimeout(shareResetTimerRef.current);
        shareResetTimerRef.current = null;
      }
    };
  }, [isOpen]);

  const onDialogKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((node) => node.offsetParent !== null);

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || !dialog.contains(active)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  const isCurrent = !!track && player.currentTrackId === track.id;
  const isPlaying = isCurrent && player.isPlaying;

  const progress = isCurrent ? player.progress : 0;
  const duration = isCurrent ? player.duration : 0;

  const shareLabel = useMemo(() => {
    if (shareState === "copied") return ui.copied;
    if (shareState === "shared") return ui.shared;
    return ui.share;
  }, [shareState, ui]);

  const handleShare = useCallback(async () => {
    if (!track) return;

    const url = window.location.href;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: track.title, url });
        setShareState("shared");
      } else {
        await navigator.clipboard.writeText(url);
        setShareState("copied");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }

    if (shareResetTimerRef.current !== null) {
      window.clearTimeout(shareResetTimerRef.current);
    }
    shareResetTimerRef.current = window.setTimeout(() => {
      shareResetTimerRef.current = null;
      setShareState("idle");
    }, 1200);
  }, [track]);

  if (!isOpen || !track) return null;

  const artist = track.artist ?? DEFAULT_ARTIST;
  const timeCurrent = formatTime(progress, "0:00");
  const timeTotal = duration > 0 ? formatTime(duration, "—:—") : "—:—";
  const playLabel = isPlaying ? ui.pause : ui.play;

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div
        ref={dialogRef}
        className={styles.modal}
        onClick={(e) => {
          e.stopPropagation();
        }}
        onKeyDown={onDialogKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="track-modal-title"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className={styles.closeButton}
          aria-label={ui.closeModal}
        >
          <svg className={styles.closeIcon} viewBox="0 0 24 24" role="img" aria-hidden="true">
            <path
              fill="currentColor"
              d="M18.3 5.7a1 1 0 0 0-1.4 0L12 10.6 7.1 5.7a1 1 0 1 0-1.4 1.4l4.9 4.9-4.9 4.9a1 1 0 1 0 1.4 1.4l4.9-4.9 4.9 4.9a1 1 0 0 0 1.4-1.4L13.4 12l4.9-4.9a1 1 0 0 0 0-1.4Z"
            />
          </svg>
        </button>

        <div className={styles.artWrap}>
          <Image
            className={styles.art}
            src={track.albumArtSrc}
            width={512}
            height={512}
            alt={track.title}
            unoptimized
          />
        </div>

        <div className={styles.body}>
          <div className={styles.meta}>
            <h2 id="track-modal-title" className={styles.title}>
              {track.title}
            </h2>
            <p className={styles.artist}>{artist}</p>
            <TagPills
              tags={track.tags}
              locale={locale}
              tagsById={tagsById}
              className={styles.tags}
            />
          </div>

          <div className={styles.waveSection}>
            <WaveformScrubber
              className={styles.waveWrap}
              trackId={track.id}
              progress={progress}
              duration={duration}
              isCurrent={isCurrent}
              bars={88}
              height={34}
              onSeekRatio={(ratio) => {
                player.seekToRatio(track, ratio);
              }}
              ariaLabel={ui.seek}
            />
            <div className={styles.timeRow} aria-label={ui.playbackTime}>
              <span className={styles.time}>{timeCurrent}</span>
              <span className={styles.time}>{timeTotal}</span>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.actionButton} ${shareState !== "idle" ? styles.actionButtonActive : ""}`}
              onClick={() => {
                void handleShare();
              }}
              aria-label={`${shareLabel} ${track.title}`}
              title={shareLabel}
            >
              <ShareIcon />
            </button>
            <button
              type="button"
              className={`${styles.actionButton} ${styles.actionButtonMain}`}
              onClick={() => {
                player.toggle(track);
              }}
              aria-label={`${playLabel} ${track.title}`}
              aria-pressed={isPlaying}
              title={playLabel}
            >
              <PlayIcon isPlaying={isPlaying} />
            </button>
            <button
              type="button"
              className={styles.actionButton}
              onClick={onRequestDownload}
              aria-label={`${ui.download} ${track.title}`}
              title={ui.download}
            >
              <DownloadIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
