"use client";

import React from "react";
import { useLanguage } from "@/lib/LanguageContext";

type HeadingLevel = "h1" | "h2";

type AboutSectionProps = {
  headingLevel?: HeadingLevel;
};

export function AboutSection({ headingLevel = "h2" }: AboutSectionProps) {
  const { t } = useLanguage();

  const TitleTag: React.ElementType = headingLevel;
  const SectionTitleTag: React.ElementType = headingLevel === "h1" ? "h2" : "h3";

  return (
    <div className="max-w-2xl mx-auto">
      <TitleTag className="text-2xl md:text-3xl font-semibold mb-12 md:mb-16 text-center">
        {t.about.title}
      </TitleTag>

      <section className="mb-14 md:mb-20">
        <SectionTitleTag className="text-xs font-semibold text-[var(--text-subtle)] mb-4 uppercase tracking-wider">
          {t.about.missionTitle}
        </SectionTitleTag>
        <p className="text-lg text-[var(--text-muted)] leading-relaxed">{t.about.missionText}</p>
      </section>

      <section>
        <SectionTitleTag className="text-xs font-semibold text-[var(--text-subtle)] mb-8 uppercase tracking-wider">
          {t.about.companyInfoTitle}
        </SectionTitleTag>
        <dl className="space-y-0">
          <div className="flex flex-col md:flex-row md:justify-between py-4 border-b border-[var(--border-color)]">
            <dt className="text-sm text-[var(--text-subtle)] mb-1 md:mb-0">{t.about.table.name}</dt>
            <dd className="text-sm md:text-right">
              {t.about.values.nameLine1}
              {t.about.values.nameLine2 && (
                <>
                  <br />
                  {t.about.values.nameLine2}
                </>
              )}
            </dd>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between py-4 border-b border-[var(--border-color)]">
            <dt className="text-sm text-[var(--text-subtle)] mb-1 md:mb-0">
              {t.about.table.established}
            </dt>
            <dd className="text-sm">{t.about.values.establishedDate}</dd>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between py-4 border-b border-[var(--border-color)]">
            <dt className="text-sm text-[var(--text-subtle)] mb-1 md:mb-0">
              {t.about.table.representative}
            </dt>
            <dd className="text-sm">{t.about.values.representativeName}</dd>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between py-4 border-b border-[var(--border-color)]">
            <dt className="text-sm text-[var(--text-subtle)] mb-1 md:mb-0">
              {t.about.table.address}
            </dt>
            <dd className="text-sm md:text-right leading-relaxed">
              {t.common.addressLine1}
              <br />
              {t.common.addressLine2} {t.common.addressLine3}
            </dd>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between py-4 border-b border-[var(--border-color)]">
            <dt className="text-sm text-[var(--text-subtle)] mb-1 md:mb-0">
              {t.about.table.corporateNumber}
            </dt>
            <dd className="text-sm font-mono">{t.about.values.corporateNumberId}</dd>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between py-4 border-b border-[var(--border-color)]">
            <dt className="text-sm text-[var(--text-subtle)] mb-1 md:mb-0">{t.about.table.duns}</dt>
            <dd className="text-sm font-mono">{t.about.values.dunsId}</dd>
          </div>
          <div className="py-5">
            <dt className="text-sm text-[var(--text-subtle)] mb-4">{t.about.table.business}</dt>
            <dd>
              <ul className="space-y-2">
                {Object.values(t.business).map((b, i) => (
                  <li key={i} className="text-sm text-[var(--text-muted)]">
                    {b.title}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
