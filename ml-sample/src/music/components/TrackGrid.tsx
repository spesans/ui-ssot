"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import type { Locale } from "@/i18n/locales";
import { getUIStrings } from "@/i18n/ui";
import type { Tag, Track } from "@/music/types";
import TrackCard from "@/music/components/TrackCard";
import TrackModal from "@/music/components/TrackModal";
import DownloadDialog from "@/music/components/DownloadDialog";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
import styles from "./TrackGrid.module.css";

const NEW_RELEASES_TAB_ID = "new-releases" as const;
const ITEMS_PER_PAGE = 50;

type ScrollTrigger = "carousel" | "tab";

type TrackGridProps = {
  tracks: Track[];
  tags: Tag[];
  locale: Locale;
};

function normalizeSearchQuery(input: string) {
  return input.trim().toLowerCase();
}

function trackSearchText(track: Track, locale: Locale, tagsById: Record<string, Tag>) {
  const parts: string[] = [track.title];
  if (track.artist) parts.push(track.artist);
  if (track.description) parts.push(track.description);

  for (const tagId of track.tags ?? []) {
    parts.push(tagId);
    const tag = tagsById[tagId];
    parts.push(tag.group);
    const localizedTagLabel =
      (tag.labels as Partial<Record<Locale, string>>)[locale] ?? tag.labels.en;
    parts.push(localizedTagLabel);
    parts.push(tag.labels.en);
    parts.push(tag.labels.ja);
  }

  return parts.join(" ").toLowerCase();
}

function resolveTagLabel(tag: Tag, locale: Locale) {
  return (tag.labels as Partial<Record<Locale, string>>)[locale] ?? tag.labels.en;
}

