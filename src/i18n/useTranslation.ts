import { useCallback, useEffect } from "react";
import { useUILanguageStore } from "@/stores/uiLanguageStore";
import { TRANSLATIONS } from "@/i18n/translations";
import { DEFAULT_UI_LANGUAGE, UI_LANGUAGES } from "@/i18n/languages";
import type { TranslationKey } from "@/i18n/locales/en";

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

/**
 * Translation hook for NaturalTalk's own interface copy.
 * Unrelated to the per-contact message translation feature — this only
 * controls what language the app's buttons, labels and screens are shown in.
 */
export function useTranslation() {
  const language = useUILanguageStore((state) => state.language);
  const setLanguage = useUILanguageStore((state) => state.setLanguage);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      const dict = TRANSLATIONS[language] ?? TRANSLATIONS[DEFAULT_UI_LANGUAGE]!;
      const template = dict[key] ?? TRANSLATIONS[DEFAULT_UI_LANGUAGE]![key] ?? key;
      return interpolate(template, vars);
    },
    [language],
  );

  return { t, language, setLanguage };
}

/**
 * Runs once at app start: matches the browser's language to a supported UI
 * language (if the user hasn't already picked one) and keeps <html>'s
 * lang/dir attributes in sync. Client-only by design — NaturalTalk's whole
 * language preference is stored in the browser, same as everything else.
 */
export function useUILanguageInit() {
  const language = useUILanguageStore((state) => state.language);
  const detectFromBrowserOnce = useUILanguageStore((state) => state.detectFromBrowserOnce);

  useEffect(() => {
    detectFromBrowserOnce();
  }, [detectFromBrowserOnce]);

  useEffect(() => {
    const meta = UI_LANGUAGES.find((l) => l.code === language);
    document.documentElement.lang = language;
    document.documentElement.dir = meta?.isRTL ? "rtl" : "ltr";
  }, [language]);
}
