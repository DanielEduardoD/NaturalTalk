import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Search, Trash2 } from "lucide-react";
import { useVocabStore } from "@/stores/vocabStore";
import { LANGUAGE_CONFIGS } from "@/config/languageConfig";
import { languageLabel } from "@/components/common/LanguagePicker";
import { inputClass } from "@/components/common/ui-kit";
import { cn } from "@/lib/utils";
import type { VocabWord } from "@/types";

export const Route = createFileRoute("/vocabulary")({
  head: () => ({
    meta: [
      { title: "Vocabulary — NaturalTalk" },
      {
        name: "description",
        content: "Words and phrases you saved from your translations, with romanization and notes.",
      },
      { property: "og:title", content: "Vocabulary — NaturalTalk" },
      {
        property: "og:description",
        content: "Build a personal phrasebook from real conversations.",
      },
    ],
  }),
  component: VocabularyPage,
});

const STATUS_CYCLE: VocabWord["studyStatus"][] = ["new", "learning", "known"];
const STATUS_STYLES: Record<VocabWord["studyStatus"], string> = {
  new: "bg-field text-muted-foreground",
  learning: "bg-amber-500/20 text-amber-400",
  known: "bg-primary/20 text-primary",
};

function VocabularyPage() {
  const navigate = useNavigate();
  const words = useVocabStore((state) => state.words);
  const loadWords = useVocabStore((state) => state.loadWords);
  const updateWord = useVocabStore((state) => state.updateWord);
  const deleteWord = useVocabStore((state) => state.deleteWord);

  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    void loadWords();
  }, [loadWords]);

  const languages = useMemo(
    () => Array.from(new Set(words.map((w) => w.language))),
    [words],
  );

  const visible = words.filter((word) => {
    if (filter !== "all" && word.language !== filter) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      word.word.toLowerCase().includes(q) ||
      word.romanization.toLowerCase().includes(q) ||
      word.meaning.toLowerCase().includes(q)
    );
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-5 pt-6 pb-16">
      <header className="flex items-center gap-3">
        <button type="button" onClick={() => void navigate({ to: "/" })} aria-label="Back">
          <ArrowLeft className="size-5 text-muted-foreground" />
        </button>
        <h1 className="font-display text-2xl font-bold">Vocabulary</h1>
      </header>

      <div className="mt-5 flex flex-wrap gap-2">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          All
        </FilterChip>
        {languages.map((code) => {
          const lang = languageLabel(code);
          return (
            <FilterChip key={code} active={filter === code} onClick={() => setFilter(code)}>
              {lang.flag} {lang.name}
            </FilterChip>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-field px-3.5 py-2.5">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search saved words"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {visible.length === 0 ? (
        <p className="mt-16 text-center text-sm text-muted-foreground">
          No saved words yet. Tap “Save” on vocabulary suggestions in a translation.
        </p>
      ) : null}

      <div className="mt-5 space-y-3">
        {visible.map((word) => {
          const isRTL = LANGUAGE_CONFIGS[word.language]?.isRTL ?? false;
          const open = expanded === word.id;
          return (
            <div key={word.id} className="rounded-2xl bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : word.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p dir={isRTL ? "rtl" : "ltr"} className="native-text text-lg">
                    {word.word}
                  </p>
                  {word.romanization ? (
                    <p className="text-xs text-muted-foreground">{word.romanization}</p>
                  ) : null}
                  <p className="mt-1 text-sm text-muted-foreground">{word.meaning}</p>
                </button>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const next =
                        STATUS_CYCLE[(STATUS_CYCLE.indexOf(word.studyStatus) + 1) % 3]!;
                      void updateWord(word.id, { studyStatus: next });
                    }}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] capitalize",
                      STATUS_STYLES[word.studyStatus],
                    )}
                  >
                    {word.studyStatus}
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteWord(word.id)}
                    aria-label="Delete word"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              {open ? (
                <div className="mt-3 space-y-3 border-t border-border pt-3">
                  {word.exampleSentence ? (
                    <p dir={isRTL ? "rtl" : "ltr"} className="native-text text-sm">
                      {word.exampleSentence}
                    </p>
                  ) : null}
                  <p className="text-[11px] text-muted-foreground">
                    Saved {new Date(word.dateAdded).toLocaleDateString()}
                  </p>
                  <input
                    defaultValue={word.userNote}
                    onBlur={(event) => void updateWord(word.id, { userNote: event.target.value })}
                    placeholder="Add a personal note..."
                    className={inputClass}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </main>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs",
        active
          ? "border-primary bg-primary/15 text-primary"
          : "border-border bg-field text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}
