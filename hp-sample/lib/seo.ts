import type { RouteLanguage } from "./locale";

export type SeoPageKey = "home" | "about" | "contact" | "privacy" | "terms" | "legal";

type SeoEntry = {
  title?: string;
  description: string;
};

const seoCopy: Record<RouteLanguage, Record<SeoPageKey, SeoEntry>> = {
  ja: {
    home: {
      description:
        "Sample Inc. はテンプレート用の架空の企業です。ここにあなたの会社の紹介文を記述してください。",
    },
    about: {
      title: "会社概要",
      description: "Sample Inc. の会社概要、ミッション、事業内容などを掲載しています。",
    },
    contact: {
      title: "お問い合わせ",
      description:
        "Sample Inc. へのお問い合わせページです。ご相談・ご依頼はフォームからご連絡ください。",
    },
    privacy: {
      title: "プライバシーポリシー",
      description: "Sample Inc. の個人情報の取り扱いについて定めたプライバシーポリシーです。",
    },
    terms: {
      title: "利用規約",
      description: "Sample Inc. のサービス利用条件を定めた利用規約です。",
    },
    legal: {
      title: "法的情報",
      description: "本サイトの法的表示および開示事項を掲載しています。",
    },
  },
  en: {
    home: {
      description:
        "Sample Inc. is a fictional company used as placeholder content for this template.",
    },
    about: {
      title: "About",
      description:
        "Company profile of Sample Inc., including mission, services, and corporate information.",
    },
    contact: {
      title: "Contact",
      description:
        "Contact Sample Inc. for project inquiries or consultations via the contact form.",
    },
    privacy: {
      title: "Privacy Policy",
      description: "Privacy policy describing how Sample Inc. handles personal information.",
    },
    terms: {
      title: "Terms of Service",
      description: "Terms of service for Sample Inc.'s website and services.",
    },
    legal: {
      title: "Legal Notice",
      description: "Legal notice and required disclosures for this website.",
    },
  },
};

export const getSeoEntry = (lang: RouteLanguage, page: SeoPageKey) => seoCopy[lang][page];
