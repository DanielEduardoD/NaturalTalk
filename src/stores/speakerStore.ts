import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SpeakerProfile } from "../types";

export const DEFAULT_SPEAKER: SpeakerProfile = {
  name: "",
  age: 24,
  gender: "male",
  nativeLanguage: "en",
  apiKey: "",
  apiProvider: "anthropic",
  aiBackend: "lovable",
  defaultTone: {
    tone: "casual",
    ageStyle: "22-25",
    slangLevel: "medium",
    internetLanguage: true,
  },
};

interface SpeakerStore {
  profile: SpeakerProfile | null;
  hasCompletedOnboarding: boolean;
  setProfile: (profile: SpeakerProfile) => void;
  updateProfile: (updates: Partial<SpeakerProfile>) => void;
  setOnboardingComplete: () => void;
  reset: () => void;
}

export const useSpeakerStore = create<SpeakerStore>()(
  persist(
    (set) => ({
      profile: null,
      hasCompletedOnboarding: false,
      setProfile: (profile) => set({ profile }),
      updateProfile: (updates) =>
        set((state) => ({
          profile: { ...(state.profile ?? DEFAULT_SPEAKER), ...updates },
        })),
      setOnboardingComplete: () => set({ hasCompletedOnboarding: true }),
      reset: () => set({ profile: null, hasCompletedOnboarding: false }),
    }),
    { name: "naturaltalk-speaker" },
  ),
);
