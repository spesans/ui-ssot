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

const MAX_STREAM_BUFFER_BYTES = 10 * 1024 * 1024;
const PROGRESS_UPDATE_INTERVAL_MS = 120;

function pickDefaultDownload(track: Track) {
  return (
    track.downloads.find((download) => download.variant === "full") ?? track.downloads.at(0) ?? null
  );
}

function resolveFilename(directUrl: string, track: Track, format?: string) {
  const fallbackExtension = format?.trim().toLowerCase();
  const fallbackName = fallbackExtension ? `${track.slug}.${fallbackExtension}` : track.slug;

  try {
    const resolved = new URL(directUrl, window.location.href);
    const lastSegment = resolved.pathname.split("/").filter(Boolean).at(-1);
    if (!lastSegment) return fallbackName;
    if (lastSegment.includes(".")) return lastSegment;
    return fallbackExtension ? `${lastSegment}.${fallbackExtension}` : lastSegment;
  } catch {
    return fallbackName;
  }
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
  const downloadAbortRef = useRef<AbortController | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [bytesReceived, setBytesReceived] = useState(0);
  const [bytesTotal, setBytesTotal] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ui = useMemo(() => getUIStrings(locale), [locale]);
  const download = useMemo(() => pickDefaultDownload(track), [track]);
  const requiresAgreement = track.license.requiresAgreement;
  const canSubmit = !!download && (!requiresAgreement || agreed) && !isSubmitting;

  const requestClose = useCallback(() => {
    downloadAbortRef.current?.abort();
    downloadAbortRef.current = null;
    setIsSubmitting(false);
    setIsStreaming(false);
    setBytesReceived(0);
    setBytesTotal(null);
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

  useEffect(() => {
    return () => {
      downloadAbortRef.current?.abort();
      downloadAbortRef.current = null;
    };
  }, []);

  const handleDownload = useCallback(async () => {
    if (!download) return;
    if (requiresAgreement && !agreed) return;

    const directUrl = (download.directUrl ?? track.audioSrc).trim();
    if (directUrl.length === 0) {
      setError(ui.noDownloadsAvailable);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    setIsStreaming(false);
    setBytesReceived(0);
    setBytesTotal(null);

    const directFilename = resolveFilename(directUrl, track, download.format);

    if (typeof download.sizeBytes === "number" && download.sizeBytes > MAX_STREAM_BUFFER_BYTES) {
      try {
        window.location.assign(directUrl);
        requestClose();
      } catch {
        setError(ui.downloadErrorGeneric);
        setIsSubmitting(false);
        setIsStreaming(false);
      }
      return;
    }

    const abortController = new AbortController();
    downloadAbortRef.current?.abort();
    downloadAbortRef.current = abortController;

    try {
      const response = await fetch(directUrl, { signal: abortController.signal });
      if (!response.ok) {
        throw new Error(`Download request failed with status ${String(response.status)}`);
      }

      const headerTotalRaw = response.headers.get("content-length");
      const headerTotal = headerTotalRaw ? Number(headerTotalRaw) : Number.NaN;
      const resolvedTotal =
        Number.isFinite(headerTotal) && headerTotal > 0
          ? headerTotal
          : typeof download.sizeBytes === "number" && download.sizeBytes > 0
            ? download.sizeBytes
            : null;
      setBytesTotal(resolvedTotal);

      if (typeof resolvedTotal === "number" && resolvedTotal > MAX_STREAM_BUFFER_BYTES) {
        try {
          window.location.assign(directUrl);
          requestClose();
        } catch {
          setError(ui.downloadErrorGeneric);
          setIsSubmitting(false);
          setIsStreaming(false);
        }
        return;
      }

      if (!response.body) {
        try {
          window.location.assign(directUrl);
          requestClose();
        } catch {
          setError(ui.downloadErrorGeneric);
          setIsSubmitting(false);
          setIsStreaming(false);
        }
        return;
      }

      setIsStreaming(true);

      const reader = response.body.getReader();
      const chunks: ArrayBuffer[] = [];
      let receivedBytes = 0;
      let lastUiUpdateAt = 0;

      let readResult = await reader.read();
      while (!readResult.done) {
        const chunk = readResult.value;
        receivedBytes += chunk.byteLength;

        if (receivedBytes > MAX_STREAM_BUFFER_BYTES) {
          try {
            window.location.assign(directUrl);
            requestClose();
          } catch {
            setError(ui.downloadErrorGeneric);
            setIsSubmitting(false);
            setIsStreaming(false);
          }
          return;
        }

        const bufferCopy = new ArrayBuffer(chunk.byteLength);
        new Uint8Array(bufferCopy).set(chunk);
        chunks.push(bufferCopy);

        const now = Date.now();
        if (now - lastUiUpdateAt >= PROGRESS_UPDATE_INTERVAL_MS) {
          lastUiUpdateAt = now;
          setBytesReceived(receivedBytes);
        }

        readResult = await reader.read();
      }

      setBytesReceived(receivedBytes);

      const blob = new Blob(chunks, { type: response.headers.get("content-type") ?? undefined });
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = directFilename;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, 0);

      requestClose();
    } catch (error_) {
      if (error_ instanceof DOMException && error_.name === "AbortError") {
        return;
      }

      try {
        window.location.assign(directUrl);
        requestClose();
        return;
      } catch {
        // Keep the error UI fallback below.
      }

      setError(ui.downloadErrorGeneric);
      setIsSubmitting(false);
      setIsStreaming(false);
    } finally {
      if (downloadAbortRef.current === abortController) {
        downloadAbortRef.current = null;
      }
    }
  }, [agreed, download, requestClose, requiresAgreement, track, ui]);

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

        {isSubmitting && (
          <div className={styles.progressSection}>
            <p role="status" aria-live="polite" className={styles.progressStatus}>
              {isStreaming ? ui.downloading : ui.preparing}
            </p>
            {isStreaming && (
              <progress
                className={styles.progressBar}
                max={typeof bytesTotal === "number" && bytesTotal > 0 ? bytesTotal : undefined}
                value={
                  typeof bytesTotal === "number" && bytesTotal > 0
                    ? Math.min(bytesReceived, bytesTotal)
                    : undefined
                }
              />
            )}
            <div className={styles.progressMeta}>
              <span className={styles.progressBytes}>{formatBytes(bytesReceived)}</span>
              {typeof bytesTotal === "number" && bytesTotal > 0 ? (
                <span className={styles.progressPercent}>
                  {String(Math.min(100, Math.round((bytesReceived / bytesTotal) * 100)))}%
                </span>
              ) : (
                <span className={styles.progressPercent} aria-hidden="true" />
              )}
            </div>
          </div>
        )}

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
              void handleDownload();
            }}
            disabled={!canSubmit}
          >
            {isSubmitting ? (isStreaming ? ui.downloading : ui.preparing) : ui.download}
          </button>
        </div>
      </div>
    </div>
  );
}
