/**
 * UI translations for the shelf page. Book files themselves are not translated;
 * per-book blurbs can be localized in books.config.json ("blurb": {"en": ..., "ko": ...}).
 */

export interface LocaleDef {
  /** Key used in books.config.json localized fields, e.g. "ko". */
  key: string;
  /** URL path prefix: "" for the root (English), "ko" → /ko/. */
  path: string;
  htmlLang: string;
  nativeName: string;
  /** Extra Google Fonts stylesheet holding body glyphs for this script. */
  fontHref?: string;
  /** Serif family from fontHref, appended after Spectral for CJK fallback. */
  bodyFont?: string;
  s: {
    eyebrow: string;
    tagline: string;
    caseNote: string;
    houseEdition: string;
    fineLine: string;
    langLabel: string;
    tagMeta: (min: number) => string;
    volumesLine: (n: number) => string;
    shelves: Record<string, string>;
  };
}

export const LOCALES: LocaleDef[] = [
  {
    key: "en",
    path: "",
    htmlLang: "en",
    nativeName: "English",
    s: {
      eyebrow: "Antiquarian & Bookshop",
      tagline: "Interactive little books, kept the old way.",
      caseNote: "Every volume opens where you left it. Pull one from the shelf.",
      houseEdition: "House edition",
      fineLine:
        "Set in IM Fell English &amp; Spectral &middot; new stock: drop an <code>.html</code> into <code>html/</code> and rebuild",
      langLabel: "Language",
      tagMeta: (min) => `&#8776;&nbsp;${min} min &middot; interactive edition`,
      volumesLine: (n) => `${n} volume${n === 1 ? "" : "s"} in the case`,
      shelves: {},
    },
  },
  {
    key: "ko",
    path: "ko",
    htmlLang: "ko",
    nativeName: "한국어",
    fontHref: "https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;500&display=swap",
    bodyFont: "Noto Serif KR",
    s: {
      eyebrow: "고서점 & 서점",
      tagline: "옛 방식으로 간직한 인터랙티브 작은 책들.",
      caseNote: "책마다 읽던 자리에서 다시 펼쳐집니다. 서가에서 한 권 꺼내 보세요.",
      houseEdition: "하우스 에디션",
      fineLine:
        "IM Fell English &amp; Spectral 서체로 조판 &middot; 새 책: <code>html/</code> 폴더에 <code>.html</code>을 넣고 다시 빌드하세요",
      langLabel: "언어",
      tagMeta: (min) => `&#8776;&nbsp;${min}분 &middot; 인터랙티브판`,
      volumesLine: (n) => `서가에 ${n}권 소장`,
      shelves: {
        Cryptography: "암호학",
        "Machine Learning": "머신러닝",
        "New Arrivals": "신간",
      },
    },
  },
  {
    key: "yue",
    path: "yue",
    htmlLang: "yue",
    nativeName: "粵語",
    fontHref: "https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@300;400;500&display=swap",
    bodyFont: "Noto Serif TC",
    s: {
      eyebrow: "古書店・書店",
      tagline: "用舊方式收藏嘅互動小書。",
      caseNote: "每本書都會喺你上次睇到嘅地方打開。喺書架度抽一本出嚟啦。",
      houseEdition: "本店版本",
      fineLine:
        "以 IM Fell English 同 Spectral 排版 &middot; 上新書：將 <code>.html</code> 放入 <code>html/</code> 再重新構建",
      langLabel: "語言",
      tagMeta: (min) => `&#8776;&nbsp;${min} 分鐘 &middot; 互動版`,
      volumesLine: (n) => `書櫃入面有 ${n} 本`,
      shelves: {
        Cryptography: "密碼學",
        "Machine Learning": "機器學習",
        "New Arrivals": "新書上架",
      },
    },
  },
  {
    key: "zh",
    path: "zh",
    htmlLang: "zh-Hans",
    nativeName: "简体中文",
    fontHref: "https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;500&display=swap",
    bodyFont: "Noto Serif SC",
    s: {
      eyebrow: "古旧书店",
      tagline: "以旧时方式珍藏的互动小书。",
      caseNote: "每本书都会在你上次读到的地方打开。从书架上抽一本吧。",
      houseEdition: "本店版本",
      fineLine:
        "以 IM Fell English 与 Spectral 排版 &middot; 上新书：将 <code>.html</code> 放入 <code>html/</code> 后重新构建",
      langLabel: "语言",
      tagMeta: (min) => `&#8776;&nbsp;${min} 分钟 &middot; 互动版`,
      volumesLine: (n) => `书柜中共 ${n} 册`,
      shelves: {
        Cryptography: "密码学",
        "Machine Learning": "机器学习",
        "New Arrivals": "新书上架",
      },
    },
  },
  {
    key: "ja",
    path: "ja",
    htmlLang: "ja",
    nativeName: "日本語",
    fontHref: "https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;500&display=swap",
    bodyFont: "Noto Serif JP",
    s: {
      eyebrow: "古書店・書店",
      tagline: "昔ながらの佇まいで綴じた、インタラクティブな小さな本。",
      caseNote: "どの本も、前回読んだところから開きます。棚から一冊どうぞ。",
      houseEdition: "自家版",
      fineLine:
        "IM Fell English と Spectral で組版 &middot; 新入荷：<code>.html</code> を <code>html/</code> に入れて再ビルド",
      langLabel: "言語",
      tagMeta: (min) => `&#8776;&nbsp;${min}分 &middot; インタラクティブ版`,
      volumesLine: (n) => `書棚に${n}冊`,
      shelves: {
        Cryptography: "暗号学",
        "Machine Learning": "機械学習",
        "New Arrivals": "新着",
      },
    },
  },
  {
    key: "cs",
    path: "cs",
    htmlLang: "cs",
    nativeName: "Čeština",
    s: {
      eyebrow: "Antikvariát & knihkupectví",
      tagline: "Interaktivní knížky, uchované postaru.",
      caseNote: "Každý svazek se otevře tam, kde jste skončili. Vytáhněte si jeden z police.",
      houseEdition: "Domácí vydání",
      fineLine:
        "Vysazeno písmy IM Fell English &amp; Spectral &middot; nové tituly: vložte <code>.html</code> do <code>html/</code> a znovu sestavte",
      langLabel: "Jazyk",
      tagMeta: (min) => `&#8776;&nbsp;${min} min &middot; interaktivní vydání`,
      volumesLine: (n) => {
        const noun = n === 1 ? "svazek" : n >= 2 && n <= 4 ? "svazky" : "svazků";
        return `${n} ${noun} ve skříni`;
      },
      shelves: {
        Cryptography: "Kryptografie",
        "Machine Learning": "Strojové učení",
        "New Arrivals": "Novinky",
      },
    },
  },
];

/** A config field that is either one string for all locales or a per-locale map. */
export type Localized = string | Record<string, string>;

export function pickText(value: Localized | undefined, localeKey: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "string") return value;
  return value[localeKey] ?? value.en ?? Object.values(value)[0];
}
