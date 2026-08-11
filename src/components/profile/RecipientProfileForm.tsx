import { useEffect, useState } from "react";
import { LANGUAGE_CONFIGS } from "@/config/languageConfig";
import { flagChoicesFor, regionExamplesFor } from "@/config/regionConfig";
import type { Gender, RecipientProfile, RelationshipType } from "@/types";
import { LanguagePicker, languageLabel } from "@/components/common/LanguagePicker";
import { Field, Note, Pill, PillGroup, inputClass } from "@/components/common/ui-kit";

const GENDERS: { value: Gender; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "non-binary", label: "Non-binary" },
  { value: "prefer-not-to-say", label: "Rather not say" },
];

const RELATIONSHIPS: { value: RelationshipType; label: string }[] = [
  { value: "close-friend", label: "🤝 Close friend" },
  { value: "casual-friend", label: "🙂 Casual friend" },
  { value: "acquaintance", label: "👋 Acquaintance" },
  { value: "family", label: "🏠 Family" },
  { value: "colleague", label: "💼 Colleague" },
  { value: "manager", label: "📈 Manager / boss" },
  { value: "client", label: "🤵 Client / customer" },
  { value: "teacher", label: "🎓 Teacher / mentor" },
  { value: "student", label: "📚 Student / mentee" },
  { value: "service", label: "🛎️ Service / support" },
  { value: "romantic-partner", label: "💞 Partner" },
  { value: "crush", label: "✨ Crush" },
  { value: "older-person", label: "🧓 Older person" },
  { value: "younger-person", label: "🌱 Younger person" },
  { value: "unknown", label: "❔ Not sure" },
];

export function emptyRecipient(nativeLanguage: string): RecipientProfile {
  return {
    name: "",
    age: null,
    gender: null,
    relationship: "unknown",
    sourceLanguage: nativeLanguage,
    targetLanguage: "",
    dialect: null,
    region: null,
    flagOverride: null,
    pronounSelf: null,
    pronounRecipient: null,
    formalityLevel: null,
    speechLevel: null,
    customNotes: "",
  };
}

const CUSTOM = "__custom__";

const NAME_PLACEHOLDERS = ["e.g. Alex", "e.g. Ms. Tanaka", "e.g. Support team", "e.g. Sam"];
const NOTES_PLACEHOLDER =
  "e.g. Team lead on a shared project — keep it warm but professional. / Old classmate, we joke a lot.";

export function RecipientProfileForm({
  value,
  onChange,
}: {
  value: RecipientProfile;
  onChange: (next: RecipientProfile) => void;
}) {
  const config = LANGUAGE_CONFIGS[value.targetLanguage];
  const set = (updates: Partial<RecipientProfile>) => onChange({ ...value, ...updates });
  const [flagPickerOpen, setFlagPickerOpen] = useState(false);

  // Seed sensible defaults whenever the target language gains config-driven fields.
  useEffect(() => {
    if (!config) return;
    const updates: Partial<RecipientProfile> = {};
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

  const defaultFlag = languageLabel(value.targetLanguage).flag;
  const flagChoices = value.targetLanguage ? flagChoicesFor(value.targetLanguage, defaultFlag) : [];
  const regionExamples = regionExamplesFor(value.targetLanguage, value.dialect);

  return (
    <div className="space-y-5">
      <Field label="Their name or label">
        <input
          value={value.name}
          onChange={(event) => set({ name: event.target.value })}
          placeholder={NAME_PLACEHOLDERS[0]}
          className={inputClass}
        />
      </Field>

      <Field label="Their age" hint="Optional — helps with age-based politeness rules.">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value.age ?? ""}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "").slice(0, 3);
            set({ age: digits === "" ? null : Number(digits) });
          }}
          placeholder="Optional"
          className={inputClass}
        />
      </Field>

      <Field label="Their gender" hint="Optional — only affects grammatical gender.">
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
            region: null,
            flagOverride: null,
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

      {value.targetLanguage ? (
        <Field label="Flag shown for this language" hint="Pick whichever one you identify with.">
          <button
            type="button"
            onClick={() => setFlagPickerOpen((v) => !v)}
            className={`${inputClass} flex items-center justify-between text-left`}
          >
            <span className="text-lg">{value.flagOverride ?? defaultFlag}</span>
            <span className="text-xs text-muted-foreground">
              {flagPickerOpen ? "Close" : "Change"}
            </span>
          </button>
          {flagPickerOpen ? (
            <div className="mt-2 flex flex-wrap gap-2 rounded-xl border border-border bg-surface p-3">
              {flagChoices.map((flag) => (
                <button
                  key={flag}
                  type="button"
                  onClick={() => {
                    set({ flagOverride: flag });
                    setFlagPickerOpen(false);
                  }}
                  className={`rounded-lg px-2 py-1 text-lg ${
                    (value.flagOverride ?? defaultFlag) === flag ? "bg-primary/20" : "bg-field"
                  }`}
                >
                  {flag}
                </button>
              ))}
            </div>
          ) : null}
        </Field>
      ) : null}

      <div className="animate-in fade-in space-y-5 duration-200">
        {config && config.dialects.length > 0 ? (
          <Field label="Dialect / variant">
            <select
              value={value.dialect ?? ""}
              onChange={(event) => set({ dialect: event.target.value || null, region: null })}
              className={inputClass}
            >
              <option value="">Let the AI decide</option>
              {config.dialects.map((dialect) => (
                <option key={dialect.code} value={dialect.label}>
                  {dialect.label}
                </option>
              ))}
            </select>
          </Field>
        ) : null}

        {value.targetLanguage ? (
          <Field
            label="City / region"
            hint="Speech changes street by street. Naming a city gets you the local way of talking."
          >
            <input
              value={value.region ?? ""}
              onChange={(event) => set({ region: event.target.value || null })}
              placeholder={regionExamples[0] ? `e.g. ${regionExamples[0]}` : "e.g. their home city"}
              className={inputClass}
            />
            {regionExamples.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {regionExamples.map((example) => (
                  <Pill
                    key={example}
                    active={value.region === example}
                    onClick={() => set({ region: example })}
                    className="px-3 py-1.5 text-xs"
                  >
                    {example}
                  </Pill>
                ))}
              </div>
            ) : null}
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

      <Field
        label="Custom notes"
        hint="Anything the AI should know: the setting, the history, how formal it should feel."
      >
        <textarea
          value={value.customNotes}
          onChange={(event) => set({ customNotes: event.target.value })}
          rows={3}
          placeholder={NOTES_PLACEHOLDER}
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
