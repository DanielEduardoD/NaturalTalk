import { ChevronDown } from "lucide-react";
import { UI_LANGUAGES } from "@/i18n/languages";
import { useTranslation } from "@/i18n/useTranslation";
import { inputClass } from "./ui-kit";
import { cn } from "@/lib/utils";

/**
 * Lets the user choose what language NaturalTalk's own interface is shown
 * in. Separate from LanguagePicker, which picks the language a *message*
 * gets translated into.
 *
 * Renders as a native <select> dropdown rather than a grid of buttons so it
 * scales to a long language list without taking over the screen.
 *
 * `compact` renders a small pill-sized control (used in the landing page
 * header, before onboarding); the default renders a full-width field (used
 * in Settings).
 */
export function UILanguagePicker({ compact = false }: { compact?: boolean } = {}) {
  const { language, setLanguage } = useTranslation();

  return (
    <div className={cn("relative", compact ? "inline-block" : "w-full")}>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        aria-label="App language"
        className={cn(
          "appearance-none",
          compact
            ? "rounded-full border border-border bg-field py-1.5 ps-3 pe-8 text-xs text-foreground"
            : `${inputClass} pe-9`,
        )}
      >
        {UI_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.nativeName}
          </option>
        ))}
      </select>
      <ChevronDown
        className={cn(
          "pointer-events-none absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground",
          compact ? "size-3.5" : "size-4",
        )}
      />
    </div>
  );
}
