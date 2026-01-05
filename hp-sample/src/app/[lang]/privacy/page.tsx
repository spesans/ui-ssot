"use client";

import { useLanguage } from "@/lib/LanguageContext";
import { Container } from "@/components/ui/Container";
import { PanelLink } from "@/components/PanelLink";

export default function Privacy() {
  const { t } = useLanguage();

  return (
    <Container className="pt-20 pb-12 md:pt-24 md:pb-20">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12 md:mb-16">
          <h1 className="text-2xl md:text-3xl font-semibold text-center mb-6">{t.privacy.title}</h1>
          <p className="text-xs text-[var(--text-subtle)] text-right">{t.privacy.lastUpdated}</p>
        </div>

        <section className="mb-10 md:mb-12">
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">{t.privacy.intro}</p>
        </section>

        <div className="space-y-8">
          {t.privacy.sections.map((section, index) => (
            <section key={index}>
              <h2 className="text-sm font-medium mb-3">{section.title}</h2>
              <div className="text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-12 md:mt-16 pt-8 border-t border-[var(--border-color)]">
          <h3 className="text-sm font-medium mb-3">{t.contact.infoTitle}</h3>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            {t.common.companyName}
            <br />
            {t.common.addressLine1}
            <br />
            {t.common.addressLine2} {t.common.addressLine3}
            <br />
            <PanelLink
              href="/#contact"
              className="hover:text-[var(--text-muted)] transition-colors focus-visible:outline-none focus-visible:underline"
            >
              {t.common.contactUs}
            </PanelLink>
          </p>
        </section>
      </div>
    </Container>
  );
}
