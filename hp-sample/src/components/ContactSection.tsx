"use client";

import React, { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { z } from "zod";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatTelHref } from "@/lib/format-tel-href";
import { useLanguage } from "@/lib/LanguageContext";
import { publicEnv } from "@/lib/env/public";

type HeadingLevel = "h1" | "h2";

type ContactSectionProps = {
  headingLevel?: HeadingLevel;
};

const ContactPayloadSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().pipe(z.email()),
  subject: z.string().trim().optional(),
  message: z.string().trim().min(1),
  website: z.string().trim().optional(),
});

type ContactPayload = z.infer<typeof ContactPayloadSchema>;

const normalizeEntry = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value.trim() : "";
const emptyToUndefined = (value: string) => (value.length === 0 ? undefined : value);

export function ContactSection({ headingLevel = "h2" }: ContactSectionProps) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  const endpoint = publicEnv.NEXT_PUBLIC_CONTACT_ENDPOINT;
  const isEndpointConfigured = Boolean(endpoint);

  const TitleTag: React.ElementType = headingLevel;
  const contactEmail = t.legal.items.email.value;
  const contactPhone = t.legal.items.phone.value;

  useEffect(() => {
    if (!error) return;
    errorRef.current?.focus();
  }, [error]);

  const inputBaseClass =
    "w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--text-subtle)] hover:border-[var(--input-border-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--input-ring)] focus-visible:border-[var(--input-border-focus)] transition-colors";

  const honeypotClass = useMemo(
    () => `${inputBaseClass} opacity-0 h-0 p-0 border-0`,
    [inputBaseClass],
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!endpoint) {
      setError(t.contact.form.missingEndpoint);
      return;
    }

    const formData = new FormData(e.currentTarget);

    const parsed = ContactPayloadSchema.safeParse({
      name: normalizeEntry(formData.get("name")),
      email: normalizeEntry(formData.get("email")),
      subject: emptyToUndefined(normalizeEntry(formData.get("subject"))),
      message: normalizeEntry(formData.get("message")),
      website: emptyToUndefined(normalizeEntry(formData.get("website"))),
    } satisfies ContactPayload);

    if (!parsed.success) {
      setError(t.contact.form.error);
      return;
    }

    const payload = parsed.data;

    if (payload.website) {
      setIsSent(true);
      e.currentTarget.reset();
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Contact endpoint responded with an error status.");
      }

      setIsSent(true);
      e.currentTarget.reset();
    } catch (err) {
      console.error(err);
      setError(t.contact.form.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
      <div>
        <TitleTag className="text-2xl md:text-3xl font-semibold mb-6 md:mb-6 text-center">
          {t.contact.title}
        </TitleTag>
        <p className="text-[var(--text-muted)] mb-10 md:mb-12 leading-relaxed text-sm md:text-base">
          {t.contact.desc}
        </p>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--surface-2)] text-[var(--text-subtle)]">
              <Mail size={18} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs text-[var(--text-subtle)] mb-1">{t.contact.email}</p>
              <a
                href={`mailto:${contactEmail}`}
                className="text-sm hover:text-[var(--text-muted)] transition-colors focus-visible:outline-none focus-visible:underline"
                rel="nofollow"
              >
                {contactEmail}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--surface-2)] text-[var(--text-subtle)]">
              <Phone size={18} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs text-[var(--text-subtle)] mb-1">{t.contact.phone}</p>
              <a
                href={formatTelHref(contactPhone)}
                className="text-sm hover:text-[var(--text-muted)] transition-colors focus-visible:outline-none focus-visible:underline"
                rel="nofollow"
              >
                {contactPhone}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--surface-2)] text-[var(--text-subtle)]">
              <MapPin size={18} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs text-[var(--text-subtle)] mb-1">{t.about.table.address}</p>
              <p className="text-sm leading-relaxed">
                {t.common.addressLine1}
                <br />
                {t.common.addressLine2} {t.common.addressLine3}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-color)] shadow-sm">
        {isSent ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-8">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5 bg-[var(--success-bg)] text-[var(--success-text)] border border-[var(--success-border)]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">{t.contact.form.thankYouTitle}</h3>
            <p className="text-sm text-[var(--text-muted)]">{t.contact.form.success}</p>
            <Button
              variant="ghost"
              className="mt-8"
              onClick={() => {
                setIsSent(false);
              }}
            >
              {t.contact.form.back}
            </Button>
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              void handleSubmit(event);
            }}
            className="space-y-5"
            noValidate
          >
            {!isEndpointConfigured && (
              <div
                role="status"
                className="text-sm text-[var(--text-muted)] bg-[var(--card-title-bg)] border border-[var(--border-color)] rounded-lg px-4 py-3"
              >
                {t.contact.form.missingEndpoint}
              </div>
            )}

            <div className="opacity-0 h-0 overflow-hidden" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                type="text"
                id="website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                className={honeypotClass}
              />
            </div>

            {error && (
              <div
                ref={errorRef}
                tabIndex={-1}
                role="alert"
                className="text-sm text-[var(--danger-text)] bg-[var(--danger-bg)] border border-[var(--danger-border)] rounded-lg px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--danger-border)]"
              >
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="name"
                className="block text-xs font-medium text-[var(--text-subtle)] mb-2"
              >
                {t.contact.form.name}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                autoComplete="name"
                className={inputBaseClass}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-[var(--text-subtle)] mb-2"
              >
                {t.contact.form.email}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                autoComplete="email"
                className={inputBaseClass}
              />
            </div>

            <div>
              <label
                htmlFor="subject"
                className="block text-xs font-medium text-[var(--text-subtle)] mb-2"
              >
                {t.contact.form.subject}
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                autoComplete="off"
                className={inputBaseClass}
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-xs font-medium text-[var(--text-subtle)] mb-2"
              >
                {t.contact.form.message}
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                className={`${inputBaseClass} resize-none`}
              />
            </div>

            <Button
              type="submit"
              disabled={!isEndpointConfigured || isSubmitting}
              className="w-full"
              size="md"
            >
              {isSubmitting ? t.contact.form.sending : t.contact.form.submit}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
