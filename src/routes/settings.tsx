import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { DEFAULT_SPEAKER, useSpeakerStore } from "@/stores/speakerStore";
import { useConversationStore } from "@/stores/conversationStore";
import { useVocabStore } from "@/stores/vocabStore";
import { useAppearanceStore } from "@/stores/appearanceStore";
import { LanguagePicker } from "@/components/common/LanguagePicker";
import { ToneControls } from "@/components/common/ToneControls";
import { ChatAppearanceControls } from "@/components/common/AppearanceControls";
import { Field, PillGroup, inputClass } from "@/components/common/ui-kit";
import { testAnthropicKey } from "@/services/translator";
import { decryptJson, encryptJson, isEncryptedPayload } from "@/lib/crypto";
import db from "@/services/database";
import type { Gender, SpeakerProfile } from "@/types";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — NaturalTalk" },
      {
        name: "description",
        content:
          "Manage your profile, default style, appearance, AI backend and encrypted backups in NaturalTalk.",
      },
      { property: "og:title", content: "Settings — NaturalTalk" },
      { property: "og:description", content: "Your profile, style defaults and privacy controls." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://naturaltalk.01100100.xyz/settings" },    ],
    links: [{ rel: "canonical", href: "https://naturaltalk.01100100.xyz/settings" }],  }),
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
  const importData = useConversationStore((state) => state.importData);
  const deleteAllWords = useVocabStore((state) => state.deleteAll);
  const loadConversations = useConversationStore((state) => state.loadConversations);
  const loadWords = useVocabStore((state) => state.loadWords);
  const appearance = useAppearanceStore((state) => state.appearance);
  const updateAppearance = useAppearanceStore((state) => state.update);
  const resetAppearance = useAppearanceStore((state) => state.reset);

  const [showKey, setShowKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<"idle" | "testing" | "ok" | "bad">("idle");
  const [exportPassword, setExportPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void loadConversations();
    void loadWords();
  }, [loadConversations, loadWords]);

  const current: SpeakerProfile = profile ?? DEFAULT_SPEAKER;

  const download = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportData = async () => {
    setStatus(null);
    const payload = {
      format: "naturaltalk-backup",
      version: 1,
      exportedAt: new Date().toISOString(),
      profile: current,
      appearance,
      conversations: await db.conversations.toArray(),
      messages: await db.messages.toArray(),
      vocabulary: await db.vocabulary.toArray(),
    };

    if (exportPassword.trim().length >= 6) {
      const encrypted = await encryptJson(payload, exportPassword.trim());
      download(JSON.stringify(encrypted, null, 2), "naturaltalk-backup.encrypted.json");
      setStatus("Encrypted backup downloaded. Keep the password safe — it cannot be recovered.");
      return;
    }
    if (exportPassword.trim().length > 0) {
      setStatus("Password must be at least 6 characters.");
      return;
    }
    download(JSON.stringify(payload, null, 2), "naturaltalk-backup.json");
    setStatus("Plain backup downloaded. Anyone with this file can read your conversations.");
  };

  const importFile = async (file: File) => {
    setStatus(null);
    try {
      let parsed: unknown = JSON.parse(await file.text());
      if (isEncryptedPayload(parsed)) {
        const password = prompt("This backup is encrypted. Enter its password:");
        if (!password) return;
        parsed = await decryptJson(parsed, password);
      }
      const data = parsed as {
        profile?: SpeakerProfile;
        appearance?: typeof appearance;
        conversations?: never[];
        messages?: never[];
        vocabulary?: never[];
      };
      if (data.profile) updateProfile(data.profile);
      if (data.appearance) updateAppearance(data.appearance);
      const result = await importData({
        conversations: data.conversations ?? [],
        messages: data.messages ?? [],
      });
      if (data.vocabulary?.length) {
        await db.vocabulary.bulkPut(
          (data.vocabulary as { dateAdded: string }[]).map((w) => ({
            ...w,
            dateAdded: new Date(w.dateAdded),
          })) as never[],
        );
        await loadWords();
      }
      setStatus(
        `Imported ${result.conversations} conversations, ${result.messages} messages and ${data.vocabulary?.length ?? 0} saved words.`,
      );
    } catch {
      setStatus("Could not read that file — wrong password or not a NaturalTalk backup.");
    }
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

      <Section title="Translation options">
        <Field label="Rewrites per message">
          <PillGroup
            options={[
              { value: "1", label: "Just one" },
              { value: "3", label: "Up to 3 options" },
            ]}
            value={String(current.optionCount)}
            onChange={(value) =>
              updateProfile({ optionCount: value === "1" ? 1 : 3, hasSetOptionPreference: true })
            }
          />
        </Field>
      </Section>

      <Section title="Appearance">
        <p className="text-xs leading-relaxed text-muted-foreground">
          App-wide defaults. Each conversation can override these from its own settings.
        </p>
        <ChatAppearanceControls
          value={appearance}
          onChange={updateAppearance}
          onReset={resetAppearance}
        />
      </Section>

      <Section title="AI backend">
        <PillGroup
          options={[
            { value: "builtin", label: "Built-in AI" },
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

      <Section title="Backup & restore">
        <Field label="Backup password" hint="Optional — 6+ characters enables encryption">
          <input
            type="password"
            value={exportPassword}
            onChange={(event) => setExportPassword(event.target.value)}
            placeholder="Leave empty for a plain file"
            className={inputClass}
          />
        </Field>
        <button
          type="button"
          onClick={() => void exportData()}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
        >
          Export backup
        </button>
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="w-full rounded-xl border border-border px-4 py-3 text-left text-sm"
        >
          Import backup from file
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void importFile(file);
            event.target.value = "";
          }}
        />
        {status ? <p className="text-xs leading-relaxed text-primary">{status}</p> : null}
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
        <p className="text-xs leading-relaxed text-muted-foreground">
          Everything lives in this browser. Your messages are sent only to the AI provider you
          configure, and NaturalTalk never stores your conversations or translations.
        </p>
      </Section>

      <Section title="Feedback">
      <p className="text-xs leading-relaxed text-muted-foreground">Found a bug or have an idea? We would love to hear from you.</p>
      <a href="mailto:feedback@01100100.xyz?subject=NaturalTalk%20Feedback" className="block w-full rounded-xl border border-border px-4 py-3 text-center text-sm font-semibold text-primary">Send feedback</a>
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
