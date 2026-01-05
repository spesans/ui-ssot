import Link from "next/link";
import styles from "./static-page.module.css";
import type { StaticPageContent, StaticPageLink } from "@/i18n/pages";

function isPlaceholder(value: string) {
  const trimmed = value.trim();
  return trimmed.startsWith("{{") && trimmed.endsWith("}}");
}

function isInternalHref(href: string) {
  return href.startsWith("/");
}

function PageLink({ link }: { link: StaticPageLink }) {
  const href = link.url;

  if (isPlaceholder(href)) {
    return (
      <span className={styles.linkRow}>
        <span>{link.label}:</span>
        <span className={styles.placeholder}>{href}</span>
      </span>
    );
  }

  if (isInternalHref(href)) {
    return <Link href={href}>{link.label}</Link>;
  }

  return (
    <a href={href} target="_blank" rel="noreferrer noopener">
      {link.label}
    </a>
  );
}

export default function StaticPage({ content }: { content: StaticPageContent }) {
  return (
    <section className={`${styles.page} container`}>
      <h1 className={styles.title}>{content.h1}</h1>
      <p className={styles.lead}>{content.lead}</p>

      {content.sections.map((section) => (
        <section key={section.heading} className={styles.section}>
          <h2 className={styles.sectionHeading}>{section.heading}</h2>

          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph} className={styles.body}>
              {paragraph}
            </p>
          ))}

          {section.bullets?.length ? (
            <ul className={styles.list} role="list">
              {section.bullets.map((bullet) => (
                <li key={bullet} className={styles.listItem}>
                  {bullet}
                </li>
              ))}
            </ul>
          ) : null}

          {section.links?.length ? (
            <ul className={styles.linkList} role="list">
              {section.links.map((link) => (
                <li key={`${link.label}:${link.url}`} className={styles.listItem}>
                  <PageLink link={link} />
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </section>
  );
}
