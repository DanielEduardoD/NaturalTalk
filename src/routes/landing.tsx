import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Globe2, Lock, Sparkles, Users } from "lucide-react";
import { useSpeakerStore } from "@/stores/speakerStore";
import { useTranslation } from "@/i18n/useTranslation";
import type { TranslationKey } from "@/i18n/locales/en";

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
      { property: "og:url", content: "https://naturaltalk.01100100.xyz/landing" },    ],
    links: [{ rel: "canonical", href: "https://naturaltalk.01100100.xyz/landing" }],  }),
  component: Landing,
});

function buildFeatures(t: (key: TranslationKey) => string) {
  return [
    {
      icon: Users,
      title: t("landing.feature.whoTalking.title"),
      body: t("landing.feature.whoTalking.body"),
    },
    {
      icon: Globe2,
      title: t("landing.feature.dialects.title"),
      body: t("landing.feature.dialects.body"),
    },
    {
      icon: Sparkles,
      title: t("landing.feature.age.title"),
      body: t("landing.feature.age.body"),
    },
    {
      icon: Lock,
      title: t("landing.feature.privacy.title"),
      body: t("landing.feature.privacy.body"),
    },
  ];
}

function Landing() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const setSeenLanding = useSpeakerStore((state) => state.setSeenLanding);
  const hasCompletedOnboarding = useSpeakerStore((state) => state.hasCompletedOnboarding);
  const FEATURES = buildFeatures(t);

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
        {t("landing.heroTitlePrefix")} <span className="text-primary">{t("landing.heroTitleHighlight")}</span>
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {t("landing.heroSubtitle")}
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
        <h2 className="font-display text-sm font-semibold">{t("landing.privacy.title")}</h2>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {t("landing.privacy.body")}
        </p>
      </section>

      <button
        type="button"
        onClick={start}
        className="mt-8 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground"
      >
        {t("landing.getStarted")}
      </button>
      <button
        type="button"
        onClick={() => {
          setSeenLanding();
          void navigate({ to: "/" });
        }}
        className="mt-3 w-full py-2 text-xs text-muted-foreground underline"
      >
        {t("landing.skipIntro")}
      </button>
    </main>
  );
}
