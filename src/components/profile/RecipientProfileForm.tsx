import { useEffect } from "react";
import { LANGUAGE_CONFIGS } from "@/config/languageConfig";
import type { Gender, RecipientProfile, RelationshipType } from "@/types";
import { LanguagePicker } from "@/components/common/LanguagePicker";
import { Field, Note, PillGroup, inputClass } from "@/components/common/ui-kit";

const GENDERS: { value: Gender; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "non-binary", label: "Non-binary" },
];

const RELATIONSHIPS: { value: RelationshipType; label: string }[] = [
  { value: "romantic-partner", label: "💕 Partner" },
  { value: "crush", label: "✨ Crush" },
  { value: "close-friend", label: "🤝 Close friend" },
  { value: "casual-friend", label: "🙂 Casual friend" },
  { value: "acquaintance", label: "👋 Acquaintance" },
  { value: "older-person", label: "🎓 Older person" },
  { value: "younger-person", label: "🌱 Younger person" },
  { value: "unknown", label: "❔ Not sure" },
];

export function emptyRecipient(nativeLanguage: string): RecipientProfile {
  return {
    name: "",
    age: null,
    gender: "female",
    relationship: "close-friend",
    sourceLanguage: nativeLanguage,
    targetLanguage: "",
    dialect: null,
    pronounSelf: null,
    pronounRecipient: null,
    formalityLevel: null,
    speechLevel: null,
    customNotes: "",
  };
}

const CUSTOM = "__custom__";

export function RecipientProfileForm({
  value,
  onChange,
}: {
  value: RecipientProfile;
  onChange: (next: RecipientProfile) => void;
}) {
  const config = LANGUAGE_CONFIGS[value.targetLanguage];
  const set = (updates: Partial<RecipientProfile>) => onChange({ ...value, ...updates });

  // Seed sensible defaults whenever the target language gains config-driven fields.
  useEffect(() => {
    if (!config) return;
    const updates: Partial<RecipientProfile> = {};
    if (config.dialects.length > 0 && !value.dialect) {
      updates.dialect = config.dialects[0]!.label;
    }
    if (config.hasFormality && !value.formalityLevel) {
      updates.formalityLevel = config.formalityLevels[0]!.value;
    }
    if (config.hasSpeechLevels && !value.speechLevel) {
      updates.speechLevel = config.speechLevels[0]!.value;
    }
    if (Object.keys(updates).length > 0) onChange({ ...value, ...updates });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.targetLanguage]);

  const sameLanguage =
    value.sourceLanguage && value.targetLanguage && value.sourceLanguage === value.targetLanguage;

  return (
    <div className="space-y-5">
      <Field label="Their name">
        <input
          value={value.name}
          onChange={(event) => set({ name: event.target.value })}
          placeholder="e.g. Yuki"
          className={inputClass}
        />
      </Field>

      <Field label="Their age">
        <input
          type="number"
          inputMode="numeric"
          value={value.age ?? ""}
          onChange={(event) =>
            set({ age: event.target.value === "" ? null : Number(event.target.value) })
          }
          placeholder="Optional"
          className={inputClass}
        />
      </Field>

      <Field label="Their gender">
        <PillGroup options={GENDERS} value={value.gender} onChange={(gender) => set({ gender })} />
      </Field>

      <Field label="Relationship">
        <PillGroup
          options={RELATIONSHIPS}
          value={value.relationship}
          onChange={(relationship) => set({ relationship })}
        />
      </Field>

      <LanguagePicker
        label="You write in"
        value={value.sourceLanguage}
        onChange={(code) => set({ sourceLanguage: code })}
      />

      <LanguagePicker
        label="Translate into"
        value={value.targetLanguage}
        placeholder="Choose a target language"
        onChange={(code) =>
          set({
            targetLanguage: code,
            dialect: null,
            pronounSelf: null,
            pronounRecipient: null,
            formalityLevel: null,
            speechLevel: null,
          })
        }
      />

      {sameLanguage ? (
        <Note tone="highlight">Source and target language are the same.</Note>
      ) : null}

      <div className="animate-in fade-in space-y-5 duration-200">
        {config && config.dialects.length > 0 ? (
          <Field label="Dialect / variant">
            <select
              value={value.dialect ?? ""}
              onChange={(event) => set({ dialect: event.target.value })}
              className={inputClass}
            >
              {config.dialects.map((dialect) => (
                <option key={dialect.code} value={dialect.label}>
                  {dialect.label}
                </option>
              ))}
            </select>
          </Field>
        ) : null}

        {config?.hasPronounSystem ? (
          <>
            <PronounSelect
              label={config.pronounOptions.selfLabel}
              options={config.pronounOptions.selfOptions}
              value={value.pronounSelf}
              onChange={(pronounSelf) => set({ pronounSelf })}
            />
            <PronounSelect
              label={config.pronounOptions.recipientLabel}
              options={config.pronounOptions.recipientOptions}
              value={value.pronounRecipient}
              onChange={(pronounRecipient) => set({ pronounRecipient })}
            />
          </>
        ) : null}

        {config?.hasFormality ? (
          <Field label={config.formalityLabel || "Formality"}>
            <select
              value={value.formalityLevel ?? ""}
              onChange={(event) => set({ formalityLevel: event.target.value })}
              className={inputClass}
            >
              {config.formalityLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </Field>
        ) : null}

        {config?.hasSpeechLevels ? (
          <Field label={config.speechLevelLabel || "Speech level"}>
            <select
              value={value.speechLevel ?? ""}
              onChange={(event) => set({ speechLevel: event.target.value })}
              className={inputClass}
            >
              {config.speechLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </Field>
        ) : null}

        {config?.hasGendering ? <Note>{config.genderingNote}</Note> : null}

        {config?.ageHierarchyWeight === "critical" ? (
          <Note tone="highlight">{config.ageHierarchyNote}</Note>
        ) : null}

        {value.targetLanguage && !config ? (
          <Note>
            General support — less specific language features available. Use Custom notes to provide
            any extra context.
          </Note>
        ) : null}
      </div>

      <Field label="Custom notes" hint="Anything the AI should know about this person or history.">
        <textarea
          value={value.customNotes}
          onChange={(event) => set({ customNotes: event.target.value })}
          rows={3}
          placeholder="e.g. We met at a language exchange, she teases me a lot"
          className={inputClass}
        />
      </Field>
    </div>
  );
}

function PronounSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string; description: string }[];
  value: string | null;
  onChange: (value: string) => void;
}) {
  const isCustom = value !== null && value !== "" && !options.some((o) => o.value === value);
  const active = options.find((o) => o.value === value);

  return (
    <Field label={label} hint={active?.description}>
      <select
        value={isCustom ? CUSTOM : (value ?? "")}
        onChange={(event) => onChange(event.target.value === CUSTOM ? " " : event.target.value)}
        className={inputClass}
      >
        <option value="">Let the AI decide</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        <option value={CUSTOM}>Other — type manually</option>
      </select>
      {isCustom ? (
        <input
          value={value?.trim() ?? ""}
          onChange={(event) => onChange(event.target.value || " ")}
          placeholder="Type the pronoun"
          className={`${inputClass} mt-2`}
        />
      ) : null}
    </Field>
  );
}
