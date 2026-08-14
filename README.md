# NaturalTalk

Context-aware translation that sounds like a native speaker your age — dialect, pronouns and formality matched to the person you're talking to.

## Built with

TanStack Start, TypeScript, React and Tailwind CSS.

## How it works

NaturalTalk uses Google's Gemini AI to generate translations, adapting tone, dialect and formality to the person you're talking to. Everything else runs client-side: your profile, conversations and saved vocabulary are stored only in your browser and are never uploaded. Message text is sent to the AI provider solely to produce a translation.

You can also bring your own Anthropic API key from Settings instead of using the built-in AI.

## Development

```sh
git clone <this-repository-url>
cd <repository-name>
bun install
bun run dev
```

## Deployment

NaturalTalk is a TanStack Start app that builds to a Cloudflare-compatible worker bundle.

```sh
bun install
bun run build
bunx wrangler deploy
```

The build emits the worker and static assets; wrangler deploy requires a wrangler.toml with your account_id and the build output paths. Set GEMINI_API_KEY as a Worker secret to enable the built-in AI: bunx wrangler secret put GEMINI_API_KEY. Users who supply their own Anthropic key need no server secret.

## PWA

public/manifest.webmanifest plus the 192/512 icons make the app installable on Android ("Add to Home screen" / install prompt in Chrome) and iOS Safari ("Add to Home Screen"). There is no service worker, so the app requires a connection — which it needs anyway for translations.

## Author

Built by Daniel Diaz / DD Enterprises.
