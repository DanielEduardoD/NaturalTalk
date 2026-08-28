import type { AgeStyle, SlangLevel, ToneSettings, ToneType } from "@/types";
import { Field, PillGroup, inputClass } from "./ui-kit";
import { useTranslation } from "@/i18n/useTranslation";
import type { TranslationKey } from "@/i18n/locales/en";

function buildTones(t: (key: TranslationKey) => string): { value: ToneType; label: string }[] {
  return [
    { value: "gen-alpha", label: t("tone.genAlpha") },
    { value: "gen-z", label: t("tone.genZ") },
    { value: "casual", label: t("tone.casual") },
    { value: "friendly", label: t("tone.friendly") },
    { value: "flirty", label: t("tone.flirty") },
    { value: "neutral", label: t("tone.neutral") },
    { value: "professional", label: t("tone.professional") },
    { value: "formal", label: t("tone.formal") },
    { value: "custom", label: `✏️ ${t("tone.custom")}` },
  ];
}

function buildAgeStyles(t: (key: TranslationKey) => string): { value: AgeStyle; label: string }[] {
  return [
    { value: "13-17", label: "13–17" },
    { value: "18-21", label: "18–21" },
    { value: "22-25", label: "22–25" },
    { value: "26-30", label: "26–30" },
    { value: "31-40", label: "31–40" },
    { value: "41-50", label: "41–50" },
    { value: "51-65", label: "51–65" },
    { value: "65+", label: "65+" },
    { value: "custom", label: t("ageStyle.other") },
    { value: "none", label: t("ageStyle.noPreference") },
  ];
}

function buildSlang(t: (key: TranslationKey) => string): { value: SlangLevel; label: string }[] {
  return [
    { value: "high", label: t("slang.high") },
    { value: "medium", label: t("slang.medium") },
    { value: "low", label: t("slang.low") },
    { value: "none", label: t("slang.none") },
  ];
}

export function ToneControls({
  value,
  onChange,
  allowUnset = false,
}: {
  value: ToneSettings;
  onChange: (next: ToneSettings) => void;
  /** When true, nothing is preselected until the user picks. */
  allowUnset?: boolean;
}) {
  const { t } = useTranslation();
  const TONES = buildTones(t);
  const AGE_STYLES = buildAgeStyles(t);
  const SLANG = buildSlang(t);

  return (
    <div className="space-y-5">
      <Field label={t("toneControls.toneLabel")}>
        <PillGroup
          options={TONES}
          value={allowUnset && !value.tone ? null : value.tone}
          onChange={(tone) =>
            onChange({ ...value, tone, customTone: tone === "custom" ? value.customTone : null })
          }
        />
        {value.tone === "custom" ? (
          <input
            value={value.customTone ?? ""}
            onChange={(event) => onChange({ ...value, customTone: event.target.value })}
            placeholder={t("toneControls.customTonePlaceholder")}
            className={`${inputClass} mt-2`}
          />
        ) : null}
      </Field>
      <Field label={t("toneControls.ageLabel")}>
        <PillGroup
          options={AGE_STYLES}
          value={allowUnset && !value.ageStyle ? null : value.ageStyle}
          onChange={(ageStyle) =>
            onChange({ ...value, ageStyle, customAge: ageStyle === "custom" ? value.customAge : null })
          }
        />
        {value.ageStyle === "custom" ? (
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={value.customAge ?? ""}
            onChange={(event) => {
              // Whole years only — strip anything that is not a digit.
              const digits = event.target.value.replace(/\D/g, "").slice(0, 3);
              onChange({ ...value, customAge: digits === "" ? null : Number(digits) });
            }}
            placeholder={t("toneControls.customAgePlaceholder")}
            className={`${inputClass} mt-2`}
          />
        ) : null}
      </Field>
      <Field label={t("toneControls.slangLabel")}>
        <PillGroup
          options={SLANG}
          value={allowUnset && !value.slangLevel ? null : value.slangLevel}
          onChange={(slangLevel) => onChange({ ...value, slangLevel })}
        />
      </Field>
      <button
        type="button"
        onClick={() => onChange({ ...value, internetLanguage: !value.internetLanguage })}
        className="flex w-full items-center justify-between rounded-xl border border-border bg-field px-3.5 py-3 text-left"
      >
        <span>
          <span className="block text-sm">{t("toneControls.internetLanguage")}</span>
          <span className="block text-xs text-muted-foreground">
            {t("toneControls.internetLanguageHint")}
          </span>
        </span>
        <span
          className={`relative h-6 w-11 rounded-full transition-colors ${
            value.internetLanguage ? "bg-primary" : "bg-border"
          }`}
        >
          <span
            className={`absolute top-0.5 size-5 rounded-full bg-background transition-all ${
              value.internetLanguage ? "left-5.5" : "left-0.5"
            }`}
          />
        </span>
      </button>
    </div>
  );
}
