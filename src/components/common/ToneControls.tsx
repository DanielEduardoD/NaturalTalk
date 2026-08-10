import type { AgeStyle, SlangLevel, ToneSettings, ToneType } from "@/types";
import { Field, PillGroup } from "./ui-kit";

const TONES: { value: ToneType; label: string }[] = [
  { value: "gen-z", label: "Gen Z" },
  { value: "casual", label: "Casual" },
  { value: "flirty", label: "Flirty" },
  { value: "neutral", label: "Neutral" },
  { value: "formal", label: "Formal" },
];

const AGE_STYLES: { value: AgeStyle; label: string }[] = [
  { value: "18-21", label: "18–21" },
  { value: "22-25", label: "22–25" },
  { value: "26-30", label: "26–30" },
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
}: {
  value: ToneSettings;
  onChange: (next: ToneSettings) => void;
}) {
  return (
    <div className="space-y-5">
      <Field label="Tone">
        <PillGroup options={TONES} value={value.tone} onChange={(tone) => onChange({ ...value, tone })} />
      </Field>
      <Field label="Sound like age">
        <PillGroup
          options={AGE_STYLES}
          value={value.ageStyle}
          onChange={(ageStyle) => onChange({ ...value, ageStyle })}
        />
      </Field>
      <Field label="Slang level">
        <PillGroup
          options={SLANG}
          value={value.slangLevel}
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
