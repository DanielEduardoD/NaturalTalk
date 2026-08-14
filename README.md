# NaturalTalk

Context-aware translation that sounds like a native speaker your age — dialect, pronouns and formality matched to the person you're talking to.

Live demo: https://naturaltalk.01100100.xyz

## Overview

Most translators return one flat, textbook-neutral sentence. NaturalTalk instead asks who you're talking to — a partner, a boss, a friend's grandma — and rewrites the message the way a native speaker your age would actually send it: right pronouns, right formality, right regional dialect, right amount of slang.

## Features

Each contact gets their own profile — relationship, age, gender and region — and every translation is tailored to that context: pronouns and formality match the relationship, dialect narrows down to the city they're in, and slang level ranges from textbook-formal to Gen Alpha internet-speak.

Translations come back structured rather than as a single guess: up to three alternate phrasings per message, each with a romanization, a literal back-translation so you know exactly what you're sending, and a breakdown of any new vocabulary worth remembering. New words surface automatically into a saved vocabulary list.

Two AI backends are supported. By default, translations run through a built-in Gemini backend that never exposes an API key to the browser — the request is validated and proxied entirely inside a Cloudflare Worker. Anyone who prefers to use their own Anthropic key can add it in Settings; that path calls Anthropic directly from the client, so no server secret is involved.

Everything else is local-first: profiles, conversations and vocabulary live only in the browser's IndexedDB. Message text is sent to the AI provider solely to produce a translation and is never stored server-side. Backups can be exported and re-imported as JSON, optionally encrypted client-side with a password using AES-256-GCM and a PBKDF2-SHA256 derived key at 150,000 iterations, entirely through the Web Crypto API.

The app installs as a PWA on Android and iOS, and includes a quick thumbs-up/down on every translation plus a direct feedback link in Settings.

## Tech stack

Frontend: TanStack Start on React 19, file-based routing, TypeScript throughout.

Styling: Tailwind CSS 4 with Radix UI primitives.

State: Zustand.

Storage: Dexie.js over IndexedDB.

AI: Vercel AI SDK, Google Gemini for the built-in backend, Anthropic Claude for the bring-your-own-key path.

Validation: Zod-validated TanStack server functions.

Hosting: Cloudflare Workers via Nitro, deployed with Wrangler.

Tooling: Vite, ESLint, Prettier, Bun.

## Development

```sh
git clone <this-repository-url>
cd NaturalTalk
bun install
bun run dev
```

## Deployment

NaturalTalk builds to a Cloudflare-compatible worker bundle.

```sh
bun install
bun run build
bunx wrangler deploy
```

wrangler deploy requires a wrangler.toml with your account ID and the build output paths. Set GEMINI_API_KEY as a Worker secret to enable the built-in AI:

```sh
bunx wrangler secret put GEMINI_API_KEY
```

Users who bring their own Anthropic key need no server secret.

## Status

Actively developed and running in production. Bug reports and feature ideas: feedback@01100100.xyz.

## Author

Built by Daniel Diaz / DD Enterprises.
