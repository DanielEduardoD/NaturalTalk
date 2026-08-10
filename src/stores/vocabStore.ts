import { create } from "zustand";
import db from "../services/database";
import type { VocabWord } from "../types";

interface VocabStore {
  words: VocabWord[];
  loadWords: () => Promise<void>;
  addWord: (word: Omit<VocabWord, "id" | "dateAdded">) => Promise<void>;
  updateWord: (id: string, updates: Partial<VocabWord>) => Promise<void>;
  deleteWord: (id: string) => Promise<void>;
  deleteAll: () => Promise<void>;
}

export const useVocabStore = create<VocabStore>((set) => ({
  words: [],

  loadWords: async () => {
    const words = await db.vocabulary.toArray();
    words.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
    set({ words });
  },

  addWord: async (word) => {
    const entry: VocabWord = { ...word, id: crypto.randomUUID(), dateAdded: new Date() };
    await db.vocabulary.add(entry);
    set((state) => ({ words: [entry, ...state.words] }));
  },

  updateWord: async (id, updates) => {
    await db.vocabulary.update(id, updates);
    set((state) => ({
      words: state.words.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    }));
  },

  deleteWord: async (id) => {
    await db.vocabulary.delete(id);
    set((state) => ({ words: state.words.filter((w) => w.id !== id) }));
  },

  deleteAll: async () => {
    await db.vocabulary.clear();
    set({ words: [] });
  },
}));
