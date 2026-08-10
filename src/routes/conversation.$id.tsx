import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Settings2, X } from "lucide-react";
import { LANGUAGE_CONFIGS } from "@/config/languageConfig";
import { languageLabel } from "@/components/common/LanguagePicker";
import { RecipientProfileForm } from "@/components/profile/RecipientProfileForm";
import { ToneControls } from "@/components/common/ToneControls";
import { TranslationOutputCard } from "@/components/conversation/TranslationOutputCard";
import { useConversationStore } from "@/stores/conversationStore";
import { useSpeakerStore } from "@/stores/speakerStore";
import { useVocabStore } from "@/stores/vocabStore";
import { requestTranslation, TranslationError } from "@/services/translator";
import { buildHistoryMessages, buildSystemPrompt, buildUserMessage } from "@/utils/promptBuilder";
import type { Message, ToneSettings, TranslationResponse, VocabFlagged } from "@/types";
import { cn } from "@/lib/utils";
import { inputClass } from "@/components/common/ui-kit";

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
    ],
  }),
  component: ConversationView,
});

function ConversationView() {
  const { id } = useParams({ from: "/conversation/$id" });
  const navigate = useNavigate();

  const profile = useSpeakerStore((state) => state.profile);
  const conversations = useConversationStore((state) => state.conversations);
  const messagesMap = useConversationStore((state) => state.messages);
  const loadConversations = useConversationStore((state) => state.loadConversations);
  const loadMessages = useConversationStore((state) => state.loadMessages);
  const updateConversation = useConversationStore((state) => state.updateConversation);
  const addMessage = useConversationStore((state) => state.addMessage);
  const updateMessageFeedback = useConversationStore((state) => state.updateMessageFeedback);
  const addWord = useVocabStore((state) => state.addWord);
  const savedWords = useVocabStore((state) => state.words);
  const loadWords = useVocabStore((state) => state.loadWords);

  const conversation = conversations.find((c) => c.id === id);
  const messages = useMemo(() => messagesMap[id] ?? [], [messagesMap, id]);

  const [mode, setMode] = useState<"single" | "dual">("single");
  const [text, setText] = useState("");
  const [received, setReceived] = useState("");
  const [context, setContext] = useState("");
  const [showContext, setShowContext] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [status, setStatus] = useState<"loading" | "error" | "loaded">("loading");
  const [response, setResponse] = useState<TranslationResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
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
        <p className="text-sm text-muted-foreground">Loading conversation…</p>
      </main>
    );
  }

  const recipient = conversation.recipient;
  const config = LANGUAGE_CONFIGS[recipient.targetLanguage];
  const isRTL = config?.isRTL ?? false;
  const targetLang = languageLabel(recipient.targetLanguage);
  const sourceLang = languageLabel(recipient.sourceLanguage);
  const tone: ToneSettings = { ...profile.defaultTone, ...(conversation.toneOverrides ?? {}) };

  const translate = async () => {
    const sourceText = text.trim();
    if (!sourceText) return;
    const receivedText = mode === "dual" ? received.trim() : "";
    const inlineContext = context.trim();

    setSheetOpen(true);
    setStatus("loading");
    setResponse(null);
    setErrorMessage(undefined);
    setActiveMessageId(null);

    lastRequest.current = () => void translate();

    try {
      const result = await requestTranslation({
        backend: profile.aiBackend,
        apiKey: profile.apiKey,
        systemPrompt: buildSystemPrompt(profile, recipient, tone),
        history: buildHistoryMessages(messages),
        userMessage: buildUserMessage(
          sourceText,
          receivedText || null,
          inlineContext || null,
          sourceLang.name,
        ),
      });

      const message: Message = {
        id: crypto.randomUUID(),
        conversationId: id,
        timestamp: new Date(),
        type: "outgoing",
        sourceText,
        translation: result.translation,
        breakdown: result.breakdown,
        vocabularyFlagged: result.vocabulary,
        toneNote: result.tone_note,
        feedback: null,
        ...(result.romanization ? { romanization: result.romanization } : {}),
        ...(receivedText ? { receivedText } : {}),
        ...(inlineContext ? { inlineContext } : {}),
      };

      await addMessage(message);
      setActiveMessageId(message.id);
      setResponse(result);
      setStatus("loaded");
      setText("");
      setReceived("");
      setContext("");
      setShowContext(false);
    } catch (error) {
      setErrorMessage(
        error instanceof TranslationError ? error.message : "Something went wrong. Try again.",
      );
      setStatus("error");
    }
  };

  const openExisting = (message: Message) => {
    setResponse({
      translation: message.translation,
      breakdown: message.breakdown ?? [],
      vocabulary: message.vocabularyFlagged ?? [],
      tone_note: message.toneNote ?? "",
      ...(message.romanization ? { romanization: message.romanization } : {}),
    });
    setActiveMessageId(message.id);
    setStatus("loaded");
    setSheetOpen(true);
  };

  const saveWord = (word: VocabFlagged) => {
    void addWord({
      word: word.word,
      romanization: word.romanization,
      meaning: word.meaning,
      language: recipient.targetLanguage,
      sourceLanguage: recipient.sourceLanguage,
      exampleSentence: response?.translation ?? "",
      sourceConversationId: id,
      userNote: "",
      studyStatus: "new",
    });
  };

  const activeMessage = messages.find((m) => m.id === activeMessageId);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <button type="button" onClick={() => void navigate({ to: "/" })} aria-label="Back">
          <ArrowLeft className="size-5 text-muted-foreground" />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="font-display truncate text-base font-semibold">{recipient.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {targetLang.flag} {targetLang.name}
            {recipient.dialect ? ` · ${recipient.dialect}` : ""}
          </p>
        </div>
        <button type="button" onClick={() => setSettingsOpen(true)} aria-label="Conversation settings">
          <Settings2 className="size-5 text-muted-foreground" />
        </button>
      </header>

      <div className="flex-1 space-y-4 px-4 py-5">
        {messages.length === 0 ? (
          <p className="pt-16 text-center text-sm text-muted-foreground">
            No messages yet. Write something below and NaturalTalk will make it sound natural.
          </p>
        ) : null}

        {messages.map((message) =>
          message.type === "incoming" ? (
            <div key={message.id} className="max-w-[85%]">
              <p className="mb-1 text-[11px] text-muted-foreground">Received</p>
              <div className="rounded-2xl rounded-tl-sm bg-surface px-4 py-3">
                <p dir={isRTL ? "rtl" : "ltr"} className="native-text text-sm">
                  {message.sourceText}
                </p>
              </div>
            </div>
          ) : (
            <div key={message.id} className="ml-auto max-w-[85%]">
              {message.receivedText ? (
                <div className="mb-2 rounded-2xl rounded-tl-sm bg-surface px-4 py-3">
                  <p className="mb-1 text-[11px] text-muted-foreground">Received</p>
                  <p dir={isRTL ? "rtl" : "ltr"} className="native-text text-sm">
                    {message.receivedText}
                  </p>
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => openExisting(message)}
                className="w-full rounded-2xl rounded-br-sm bg-primary/15 px-4 py-3 text-left"
              >
                <p dir={isRTL ? "rtl" : "ltr"} className="native-text text-base leading-relaxed">
                  {message.translation}
                </p>
                {message.romanization ? (
                  <p className="mt-1 text-xs text-muted-foreground">{message.romanization}</p>
                ) : null}
                <p className="mt-2 text-xs text-muted-foreground">{message.sourceText}</p>
              </button>
              <p className="mt-1 text-right text-[11px] text-muted-foreground">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ),
        )}
        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-0 space-y-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex gap-1 rounded-xl bg-field p-1 text-xs">
          {(
            [
              ["single", "My Message"],
              ["dual", "Received + Reply"],
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

        <p className="text-[11px] text-muted-foreground">
          Writing in: {sourceLang.flag} {sourceLang.name}
        </p>

        {mode === "dual" ? (
          <textarea
            value={received}
            onChange={(event) => setReceived(event.target.value)}
            rows={2}
            placeholder="Paste what they sent you"
            className={`${inputClass} bg-surface text-sm`}
          />
        ) : null}

        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={2}
          placeholder={mode === "dual" ? "My reply" : "What do you want to say?"}
          className={inputClass}
        />

        {showContext ? (
          <input
            value={context}
            onChange={(event) => setContext(event.target.value)}
            placeholder="Context for this message"
            className={inputClass}
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowContext(true)}
            className="text-xs text-muted-foreground underline"
          >
            Add context for this message
          </button>
        )}

        <button
          type="button"
          disabled={!text.trim()}
          onClick={() => void translate()}
          className="w-full rounded-xl bg-accent py-3.5 text-sm font-semibold text-accent-foreground disabled:opacity-40"
        >
          Translate
        </button>
      </div>

      {sheetOpen ? (
        <div className="fixed inset-0 z-40 flex items-end bg-black/60" onClick={() => setSheetOpen(false)}>
          <div
            className="mx-auto w-full max-w-md rounded-t-3xl bg-background p-4 pb-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
            <TranslationOutputCard
              status={status}
              response={response}
              targetLanguage={recipient.targetLanguage}
              savedWords={savedWords.map((w) => w.word)}
              onSaveWord={saveWord}
              onFeedback={(value, detail) => {
                if (activeMessageId) void updateMessageFeedback(activeMessageId, value, detail);
              }}
              onRetry={() => lastRequest.current?.()}
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
              <h2 className="font-display text-xl font-bold">Conversation settings</h2>
              <button type="button" onClick={() => setSettingsOpen(false)} aria-label="Close">
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
              <h3 className="mb-4 font-display text-base font-semibold">Style overrides</h3>
              <ToneControls
                value={tone}
                onChange={(next) => void updateConversation(id, { toneOverrides: next })}
              />
            </div>
            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              className="mt-8 w-full rounded-xl bg-accent py-3.5 text-sm font-semibold text-accent-foreground"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
