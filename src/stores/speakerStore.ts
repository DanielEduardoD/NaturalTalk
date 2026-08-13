import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SpeakerProfile } from "../types";

export const DEFAULT_SPEAKER: SpeakerProfile = {
  name: "",
  age: null,
  gender: null,
  nativeLanguage: "",
  apiKey: "",
  apiProvider: "anthropic",
  aiBackend: "lovable",
  optionCount: 3,
  hasSetOptionPreference: false,
  defaultTone: {
    tone: "casual",
    ageStyle: "none",
    customAge: null,
    customTone: null,
    slangLevel: "medium",
    internetLanguage: true,
  },
};

interface SpeakerStore {
  profile: SpeakerProfile | null;
  hasCompletedOnboarding: boolean;
  hasSeenLanding: boolean;
  setProfile: (profile: SpeakerProfile) => void;
  updateProfile: (updates: Partial<SpeakerProfile>) => void;
  setOnboardingComplete: () => void;
  setSeenLanding: () => void;
  reset: () => void;
}

export const useSpeakerStore = create<SpeakerStore>()(
  persist(
    (set) => ({
      profile: null,
      hasCompletedOnboarding: false,
      hasSeenLanding: false,
      setProfile: (profile) => set({ profile }),
      updateProfile: (updates) =>
        set((state) => ({
          profile: { ...(state.profile ?? DEFAULT_SPEAKER), ...updates },
        })),
      setOnboardingComplete: () => set({ hasCompletedOnboarding: true }),
      setSeenLanding: () => set({ hasSeenLanding: true }),
      reset: () => set({ profile: null, hasCompletedOnboarding: false, hasSeenLanding: false }),
    }),
    { name: "naturaltalk-speaker" },
  ),
);
