import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BookOpen, Pin, PinOff, Plus, Settings, Trash2, X } from "lucide-react";
import { useConversationStore } from "@/stores/conversationStore";
import { useSpeakerStore } from "@/stores/speakerStore";
import { LANGUAGE_CONFIGS } from "@/config/languageConfig";
import { languageLabel } from "@/components/common/LanguagePicker";
import { RecipientProfileForm, emptyRecipient } from "@/components/profile/RecipientProfileForm";
import { ToneControls } from "@/components/common/ToneControls";
import type { RecipientProfile } from "@/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NaturalTalk — Translations that sound like you" },
      {
        name: "description",
        content:
          "Context-aware translation that adapts pronouns, dialect and formality to the person you're talking to.",
      },
      { property: "og:title", content: "NaturalTalk — Translations that sound like you" },
      {
        property: "og:description",
        content: "Culturally intelligent rewrites, not literal translations.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://envision-builder-lab.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://envision-builder-lab.lovable.app/" }],
  }),

  component: Dashboard,
});

const RELATIONSHIP_LABELS: Record<string, string> = {
  "romantic-partner": "Partner",
  crush: "Crush",
  "close-friend": "Close friend",
  "casual-friend": "Casual friend",
  acquaintance: "Acquaintance",
  "older-person": "Older person",
  "younger-person": "Younger person",
  unknown: "Not sure",
};

