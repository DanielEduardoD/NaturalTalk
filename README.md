# NaturalTalk

Context-aware translation that sounds like a native speaker your age. Tell it who you're
writing to — dialect, formality, relationship, age — and it rewrites your message the way
a real person would actually send it.

Copyright © DD Enterprises. Maintained by Daniel Diaz.

## Development

You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Deployment

NaturalTalk builds to a Cloudflare-compatible worker bundle.

```bash
bun install
bun run build        # emits the worker + static assets
bunx wrangler deploy # requires a wrangler.toml with your account_id and the build output paths
```

Set the translation gateway key as a Worker secret before deploying. Users who supply their
own provider key in Settings need no server secret.

## PWA

`public/manifest.webmanifest` plus the 192/512 icons make the app installable on Android
("Add to Home screen" / install prompt in Chrome) and iOS Safari ("Add to Home Screen").
There is no service worker, so the app requires a connection — which it needs anyway for
translations.
