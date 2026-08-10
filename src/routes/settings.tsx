import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { DEFAULT_SPEAKER, useSpeakerStore } from "@/stores/speakerStore";
import { useConversationStore } from "@/stores/conversationStore";
import { useVocabStore } from "@/stores/vocabStore";
import { LanguagePicker } from "@/components/common/LanguagePicker";
import { ToneControls } from "@/components/common/ToneControls";
import { Field, PillGroup, inputClass } from "@/components/common/ui-kit";
import { testAnthropicKey } from "@/services/translator";
import type { Gender, SpeakerProfile } from "@/types";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — NaturalTalk" },
      {
        name: "description",
        content: "Manage your profile, default style, AI backend and local data in NaturalTalk.",
      },
      { property: "og:title", content: "Settings — NaturalTalk" },
      { property: "og:description", content: "Your profile, style defaults and privacy controls." },
    ],
  }),
  component: SettingsPage,
});

const GENDERS: { value: Gender; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "non-binary", label: "Non-binary" },
];

function SettingsPage() {
  const navigate = useNavigate();
  const profile = useSpeakerStore((state) => state.profile);
  const updateProfile = useSpeakerStore((state) => state.updateProfile);
  const deleteAllConversations = useConversationStore((state) => state.deleteAllConversations);
  const deleteAllWords = useVocabStore((state) => state.deleteAll);
  const conversations = useConversationStore((state) => state.conversations);
  const words = useVocabStore((state) => state.words);
  const loadConversations = useConversationStore((state) => state.loadConversations);
  const loadWords = useVocabStore((state) => state.loadWords);

  const [showKey, setShowKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<"idle" | "testing" | "ok" | "bad">("idle");

  useEffect(() => {
    void loadConversations();
    void loadWords();
  }, [loadConversations, loadWords]);

  const current: SpeakerProfile = profile ?? DEFAULT_SPEAKER;

  const exportData = () => {
    const blob = new Blob(
      [JSON.stringify({ profile: current, conversations, vocabulary: words }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "naturaltalk-data.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-5 pt-6 pb-16">
      <header className="flex items-center gap-3">
        <button type="button" onClick={() => void navigate({ to: "/" })} aria-label="Back">
          <ArrowLeft className="size-5 text-muted-foreground" />
        </button>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
      </header>

      <Section title="My profile">
        <Field label="Name">
          <input
            value={current.name}
            onChange={(event) => updateProfile({ name: event.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Age">
          <input
            type="number"
            inputMode="numeric"
            value={current.age || ""}
            onChange={(event) => updateProfile({ age: Number(event.target.value) })}
            className={inputClass}
          />
        </Field>
        <Field label="Gender">
          <PillGroup
            options={GENDERS}
            value={current.gender}
            onChange={(gender) => updateProfile({ gender })}
          />
        </Field>
        <LanguagePicker
          label="Native language"
          value={current.nativeLanguage}
          onChange={(code) => updateProfile({ nativeLanguage: code })}
        />
      </Section>

      <Section title="AI backend">
        <PillGroup
          options={[
            { value: "lovable", label: "Built-in AI" },
            { value: "own", label: "My own API key" },
          ]}
          value={current.aiBackend}
          onChange={(aiBackend) => updateProfile({ aiBackend })}
        />
        {current.aiBackend === "own" ? (
          <>
            <Field label="Anthropic API key">
              <div className="flex gap-2">
                <input
                  type={showKey ? "text" : "password"}
                  value={current.apiKey}
                  onChange={(event) => {
                    updateProfile({ apiKey: event.target.value });
                    setKeyStatus("idle");
                  }}
                  placeholder="sk-ant-..."
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  aria-label={showKey ? "Hide key" : "Show key"}
                  className="rounded-xl border border-border px-3 text-muted-foreground"
                >
                  {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={async () => {
                  setKeyStatus("testing");
                  setKeyStatus((await testAnthropicKey(current.apiKey)) ? "ok" : "bad");
                }}
                className="rounded-xl border border-border px-4 py-2 text-sm"
              >
                Test key
              </button>
              {keyStatus === "testing" ? (
                <span className="text-xs text-muted-foreground">Testing…</span>
              ) : null}
              {keyStatus === "ok" ? <span className="text-xs text-primary">✓ Connected</span> : null}
              {keyStatus === "bad" ? (
                <span className="text-xs text-destructive">✗ Invalid key</span>
              ) : null}
            </div>
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary underline"
            >
              Get an Anthropic API key →
            </a>
          </>
        ) : (
          <p className="text-xs leading-relaxed text-muted-foreground">
            Translations run on NaturalTalk&apos;s built-in AI. No key required.
          </p>
        )}
      </Section>

      <Section title="Default style">
        <ToneControls
          value={current.defaultTone}
          onChange={(defaultTone) => updateProfile({ defaultTone })}
        />
      </Section>

      <Section title="Data & privacy">
        <button
          type="button"
          onClick={() => {
            if (confirm("Delete all conversations? This cannot be undone.")) {
              void deleteAllConversations();
            }
          }}
          className="w-full rounded-xl border border-border px-4 py-3 text-left text-sm"
        >
          Delete all conversations
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm("Delete your vocabulary list? This cannot be undone.")) {
              void deleteAllWords();
            }
          }}
          className="w-full rounded-xl border border-border px-4 py-3 text-left text-sm"
        >
          Delete vocabulary list
        </button>
        <button
          type="button"
          onClick={exportData}
          className="w-full rounded-xl border border-border px-4 py-3 text-left text-sm"
        >
          Export all data as JSON
        </button>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Your messages are sent only to the AI provider you configure. NaturalTalk never stores
          your conversations or translations.
        </p>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 space-y-4">
      <h2 className="font-display text-base font-semibold">{title}</h2>
      {children}
    </section>
  );
}
