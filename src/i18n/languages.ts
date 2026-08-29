// Languages NaturalTalk's own interface can be displayed in.
// Distinct from src/config/languageConfig.ts, which lists languages you can
// translate *messages* into — this list is only for the app's own UI chrome.

export interface UILanguage {
  code: string;
  /** Name written in that language itself (endonym), so users can find their
   * own language even when the current UI language isn't theirs. */
  nativeName: string;
  flag: string;
  isRTL: boolean;
}

export const UI_LANGUAGES: UILanguage[] = [
  { code: "en", nativeName: "English", flag: "🇬🇧", isRTL: false },
  { code: "es", nativeName: "Español", flag: "🇪🇸", isRTL: false },
  { code: "ja", nativeName: "日本語", flag: "🇯🇵", isRTL: false },
  { code: "zh-Hans", nativeName: "简体中文", flag: "🇨🇳", isRTL: false },
  { code: "zh-Hant", nativeName: "繁體中文", flag: "🇹🇼", isRTL: false },
  { code: "ko", nativeName: "한국어", flag: "🇰🇷", isRTL: false },
  { code: "ar", nativeName: "العربية", flag: "🇸🇦", isRTL: true },
  { code: "pt", nativeName: "Português", flag: "🇧🇷", isRTL: false },
  { code: "fr", nativeName: "Français", flag: "🇫🇷", isRTL: false },
  { code: "de", nativeName: "Deutsch", flag: "🇩🇪", isRTL: false },
  { code: "it", nativeName: "Italiano", flag: "🇮🇹", isRTL: false },
  { code: "hi", nativeName: "हिन्दी", flag: "🇮🇳", isRTL: false },
  { code: "th", nativeName: "ไทย", flag: "🇹🇭", isRTL: false },
  { code: "vi", nativeName: "Tiếng Việt", flag: "🇻🇳", isRTL: false },
  { code: "id", nativeName: "Bahasa Indonesia", flag: "🇮🇩", isRTL: false },
  { code: "tr", nativeName: "Türkçe", flag: "🇹🇷", isRTL: false },
  { code: "pl", nativeName: "Polski", flag: "🇵🇱", isRTL: false },
];

export const DEFAULT_UI_LANGUAGE = "en";

export function isSupportedUILanguage(code: string): boolean {
  return UI_LANGUAGES.some((l) => l.code === code);
}

/** Best-effort match of a BCP-47 browser tag (e.g. "pt-BR", "zh-Hans-CN") to a supported UI language. */
export function matchBrowserLanguage(tag: string): string | null {
  const lower = tag.toLowerCase();

  // Chinese needs script/region sniffing rather than a bare base-language
  // match, since "zh" alone is ambiguous between Simplified and Traditional.
  if (lower.startsWith("zh")) {
    const isTraditional =
      lower.includes("hant") ||
      lower.includes("-tw") ||
      lower.includes("-hk") ||
      lower.includes("-mo");
    return isTraditional ? "zh-Hant" : "zh-Hans";
  }

  const base = lower.split("-")[0];
  if (isSupportedUILanguage(base)) return base;
  return null;
}
