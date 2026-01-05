import styles from "../(static)/static-page.module.css";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/locales";
import { getUIStrings } from "@/i18n/ui";

export default async function NewPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale: localeParam } = await params;
  const locale: Locale = isLocale(localeParam) ? localeParam : DEFAULT_LOCALE;
  const ui = getUIStrings(locale);

  return (
    <section className={`${styles.page} container`}>
      <h1 className={styles.title}>{ui.newReleases}</h1>
      <p className={styles.body}>{ui.comingSoon}</p>
    </section>
  );
}
