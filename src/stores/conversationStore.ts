import { create } from "zustand";
import db from "../services/database";
import type { Appearance, Conversation, Message, RecipientProfile, ToneSettings } from "../types";

interface ConversationStore {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  setActiveConversation: (id: string) => void;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  createConversation: (
    recipient: RecipientProfile,
    toneOverrides?: Partial<ToneSettings> | null,
  ) => Promise<Conversation>;
  updateConversation: (
    id: string,
    updates: {
      recipient?: RecipientProfile;
      toneOverrides?: Partial<ToneSettings> | null;
      pinned?: boolean;
      archived?: boolean;
      appearance?: Partial<Appearance> | null;
    },
  ) => Promise<void>;
  togglePinned: (id: string) => Promise<void>;
  toggleArchived: (id: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  addMessage: (message: Message) => Promise<void>;
  updateMessage: (messageId: string, updates: Partial<Message>) => Promise<void>;
  deleteMessage: (conversationId: string, messageId: string) => Promise<void>;
  updateMessageFeedback: (
    messageId: string,
    feedback: "up" | "down",
    detail?: string,
  ) => Promise<void>;
  importData: (payload: {
    conversations: Conversation[];
    messages: Message[];
  }) => Promise<{ conversations: number; messages: number }>;
  deleteAllConversations: () => Promise<void>;
}

const sortConversations = (a: Conversation, b: Conversation) => {
  if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
};

/** Older records predate pinning and per-chat appearance. */
const normalize = (c: Conversation): Conversation => ({
  ...c,
  pinned: c.pinned ?? false,
  archived: c.archived ?? false,
  appearance: c.appearance ?? null,
});

export const useConversationStore = create<ConversationStore>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},

  setActiveConversation: (id) => set({ activeConversationId: id }),

  loadConversations: async () => {
    const conversations = (await db.conversations.toArray()).map(normalize).sort(sortConversations);
    set({ conversations });
  },

  loadMessages: async (conversationId) => {
    const rows = await db.messages.where("conversationId").equals(conversationId).toArray();
    rows.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    set((state) => ({ messages: { ...state.messages, [conversationId]: rows } }));
  },

  createConversation: async (recipient, toneOverrides = null) => {
    const now = new Date();
    const conversation: Conversation = {
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      recipient,
      toneOverrides: toneOverrides ?? null,
      pinned: false,
      archived: false,
      appearance: null,
    };
    await db.conversations.add(conversation);
    set((state) => ({
      conversations: [conversation, ...state.conversations].sort(sortConversations),
    }));
    return conversation;
  },

  updateConversation: async (id, updates) => {
    const patch = { ...updates, updatedAt: new Date() };
    await db.conversations.update(id, patch);
    set((state) => ({
      conversations: state.conversations
        .map((c) => (c.id === id ? { ...c, ...patch } : c))
        .sort(sortConversations),
    }));
  },

  togglePinned: async (id) => {
    const current = get().conversations.find((c) => c.id === id);
    const pinned = !current?.pinned;
    await db.conversations.update(id, { pinned });
    set((state) => ({
      conversations: state.conversations
        .map((c) => (c.id === id ? { ...c, pinned } : c))
        .sort(sortConversations),
    }));
  },

  toggleArchived: async (id) => {
    const current = get().conversations.find((c) => c.id === id);
    const archived = !current?.archived;
    // Archiving also clears the pin so the chat leaves the top of the list.
    const patch = archived ? { archived, pinned: false } : { archived };
    await db.conversations.update(id, patch);
    set((state) => ({
      conversations: state.conversations
        .map((c) => (c.id === id ? { ...c, ...patch } : c))
        .sort(sortConversations),
    }));
  },

  deleteConversation: async (id) => {
    await db.messages.where("conversationId").equals(id).delete();
    await db.conversations.delete(id);
    set((state) => {
      const messages = { ...state.messages };
      delete messages[id];
      return { conversations: state.conversations.filter((c) => c.id !== id), messages };
    });
  },

  addMessage: async (message) => {
    await db.messages.add(message);
    await db.conversations.update(message.conversationId, { updatedAt: new Date() });
    set((state) => ({
      messages: {
        ...state.messages,
        [message.conversationId]: [...(state.messages[message.conversationId] ?? []), message],
      },
      conversations: state.conversations
        .map((c) => (c.id === message.conversationId ? { ...c, updatedAt: new Date() } : c))
        .sort(sortConversations),
    }));
  },

  updateMessage: async (messageId, updates) => {
    await db.messages.update(messageId, updates);
    const { messages } = get();
    const next: Record<string, Message[]> = {};
    for (const [key, list] of Object.entries(messages)) {
      next[key] = list.map((m) => (m.id === messageId ? { ...m, ...updates } : m));
    }
    set({ messages: next });
  },

  deleteMessage: async (conversationId, messageId) => {
    await db.messages.delete(messageId);
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] ?? []).filter((m) => m.id !== messageId),
      },
    }));
  },

  updateMessageFeedback: async (messageId, feedback, detail) => {
    await get().updateMessage(messageId, { feedback, feedbackDetail: detail ?? "" });
  },

  importData: async (payload) => {
    const conversations = (payload.conversations ?? []).map((c) =>
      normalize({
        ...c,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
      }),
    );
    const messages = (payload.messages ?? []).map((m) => ({
      ...m,
      timestamp: new Date(m.timestamp),
    }));
    if (conversations.length) await db.conversations.bulkPut(conversations);
    if (messages.length) await db.messages.bulkPut(messages);
    await get().loadConversations();
    return { conversations: conversations.length, messages: messages.length };
  },

  deleteAllConversations: async () => {
    await db.messages.clear();
    await db.conversations.clear();
    set({ conversations: [], messages: {} });
  },
}));
