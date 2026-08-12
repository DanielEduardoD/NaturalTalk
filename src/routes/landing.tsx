import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Globe2, Lock, Sparkles, Users } from "lucide-react";
import { useSpeakerStore } from "@/stores/speakerStore";

export const Route = createFileRoute("/landing")({
  head: () => ({
    meta: [
      { title: "NaturalTalk — Translations that sound like a real person" },
      {
        name: "description",
        content:
          "NaturalTalk rewrites your messages with the right dialect, pronouns and formality for the person you're talking to. Everything stays on your device.",
      },
      { property: "og:title", content: "NaturalTalk — Translations that sound like a real person" },
      {
        property: "og:description",
        content:
          "Culturally intelligent rewrites with dialect, age and relationship awareness. Private by design.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://envision-builder-lab.lovable.app/landing" },
    ],
    links: [{ rel: "canonical", href: "https://envision-builder-lab.lovable.app/landing" }],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Users,
    title: "Knows who you're talking to",
    body: "Pronouns, formality and hierarchy adapt to each person you add — partner, boss, or a friend's grandma.",
  },
  {
    icon: Globe2,
    title: "Real dialects, not textbook",
    body: "Down to the region: Northern Mexican, Kansai Japanese, Southern Vietnamese and more.",
  },
  {
    icon: Sparkles,
    title: "Sounds your age",
    body: "Gen Alpha to formal business. Slang level, internet language and per-message moods are yours to set.",
  },
  {
    icon: Lock,
    title: "Private by design",
    body: "Conversations, profiles and saved words live in your browser only. Exports can be password-encrypted.",
  },
];

function Landing() {
  const navigate = useNavigate();
  const setSeenLanding = useSpeakerStore((state) => state.setSeenLanding);
  const hasCompletedOnboarding = useSpeakerStore((state) => state.hasCompletedOnboarding);

  const start = () => {
    setSeenLanding();
    void navigate({ to: hasCompletedOnboarding ? "/" : "/onboarding" });
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-5 pt-16 pb-12">
      <div className="flex size-16 items-center justify-center rounded-3xl bg-primary/15 text-3xl">
        💬
      </div>
      <h1 className="mt-6 font-display text-3xl leading-tight font-bold">
        Translations that sound like <span className="text-primary">you</span>
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        NaturalTalk is a context-aware translator. Tell it who you're writing to and it rewrites
        your message the way a native speaker your age would actually send it.
      </p>

      <div className="mt-9 space-y-4">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-3 rounded-2xl bg-surface p-4">
            <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="font-display text-sm font-semibold">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-2xl border border-border p-4">
        <h2 className="font-display text-sm font-semibold">Your data, your device</h2>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Profiles, conversations and vocabulary are stored locally in this browser. Message text is
          sent to the AI provider only to produce a translation, and nothing is kept on our side. If
          you clear browser data or uninstall the app, your history is gone — export a backup first.
        </p>
      </section>

      <button
        type="button"
        onClick={start}
        className="mt-8 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground"
      >
        Get started
      </button>
      <button
        type="button"
        onClick={() => {
          setSeenLanding();
          void navigate({ to: "/" });
        }}
        className="mt-3 w-full py-2 text-xs text-muted-foreground underline"
      >
        Skip intro
      </button>
    </main>
  );
}