export default function TrackGrid({ tracks, tags, locale }: TrackGridProps) {
  const [openTrackId, setOpenTrackId] = useState<string | null>(null);
  const [downloadTrackId, setDownloadTrackId] = useState<string | null>(null);
  const [compactCards, setCompactCards] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const ui = useMemo(() => getUIStrings(locale), [locale]);
  const contentPanelId = useId();
  const filtersPanelId = useId();

  const filterButtonRef = useRef<HTMLButtonElement | null>(null);
  const filterPanelRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const selectedTagSet = useMemo(() => new Set(selectedTagIds), [selectedTagIds]);

  const toggleTag = useCallback((tagId: string) => {
    setCurrentPage(1);
    setSelectedTagIds((current) => {
      if (current.includes(tagId)) {
        return current.filter((existing) => existing !== tagId);
      }
      return [...current, tagId];
    });
  }, []);

  const tagsById = useMemo(() => {
    const map: Record<string, Tag> = {};
    for (const tag of tags) {
      map[tag.id] = tag;
    }
    return map;
  }, [tags]);

  const searchTokens = useMemo(() => {
    const normalized = normalizeSearchQuery(searchQuery);
    if (!normalized) return [];
    return normalized.split(/\s+/g).filter(Boolean);
  }, [searchQuery]);

  const visibleTracks = useMemo(() => {
    const hasTagFilter = selectedTagIds.length > 0;
    const hasSearch = searchTokens.length > 0;
    if (!hasTagFilter && !hasSearch) return tracks;

    return tracks.filter((track) => {
      if (hasTagFilter) {
        const trackTags = track.tags ?? [];
        let matchesAny = false;
        for (const tagId of selectedTagIds) {
          if (trackTags.includes(tagId)) {
            matchesAny = true;
            break;
          }
        }
        if (!matchesAny) return false;
      }

      if (hasSearch) {
        const haystack = trackSearchText(track, locale, tagsById);
        for (const token of searchTokens) {
          if (!haystack.includes(token)) return false;
        }
      }

      return true;
    });
  }, [locale, searchTokens, selectedTagIds, tagsById, tracks]);

  const totalPages = Math.ceil(visibleTracks.length / ITEMS_PER_PAGE);
  const paginatedTracks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return visibleTracks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, visibleTracks]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 520px)");
    const update = () => {
      setCompactCards(media.matches);
    };
    update();
    media.addEventListener("change", update);
    return () => {
      media.removeEventListener("change", update);
    };
  }, []);

  const openTrack = useMemo(() => {
    if (!openTrackId) return null;
    return tracks.find((track) => track.id === openTrackId) ?? null;
  }, [openTrackId, tracks]);

  const downloadTrack = useMemo(() => {
    if (!downloadTrackId) return null;
    return tracks.find((track) => track.id === downloadTrackId) ?? null;
  }, [downloadTrackId, tracks]);

  const tabsRef = useRef<Record<string, HTMLButtonElement | null>>({});
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const lastCarouselTargetRef = useRef<string | null>(null);

  useEffect(() => {
    // Only scroll if the change was triggered by the Carousel (top tags)
    if (scrollTriggerRef.current !== "carousel") {
      return;
    }

    const targetId = lastCarouselTargetRef.current ?? NEW_RELEASES_TAB_ID;
    const element = tabsRef.current[targetId];

    if (element) {
      const inlineAlignment = targetId === NEW_RELEASES_TAB_ID ? "start" : "center";
      // Modern browsers: supports options object; fallback keeps behavior acceptable on older engines.
      try {
        element.scrollIntoView({
          behavior: "smooth",
          inline: inlineAlignment,
          block: "nearest",
        });
      } catch {
        element.scrollIntoView();
      }
    }

    // Reset trigger
    scrollTriggerRef.current = null;
    lastCarouselTargetRef.current = null;
  }, [selectedTagIds]);

  const hasActiveFilters = selectedTagIds.length > 0 || searchTokens.length > 0;
  const resultsSummary = ui.resultsCount
    .replace("{shown}", String(visibleTracks.length))
    .replace("{total}", String(tracks.length));

  const activeFilterCount = selectedTagIds.length + (searchTokens.length > 0 ? 1 : 0);

  const closeFilterPanel = useCallback(() => {
    setFiltersOpen(false);
  }, []);

  const clearAllFilters = useCallback(() => {
    setCurrentPage(1);
    setSelectedTagIds([]);
    setSearchQuery("");
  }, []);

  // Body scroll lock and focus management for filter panel
  useEffect(() => {
    if (!filtersOpen) return;

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus search input on open
    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      const previousFocus = previouslyFocusedRef.current;
      if (previousFocus && document.contains(previousFocus)) {
        previousFocus.focus();
      }
      previouslyFocusedRef.current = null;
    };
  }, [filtersOpen]);

  const onPanelKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeFilterPanel();
        return;
      }

      if (event.key !== "Tab") return;
      const panel = filterPanelRef.current;
      if (!panel) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((node) => node.offsetParent !== null);

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || !panel.contains(active)) {
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
    [closeFilterPanel],
  );

  return (
    <div className={`${styles.root} container`}>
      <div className={styles.carousel} aria-label={ui.tags} role="list">
        {tags.map((tag) => (
          <TagCard
            key={tag.id}
            tag={tag}
            isSelected={selectedTagSet.has(tag.id)}
            onToggle={() => {
              scrollTriggerRef.current = "carousel";
              lastCarouselTargetRef.current = tag.id;
              toggleTag(tag.id);
            }}
            contentPanelId={contentPanelId}
            locale={locale}
          />
        ))}
      </div>

      <nav className={styles.tabBar} aria-label={ui.trackLibrary}>
        <button
          ref={(el) => {
            tabsRef.current[NEW_RELEASES_TAB_ID] = el;
          }}
          type="button"
          className={`${styles.tab} ${selectedTagIds.length === 0 ? styles.tabActive : ""}`}
          onClick={() => {
            scrollTriggerRef.current = "tab";
            setCurrentPage(1);
            setSelectedTagIds([]);
          }}
          aria-pressed={selectedTagIds.length === 0}
          aria-controls={contentPanelId}
        >
          {ui.newReleases}
        </button>
        {tags.map((tag) => {
          const isActive = selectedTagIds.length === 1 && selectedTagIds[0] === tag.id;
          const label = resolveTagLabel(tag, locale);
          return (
            <button
              key={tag.id}
              ref={(el) => {
                tabsRef.current[tag.id] = el;
              }}
              type="button"
              className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
              onClick={() => {
                scrollTriggerRef.current = "tab";
                setCurrentPage(1);
                setSelectedTagIds([tag.id]);
              }}
              aria-pressed={isActive}
              aria-controls={contentPanelId}
            >
              {label}
            </button>
          );
        })}
        <button
          ref={filterButtonRef}
          type="button"
          className={`${styles.filterButton} ${filtersOpen ? styles.filterButtonOpen : ""} ${
            hasActiveFilters ? styles.filterButtonActive : ""
          }`}
          onClick={() => {
            setFiltersOpen(true);
          }}
          aria-expanded={filtersOpen}
          aria-controls={filtersPanelId}
          aria-label={ui.filters}
        >
          <SlidersHorizontal size={20} className={styles.filterButtonIcon} aria-hidden="true" />
          {activeFilterCount > 0 && (
            <span className={styles.filterBadge} aria-hidden="true">
              {activeFilterCount}
            </span>
          )}
        </button>
      </nav>

      <div className={styles.contentPanel}>
        {selectedTagIds.length > 0 && (
          <div className={styles.selectedTags} aria-label={ui.tags}>
            {selectedTagIds.map((tagId) => {
              const label = tagId in tagsById ? resolveTagLabel(tagsById[tagId], locale) : tagId;
              return (
                <button
                  key={tagId}
                  type="button"
                  className={styles.selectedTag}
                  onClick={() => {
                    toggleTag(tagId);
                  }}
                  aria-label={`${ui.removeFilter} ${label}`}
                  title={ui.removeFilter}
                >
                  <span className={styles.selectedTagLabel}>{label}</span>
                  <X className={styles.selectedTagIcon} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        )}

        {visibleTracks.length === 0 && (
          <div className={styles.noResults} role="status">
            <p className={styles.noResultsTitle}>{ui.noResults}</p>
            {hasActiveFilters && (
              <button type="button" className={styles.noResultsAction} onClick={clearAllFilters}>
                {ui.resetFilters}
              </button>
            )}
          </div>
        )}

        <ul id={contentPanelId} className={styles.grid} aria-label={ui.trackLibrary} role="list">
          {paginatedTracks.map((track) => (
            <li key={track.id} className={styles.item}>
              <TrackCard
                track={track}
                isMobile={compactCards}
                tagsById={tagsById}
                locale={locale}
                onOpen={() => {
                  setOpenTrackId(track.id);
                }}
                onDownload={() => {
                  setDownloadTrackId(track.id);
                }}
              />
            </li>
          ))}
        </ul>

        {visibleTracks.length > 0 && (
          <div className={styles.paginationFooter} aria-live="polite">
            <span className={styles.paginationText}>{resultsSummary}</span>
            <div className={styles.paginationNav}>
              <button
                type="button"
                className={styles.paginationButton}
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                }}
                disabled={currentPage <= 1}
                aria-label={ui.previousPage}
              >
                <ChevronLeft className={styles.paginationIcon} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={styles.paginationButton}
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                }}
                disabled={currentPage >= totalPages}
                aria-label={ui.nextPage}
              >
                <ChevronRight className={styles.paginationIcon} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>

      {openTrack && (
        <TrackModal
          key={openTrack.id}
          track={openTrack}
          tagsById={tagsById}
          locale={locale}
          isOpen
          onClose={() => {
            setOpenTrackId(null);
          }}
          onRequestDownload={() => {
            setDownloadTrackId(openTrack.id);
          }}
        />
      )}

      {downloadTrack && (
        <DownloadDialog
          key={downloadTrack.id}
          track={downloadTrack}
          locale={locale}
          isOpen
          onClose={() => {
            setDownloadTrackId(null);
          }}
        />
      )}

      {filtersOpen && (
        <div
          className={styles.filterOverlayBackdrop}
          onClick={closeFilterPanel}
          role="presentation"
        >
          <div
            ref={filterPanelRef}
            id={filtersPanelId}
            className={styles.filterOverlay}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onKeyDown={onPanelKeyDown}
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-panel-title"
          >
            <header className={styles.filterOverlayHeader}>
              <h2 id="filter-panel-title" className={styles.filterOverlayTitle}>
                {ui.filters}
              </h2>
              <button
                type="button"
                className={styles.filterOverlayClose}
                onClick={closeFilterPanel}
                aria-label={ui.closeModal}
              >
                <X className={styles.filterOverlayCloseIcon} aria-hidden="true" />
              </button>
            </header>

            <div className={styles.filterOverlayBody}>
              <div className={styles.filterSearchSection}>
                <div className={styles.filterSearchField}>
                  <Search className={styles.filterSearchIcon} aria-hidden="true" />
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchQuery}
                    onChange={(event) => {
                      setCurrentPage(1);
                      setSearchQuery(event.target.value);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Escape" && searchQuery.trim().length > 0) {
                        event.stopPropagation();
                        setCurrentPage(1);
                        setSearchQuery("");
                      }
                    }}
                    placeholder={ui.searchPlaceholder}
                    aria-label={ui.searchPlaceholder}
                    className={styles.filterSearchInput}
                  />
                  {searchQuery.trim().length > 0 && (
                    <button
                      type="button"
                      className={styles.filterSearchClear}
                      onClick={() => {
                        setCurrentPage(1);
                        setSearchQuery("");
                        searchInputRef.current?.focus();
                      }}
                      aria-label={ui.clearSearch}
                    >
                      <X className={styles.filterSearchClearIcon} aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.filterTagsSection}>
                <div className={styles.filterTagsTitle}>{ui.tags}</div>
                <div className={styles.tagButtons}>
                  {tags.map((tag) => {
                    const isSelected = selectedTagSet.has(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        className={`${styles.tagButton} ${
                          isSelected ? styles.tagButtonActive : ""
                        }`}
                        onClick={() => {
                          toggleTag(tag.id);
                        }}
                        aria-pressed={isSelected}
                      >
                        {resolveTagLabel(tag, locale)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <footer className={styles.filterOverlayFooter}>
              <span className={styles.filterResultsText}>{resultsSummary}</span>
              {hasActiveFilters && (
                <button
                  type="button"
                  className={styles.filterResetButton}
                  onClick={clearAllFilters}
                >
                  {ui.resetFilters}
                </button>
              )}
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Component: TagCard
// -----------------------------------------------------------------------------

function TagCard({
  tag,
  isSelected,
  onToggle,
  contentPanelId,
  locale,
}: {
  tag: Tag;
  isSelected: boolean;
  onToggle: () => void;
  contentPanelId: string;
  locale: Locale;
}) {
  const [iconHidden, setIconHidden] = useState(false);
  const isActive = isSelected;
  const label = resolveTagLabel(tag, locale);
  const iconSrc = `/tag-icons/${tag.id}.svg`;

  const handleIconError = () => {
    setIconHidden(true);
  };

  return (
    <button
      type="button"
      className={styles.carouselButton}
      onClick={() => {
        onToggle();
      }}
      aria-pressed={isActive}
      aria-controls={contentPanelId}
    >
      <div className={`${styles.carouselCard} ${isActive ? styles.carouselCardActive : ""}`}>
        <div className={styles.cardBackground} />
        {!iconHidden && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={iconSrc}
            alt=""
            className={styles.cardBlurredImage}
            draggable={false}
            aria-hidden="true"
            onError={handleIconError}
          />
        )}
        <div className={styles.cardGlow} />

        {!iconHidden && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={iconSrc}
            alt=""
            className={styles.cardImage}
            draggable={false}
            aria-hidden="true"
            onError={handleIconError}
          />
        )}

        <span className={styles.carouselLabel}>{label}</span>
      </div>
    </button>
  );
}
