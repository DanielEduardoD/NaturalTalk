import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DEFAULT_SPEAKER, useSpeakerStore } from "@/stores/speakerStore";
import type { Gender, SpeakerProfile } from "@/types";
import { LanguagePicker } from "@/components/common/LanguagePicker";
import { ToneControls } from "@/components/common/ToneControls";
import { Field, PillGroup, inputClass } from "@/components/common/ui-kit";

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

const GENDERS: { value: Gender; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "non-binary", label: "Non-binary" },
];

const TOTAL_STEPS = 4;

function Onboarding() {
  const navigate = useNavigate();
  const existing = useSpeakerStore((state) => state.profile);
  const setProfile = useSpeakerStore((state) => state.setProfile);
  const setOnboardingComplete = useSpeakerStore((state) => state.setOnboardingComplete);
  const setSeenLanding = useSpeakerStore((state) => state.setSeenLanding);

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
        Step {step} of {TOTAL_STEPS}
      </p>

      {step === 1 ? (
        <div className="mt-3 space-y-6">
          <h1 className="font-display text-2xl font-bold">Tell us about yourself</h1>
          <Field label="Name" hint="Optional">
            <input
              value={draft.name}
              onChange={(event) => set({ name: event.target.value })}
              placeholder="Your name"
              className={inputClass}
            />
          </Field>
          <Field label="Age">
            <input
              type="number"
              inputMode="numeric"
              value={draft.age || ""}
              onChange={(event) => set({ age: Number(event.target.value) })}
              placeholder="e.g. 24"
              className={inputClass}
            />
          </Field>
          <Field label="Gender">
            <PillGroup
              options={GENDERS}
              value={draft.gender}
              onChange={(gender) => set({ gender })}
            />
          </Field>
          <LanguagePicker
            label="What language do you write in?"
            value={draft.nativeLanguage}
            onChange={(code) => set({ nativeLanguage: code })}
          />
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mt-3 space-y-6">
          <h1 className="font-display text-2xl font-bold">How do you want to sound?</h1>
          <ToneControls
            value={draft.defaultTone}
            onChange={(defaultTone) => set({ defaultTone })}
          />
        </div>
      ) : null}

      {step === 3 ? (
        <div className="mt-3 space-y-6">
          <h1 className="font-display text-2xl font-bold">How many options per message?</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            NaturalTalk can give you a single best rewrite, or several alternatives to choose from.
            You can change this any time in Settings.
          </p>
          <PillGroup
            options={[
              { value: "1", label: "Just one" },
              { value: "3", label: "Up to 3 options" },
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
          <h1 className="font-display text-2xl font-bold">You&apos;re all set</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            NaturalTalk translates with built-in AI out of the box — nothing to configure.
          </p>
          <section className="rounded-2xl border border-border p-4">
            <h2 className="font-display text-sm font-semibold">Privacy &amp; storage</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Your profile, conversations and saved words are stored only in this browser — we never
              upload them. Message text is sent to the AI provider solely to generate a translation
              and is not retained. Clearing browser data deletes your history, so export a backup
              from Settings if it matters to you.
            </p>
          </section>
          <div className="rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
            Prefer to use your own Anthropic key? You can add it any time in{" "}
            <span className="text-foreground">Settings → API configuration</span>.
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
            Back
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
          {step === TOTAL_STEPS ? "Start translating" : "Next"}
        </button>
      </div>
    </main>
  );
}

