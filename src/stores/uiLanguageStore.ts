import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_UI_LANGUAGE, matchBrowserLanguage } from "@/i18n/languages";

interface UILanguageStore {
  /** BCP-47-ish code for the language NaturalTalk's own screens are shown in. */
  language: string;
  /** Whether we've already tried to match the browser's language once. */
  autoDetected: boolean;
  setLanguage: (code: string) => void;
  detectFromBrowserOnce: () => void;
}

export const useUILanguageStore = create<UILanguageStore>()(
  persist(
    (set, get) => ({
      language: DEFAULT_UI_LANGUAGE,
      autoDetected: false,
      setLanguage: (code) => set({ language: code }),
      detectFromBrowserOnce: () => {
        if (get().autoDetected) return;
        if (typeof navigator === "undefined") return;
        const candidates = navigator.languages && navigator.languages.length > 0
          ? navigator.languages
          : [navigator.language];
        for (const tag of candidates) {
          const match = matchBrowserLanguage(tag);
          if (match) {
            set({ language: match, autoDetected: true });
            return;
          }
        }
        set({ autoDetected: true });
      },
    }),
    { name: "naturaltalk-ui-language" },
  ),
);
