import PlayerProvider from "@/music/PlayerProvider";
import TrackGrid from "@/music/components/TrackGrid";
import { getCatalog } from "@/music/catalog";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/locales";

export default async function Home({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale: localeParam } = await params;
  const locale: Locale = isLocale(localeParam) ? localeParam : DEFAULT_LOCALE;
  const { tracks, tags } = getCatalog();

  return (
    <PlayerProvider>
      <TrackGrid tracks={tracks} tags={tags} locale={locale} />
    </PlayerProvider>
  );
}
