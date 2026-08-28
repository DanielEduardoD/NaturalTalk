import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, ArrowLeftRight, Pencil, Settings2, Trash2, X } from "lucide-react";
import { LANGUAGE_CONFIGS } from "@/config/languageConfig";
import { LanguagePicker, languageLabel } from "@/components/common/LanguagePicker";
import { RecipientProfileForm } from "@/components/profile/RecipientProfileForm";
import { ToneControls } from "@/components/common/ToneControls";
import { TranslationOutputCard } from "@/components/conversation/TranslationOutputCard";
import { useConversationStore } from "@/stores/conversationStore";
import { useSpeakerStore } from "@/stores/speakerStore";
import { useVocabStore } from "@/stores/vocabStore";
import {
  DEFAULT_APPEARANCE,
  useAppearanceStore,
  resolveAppearance,
} from "@/stores/appearanceStore";
import { ChatAppearanceControls, bubbleClass, wallpaperClass } from "@/components/common/AppearanceControls";
import { requestTranslation, TranslationError } from "@/services/translator";
import { buildHistoryMessages, buildSystemPrompt, buildUserMessage, MOOD_LABELS } from "@/utils/promptBuilder";
import type { Message, MessageMood, ToneSettings, TranslationResponse, VocabFlagged } from "@/types";
import { cn } from "@/lib/utils";
import { inputClass, Pill } from "@/components/common/ui-kit";
import { RubyText } from "@/components/common/RubyText";
import { useTranslation } from "@/i18n/useTranslation";
import type { TranslationKey } from "@/i18n/locales/en";

