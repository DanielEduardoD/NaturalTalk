import { useEffect, useState } from "react";
import { LANGUAGE_CONFIGS } from "@/config/languageConfig";
import { flagChoicesFor, regionExamplesFor } from "@/config/regionConfig";
import type { Gender, RecipientProfile, RelationshipType } from "@/types";
import { LanguagePicker, languageLabel } from "@/components/common/LanguagePicker";
import { Field, Note, Pill, PillGroup, inputClass } from "@/components/common/ui-kit";
import { useTranslation } from "@/i18n/useTranslation";
import type { TranslationKey } from "@/i18n/locales/en";

function buildGenders(t: (key: TranslationKey) => string): { value: Gender; label: string }[] {
  return [
    { value: "female", label: t("gender.female") },
    { value: "male", label: t("gender.male") },
    { value: "non-binary", label: t("gender.nonBinary") },
    { value: "prefer-not-to-say", label: t("gender.preferNotToSay") },
  ];
}

function buildRelationships(t: (key: TranslationKey) => string): { value: RelationshipType; label: string }[] {
  return [
    { value: "close-friend", label: `🤝 ${t("relationship.closeFriend")}` },
    { value: "casual-friend", label: `🙂 ${t("relationship.casualFriend")}` },
    { value: "acquaintance", label: `👋 ${t("relationship.acquaintance")}` },
    { value: "family", label: `🏠 ${t("relationship.family")}` },
    { value: "colleague", label: `💼 ${t("relationship.colleague")}` },
    { value: "manager", label: `📈 ${t("relationship.manager")}` },
    { value: "client", label: `🤵 ${t("relationship.client")}` },
    { value: "teacher", label: `🎓 ${t("relationship.teacher")}` },
    { value: "student", label: `📚 ${t("relationship.student")}` },
    { value: "service", label: `🛎️ ${t("relationship.service")}` },
    { value: "romantic-partner", label: `💞 ${t("relationship.romanticPartner")}` },
    { value: "crush", label: `✨ ${t("relationship.crush")}` },
    { value: "older-person", label: `🧓 ${t("relationship.olderPerson")}` },
    { value: "younger-person", label: `🌱 ${t("relationship.youngerPerson")}` },
    { value: "unknown", label: `❔ ${t("relationship.unknown")}` },
    { value: "custom", label: `✏️ ${t("relationship.custom")}` },
  ];
}

export function emptyRecipient(nativeLanguage: string): RecipientProfile {
  return {
    name: "",
    age: null,
    gender: null,
    relationship: "unknown",
    customRelationship: null,
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

export function RecipientProfileForm({
  value,
  onChange,
}: {
  value: RecipientProfile;
  onChange: (next: RecipientProfile) => void;
}) {
  const { t } = useTranslation();
  const GENDERS = buildGenders(t);
  const RELATIONSHIPS = buildRelationships(t);
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
      <Field label={t("profileForm.nameLabel")}>
        <input
          value={value.name}
          onChange={(event) => set({ name: event.target.value })}
          placeholder={t("profileForm.namePlaceholder")}
          className={inputClass}
        />
      </Field>

      <Field label={t("profileForm.ageLabel")} hint={t("profileForm.ageHint")}>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value.age ?? ""}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "").slice(0, 3);
            set({ age: digits === "" ? null : Number(digits) });
          }}
          placeholder={t("common.optional")}
          className={inputClass}
        />
      </Field>

      <Field label={t("profileForm.genderLabel")} hint={t("profileForm.genderHint")}>
        <PillGroup options={GENDERS} value={value.gender} onChange={(gender) => set({ gender })} />
      </Field>

      <Field label={t("profileForm.relationshipLabel")}>
        <PillGroup
          options={RELATIONSHIPS}
          value={value.relationship}
          onChange={(relationship) =>
            set({
              relationship,
              customRelationship: relationship === "custom" ? value.customRelationship : null,
            })
          }
        />
        {value.relationship === "custom" ? (
          <input
            value={value.customRelationship ?? ""}
            onChange={(event) => set({ customRelationship: event.target.value })}
            placeholder={t("profileForm.relationshipCustomPlaceholder")}
            className={`${inputClass} mt-2`}
          />
        ) : null}
      </Field>

      <LanguagePicker
        label={t("profileForm.youWriteIn")}
        value={value.sourceLanguage}
        onChange={(code) => set({ sourceLanguage: code })}
      />

      <LanguagePicker
        label={t("profileForm.translateInto")}
        value={value.targetLanguage}
        placeholder={t("profileForm.targetPlaceholder")}
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
        <Note tone="highlight">{t("profileForm.sameLanguageNote")}</Note>
      ) : null}

      {value.targetLanguage ? (
        <Field label={t("profileForm.flagLabel")} hint={t("profileForm.flagHint")}>
          <button
            type="button"
            onClick={() => setFlagPickerOpen((v) => !v)}
            className={`${inputClass} flex items-center justify-between text-left`}
          >
            <span className="text-lg">{value.flagOverride ?? defaultFlag}</span>
            <span className="text-xs text-muted-foreground">
              {flagPickerOpen ? t("profileForm.flagClose") : t("profileForm.flagChange")}
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
          <Field label={t("profileForm.dialectLabel")}>
            <select
              value={value.dialect ?? ""}
              onChange={(event) => set({ dialect: event.target.value || null, region: null })}
              className={inputClass}
            >
              <option value="">{t("common.letAiDecide")}</option>
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
            label={t("profileForm.regionLabel")}
            hint={t("profileForm.regionHint")}
          >
            <input
              value={value.region ?? ""}
              onChange={(event) => set({ region: event.target.value || null })}
              placeholder={regionExamples[0] ? `e.g. ${regionExamples[0]}` : t("profileForm.regionPlaceholder")}
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
          <Note>{t("profileForm.generalSupportNote")}</Note>
        ) : null}
      </div>

      <Field
        label={t("profileForm.notesLabel")}
        hint={t("profileForm.notesHint")}
      >
        <textarea
          value={value.customNotes}
          onChange={(event) => set({ customNotes: event.target.value })}
          rows={3}
          placeholder={t("profileForm.notesPlaceholder")}
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
  const { t } = useTranslation();
  const isCustom = value !== null && value !== "" && !options.some((o) => o.value === value);
  const active = options.find((o) => o.value === value);

  return (
    <Field label={label} hint={active?.description}>
      <select
        value={isCustom ? CUSTOM : (value ?? "")}
        onChange={(event) => onChange(event.target.value === CUSTOM ? " " : event.target.value)}
        className={inputClass}
      >
        <option value="">{t("common.letAiDecide")}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        <option value={CUSTOM}>{t("profileForm.pronounOtherManual")}</option>
      </select>
      {isCustom ? (
        <input
          value={value?.trim() ?? ""}
          onChange={(event) => onChange(event.target.value || " ")}
          placeholder={t("profileForm.pronounTypePlaceholder")}
          className={`${inputClass} mt-2`}
        />
      ) : null}
    </Field>
  );
}
