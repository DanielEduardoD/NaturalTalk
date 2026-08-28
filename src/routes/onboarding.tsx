import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DEFAULT_SPEAKER, useSpeakerStore } from "@/stores/speakerStore";
import type { Gender, SpeakerProfile } from "@/types";
import { LanguagePicker } from "@/components/common/LanguagePicker";
import { ToneControls } from "@/components/common/ToneControls";
import { Field, PillGroup, inputClass } from "@/components/common/ui-kit";
import { useTranslation } from "@/i18n/useTranslation";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your profile — NaturalTalk" },
      {
        name: "description",
        content:
          "Tell NaturalTalk who you are and how you want to sound so every translation matches your voice.",
      },
      { property: "og:title", content: "Set up your profile — NaturalTalk" },
      {
        property: "og:description",
        content: "Three quick steps to personal, natural-sounding translations.",
      },
    ],
  }),
  component: Onboarding,
});

const TOTAL_STEPS = 4;

function Onboarding() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const existing = useSpeakerStore((state) => state.profile);
  const setProfile = useSpeakerStore((state) => state.setProfile);
  const setOnboardingComplete = useSpeakerStore((state) => state.setOnboardingComplete);
  const setSeenLanding = useSpeakerStore((state) => state.setSeenLanding);

  const GENDERS: { value: Gender; label: string }[] = [
    { value: "female", label: t("gender.female") },
    { value: "male", label: t("gender.male") },
    { value: "non-binary", label: t("gender.nonBinary") },
  ];

  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<SpeakerProfile>(existing ?? DEFAULT_SPEAKER);

  const set = (updates: Partial<SpeakerProfile>) => setDraft({ ...draft, ...updates });

  const finish = () => {
    setProfile({ ...draft, hasSetOptionPreference: true });
    setOnboardingComplete();
    setSeenLanding();
    void navigate({ to: "/" });
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-8">
      <div className="flex gap-1.5">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => (
          <span
            key={n}
            className={`h-1 flex-1 rounded-full ${n <= step ? "bg-primary" : "bg-border"}`}
          />
        ))}
      </div>
      <p className="mt-4 text-xs tracking-wide text-muted-foreground uppercase">
        {t("onboarding.stepOf", { step, total: TOTAL_STEPS })}
      </p>

      {step === 1 ? (
        <div className="mt-3 space-y-6">
          <h1 className="font-display text-2xl font-bold">{t("onboarding.step1.title")}</h1>
          <Field label={t("onboarding.step1.nameLabel")} hint={t("common.optional")}>
            <input
              value={draft.name}
              onChange={(event) => set({ name: event.target.value })}
              placeholder={t("onboarding.step1.namePlaceholder")}
              className={inputClass}
            />
          </Field>
          <Field label={t("onboarding.step1.ageLabel")}>
            <input
              type="number"
              inputMode="numeric"
              value={draft.age || ""}
              onChange={(event) => set({ age: Number(event.target.value) })}
              placeholder={t("onboarding.step1.agePlaceholder")}
              className={inputClass}
            />
          </Field>
          <Field label={t("onboarding.step1.genderLabel")}>
            <PillGroup
              options={GENDERS}
              value={draft.gender}
              onChange={(gender) => set({ gender })}
            />
          </Field>
          <LanguagePicker
            label={t("onboarding.step1.languageLabel")}
            value={draft.nativeLanguage}
            onChange={(code) => set({ nativeLanguage: code })}
          />
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mt-3 space-y-6">
          <h1 className="font-display text-2xl font-bold">{t("onboarding.step2.title")}</h1>
          <ToneControls
            value={draft.defaultTone}
            onChange={(defaultTone) => set({ defaultTone })}
          />
        </div>
      ) : null}

      {step === 3 ? (
        <div className="mt-3 space-y-6">
          <h1 className="font-display text-2xl font-bold">{t("onboarding.step3.title")}</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("onboarding.step3.body")}
          </p>
          <PillGroup
            options={[
              { value: "1", label: t("onboarding.step3.justOne") },
              { value: "3", label: t("onboarding.step3.upToThree") },
            ]}
            value={draft.hasSetOptionPreference ? String(draft.optionCount) : null}
            onChange={(value) =>
              set({ optionCount: value === "1" ? 1 : 3, hasSetOptionPreference: true })
            }
          />

        </div>
      ) : null}

      {step === 4 ? (
        <div className="mt-3 space-y-6">
          <h1 className="font-display text-2xl font-bold">{t("onboarding.step4.title")}</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("onboarding.step4.body")}
          </p>
          <section className="rounded-2xl border border-border p-4">
            <h2 className="font-display text-sm font-semibold">{t("onboarding.step4.privacyTitle")}</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {t("onboarding.step4.privacyBody")}
            </p>
          </section>
          <div className="rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
            {t("onboarding.step4.ownKeyPrefix")}{" "}
            <span className="text-foreground">{t("onboarding.step4.ownKeySettingsPath")}</span>.
          </div>
        </div>
      ) : null}

      <div className="mt-auto flex gap-3 pt-10">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="rounded-xl border border-border px-5 py-3 text-sm"
          >
            {t("onboarding.back")}
          </button>
        ) : null}
        <button
          type="button"
          disabled={
            (step === 1 && !draft.nativeLanguage) || (step === 3 && !draft.hasSetOptionPreference)
          }
          onClick={() => (step === TOTAL_STEPS ? finish() : setStep(step + 1))}
          className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"
        >
          {step === TOTAL_STEPS ? t("onboarding.startTranslating") : t("onboarding.next")}
        </button>
      </div>
    </main>
  );
}
