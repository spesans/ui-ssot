import styles from "./Footer.module.css";
import { BRAND } from "@/lib/branding";

type IconProps = {
  className?: string;
};

function YouTubeIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

function InstagramIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function XIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <span className={styles.spacer} aria-hidden="true" />
        <p className={styles.copyright}>
          © {new Date().getFullYear()} {BRAND.shortName}
        </p>
        <nav className={styles.social} aria-label="Social links">
          <a
            className={styles.socialLink}
            href="https://www.youtube.com/"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="YouTube"
            title="YouTube"
          >
            <YouTubeIcon className={styles.socialIcon} />
          </a>
          <a
            className={styles.socialLink}
            href="https://www.instagram.com/"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Instagram"
            title="Instagram"
          >
            <InstagramIcon className={styles.socialIcon} />
          </a>
          <a
            className={styles.socialLink}
            href="https://x.com/"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="X"
            title="X"
          >
            <XIcon className={styles.socialIcon} />
          </a>
        </nav>
      </div>
    </footer>
  );
}