export const Route = createFileRoute("/conversation/$id")({
  head: () => ({
    meta: [
      { title: "Conversation — NaturalTalk" },
      {
        name: "description",
        content:
          "Translate your messages with the right pronouns, dialect and tone for this person.",
      },
      { property: "og:title", content: "Conversation — NaturalTalk" },
      {
        property: "og:description",
        content: "Context-aware translation for a specific person you talk to.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConversationView,
});

const MOODS: MessageMood[] = [
  "default",
  "funny",
  "dramatic",
  "affectionate",
  "excited",
  "apologetic",
  "serious",
  "assertive",
  "grateful",
  "custom",
];

function buildMoodChipLabels(t: (key: TranslationKey) => string): Record<MessageMood, string> {
  return {
    default: t("mood.default"),
    funny: `😄 ${t("mood.funny")}`,
    dramatic: `🎭 ${t("mood.dramatic")}`,
    affectionate: `🫶 ${t("mood.affectionate")}`,
    excited: `🎉 ${t("mood.excited")}`,
    apologetic: `🙏 ${t("mood.apologetic")}`,
    serious: `🧭 ${t("mood.serious")}`,
    assertive: `💪 ${t("mood.assertive")}`,
    grateful: `🌸 ${t("mood.grateful")}`,
    custom: `✏️ ${t("mood.custom")}`,
  };
}

function ConversationView() {
  const { id } = useParams({ from: "/conversation/$id" });
  const navigate = useNavigate();
  const { t } = useTranslation();
  const MOOD_CHIP_LABELS = buildMoodChipLabels(t);

  const profile = useSpeakerStore((state) => state.profile);
  const conversations = useConversationStore((state) => state.conversations);
  const messagesMap = useConversationStore((state) => state.messages);
  const loadConversations = useConversationStore((state) => state.loadConversations);
  const loadMessages = useConversationStore((state) => state.loadMessages);
  const updateConversation = useConversationStore((state) => state.updateConversation);
  const addMessage = useConversationStore((state) => state.addMessage);
  const updateMessage = useConversationStore((state) => state.updateMessage);
  const deleteMessage = useConversationStore((state) => state.deleteMessage);
  const updateMessageFeedback = useConversationStore((state) => state.updateMessageFeedback);
  const addWord = useVocabStore((state) => state.addWord);
  const savedWords = useVocabStore((state) => state.words);
  const loadWords = useVocabStore((state) => state.loadWords);
  const globalAppearance = useAppearanceStore((state) => state.appearance);

  const conversation = conversations.find((c) => c.id === id);
  const messages = useMemo(() => messagesMap[id] ?? [], [messagesMap, id]);

  const [mode, setMode] = useState<"single" | "dual">("single");
  const [text, setText] = useState("");
  const [received, setReceived] = useState("");
  const [context, setContext] = useState("");
  const [showContext, setShowContext] = useState(false);
  const [mood, setMood] = useState<MessageMood>("default");
  const [moodDetail, setMoodDetail] = useState("");
  const [showLanguages, setShowLanguages] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [status, setStatus] = useState<"loading" | "error" | "loaded">("loading");
  const [response, setResponse] = useState<TranslationResponse | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const lastRequest = useRef<(() => void) | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void loadConversations();
    void loadMessages(id);
    void loadWords();
  }, [id, loadConversations, loadMessages, loadWords]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (!conversation || !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">{t("conversation.loading")}</p>
      </main>
    );
  }

  const recipient = conversation.recipient;
  const config = LANGUAGE_CONFIGS[recipient.targetLanguage];
  const isRTL = config?.isRTL ?? false;
  const targetLang = languageLabel(recipient.targetLanguage);
  const sourceLang = languageLabel(recipient.sourceLanguage);
  const targetFlag = recipient.flagOverride ?? targetLang.flag;
  const tone: ToneSettings = { ...profile.defaultTone, ...(conversation.toneOverrides ?? {}) };
  const appearance = resolveAppearance(globalAppearance ?? DEFAULT_APPEARANCE, conversation.appearance);
  const optionCount = profile.optionCount ?? 1;

  const runTranslation = async (args: {
    sourceText: string;
    receivedText: string;
    inlineContext: string;
    moodValue: MessageMood;
    moodText: string;
    replaceMessageId?: string;
  }) => {
    setSheetOpen(true);
    setStatus("loading");
    setResponse(null);
    setSelectedIndex(0);
    setErrorMessage(undefined);
    if (!args.replaceMessageId) setActiveMessageId(null);

    lastRequest.current = () => void runTranslation(args);

    try {
      const result = await requestTranslation({
        backend: profile.aiBackend,
        apiKey: profile.apiKey,
        systemPrompt: buildSystemPrompt(profile, recipient, tone, optionCount),
        history: buildHistoryMessages(messages),
        userMessage: buildUserMessage(
          args.sourceText,
          args.receivedText || null,
          args.inlineContext || null,
          sourceLang.name,
          { mood: args.moodValue, detail: args.moodText },
        ),
      });

      const first = result.options[0]!;
      const base = {
        sourceText: args.sourceText,
        translation: first.translation,
        literal: first.literal,
        ruby: first.ruby,
        options: result.options,
        selectedOption: 0,
        breakdown: result.breakdown,
        vocabularyFlagged: result.vocabulary,
        toneNote: result.tone_note,
        romanization: first.romanization,
        mood: args.moodValue,
        moodDetail: args.moodText,
        sourceLanguage: recipient.sourceLanguage,
        targetLanguage: recipient.targetLanguage,
        receivedText: args.receivedText,
        inlineContext: args.inlineContext,
      };

      if (args.replaceMessageId) {
        await updateMessage(args.replaceMessageId, base);
        setActiveMessageId(args.replaceMessageId);
      } else {
        const message: Message = {
          id: crypto.randomUUID(),
          conversationId: id,
          timestamp: new Date(),
          type: "outgoing",
          feedback: null,
          ...base,
        };
        await addMessage(message);
        setActiveMessageId(message.id);
        setText("");
        setReceived("");
        setContext("");
        setShowContext(false);
        setMood("default");
        setMoodDetail("");
      }

      setResponse(result);
      setStatus("loaded");
    } catch (error) {
      setErrorMessage(
        error instanceof TranslationError ? error.message : t("translationCard.unexpectedError"),
      );
      setStatus("error");
    }
  };

  const translate = () => {
    const sourceText = text.trim();
    if (!sourceText) return;
    void runTranslation({
      sourceText,
      receivedText: mode === "dual" ? received.trim() : "",
      inlineContext: context.trim(),
      moodValue: mood,
      moodText: moodDetail.trim(),
    });
  };

  const regenerate = (message: Message) => {
    void runTranslation({
      sourceText: message.sourceText,
      receivedText: message.receivedText ?? "",
      inlineContext: message.inlineContext ?? "",
      moodValue: message.mood ?? "default",
      moodText: message.moodDetail ?? "",
      replaceMessageId: message.id,
    });
  };

  const openExisting = (message: Message) => {
    const options = message.options ?? [
      {
        translation: message.translation,
        romanization: message.romanization ?? "",
        literal: message.literal ?? "",
        style_label: "",
        ruby: message.ruby,
      },
    ];
    setResponse({
      options,
      breakdown: message.breakdown ?? [],
      vocabulary: message.vocabularyFlagged ?? [],
      tone_note: message.toneNote ?? "",
    });
    setSelectedIndex(message.selectedOption ?? 0);
    setActiveMessageId(message.id);
    setStatus("loaded");
    setSheetOpen(true);
  };

  const chooseOption = (index: number) => {
    setSelectedIndex(index);
    const option = response?.options[index];
    if (activeMessageId && option) {
      void updateMessage(activeMessageId, {
        selectedOption: index,
        translation: option.translation,
        literal: option.literal,
        romanization: option.romanization,
        ruby: option.ruby,
      });
    }
  };

  const saveWord = (word: VocabFlagged) => {
    void addWord({
      word: word.word,
      romanization: word.romanization,
      meaning: word.meaning,
      language: recipient.targetLanguage,
      sourceLanguage: recipient.sourceLanguage,
      exampleSentence: response?.options[selectedIndex]?.translation ?? "",
      sourceConversationId: id,
      userNote: "",
      studyStatus: "new",
    });
  };

  const activeMessage = messages.find((m) => m.id === activeMessageId);

  return (
    <main
      className={cn(
        "mx-auto flex min-h-screen w-full max-w-md flex-col bg-background",
        wallpaperClass(appearance.wallpaper),
      )}
      data-accent={appearance.accent}
    >
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <button type="button" onClick={() => void navigate({ to: "/" })} aria-label={t("conversation.backAria")}>
          <ArrowLeft className="size-5 text-muted-foreground" />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="font-display truncate text-base font-semibold">{recipient.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {targetFlag} {targetLang.name}
            {recipient.region ? ` · ${recipient.region}` : recipient.dialect ? ` · ${recipient.dialect}` : ""}
          </p>
        </div>
        <button type="button" onClick={() => setSettingsOpen(true)} aria-label={t("conversation.settingsAria")}>
          <Settings2 className="size-5 text-muted-foreground" />
        </button>
      </header>

      <div className="flex-1 space-y-4 px-4 py-5">
        {messages.length === 0 ? (
          <p className="pt-16 text-center text-sm text-muted-foreground">
            {t("conversation.empty")}
          </p>
        ) : null}

        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            {message.receivedText ? (
              <div className="mr-auto max-w-[85%]">
                <p className="mb-1 text-[11px] text-muted-foreground">{t("conversation.received")}</p>
                <div className={cn("bg-surface px-4 py-3", bubbleClass(appearance.bubbleStyle, "incoming"))}>
                  <p dir={isRTL ? "rtl" : "ltr"} className="native-text text-sm">
                    {message.receivedText}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="ml-auto max-w-[85%]">
              {editingId === message.id ? (
                <div className="space-y-2 rounded-xl border border-border bg-surface p-3">
                  <textarea
                    value={editingText}
                    onChange={(event) => setEditingText(event.target.value)}
                    rows={3}
                    className={inputClass}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const next = editingText.trim();
                        setEditingId(null);
                        if (next && next !== message.sourceText) {
                          void runTranslation({
                            sourceText: next,
                            receivedText: message.receivedText ?? "",
                            inlineContext: message.inlineContext ?? "",
                            moodValue: message.mood ?? "default",
                            moodText: message.moodDetail ?? "",
                            replaceMessageId: message.id,
                          });
                        }
                      }}
                      className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground"
                    >
                      {t("conversation.saveAndRetranslate")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs"
                    >
                      {t("conversation.cancel")}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openExisting(message)}
                  className={cn(
                    "w-full bg-primary/15 px-4 py-3 text-left",
                    bubbleClass(appearance.bubbleStyle, "outgoing"),
                  )}
                >
                  <p dir={isRTL ? "rtl" : "ltr"} className="native-text text-base leading-relaxed">
                    <RubyText text={message.translation} ruby={message.ruby} />
                  </p>
                  {message.romanization ? (
                    <p className="mt-1 text-xs text-muted-foreground">{message.romanization}</p>
                  ) : null}
                  {message.literal ? (
                    <p className="mt-2 border-t border-border/60 pt-2 text-xs text-muted-foreground">
                      <span className="uppercase">{t("conversation.literally")}</span> {message.literal}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-muted-foreground italic">
                    {t("conversation.youWrote", { text: message.sourceText })}
                  </p>
                </button>
              )}

              <div className="mt-1 flex items-center justify-end gap-3 text-[11px] text-muted-foreground">
                {message.mood && message.mood !== "default" ? (
                  <span>{MOOD_CHIP_LABELS[message.mood]}</span>
                ) : null}
                <button type="button" onClick={() => regenerate(message)} aria-label={t("conversation.regenerate")}>
                  {t("conversation.regenerate")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(message.id);
                    setEditingText(message.sourceText);
                  }}
                  aria-label={t("conversation.editAria")}
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(t("conversation.deleteConfirm"))) void deleteMessage(id, message.id);
                  }}
                  aria-label={t("conversation.deleteAria")}
                >
                  <Trash2 className="size-3.5" />
                </button>
                <span>
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-0 space-y-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex gap-1 rounded-xl bg-field p-1 text-xs">
          {(
            [
              ["single", t("conversation.mode.single")],
              ["dual", t("conversation.mode.dual")],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={cn(
                "flex-1 rounded-lg py-2 transition-colors",
                mode === value ? "bg-surface text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            {sourceLang.flag} {sourceLang.name} → {targetFlag} {targetLang.name}
          </span>
          <button
            type="button"
            onClick={() => setShowLanguages((v) => !v)}
            className="underline"
          >
            {showLanguages ? t("conversation.hideLanguages") : t("conversation.changeLanguages")}
          </button>
        </div>

        {showLanguages ? (
          <div className="space-y-3 rounded-xl border border-border bg-surface p-3">
            <LanguagePicker
              label={t("conversation.iWriteIn")}
              value={recipient.sourceLanguage}
              onChange={(code) =>
                void updateConversation(id, { recipient: { ...recipient, sourceLanguage: code } })
              }
            />
            <LanguagePicker
              label={t("conversation.translateInto")}
              value={recipient.targetLanguage}
              onChange={(code) =>
                void updateConversation(id, {
                  recipient: { ...recipient, targetLanguage: code, flagOverride: null },
                })
              }
            />
            <button
              type="button"
              onClick={() =>
                void updateConversation(id, {
                  recipient: {
                    ...recipient,
                    sourceLanguage: recipient.targetLanguage,
                    targetLanguage: recipient.sourceLanguage,
                  },
                })
              }
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs"
            >
              <ArrowLeftRight className="size-3.5" /> {t("conversation.swapDirections")}
            </button>
          </div>
        ) : null}

        {mode === "dual" ? (
          <textarea
            value={received}
            onChange={(event) => setReceived(event.target.value)}
            rows={2}
            placeholder={t("conversation.receivedPlaceholder")}
            className={`${inputClass} bg-surface text-sm`}
          />
        ) : null}

        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={2}
          placeholder={mode === "dual" ? t("conversation.replyPlaceholder") : t("conversation.messagePlaceholder")}
          className={inputClass}
        />

        <div className="flex flex-wrap gap-2">
          {MOODS.map((value) => (
            <Pill
              key={value}
              active={mood === value}
              onClick={() => setMood(value)}
              className="px-3 py-1.5 text-xs"
            >
              {MOOD_CHIP_LABELS[value]}
            </Pill>
          ))}
        </div>
        {mood === "custom" ? (
          <input
            value={moodDetail}
            onChange={(event) => setMoodDetail(event.target.value)}
            placeholder="How should this one message sound?"
            className={inputClass}
          />
        ) : mood !== "default" ? (
          <p className="text-[11px] text-muted-foreground">{MOOD_LABELS[mood]}</p>
        ) : null}

        {showContext ? (
          <input
            value={context}
            onChange={(event) => setContext(event.target.value)}
            placeholder={t("conversation.contextPlaceholder")}
            className={inputClass}
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowContext(true)}
            className="text-xs text-muted-foreground underline"
          >
            {t("conversation.addContext")}
          </button>
        )}

        <button
          type="button"
          disabled={!text.trim()}
          onClick={translate}
          className="w-full rounded-xl bg-accent py-3.5 text-sm font-semibold text-accent-foreground disabled:opacity-40"
        >
          {t("conversation.translate")}
        </button>
      </div>

      {sheetOpen ? (
        <div className="fixed inset-0 z-40 flex items-end bg-black/60" onClick={() => setSheetOpen(false)}>
          <div
            className="mx-auto max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-background p-4 pb-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
            <TranslationOutputCard
              status={status}
              response={response}
              targetLanguage={recipient.targetLanguage}
              sourceLanguageName={sourceLang.name}
              selectedIndex={selectedIndex}
              savedWords={savedWords.map((w) => w.word)}
              onSelectOption={chooseOption}
              onSaveWord={saveWord}
              onFeedback={(value, detail) => {
                if (activeMessageId) void updateMessageFeedback(activeMessageId, value, detail);
              }}
              onRetry={() => lastRequest.current?.()}
              {...(activeMessage ? { onRegenerate: () => regenerate(activeMessage) } : {})}
              {...(errorMessage ? { errorMessage } : {})}
              {...(activeMessage?.feedback ? { feedback: activeMessage.feedback } : {})}
            />
          </div>
        </div>
      ) : null}

      {settingsOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
          <div className="mx-auto w-full max-w-md px-5 py-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">{t("conversation.settings.title")}</h2>
              <button type="button" onClick={() => setSettingsOpen(false)} aria-label={t("conversation.settings.closeAria")}>
                <X className="size-5 text-muted-foreground" />
              </button>
            </div>
            <div className="mt-6">
              <RecipientProfileForm
                value={recipient}
                onChange={(next) => void updateConversation(id, { recipient: next })}
              />
            </div>
            <div className="mt-8">
              <h3 className="mb-4 font-display text-base font-semibold">{t("conversation.settings.styleForChat")}</h3>
              <ToneControls
                value={tone}
                onChange={(next) => void updateConversation(id, { toneOverrides: next })}
              />
            </div>
            <div className="mt-8">
              <h3 className="mb-4 font-display text-base font-semibold">{t("conversation.settings.lookOfChat")}</h3>
              <ChatAppearanceControls
                value={appearance}
                onChange={(next) =>
                  void updateConversation(id, {
                    appearance: { ...(conversation.appearance ?? {}), ...next },
                  })
                }
                onReset={() => void updateConversation(id, { appearance: null })}
              />
            </div>
            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              className="mt-8 w-full rounded-xl bg-accent py-3.5 text-sm font-semibold text-accent-foreground"
            >
              {t("conversation.settings.done")}
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
