import type { RouteLanguage } from "./locale";

export type SeoPageKey = "home" | "about" | "contact" | "privacy" | "terms" | "legal";

type SeoEntry = {
  title?: string;
  description: string;
};

const seoCopy: Record<RouteLanguage, Record<SeoPageKey, SeoEntry>> = {
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
  zh: {
    home: {
      description: "Sample Inc. 是用作本模板占位内容的虚构公司。",
    },
    about: {
      title: "关于我们",
      description: "Sample Inc. 的公司简介，包括使命、服务和企业信息。",
    },
    contact: {
      title: "联系我们",
      description: "通过联系表单联系 Sample Inc. 进行项目咨询或洽谈。",
    },
    privacy: {
      title: "隐私政策",
      description: "描述 Sample Inc. 如何处理个人信息的隐私政策。",
    },
    terms: {
      title: "服务条款",
      description: "Sample Inc. 网站和服务的服务条款。",
    },
    legal: {
      title: "法律信息",
      description: "本网站的法律声明和必要披露信息。",
    },
  },
  hi: {
    home: {
      description:
        "Sample Inc. इस टेम्पलेट के लिए प्लेसहोल्डर सामग्री के रूप में उपयोग की जाने वाली एक काल्पनिक कंपनी है।",
    },
    about: {
      title: "हमारे बारे में",
      description:
        "Sample Inc. की कंपनी प्रोफाइल, जिसमें मिशन, सेवाएं और कॉर्पोरेट जानकारी शामिल है।",
    },
    contact: {
      title: "संपर्क करें",
      description:
        "प्रोजेक्ट पूछताछ या परामर्श के लिए संपर्क फ़ॉर्म के माध्यम से Sample Inc. से संपर्क करें।",
    },
    privacy: {
      title: "गोपनीयता नीति",
      description: "गोपनीयता नीति जो बताती है कि Sample Inc. व्यक्तिगत जानकारी को कैसे संभालती है।",
    },
    terms: {
      title: "सेवा की शर्तें",
      description: "Sample Inc. की वेबसाइट और सेवाओं के लिए सेवा की शर्तें।",
    },
    legal: {
      title: "कानूनी जानकारी",
      description: "इस वेबसाइट के लिए कानूनी सूचना और आवश्यक प्रकटीकरण।",
    },
  },
  es: {
    home: {
      description:
        "Sample Inc. es una empresa ficticia utilizada como contenido de marcador de posición para esta plantilla.",
    },
    about: {
      title: "Acerca de nosotros",
      description:
        "Perfil de la empresa Sample Inc., incluyendo misión, servicios e información corporativa.",
    },
    contact: {
      title: "Contacto",
      description:
        "Contacte con Sample Inc. para consultas de proyectos a través del formulario de contacto.",
    },
    privacy: {
      title: "Política de privacidad",
      description:
        "Política de privacidad que describe cómo Sample Inc. maneja la información personal.",
    },
    terms: {
      title: "Términos de servicio",
      description: "Términos de servicio para el sitio web y servicios de Sample Inc.",
    },
    legal: {
      title: "Aviso legal",
      description: "Aviso legal y divulgaciones requeridas para este sitio web.",
    },
  },
  ar: {
    home: {
      description: "Sample Inc. هي شركة وهمية تُستخدم كمحتوى بديل لهذا القالب.",
    },
    about: {
      title: "من نحن",
      description: "ملف الشركة Sample Inc.، بما في ذلك الرسالة والخدمات ومعلومات الشركة.",
    },
    contact: {
      title: "اتصل بنا",
      description: "تواصل مع Sample Inc. للاستفسارات أو الاستشارات عبر نموذج الاتصال.",
    },
    privacy: {
      title: "سياسة الخصوصية",
      description: "سياسة الخصوصية التي توضح كيفية تعامل Sample Inc. مع المعلومات الشخصية.",
    },
    terms: {
      title: "شروط الخدمة",
      description: "شروط الخدمة لموقع وخدمات Sample Inc.",
    },
    legal: {
      title: "المعلومات القانونية",
      description: "الإشعار القانوني والإفصاحات المطلوبة لهذا الموقع.",
    },
  },
  bn: {
    home: {
      description:
        "Sample Inc. একটি কাল্পনিক কোম্পানি যা এই টেমপ্লেটের জন্য প্লেসহোল্ডার কন্টেন্ট হিসাবে ব্যবহৃত হয়।",
    },
    about: {
      title: "আমাদের সম্পর্কে",
      description: "Sample Inc.-এর কোম্পানি প্রোফাইল, মিশন, পরিষেবা এবং কর্পোরেট তথ্য সহ।",
    },
    contact: {
      title: "যোগাযোগ",
      description:
        "প্রকল্প অনুসন্ধান বা পরামর্শের জন্য যোগাযোগ ফর্মের মাধ্যমে Sample Inc.-এর সাথে যোগাযোগ করুন।",
    },
    privacy: {
      title: "গোপনীয়তা নীতি",
      description: "গোপনীয়তা নীতি যা বর্ণনা করে Sample Inc. কীভাবে ব্যক্তিগত তথ্য পরিচালনা করে।",
    },
    terms: {
      title: "সেবার শর্তাবলী",
      description: "Sample Inc.-এর ওয়েবসাইট এবং পরিষেবার জন্য সেবার শর্তাবলী।",
    },
    legal: {
      title: "আইনি তথ্য",
      description: "এই ওয়েবসাইটের জন্য আইনি বিজ্ঞপ্তি এবং প্রয়োজনীয় প্রকাশ।",
    },
  },
  fr: {
    home: {
      description:
        "Sample Inc. est une entreprise fictive utilisée comme contenu de substitution pour ce modèle.",
    },
    about: {
      title: "À propos",
      description:
        "Profil de l'entreprise Sample Inc., incluant mission, services et informations corporatives.",
    },
    contact: {
      title: "Contact",
      description:
        "Contactez Sample Inc. pour des demandes de projets ou des consultations via le formulaire de contact.",
    },
    privacy: {
      title: "Politique de confidentialité",
      description:
        "Politique de confidentialité décrivant comment Sample Inc. traite les informations personnelles.",
    },
    terms: {
      title: "Conditions d'utilisation",
      description: "Conditions d'utilisation du site web et des services de Sample Inc.",
    },
    legal: {
      title: "Mentions légales",
      description: "Mentions légales et divulgations requises pour ce site web.",
    },
  },
  ru: {
    home: {
      description:
        "Sample Inc. — это вымышленная компания, используемая в качестве содержимого-заполнителя для этого шаблона.",
    },
    about: {
      title: "О нас",
      description:
        "Профиль компании Sample Inc., включая миссию, услуги и корпоративную информацию.",
    },
    contact: {
      title: "Контакты",
      description:
        "Свяжитесь с Sample Inc. для запросов по проектам или консультаций через контактную форму.",
    },
    privacy: {
      title: "Политика конфиденциальности",
      description:
        "Политика конфиденциальности, описывающая, как Sample Inc. обрабатывает личную информацию.",
    },
    terms: {
      title: "Условия использования",
      description: "Условия использования веб-сайта и услуг Sample Inc.",
    },
    legal: {
      title: "Правовая информация",
      description: "Правовое уведомление и обязательные раскрытия для этого веб-сайта.",
    },
  },
  pt: {
    home: {
      description:
        "Sample Inc. é uma empresa fictícia usada como conteúdo de substituição para este modelo.",
    },
    about: {
      title: "Sobre",
      description:
        "Perfil da empresa Sample Inc., incluindo missão, serviços e informações corporativas.",
    },
    contact: {
      title: "Contato",
      description:
        "Entre em contato com a Sample Inc. para consultas de projetos através do formulário de contato.",
    },
    privacy: {
      title: "Política de privacidade",
      description:
        "Política de privacidade descrevendo como a Sample Inc. trata informações pessoais.",
    },
    terms: {
      title: "Termos de serviço",
      description: "Termos de serviço para o site e serviços da Sample Inc.",
    },
    legal: {
      title: "Informações legais",
      description: "Aviso legal e divulgações obrigatórias para este site.",
    },
  },
  id: {
    home: {
      description:
        "Sample Inc. adalah perusahaan fiktif yang digunakan sebagai konten placeholder untuk template ini.",
    },
    about: {
      title: "Tentang",
      description:
        "Profil perusahaan Sample Inc., termasuk misi, layanan, dan informasi perusahaan.",
    },
    contact: {
      title: "Kontak",
      description:
        "Hubungi Sample Inc. untuk pertanyaan proyek atau konsultasi melalui formulir kontak.",
    },
    privacy: {
      title: "Kebijakan Privasi",
      description:
        "Kebijakan privasi yang menjelaskan bagaimana Sample Inc. menangani informasi pribadi.",
    },
    terms: {
      title: "Ketentuan Layanan",
      description: "Ketentuan layanan untuk situs web dan layanan Sample Inc.",
    },
    legal: {
      title: "Informasi Legal",
      description: "Pemberitahuan hukum dan pengungkapan yang diperlukan untuk situs web ini.",
    },
  },
  de: {
    home: {
      description:
        "Sample Inc. ist ein fiktives Unternehmen, das als Platzhalterinhalt für diese Vorlage verwendet wird.",
    },
    about: {
      title: "Über uns",
      description:
        "Unternehmensprofil von Sample Inc., einschließlich Mission, Dienstleistungen und Unternehmensinformationen.",
    },
    contact: {
      title: "Kontakt",
      description:
        "Kontaktieren Sie Sample Inc. für Projektanfragen oder Beratungen über das Kontaktformular.",
    },
    privacy: {
      title: "Datenschutzerklärung",
      description:
        "Datenschutzerklärung, die beschreibt, wie Sample Inc. mit persönlichen Daten umgeht.",
    },
    terms: {
      title: "Nutzungsbedingungen",
      description: "Nutzungsbedingungen für die Website und Dienste von Sample Inc.",
    },
    legal: {
      title: "Impressum",
      description: "Impressum und erforderliche Offenlegungen für diese Website.",
    },
  },
  ko: {
    home: {
      description: "Sample Inc.는 이 템플릿의 플레이스홀더 콘텐츠로 사용되는 가상의 회사입니다.",
    },
    about: {
      title: "회사소개",
      description: "Sample Inc.의 회사 프로필, 미션, 서비스 및 기업 정보를 포함합니다.",
    },
    contact: {
      title: "문의하기",
      description: "문의 양식을 통해 프로젝트 문의나 상담을 위해 Sample Inc.에 연락하세요.",
    },
    privacy: {
      title: "개인정보처리방침",
      description: "Sample Inc.가 개인정보를 어떻게 처리하는지 설명하는 개인정보처리방침입니다.",
    },
    terms: {
      title: "이용약관",
      description: "Sample Inc.의 웹사이트 및 서비스에 대한 이용약관입니다.",
    },
    legal: {
      title: "법적 정보",
      description: "이 웹사이트에 대한 법적 고지 및 필수 공개 사항입니다.",
    },
  },
};

export const getSeoEntry = (lang: RouteLanguage, page: SeoPageKey) => seoCopy[lang][page];
