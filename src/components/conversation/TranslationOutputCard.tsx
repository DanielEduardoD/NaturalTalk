import { useState } from "react";
import { Check, ChevronDown, Copy, RefreshCw, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";
import { LANGUAGE_CONFIGS } from "@/config/languageConfig";
import type { TranslationResponse, VocabFlagged } from "@/types";
import { cn } from "@/lib/utils";

const FEEDBACK_CHIPS = [
  "Wrong pronouns",
  "Wrong dialect",
  "Sounds unnatural",
  "Wrong tone",
  "Too formal",
  "Too casual",
  "Other",
];

interface Props {
  status: "loading" | "error" | "loaded";
  response: TranslationResponse | null;
  errorMessage?: string;
  targetLanguage: string;
  sourceLanguageName: string;
  feedback?: "up" | "down" | null;
  selectedIndex: number;
  savedWords: string[];
  onSelectOption: (index: number) => void;
  onSaveWord: (word: VocabFlagged) => void;
  onFeedback: (value: "up" | "down", detail?: string) => void;
  onRetry: () => void;
  onRegenerate?: () => void;
}

export function TranslationOutputCard({
  status,
  response,
  errorMessage,
  targetLanguage,
  sourceLanguageName,
  feedback,
  selectedIndex,
  savedWords,
  onSelectOption,
  onSaveWord,
  onFeedback,
  onRetry,
  onRegenerate,
}: Props) {
  const config = LANGUAGE_CONFIGS[targetLanguage];
  const isRTL = config?.isRTL ?? false;
  const [copied, setCopied] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showVocab, setShowVocab] = useState(false);
  const [showFeedbackChips, setShowFeedbackChips] = useState(false);

  const options = response?.options ?? [];
  const active = options[selectedIndex] ?? options[0];

  const copy = async () => {
    if (!active) return;
    await navigator.clipboard.writeText(active.translation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-surface p-5 pl-6">
      <span
        className={cn(
          "absolute top-0 bottom-0 left-0 w-1 origin-bottom",
          status === "loaded" ? "animate-fill-up bg-primary" : "animate-border-pulse bg-border",
        )}
      />

      {status === "loading" ? (
        <div className="space-y-3">
          <div className="h-6 w-3/4 animate-pulse rounded bg-field" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-field" />
          <div className="h-11 w-full animate-pulse rounded-xl bg-field" />
        </div>
      ) : null}

      {status === "error" ? (
        <div className="space-y-3">
          <p className="text-sm text-destructive">
            {errorMessage ?? "Unexpected response. Please try again."}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground"
          >
            Retry
          </button>
        </div>
      ) : null}

      {status === "loaded" && active ? (
        <div className="space-y-4">
          {options.length > 1 ? (
            <div className="space-y-2">
              <p className="text-xs tracking-wide text-muted-foreground uppercase">
                Pick the version you like
              </p>
              {options.map((option, index) => (
                <button
                  key={`${option.translation}-${index}`}
                  type="button"
                  onClick={() => onSelectOption(index)}
                  className={cn(
                    "block w-full rounded-xl border px-3.5 py-3 text-left transition-colors",
                    index === selectedIndex
                      ? "border-primary bg-primary/10"
                      : "border-border bg-field",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-muted-foreground">
                      {option.style_label || `Option ${index + 1}`}
                    </span>
                    {index === selectedIndex ? (
                      <Check className="size-3.5 shrink-0 text-primary" />
                    ) : null}
                  </span>
                  <span
                    dir={isRTL ? "rtl" : "ltr"}
                    className={cn("native-text mt-1 block text-base leading-relaxed", isRTL && "text-right")}
                  >
                    {option.translation}
                  </span>
                  {option.literal ? (
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {option.literal}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          ) : (
            <p
              dir={isRTL ? "rtl" : "ltr"}
              className={cn("native-text text-xl leading-relaxed", isRTL && "text-right")}
            >
              {active.translation}
            </p>
          )}

          {config?.needsRomanization && active.romanization ? (
            <p className="text-sm text-muted-foreground">{active.romanization}</p>
          ) : null}

          {active.literal ? (
            <div className="rounded-xl border border-border bg-field px-3 py-2.5">
              <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                Literal meaning in {sourceLanguageName}
              </p>
              <p className="mt-1 text-sm">{active.literal}</p>
            </div>
          ) : null}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={copy}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-accent-foreground"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
            {onRegenerate ? (
              <button
                type="button"
                onClick={onRegenerate}
                className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm"
              >
                <RefreshCw className="size-4" /> Regenerate
              </button>
            ) : null}
          </div>

          <div className="h-px bg-border" />

          {response && response.breakdown.length > 0 ? (
            <div>
              <button
                type="button"
                onClick={() => setShowBreakdown((v) => !v)}
                className="flex w-full items-center justify-between text-sm text-muted-foreground"
              >
                Phrase breakdown
                <ChevronDown
                  className={cn("size-4 transition-transform", showBreakdown && "rotate-180")}
                />
              </button>
              {showBreakdown ? (
                <div className="mt-3 space-y-3">
                  {response.breakdown.map((item, index) => (
                    <div key={`${item.phrase}-${index}`} className="text-sm">
                      <p className="native-text" dir={isRTL ? "rtl" : "ltr"}>
                        {item.phrase}
                      </p>
                      {item.romanization ? (
                        <p className="text-xs text-muted-foreground">{item.romanization}</p>
                      ) : null}
                      <p className="text-xs text-muted-foreground">{item.meaning}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {response && response.vocabulary.length > 0 ? (
            <div>
              <button
                type="button"
                onClick={() => setShowVocab((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1.5 text-xs text-primary"
              >
                <Sparkles className="size-3.5" />
                {response.vocabulary.length} new word
                {response.vocabulary.length === 1 ? "" : "s"}
              </button>
              {showVocab ? (
                <div className="mt-3 space-y-2">
                  {response.vocabulary.map((word) => {
                    const saved = savedWords.includes(word.word);
                    return (
                      <div
                        key={word.word}
                        className="flex items-center justify-between gap-3 rounded-xl bg-field px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="native-text truncate text-sm">{word.word}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {word.romanization ? `${word.romanization} — ` : ""}
                            {word.meaning}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={saved}
                          onClick={() => onSaveWord(word)}
                          className="shrink-0 rounded-lg border border-primary/50 px-2.5 py-1 text-xs text-primary disabled:opacity-50"
                        >
                          {saved ? "Saved ✓" : "Save"}
                        </button>
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => response.vocabulary.forEach(onSaveWord)}
                    className="text-xs text-primary underline"
                  >
                    Save all
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          {response?.tone_note ? (
            <p className="text-xs text-muted-foreground italic">{response.tone_note}</p>
          ) : null}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => onFeedback("up")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs",
                feedback === "up" && "border-primary text-primary",
              )}
            >
              <ThumbsUp className="size-3.5" /> Looks good
            </button>
            <button
              type="button"
              onClick={() => {
                setShowFeedbackChips(true);
                onFeedback("down");
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs",
                feedback === "down" && "border-destructive text-destructive",
              )}
            >
              <ThumbsDown className="size-3.5" /> Something&apos;s off
            </button>
          </div>

          {showFeedbackChips ? (
            <div className="flex flex-wrap gap-2">
              {FEEDBACK_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    onFeedback("down", chip);
                    setShowFeedbackChips(false);
                  }}
                  className="rounded-full bg-field px-3 py-1.5 text-xs text-muted-foreground"
                >
                  {chip}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
