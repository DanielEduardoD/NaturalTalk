import type { AgeStyle, SlangLevel, ToneSettings, ToneType } from "@/types";
import { Field, PillGroup, inputClass } from "./ui-kit";

const TONES: { value: ToneType; label: string }[] = [
  { value: "gen-alpha", label: "Gen Alpha" },
  { value: "gen-z", label: "Gen Z" },
  { value: "casual", label: "Casual" },
  { value: "friendly", label: "Friendly" },
  { value: "flirty", label: "Flirty" },
  { value: "neutral", label: "Neutral" },
  { value: "professional", label: "Professional" },
  { value: "formal", label: "Formal" },
];

const AGE_STYLES: { value: AgeStyle; label: string }[] = [
  { value: "13-17", label: "13–17" },
  { value: "18-21", label: "18–21" },
  { value: "22-25", label: "22–25" },
  { value: "26-30", label: "26–30" },
  { value: "31-40", label: "31–40" },
  { value: "41-50", label: "41–50" },
  { value: "51-65", label: "51–65" },
  { value: "65+", label: "65+" },
  { value: "custom", label: "Other (exact age)" },
  { value: "none", label: "No preference" },
];

const SLANG: { value: SlangLevel; label: string }[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "none", label: "None" },
];

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
  return (
    <div className="space-y-5">
      <Field label="Tone">
        <PillGroup
          options={TONES}
          value={allowUnset && !value.tone ? null : value.tone}
          onChange={(tone) => onChange({ ...value, tone })}
        />
      </Field>
      <Field label="Sound like age">
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
            placeholder="Exact age, e.g. 37"
            className={`${inputClass} mt-2`}
          />
        ) : null}
      </Field>
      <Field label="Slang level">
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
          <span className="block text-sm">Internet language</span>
          <span className="block text-xs text-muted-foreground">
            Native shortcuts, abbreviations, texting patterns
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
