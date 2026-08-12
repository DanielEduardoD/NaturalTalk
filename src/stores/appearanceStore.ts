import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AccentTheme, Appearance, BubbleStyle, Wallpaper } from "../types";

export const DEFAULT_APPEARANCE: Appearance = {
  accent: "violet",
  bubbleStyle: "signal",
  wallpaper: "none",
  outgoingTint: "violet",
  compact: false,
};

export const ACCENT_THEMES: { value: AccentTheme; label: string; swatch: string }[] = [
  { value: "violet", label: "Violet", swatch: "oklch(0.66 0.18 295)" },
  { value: "teal", label: "Teal", swatch: "oklch(0.784 0.137 187.6)" },
  { value: "indigo", label: "Indigo", swatch: "oklch(0.68 0.15 274)" },
  { value: "amber", label: "Amber", swatch: "oklch(0.82 0.15 82)" },
  { value: "rose", label: "Rose", swatch: "oklch(0.74 0.16 12)" },
  { value: "forest", label: "Forest", swatch: "oklch(0.74 0.15 152)" },
  { value: "slate", label: "Slate", swatch: "oklch(0.72 0.03 250)" },
];


export const BUBBLE_STYLES: { value: BubbleStyle; label: string }[] = [
  { value: "signal", label: "Tucked" },
  { value: "rounded", label: "Pill" },
  { value: "square", label: "Square" },
];

export const WALLPAPERS: { value: Wallpaper; label: string }[] = [
  { value: "none", label: "None" },
  { value: "dots", label: "Dots" },
  { value: "grid", label: "Grid" },
  { value: "aurora", label: "Aurora" },
  { value: "waves", label: "Waves" },
  { value: "paper", label: "Paper" },
];

interface AppearanceStore {
  appearance: Appearance;
  update: (updates: Partial<Appearance>) => void;
  reset: () => void;
}

export const useAppearanceStore = create<AppearanceStore>()(
  persist(
    (set) => ({
      appearance: DEFAULT_APPEARANCE,
      update: (updates) => set((state) => ({ appearance: { ...state.appearance, ...updates } })),
      reset: () => set({ appearance: DEFAULT_APPEARANCE }),
    }),
    { name: "naturaltalk-appearance" },
  ),
);

export function resolveAppearance(
  base: Appearance,
  override: Partial<Appearance> | null | undefined,
): Appearance {
  return { ...base, ...(override ?? {}) };
}
