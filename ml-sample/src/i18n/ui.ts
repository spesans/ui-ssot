import type { Locale } from "./locales";

export type UIStrings = {
  home: string;
  about: string;
  greeting: string;
  terms: string;
  privacyPolicy: string;
  contact: string;
  newReleases: string;
  comingSoon: string;
  filters: string;
  search: string;
  searchPlaceholder: string;
  clearSearch: string;
  resultsCount: string;
  clearFilters: string;
  removeFilter: string;
  noResults: string;
  resetFilters: string;
  tagMatchMode: string;
  matchAny: string;
  matchAll: string;
  download: string;
  license: string;
  file: string;
  applyHere: string;
  cancel: string;
  preparing: string;
  share: string;
  copied: string;
  shared: string;
  play: string;
  pause: string;
  details: string;
  moreOptions: string;
  tags: string;
  trackLibrary: string;
  seek: string;
  playbackTime: string;
  closeModal: string;
  downloadDialogDescription: string;
  noDownloadsAvailable: string;
  licenseAgreement: string;
  licenseSummary: string;
  downloadsTemporarilyUnavailable: string;
  downloadErrorAgreement: string;
  downloadErrorNotAvailable: string;
  downloadErrorTooManyRequests: string;
  downloadErrorServiceUnavailable: string;
  downloadErrorGeneric: string;
  // Accessibility
  skipToContent: string;
  openNavigation: string;
  closeNavigation: string;
  selectLanguage: string;
  toggleTheme: string;
  // Pagination
  previousPage: string;
  nextPage: string;
};

const UI: Partial<Record<Locale, UIStrings>> = {
  ja: {
    home: "ホーム",
    about: "概要",
    greeting: "あいさつ",
    terms: "利用規約",
    privacyPolicy: "プライバシーポリシー",
    contact: "お問い合わせ",
    newReleases: "新作",
    comingSoon: "準備中",
    filters: "絞り込み",
    search: "検索",
    searchPlaceholder: "曲名・アーティスト・キーワードで検索",
    clearSearch: "検索をクリア",
    resultsCount: "{total}件中{shown}件",
    clearFilters: "クリア",
    removeFilter: "フィルターを解除",
    noResults: "一致する楽曲がありません。",
    resetFilters: "リセット",
    tagMatchMode: "タグの条件",
    matchAny: "いずれか",
    matchAll: "すべて",
    download: "ダウンロード",
    license: "ライセンス",
    file: "ファイル",
    applyHere: "リンクを開く",
    cancel: "キャンセル",
    preparing: "準備中…",
    share: "共有",
    copied: "コピーしました",
    shared: "共有しました",
    play: "再生",
    pause: "一時停止",
    details: "詳細",
    moreOptions: "その他のオプション",
    tags: "タグ",
    trackLibrary: "ライブラリ",
    seek: "シーク",
    playbackTime: "再生時間",
    closeModal: "閉じる",
    downloadDialogDescription: "ライセンス条件を確認してからダウンロードを開始します。",
    noDownloadsAvailable: "このトラックにはダウンロードがありません。",
    licenseAgreement: "このダウンロードのライセンス条件に同意します。",
    licenseSummary:
      "これはテンプレート用のサンプルです。内容はあなたの用途に合わせて置き換えてください。",
    downloadsTemporarilyUnavailable: "ダウンロードは現在利用できません。",
    downloadErrorAgreement:
      "ダウンロードを準備できませんでした。ライセンスへの同意を確認してください。",
    downloadErrorNotAvailable: "このダウンロードは利用できなくなりました。",
    downloadErrorTooManyRequests: "リクエストが多すぎます。少し待ってから再度お試しください。",
    downloadErrorServiceUnavailable: "ダウンロードサービスは一時的に利用できません。",
    downloadErrorGeneric: "ダウンロードを準備できませんでした。もう一度お試しください。",
    // Accessibility
    skipToContent: "メインコンテンツへ",
    openNavigation: "ナビゲーションを開く",
    closeNavigation: "ナビゲーションを閉じる",
    selectLanguage: "言語を選択",
    toggleTheme: "テーマを切り替え",
    // Pagination
    previousPage: "前のページ",
    nextPage: "次のページ",
  },
  en: {
    home: "Home",
    about: "About",
    greeting: "Greeting",
    terms: "Terms",
    privacyPolicy: "Privacy",
    contact: "Contact",
    newReleases: "New",
    comingSoon: "Coming soon",
    filters: "Filters",
    search: "Search",
    searchPlaceholder: "Search by title, artist, or keyword",
    clearSearch: "Clear search",
    resultsCount: "Showing {shown} of {total}",
    clearFilters: "Clear",
    removeFilter: "Remove filter",
    noResults: "No tracks found.",
    resetFilters: "Reset filters",
    tagMatchMode: "Tag match",
    matchAny: "Any",
    matchAll: "All",
    download: "Download",
    license: "License",
    file: "File",
    applyHere: "Open link",
    cancel: "Cancel",
    preparing: "Preparing…",
    share: "Share",
    copied: "Copied",
    shared: "Shared",
    play: "Play",
    pause: "Pause",
    details: "Details",
    moreOptions: "More options",
    tags: "Tags",
    trackLibrary: "Library",
    seek: "Seek",
    playbackTime: "Playback time",
    closeModal: "Close modal",
    downloadDialogDescription: "Review the license terms, then start the download.",
    noDownloadsAvailable: "No downloads available for this track.",
    licenseAgreement: "I agree to the license terms for this download.",
    licenseSummary: "This is template sample copy. Replace it with your own license terms.",
    downloadsTemporarilyUnavailable: "Downloads are temporarily unavailable.",
    downloadErrorAgreement: "Unable to prepare the download. Please confirm the license agreement.",
    downloadErrorNotAvailable: "This download is no longer available.",
    downloadErrorTooManyRequests: "Too many requests. Please wait a moment and try again.",
    downloadErrorServiceUnavailable: "The download service is temporarily unavailable.",
    downloadErrorGeneric: "Unable to prepare the download. Please try again.",
    // Accessibility
    skipToContent: "Skip to content",
    openNavigation: "Open navigation",
    closeNavigation: "Close navigation",
    selectLanguage: "Select language",
    toggleTheme: "Toggle theme",
    // Pagination
    previousPage: "Previous page",
    nextPage: "Next page",
  },
};

export function getUIStrings(locale: Locale): UIStrings {
  const resolved = UI[locale] ?? UI.en ?? UI.ja;
  if (!resolved) {
    throw new Error("UI strings are not configured.");
  }
  return resolved;
}
