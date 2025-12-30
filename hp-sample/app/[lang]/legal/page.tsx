"use client";

import { useLanguage } from "@/lib/LanguageContext";
import { Container } from "@/components/ui/Container";

export default function Legal() {
  const { t } = useLanguage();
  const formatTelHref = (phone: string) => {
    const sanitized = phone.replace(/[^\d+]/g, "");
    return sanitized ? `tel:${sanitized}` : "tel:";
  };

  return (
    <Container className="pt-16 pb-12 md:py-20">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12 md:mb-16">
          <h1 className="text-2xl md:text-3xl font-semibold text-center mb-6">{t.legal.title}</h1>
          <p className="text-xs text-[var(--text-subtle)] text-right">{t.legal.lastUpdated}</p>
        </div>

        <dl className="space-y-0">
          {Object.entries(t.legal.items).map(([key, item]) => (
            <div key={key} className="py-4 border-b border-[var(--border-color)]">
              <dt className="text-sm text-[var(--text-subtle)] mb-1">{item.label}</dt>
              <dd className="text-sm whitespace-pre-wrap leading-relaxed">
                {key === "phone" ? (
                  <a
                    href={formatTelHref(item.value)}
                    className="hover:text-[var(--text-muted)] transition-colors focus-visible:outline-none focus-visible:underline"
                    rel="nofollow"
                  >
                    {item.value}
                  </a>
                ) : key === "email" ? (
                  <a
                    href={`mailto:${item.value}`}
                    className="hover:text-[var(--text-muted)] transition-colors focus-visible:outline-none focus-visible:underline"
                    rel="nofollow"
                  >
                    {item.value}
                  </a>
                ) : (
                  item.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Container>
  );
}
