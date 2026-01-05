"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import type { Locale } from "@/i18n/locales";
import { getUIStrings } from "@/i18n/ui";
import { BRAND } from "@/lib/branding";
import type { Tag, Track } from "@/music/types";
import { usePlayer } from "@/music/PlayerProvider";
import WaveformScrubber from "@/music/components/WaveformScrubber";
import TagPills from "@/music/components/TagPills";
import styles from "./TrackCard.module.css";

type Props = {
  track: Track;
  tagsById: Record<string, Tag>;
  locale: Locale;
  isMobile?: boolean;
  onOpen: () => void;
  onDownload: () => void;
};

type ShareState = "idle" | "copied" | "shared";

const DEFAULT_ARTIST = BRAND.shortName;
const TITLE_MAX_CHARS = 15;

function truncateTitle(input: string, maxChars: number) {
  const chars = Array.from(input);
  if (chars.length <= maxChars) return input;
  return `${chars.slice(0, maxChars - 1).join("")}…`;
}

function PlayIcon({ isPlaying }: { isPlaying: boolean }) {
  if (isPlaying) {
    return (
      <svg className={styles.icon} viewBox="0 0 24 24" role="img" aria-hidden="true">
        <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
      </svg>
    );
  }

  return (
    <svg className={styles.icon} viewBox="0 0 24 24" role="img" aria-hidden="true">
      <path fill="currentColor" d="M8 5v14l11-7z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" role="img" aria-hidden="true">
      <path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" role="img" aria-hidden="true">
      <path
        fill="currentColor"
        d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" role="img" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" role="img" aria-hidden="true">
      <path
        fill="currentColor"
        d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z"
      />
    </svg>
  );
}

export default function TrackCard({
  track,
  tagsById,
  locale,
  isMobile = false,
  onOpen,
  onDownload,
}: Props) {
  const player = usePlayer();
  const shareResetTimerRef = useRef<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [shareState, setShareState] = useState<ShareState>("idle");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  const ui = useMemo(() => getUIStrings(locale), [locale]);

  const isCurrent = player.currentTrackId === track.id;
  const isPlaying = isCurrent && player.isPlaying;
  const progress = isCurrent ? player.progress : 0;
  const duration = isCurrent ? player.duration : 0;
  const artist = track.artist ?? DEFAULT_ARTIST;

  // Use JS truncation ONLY on desktop to prevent waveform squashing per user request
  // On mobile, CSS handles truncation (ellipsis) to use full width
  const displayTitle = !isMobile ? truncateTitle(track.title, TITLE_MAX_CHARS) : track.title;

  // Handle menu outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setMenuOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    return () => {
      if (shareResetTimerRef.current !== null) {
        window.clearTimeout(shareResetTimerRef.current);
        shareResetTimerRef.current = null;
      }
    };
  }, []);

  const shareLabel = useMemo(() => {
    if (shareState === "copied") return ui.copied;
    if (shareState === "shared") return ui.shared;
    return ui.share;
  }, [shareState, ui]);

  const handleShare = useCallback(
    async (event?: ReactMouseEvent<HTMLElement>) => {
      event?.stopPropagation();

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

      setMenuOpen(false); // Close menu if open

      if (shareResetTimerRef.current !== null) {
        window.clearTimeout(shareResetTimerRef.current);
      }
      shareResetTimerRef.current = window.setTimeout(() => {
        shareResetTimerRef.current = null;
        setShareState("idle");
      }, 1200);
    },
    [track.title],
  );

  const handleCardClick = useCallback(
    (event: ReactMouseEvent<HTMLElement>) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      // Prevent opening details if clicking specific interactive elements
      if (
        target.closest(`.${styles.iconButton}`) ||
        target.closest(`.${styles.artWrapper}`) ||
        target.closest(`.${styles.menuContainer}`) ||
        target.closest(`a`)
      ) {
        return;
      }
      onOpen();
    },
    [onOpen],
  );

  const playLabel = isPlaying ? ui.pause : ui.play;

  return (
    <article
      className={`${styles.card} ${menuOpen ? styles.cardMenuOpen : ""}`}
      onClick={handleCardClick}
    >
      <div className={styles.startGroup}>
        <button
          type="button"
          className={styles.artWrapper}
          onClick={(event) => {
            event.stopPropagation();
            player.toggle(track);
          }}
          aria-label={`${playLabel} ${track.title}`}
          aria-pressed={isPlaying}
        >
          <Image
            className={styles.art}
            src={track.albumArtSrc}
            width={512}
            height={512}
            alt=""
            unoptimized
          />
          <div className={`${styles.artOverlay} ${isPlaying ? styles.artOverlayVisible : ""}`}>
            <PlayIcon isPlaying={isPlaying} />
          </div>
        </button>

        <div className={styles.text}>
          <h3 className={styles.title} title={track.title}>
            {displayTitle}
          </h3>
          {isMobile ? (
            <div className={styles.metaRow}>
              <TagPills tags={track.tags} locale={locale} tagsById={tagsById} />
              <span className={styles.artistName} title={artist}>
                {artist}
              </span>
            </div>
          ) : (
            <TagPills tags={track.tags} locale={locale} tagsById={tagsById} />
          )}
        </div>
      </div>

      <div className={styles.centerGroup}>
        <WaveformScrubber
          className={styles.waveWrap}
          trackId={track.id}
          progress={progress}
          duration={duration}
          isCurrent={isCurrent}
          bars={64}
          height={24}
          onSeekRatio={(ratio) => {
            player.seekToRatio(track, ratio);
          }}
          ariaLabel={`${ui.seek} ${track.title}`}
        />
      </div>

      {/* Desktop Actions */}
      <div className={styles.desktopActions}>
        <button
          type="button"
          className={`${styles.iconButton} ${styles.iconButtonShare} ${
            shareState !== "idle" ? styles.iconButtonActive : ""
          }`}
          onClick={(event) => void handleShare(event)}
          aria-label={`${shareLabel} ${track.title}`}
          title={shareLabel}
        >
          <ShareIcon />
        </button>

        <button
          type="button"
          className={`${styles.iconButton} ${styles.iconButtonDownload}`}
          aria-label={`${ui.download} ${track.title}`}
          onClick={(event) => {
            event.stopPropagation();
            onDownload();
          }}
        >
          <DownloadIcon />
        </button>

        <button
          type="button"
          className={styles.iconButton}
          aria-label={`${ui.details} ${track.title}`}
          title={ui.details}
          onClick={(event) => {
            event.stopPropagation();
            onOpen();
          }}
        >
          <InfoIcon />
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={styles.mobileMenu} ref={menuRef}>
        <button
          type="button"
          className={styles.iconButton}
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          aria-label={ui.moreOptions}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? menuId : undefined}
        >
          <MenuIcon />
        </button>

        {menuOpen && (
          <div id={menuId} className={styles.menuPopover}>
            <button
              type="button"
              className={styles.menuItem}
              onClick={(event) => void handleShare(event)}
            >
              <ShareIcon />
              <span>{shareLabel}</span>
            </button>
            <button
              type="button"
              className={styles.menuItem}
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                onDownload();
              }}
            >
              <DownloadIcon />
              <span>{ui.download}</span>
            </button>
            <button
              type="button"
              className={styles.menuItem}
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                onOpen();
              }}
            >
              <InfoIcon />
              <span>{ui.details}</span>
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