function relativeTime(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

function Dashboard() {
  const navigate = useNavigate();
  const hasCompletedOnboarding = useSpeakerStore((state) => state.hasCompletedOnboarding);
  const hasSeenLanding = useSpeakerStore((state) => state.hasSeenLanding);
  const profile = useSpeakerStore((state) => state.profile);
  const conversations = useConversationStore((state) => state.conversations);
  const messages = useConversationStore((state) => state.messages);
  const loadConversations = useConversationStore((state) => state.loadConversations);
  const loadMessages = useConversationStore((state) => state.loadMessages);
  const createConversation = useConversationStore((state) => state.createConversation);
  const deleteConversation = useConversationStore((state) => state.deleteConversation);
  const togglePinned = useConversationStore((state) => state.togglePinned);

  const [modalOpen, setModalOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    conversations.forEach((c) => {
      if (!messages[c.id]) void loadMessages(c.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations]);

  useEffect(() => {
    if (!hydrated) return;
    if (!hasSeenLanding && !hasCompletedOnboarding) {
      void navigate({ to: "/landing" });
      return;
    }
    if (!hasCompletedOnboarding) void navigate({ to: "/onboarding" });
  }, [hydrated, hasSeenLanding, hasCompletedOnboarding, navigate]);


  if (!hydrated) return <div className="min-h-screen bg-background" />;

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-5 pt-8 pb-28">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">NaturalTalk</h1>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => void navigate({ to: "/vocabulary" })}
            aria-label="Vocabulary"
            className="rounded-full p-2 text-muted-foreground hover:text-foreground"
          >
            <BookOpen className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => void navigate({ to: "/settings" })}
            aria-label="Settings"
            className="rounded-full p-2 text-muted-foreground hover:text-foreground"
          >
            <Settings className="size-5" />
          </button>
        </div>
      </header>

      {conversations.length === 0 ? (
        <div className="mt-24 flex flex-col items-center text-center">
          <div className="flex size-20 items-center justify-center rounded-3xl bg-surface text-3xl">
            💬
          </div>
          <h2 className="mt-5 font-display text-lg font-semibold">Start your first conversation</h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Add someone you talk to and NaturalTalk will match their language, dialect and social
            context.
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-6 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground"
          >
            + New Conversation
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {conversations.map((conversation) => {
            const lang = languageLabel(conversation.recipient.targetLanguage);
            const isRTL = LANGUAGE_CONFIGS[conversation.recipient.targetLanguage]?.isRTL ?? false;
            const list = messages[conversation.id] ?? [];
            const last = [...list].reverse().find((m) => m.type === "outgoing");
            return (
              <div
                key={conversation.id}
                className="group relative overflow-hidden rounded-2xl bg-surface"
              >
                <button
                  type="button"
                  onClick={() =>
                    void navigate({
                      to: "/conversation/$id",
                      params: { id: conversation.id },
                    })
                  }
                  className="block w-full p-4 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-base font-semibold">
                        {conversation.pinned ? (
                          <Pin className="mr-1 inline size-3.5 text-primary" />
                        ) : null}
                        {conversation.recipient.name || "Unnamed"}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {lang.flag} {lang.name}
                        {conversation.recipient.dialect ? ` · ${conversation.recipient.dialect}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 pr-14 text-xs text-muted-foreground">
                      {relativeTime(conversation.updatedAt)}
                    </span>
                  </div>
                  <span className="mt-2 inline-block rounded-full bg-field px-2.5 py-1 text-[11px] text-muted-foreground">
                    {RELATIONSHIP_LABELS[conversation.recipient.relationship]}
                  </span>
                  {last ? (
                    <p
                      dir={isRTL ? "rtl" : "ltr"}
                      className="native-text mt-2 truncate text-sm text-muted-foreground"
                    >
                      {last.translation}
                    </p>
                  ) : null}
                </button>
                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => void togglePinned(conversation.id)}
                    className={
                      conversation.pinned
                        ? "rounded-full p-1.5 text-primary"
                        : "rounded-full p-1.5 text-muted-foreground hover:text-foreground"
                    }
                    aria-label={conversation.pinned ? "Unpin conversation" : "Pin conversation"}
                  >
                    {conversation.pinned ? (
                      <PinOff className="size-4" />
                    ) : (
                      <Pin className="size-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        confirm(
                          `Delete the conversation with ${conversation.recipient.name || "this person"}? This cannot be undone.`,
                        )
                      ) {
                        void deleteConversation(conversation.id);
                      }
                    }}
                    className="rounded-full p-1.5 text-muted-foreground hover:text-destructive"
                    aria-label="Delete conversation"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

            );
          })}
        </div>
      )}

      {conversations.length > 0 ? (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          aria-label="New conversation"
          className="fixed right-5 bottom-6 z-30 flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg"
        >
          <Plus className="size-6" />
        </button>
      ) : null}

      {modalOpen ? (
        <NewConversationModal
          nativeLanguage={profile?.nativeLanguage ?? "en"}
          onClose={() => setModalOpen(false)}
          onCreate={async (recipient) => {
            const conversation = await createConversation(recipient);
            setModalOpen(false);
            void navigate({ to: "/conversation/$id", params: { id: conversation.id } });
          }}
        />
      ) : null}
    </main>
  );
}

function NewConversationModal({
  nativeLanguage,
  onClose,
  onCreate,
}: {
  nativeLanguage: string;
  onClose: () => void;
  onCreate: (recipient: RecipientProfile) => Promise<void>;
}) {
  const profile = useSpeakerStore((state) => state.profile);
  const [recipient, setRecipient] = useState<RecipientProfile>(emptyRecipient(nativeLanguage));
  const [tone, setTone] = useState(profile?.defaultTone);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
      <div className="mx-auto w-full max-w-md px-5 py-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">New conversation</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="size-5 text-muted-foreground" />
          </button>
        </div>

        <div className="mt-6">
          <RecipientProfileForm value={recipient} onChange={setRecipient} />
        </div>

        {tone ? (
          <div className="mt-8">
            <h3 className="mb-4 font-display text-base font-semibold">Style for this person</h3>
            <ToneControls value={tone} onChange={setTone} />
          </div>
        ) : null}

        <button
          type="button"
          disabled={!recipient.name.trim() || !recipient.targetLanguage}
          onClick={() => void onCreate(recipient)}
          className="mt-8 w-full rounded-xl bg-accent py-3.5 text-sm font-semibold text-accent-foreground disabled:opacity-40"
        >
          Create Conversation
        </button>
      </div>
    </div>
  );
}
