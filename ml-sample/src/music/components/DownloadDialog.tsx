"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import type { Track } from "@/music/types";
import type { Locale } from "@/i18n/locales";
import { getUIStrings } from "@/i18n/ui";
import styles from "./DownloadDialog.module.css";

type Props = {
  track: Track;
  locale: Locale;
  isOpen: boolean;
  onClose: () => void;
};

function pickDefaultDownload(track: Track) {
  return (
    track.downloads.find((download) => download.variant === "full") ?? track.downloads.at(0) ?? null
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${String(bytes)} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes;
  let unitIndex = -1;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

export default function DownloadDialog({ track, locale, isOpen, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ui = useMemo(() => getUIStrings(locale), [locale]);
  const download = useMemo(() => pickDefaultDownload(track), [track]);
  const requiresAgreement = track.license.requiresAgreement;
  const canSubmit = !!download && (!requiresAgreement || agreed) && !isSubmitting;

  const requestClose = useCallback(() => {
    setIsSubmitting(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    cancelButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      const previousFocus = previouslyFocusedRef.current;
      if (previousFocus && document.contains(previousFocus)) {
        previousFocus.focus();
      }
      previouslyFocusedRef.current = null;
    };
  }, [isOpen]);

  const handleDownload = useCallback(() => {
    if (!download) return;
    if (requiresAgreement && !agreed) return;

    const directUrl = (download.directUrl ?? track.audioSrc).trim();
    if (directUrl.length === 0) {
      setError(ui.noDownloadsAvailable);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      window.location.assign(directUrl);
    } catch {
      setError(ui.downloadErrorGeneric);
      setIsSubmitting(false);
    }
  }, [agreed, download, requiresAgreement, track.audioSrc, ui]);

  const onDialogKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
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
    [requestClose],
  );

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={requestClose} role="presentation">
      <div
        ref={dialogRef}
        className={styles.dialog}
        onClick={(event) => {
          event.stopPropagation();
        }}
        onKeyDown={onDialogKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-dialog-title"
        aria-describedby="download-dialog-description"
      >
        <header className={styles.header}>
          <h2 id="download-dialog-title" className={styles.title}>
            {ui.download}
          </h2>
          <p className={styles.trackTitle}>{track.title}</p>
        </header>

        <p id="download-dialog-description" className={styles.srOnly}>
          {ui.downloadDialogDescription}
        </p>

        <section className={styles.section} aria-label={ui.license}>
          <p className={styles.sectionTitle}>{ui.license}</p>
          <p className={styles.summary}>{ui.licenseSummary}</p>
          {track.license.note && <p className={styles.note}>{track.license.note}</p>}
          {track.license.clearanceUrl && (
            <a
              href={track.license.clearanceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.clearanceLink}
            >
              {ui.applyHere}
            </a>
          )}

          {requiresAgreement && (
            <label className={styles.agreeRow}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(event) => {
                  setAgreed(event.target.checked);
                }}
              />
              <span>{ui.licenseAgreement}</span>
            </label>
          )}
        </section>

        <section className={styles.section} aria-label={ui.file}>
          <p className={styles.sectionTitle}>{ui.file}</p>
          {download ? (
            <p className={styles.fileLine}>
              {download.label} · {download.format.toUpperCase()}
              {typeof download.sizeBytes === "number"
                ? ` · ${formatBytes(download.sizeBytes)}`
                : ""}
            </p>
          ) : (
            <p className={styles.summary}>{ui.noDownloadsAvailable}</p>
          )}
        </section>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <div className={styles.actions}>
          <button
            ref={cancelButtonRef}
            type="button"
            className={styles.button}
            onClick={requestClose}
          >
            {ui.cancel}
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.primary}`}
            onClick={() => {
              handleDownload();
            }}
            disabled={!canSubmit}
          >
            {isSubmitting ? ui.preparing : ui.download}
          </button>
        </div>
      </div>
    </div>
  );
}
