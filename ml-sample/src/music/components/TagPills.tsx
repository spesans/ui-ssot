"use client";

import type { Locale } from "@/i18n/locales";
import { getUIStrings } from "@/i18n/ui";
import type { Tag } from "@/music/types";
import styles from "./TagPills.module.css";

type Props = {
  tags?: string[] | null;
  locale: Locale;
  tagsById?: Record<string, Tag>;
  className?: string;
};

function formatTagLabel(tagId: string) {
  return tagId
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function resolveTagLabel(tagId: string, locale: Locale, tagsById: Record<string, Tag> | undefined) {
  const tag = tagsById?.[tagId];
  if (!tag) return formatTagLabel(tagId);
  const localized = (tag.labels as Partial<Record<Locale, string>>)[locale];
  return localized ?? tag.labels.en;
}

export default function TagPills({ tags, locale, tagsById, className }: Props) {
  if (!tags || tags.length === 0) return null;

  const ui = getUIStrings(locale);

  return (
    <ul className={[styles.list, className ?? ""].join(" ")} aria-label={ui.tags} role="list">
      {tags.map((tag) => (
        <li key={tag} className={styles.item}>
          <span className={styles.tag}>{resolveTagLabel(tag, locale, tagsById)}</span>
        </li>
      ))}
    </ul>
  );
}
