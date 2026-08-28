import { useMemo, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { ALL_LANGUAGES, LANGUAGE_CONFIGS, TIER2_LANGUAGES } from "@/config/languageConfig";
import { inputClass } from "./ui-kit";
import { useTranslation } from "@/i18n/useTranslation";

export function languageLabel(code: string) {
  const known = ALL_LANGUAGES.find((l) => l.code === code);
  if (known) return { flag: known.flag, name: known.name };
  if (!code) return { flag: "🌐", name: "" };
  return { flag: "🌐", name: code };
}

interface LanguagePickerProps {
  value: string;
  onChange: (code: string, name: string) => void;
  placeholder?: string;
  excludeCode?: string;
  label?: string;
}

export function LanguagePicker({
  value,
  onChange,
  placeholder,
  excludeCode,
  label,
}: LanguagePickerProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [custom, setCustom] = useState("");

  const selected = languageLabel(value);
  const resolvedPlaceholder = placeholder ?? t("languagePicker.choosePlaceholder");

  const { tier1, tier2 } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (name: string, code: string) =>
      !q || name.toLowerCase().includes(q) || code.toLowerCase() === q;
    return {
      tier1: Object.values(LANGUAGE_CONFIGS).filter(
        (l) => l.code !== excludeCode && match(l.name, l.code),
      ),
      tier2: TIER2_LANGUAGES.filter((l) => l.code !== excludeCode && match(l.name, l.code)),
    };
  }, [query, excludeCode]);

  const pick = (code: string, name: string) => {
    onChange(code, name);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="space-y-2">
      {label ? (
        <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </label>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${inputClass} flex items-center justify-between text-left`}
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {value ? `${selected.flag}  ${selected.name}` : resolvedPlaceholder}
        </span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Search className="size-4 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("languagePicker.searchPlaceholder")}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button type="button" onClick={() => setOpen(false)} aria-label={t("languagePicker.closeAria")}>
              <X className="size-5 text-muted-foreground" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {tier1.length > 0 ? (
              <p className="px-1 pb-2 text-xs tracking-wide text-muted-foreground uppercase">
                {t("languagePicker.fullSupport")}
              </p>
            ) : null}
            {tier1.map((lang) => (
              <LanguageRow
                key={lang.code}
                flag={lang.flag}
                name={lang.name}
                tier1
                selected={lang.code === value}
                onClick={() => pick(lang.code, lang.name)}
              />
            ))}

            {tier2.length > 0 ? (
              <p className="px-1 pt-4 pb-2 text-xs tracking-wide text-muted-foreground uppercase">
                {t("languagePicker.generalSupport")}
              </p>
            ) : null}
            {tier2.map((lang) => (
              <LanguageRow
                key={lang.code}
                flag={lang.flag}
                name={lang.name}
                selected={lang.code === value}
                onClick={() => pick(lang.code, lang.name)}
              />
            ))}

            <div className="mt-5 space-y-2 rounded-xl border border-border bg-surface p-3">
              <p className="text-xs text-muted-foreground">{t("languagePicker.otherPrompt")}</p>
              <div className="flex gap-2">
                <input
                  value={custom}
                  onChange={(event) => setCustom(event.target.value)}
                  placeholder={t("languagePicker.otherPlaceholder")}
                  className={inputClass}
                />
                <button
                  type="button"
                  disabled={!custom.trim()}
                  onClick={() => pick(custom.trim(), custom.trim())}
                  className="rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-40"
                >
                  {t("languagePicker.use")}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function LanguageRow({
  flag,
  name,
  tier1,
  selected,
  onClick,
}: {
  flag: string;
  name: string;
  tier1?: boolean;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left hover:bg-surface"
    >
      <span className="text-lg">{flag}</span>
      <span className="flex-1 text-sm">{name}</span>
      {tier1 ? <span className="size-1.5 rounded-full bg-primary" /> : null}
      {selected ? <Check className="size-4 text-primary" /> : null}
    </button>
  );
}
