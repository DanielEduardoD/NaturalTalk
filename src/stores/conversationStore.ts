import { create } from "zustand";
import db from "../services/database";
import type { Conversation, Message, RecipientProfile, ToneSettings } from "../types";

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
    updates: { recipient?: RecipientProfile; toneOverrides?: Partial<ToneSettings> | null },
  ) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  addMessage: (message: Message) => Promise<void>;
  updateMessageFeedback: (
    messageId: string,
    feedback: "up" | "down",
    detail?: string,
  ) => Promise<void>;
  deleteAllConversations: () => Promise<void>;
}

const byUpdatedDesc = (a: Conversation, b: Conversation) =>
  new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();

export const useConversationStore = create<ConversationStore>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},

  setActiveConversation: (id) => set({ activeConversationId: id }),

  loadConversations: async () => {
    const conversations = (await db.conversations.toArray()).sort(byUpdatedDesc);
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
    };
    await db.conversations.add(conversation);
    set((state) => ({ conversations: [conversation, ...state.conversations].sort(byUpdatedDesc) }));
    return conversation;
  },

  updateConversation: async (id, updates) => {
    const patch = { ...updates, updatedAt: new Date() };
    await db.conversations.update(id, patch);
    set((state) => ({
      conversations: state.conversations
        .map((c) => (c.id === id ? { ...c, ...patch } : c))
        .sort(byUpdatedDesc),
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
        .sort(byUpdatedDesc),
    }));
  },

  updateMessageFeedback: async (messageId, feedback, detail) => {
    await db.messages.update(messageId, { feedback, feedbackDetail: detail ?? "" });
    const { messages } = get();
    const next: Record<string, Message[]> = {};
    for (const [key, list] of Object.entries(messages)) {
      next[key] = list.map((m) =>
        m.id === messageId ? { ...m, feedback, feedbackDetail: detail ?? "" } : m,
      );
    }
    set({ messages: next });
  },

  deleteAllConversations: async () => {
    await db.messages.clear();
    await db.conversations.clear();
    set({ conversations: [], messages: {} });
  },
}));
