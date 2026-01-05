import type { Locale } from "@/i18n/locales";

export type StaticPageId = "about" | "terms" | "privacy" | "contact";

export type StaticPageLink = {
  label: string;
  url: string;
};

export type StaticPageSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  links?: StaticPageLink[];
};

export type StaticPageContent = {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  lead: string;
  sections: StaticPageSection[];
};

const PLACEHOLDERS = {
  operatorName: "{{OPERATOR_NAME}}",
  contactEmail: "{{CONTACT_EMAIL}}",
  contactFormUrl: "{{CONTACT_FORM_URL}}",
  lastUpdated: "{{LAST_UPDATED_DATE_ISO}}",
} as const;

type Localized<T> = Partial<Record<Locale, T>>;

function resolveLocalized<T>(table: Localized<T>, locale: Locale): T {
  const resolved = table[locale] ?? table.en ?? table.ja;
  if (!resolved) {
    throw new Error("Static page content is not configured.");
  }
  return resolved;
}

const ABOUT: Localized<StaticPageContent> = {
  ja: {
    metaTitle: "概要 | Music Library Sample",
    metaDescription: "音楽ライブラリUIのテンプレート用サンプルです。",
    h1: "概要",
    lead: "このサイトは、音楽ライブラリUIのテンプレートとして使えるサンプル実装です。",
    sections: [
      {
        heading: "このテンプレートでできること",
        bullets: [
          "タグ/タブで絞り込み",
          "試聴プレイヤー",
          "詳細モーダル",
          "ダウンロードダイアログ(同意チェック付き)",
        ],
      },
      {
        heading: "置き換えるポイント",
        bullets: [
          "ブランド: src/lib/branding.ts",
          "カタログ: src/music/sampleCatalog.ts",
          "静的ページ: src/i18n/pages.ts",
        ],
      },
    ],
  },
  en: {
    metaTitle: "About | Music Library Sample",
    metaDescription: "A template-ready music library UI sample.",
    h1: "About",
    lead: "This site is a template-ready sample implementation of a music library UI.",
    sections: [
      {
        heading: "What you get",
        bullets: [
          "Tag/tab filtering",
          "Preview player",
          "Details modal",
          "Download dialog with agreement checkbox",
        ],
      },
      {
        heading: "What to customize",
        bullets: [
          "Branding: src/lib/branding.ts",
          "Catalog: src/music/sampleCatalog.ts",
          "Static pages: src/i18n/pages.ts",
        ],
      },
    ],
  },
};

const TERMS: Localized<StaticPageContent> = {
  ja: {
    metaTitle: "利用規約 | Music Library Sample",
    metaDescription: "テンプレート用のサンプル利用規約です。",
    h1: "利用規約",
    lead: `最終更新: ${PLACEHOLDERS.lastUpdated}`,
    sections: [
      {
        heading: "サンプル条項",
        paragraphs: [
          "ここはテンプレート用のプレースホルダーです。あなたのサービス内容に合わせて内容を差し替えてください。",
        ],
      },
    ],
  },
  en: {
    metaTitle: "Terms | Music Library Sample",
    metaDescription: "Template sample terms.",
    h1: "Terms",
    lead: `Last updated: ${PLACEHOLDERS.lastUpdated}`,
    sections: [
      {
        heading: "Sample terms",
        paragraphs: ["This is placeholder copy for a template. Replace it with your own terms."],
      },
    ],
  },
};

const PRIVACY: Localized<StaticPageContent> = {
  ja: {
    metaTitle: "プライバシーポリシー | Music Library Sample",
    metaDescription: "テンプレート用のサンプルプライバシーポリシーです。",
    h1: "プライバシーポリシー",
    lead: `最終更新: ${PLACEHOLDERS.lastUpdated}`,
    sections: [
      {
        heading: "サンプル条項",
        paragraphs: [
          "ここはテンプレート用のプレースホルダーです。取得する情報と利用目的に合わせて内容を差し替えてください。",
        ],
      },
    ],
  },
  en: {
    metaTitle: "Privacy | Music Library Sample",
    metaDescription: "Template sample privacy policy.",
    h1: "Privacy",
    lead: `Last updated: ${PLACEHOLDERS.lastUpdated}`,
    sections: [
      {
        heading: "Sample policy",
        paragraphs: [
          "This is placeholder copy for a template. Replace it with your own privacy policy.",
        ],
      },
    ],
  },
};

const CONTACT: Localized<StaticPageContent> = {
  ja: {
    metaTitle: "お問い合わせ | Music Library Sample",
    metaDescription: "連絡先のサンプルです。",
    h1: "お問い合わせ",
    lead: `運営者: ${PLACEHOLDERS.operatorName}`,
    sections: [
      {
        heading: "連絡先",
        links: [
          { label: "お問い合わせフォーム", url: PLACEHOLDERS.contactFormUrl },
          { label: "メール", url: PLACEHOLDERS.contactEmail },
        ],
      },
    ],
  },
  en: {
    metaTitle: "Contact | Music Library Sample",
    metaDescription: "Sample contact page.",
    h1: "Contact",
    lead: `Operator: ${PLACEHOLDERS.operatorName}`,
    sections: [
      {
        heading: "Contact",
        links: [
          { label: "Contact form", url: PLACEHOLDERS.contactFormUrl },
          { label: "Email", url: PLACEHOLDERS.contactEmail },
        ],
      },
    ],
  },
};

export function getStaticPage(pageId: StaticPageId, locale: Locale): StaticPageContent {
  switch (pageId) {
    case "about":
      return resolveLocalized(ABOUT, locale);
    case "terms":
      return resolveLocalized(TERMS, locale);
    case "privacy":
      return resolveLocalized(PRIVACY, locale);
    case "contact":
      return resolveLocalized(CONTACT, locale);
  }
}
