"use client";

import { useLanguage } from "@/lib/LanguageContext";
import { Container } from "@/components/ui/Container";

export default function Terms() {
  const { t } = useLanguage();

  return (
    <Container className="pt-16 pb-12 md:py-20">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12 md:mb-16">
          <h1 className="text-2xl md:text-3xl font-semibold text-center mb-6">{t.terms.title}</h1>
          <p className="text-xs text-[var(--text-subtle)] text-right">{t.terms.lastUpdated}</p>
        </div>

        <section className="mb-10 md:mb-12">
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">{t.terms.intro}</p>
        </section>

        <div className="space-y-8">
          {t.terms.articles.map((article, index) => (
            <section key={index}>
              <h2 className="text-sm font-medium mb-3">{article.title}</h2>
              <div className="text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap">
                {article.content}
              </div>
            </section>
          ))}
        </div>
      </div>
    </Container>
  );
}
