import type { Appearance, BubbleStyle, Wallpaper } from "@/types";
import {
  ACCENT_THEMES,
  BUBBLE_STYLES,
  WALLPAPERS,
} from "@/stores/appearanceStore";
import { Field, PillGroup } from "./ui-kit";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/useTranslation";
import type { TranslationKey } from "@/i18n/locales/en";

export function bubbleClass(style: BubbleStyle, side: "incoming" | "outgoing") {
  if (style === "square") return "rounded-md";
  if (style === "rounded") return "rounded-3xl";
  // "signal" — one tucked corner on the sender's side.
  return side === "outgoing" ? "rounded-2xl rounded-br-md" : "rounded-2xl rounded-bl-md";
}

export function wallpaperClass(wallpaper: Wallpaper) {
  return wallpaper === "none" ? "" : `wallpaper-${wallpaper}`;
}

export function ChatAppearanceControls({
  value,
  onChange,
  onReset,
}: {
  value: Appearance;
  onChange: (next: Partial<Appearance>) => void;
  onReset?: () => void;
}) {
  const { t } = useTranslation();
  const bubbleOptions = BUBBLE_STYLES.map((b) => ({
    value: b.value,
    label: t(`bubbleStyle.${b.value}` as TranslationKey),
  }));
  const wallpaperOptions = WALLPAPERS.map((w) => ({
    value: w.value,
    label: t(`wallpaper.${w.value}` as TranslationKey),
  }));

  return (
    <div className="space-y-5">
      <Field label={t("appearance.accentLabel")}>
        <div className="flex flex-wrap gap-2">
          {ACCENT_THEMES.map((theme) => (
            <button
              key={theme.value}
              type="button"
              onClick={() => onChange({ accent: theme.value })}
              aria-label={t(`accent.${theme.value}` as TranslationKey)}
              className={cn(
                "size-9 rounded-full border-2",
                value.accent === theme.value ? "border-foreground" : "border-transparent",
              )}
              style={{ backgroundColor: theme.swatch }}
            />
          ))}
        </div>
      </Field>

      <Field label={t("appearance.bubbleLabel")}>
        <PillGroup
          options={bubbleOptions}
          value={value.bubbleStyle}
          onChange={(bubbleStyle) => onChange({ bubbleStyle })}
        />
      </Field>

      <Field label={t("appearance.wallpaperLabel")}>
        <PillGroup
          options={wallpaperOptions}
          value={value.wallpaper}
          onChange={(wallpaper) => onChange({ wallpaper })}
        />
      </Field>

      {onReset ? (
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-muted-foreground underline"
        >
          {t("appearance.reset")}
        </button>
      ) : null}
    </div>
  );
}
