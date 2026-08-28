import { UI_LANGUAGES } from "@/i18n/languages";
import { useTranslation } from "@/i18n/useTranslation";

/**
 * Lets the user choose what language NaturalTalk's own interface is shown
 * in. Separate from LanguagePicker, which picks the language a *message*
 * gets translated into.
 */
export function UILanguagePicker() {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="flex flex-wrap gap-2">
      {UI_LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => setLanguage(lang.code)}
          className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition-colors ${
            language === lang.code
              ? "border-primary bg-primary/15 text-primary"
              : "border-border bg-field text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>{lang.flag}</span>
          <span>{lang.nativeName}</span>
        </button>
      ))}
    </div>
  );
}
