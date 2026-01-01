import { Container } from "./ui/Container";
import { GitHubIcon } from "./icons/GitHubIcon";

const socialLinkClass =
  "flex items-center justify-center w-9 h-9 rounded-lg text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-indicator)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]";

export const Footer = () => {
  return (
    <footer className="py-10 md:py-12 mt-auto">
      <Container>
        <div className="relative flex flex-col md:flex-row items-center justify-center gap-6">
          <nav
            className="flex items-center gap-2 md:ml-auto print-hidden"
            aria-label="Social media links"
          >
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className={socialLinkClass}
              aria-label="GitHub"
            >
              <GitHubIcon size={18} />
            </a>
          </nav>

          <p className="text-sm text-[var(--text-subtle)] text-center md:absolute md:left-1/2 md:-translate-x-1/2">
            © 202X Sample Inc.
          </p>
        </div>
      </Container>
    </footer>
  );
};
