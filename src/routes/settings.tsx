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
import { UILanguagePicker } from "@/components/common/UILanguagePicker";
import { Field, PillGroup, inputClass } from "@/components/common/ui-kit";
import { testAnthropicKey } from "@/services/translator";
import { decryptJson, encryptJson, isEncryptedPayload } from "@/lib/crypto";
import db from "@/services/database";
import type { Gender, SpeakerProfile } from "@/types";
import { useTranslation } from "@/i18n/useTranslation";

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
      { property: "og:url", content: "https://naturaltalk.01100100.xyz/settings" }, ],
    links: [{ rel: "canonical", href: "https://naturaltalk.01100100.xyz/settings" }], }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const GENDERS: { value: Gender; label: string }[] = [
    { value: "female", label: t("gender.female") },
    { value: "male", label: t("gender.male") },
    { value: "non-binary", label: t("gender.nonBinary") },
  ];
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
      setStatus(t("settings.backup.encryptedDownloaded"));
      return;
    }
    if (exportPassword.trim().length > 0) {
      setStatus(t("settings.backup.passwordTooShort"));
      return;
    }
    download(JSON.stringify(payload, null, 2), "naturaltalk-backup.json");
    setStatus(t("settings.backup.plainDownloaded"));
  };

  const importFile = async (file: File) => {
    setStatus(null);
    try {
      let parsed: unknown = JSON.parse(await file.text());
      if (isEncryptedPayload(parsed)) {
        const password = prompt(t("settings.backup.encryptedPrompt"));
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
        t("settings.backup.importedSummary", {
          conversations: result.conversations,
          messages: result.messages,
          words: data.vocabulary?.length ?? 0,
        }),
      );
    } catch {
      setStatus(t("settings.backup.importError"));
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-5 pt-6 pb-16">
      <header className="flex items-center gap-3">
        <button type="button" onClick={() => void navigate({ to: "/" })} aria-label={t("settings.backAria")}>
          <ArrowLeft className="size-5 text-muted-foreground" />
        </button>
        <h1 className="font-display text-2xl font-bold">{t("settings.title")}</h1>
      </header>

      <Section title={t("settings.section.myProfile")}>
        <Field label={t("settings.field.name")}>
          <input
            value={current.name}
            onChange={(event) => updateProfile({ name: event.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label={t("settings.field.age")}>
          <input
            type="number"
            inputMode="numeric"
            value={current.age || ""}
            onChange={(event) => updateProfile({ age: Number(event.target.value) })}
            className={inputClass}
          />
        </Field>
        <Field label={t("settings.field.gender")}>
          <PillGroup
            options={GENDERS}
            value={current.gender}
            onChange={(gender) => updateProfile({ gender })}
          />
        </Field>
        <LanguagePicker
          label={t("settings.field.nativeLanguage")}
          value={current.nativeLanguage}
          onChange={(code) => updateProfile({ nativeLanguage: code })}
        />
      </Section>

      <Section title={t("settings.section.translationOptions")}>
        <Field label={t("settings.field.rewritesPerMessage")}>
          <PillGroup
            options={[
              { value: "1", label: t("settings.rewrites.justOne") },
              { value: "3", label: t("settings.rewrites.upToThree") },
            ]}
            value={String(current.optionCount)}
            onChange={(value) =>
              updateProfile({ optionCount: value === "1" ? 1 : 3, hasSetOptionPreference: true })
            }
          />
        </Field>
      </Section>

      <Section title={t("settings.section.appearance")}>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {t("settings.appearance.note")}
        </p>
        <ChatAppearanceControls
          value={appearance}
          onChange={updateAppearance}
          onReset={resetAppearance}
        />
      </Section>

      <Section title={t("settings.section.aiBackend")}>
        <PillGroup
          options={[
            { value: "builtin", label: t("settings.aiBackend.builtin") },
            { value: "own", label: t("settings.aiBackend.own") },
          ]}
          value={current.aiBackend}
          onChange={(aiBackend) => updateProfile({ aiBackend })}
        />
        {current.aiBackend === "own" ? (
          <>
            <Field label={t("settings.aiBackend.keyLabel")}>
              <div className="flex gap-2">
                <input
                  type={showKey ? "text" : "password"}
                  value={current.apiKey}
                  onChange={(event) => {
                    updateProfile({ apiKey: event.target.value });
                    setKeyStatus("idle");
                  }}
                  placeholder={t("settings.aiBackend.keyPlaceholder")}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  aria-label={showKey ? t("settings.aiBackend.hideKeyAria") : t("settings.aiBackend.showKeyAria")}
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
                {t("settings.aiBackend.testKey")}
              </button>
              {keyStatus === "testing" ? (
                <span className="text-xs text-muted-foreground">{t("settings.aiBackend.testing")}</span>
              ) : null}
              {keyStatus === "ok" ? <span className="text-xs text-primary">{t("settings.aiBackend.connected")}</span> : null}
              {keyStatus === "bad" ? (
                <span className="text-xs text-destructive">{t("settings.aiBackend.invalidKey")}</span>
              ) : null}
            </div>
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary underline"
            >
              {t("settings.aiBackend.getKeyLink")}
            </a>
          </>
        ) : (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t("settings.aiBackend.builtinNote")}
          </p>
        )}
      </Section>

      <Section title={t("settings.section.defaultStyle")}>
        <ToneControls
          value={current.defaultTone}
          onChange={(defaultTone) => updateProfile({ defaultTone })}
        />
      </Section>

      <Section title={t("settings.section.backupRestore")}>
        <Field label={t("settings.backup.passwordLabel")} hint={t("settings.backup.passwordHint")}>
          <input
            type="password"
            value={exportPassword}
            onChange={(event) => setExportPassword(event.target.value)}
            placeholder={t("settings.backup.passwordPlaceholder")}
            className={inputClass}
          />
        </Field>
        <button
          type="button"
          onClick={() => void exportData()}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
        >
          {t("settings.backup.export")}
        </button>
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="w-full rounded-xl border border-border px-4 py-3 text-left text-sm"
        >
          {t("settings.backup.import")}
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

      <Section title={t("settings.section.dataPrivacy")}>
        <button
          type="button"
          onClick={() => {
            if (confirm(t("settings.data.deleteAllConversationsConfirm"))) {
              void deleteAllConversations();
            }
          }}
          className="w-full rounded-xl border border-border px-4 py-3 text-left text-sm"
        >
          {t("settings.data.deleteAllConversations")}
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm(t("settings.data.deleteVocabularyConfirm"))) {
              void deleteAllWords();
            }
          }}
          className="w-full rounded-xl border border-border px-4 py-3 text-left text-sm"
        >
          {t("settings.data.deleteVocabulary")}
        </button>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {t("settings.data.privacyNote")}
        </p>
      </Section>

      <Section title={t("settings.section.interfaceLanguage")}>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {t("settings.interfaceLanguage.note")}
        </p>
        <UILanguagePicker />
      </Section>

      <Section title={t("settings.section.feedback")}>
        <p className="text-xs leading-relaxed text-muted-foreground">{t("settings.feedback.body")}</p>
        <a href="mailto:feedback@01100100.xyz?subject=NaturalTalk%20Feedback" className="block w-full rounded-xl border border-border px-4 py-3 text-center text-sm font-semibold text-primary">{t("settings.feedback.sendButton")}</a>
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
