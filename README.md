# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

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

NaturalTalk is a TanStack Start app that builds to a Cloudflare-compatible worker bundle.

- **Lovable hosting** — click Publish; frontend changes go live after clicking Update, backend changes deploy immediately.
- **GitHub** — connect the project via the chat "+" menu → GitHub → Connect project for two-way sync.
- **Cloudflare Workers (self-host)** — after connecting GitHub, clone the repo and run:
  ```bash
  bun install
  bun run build        # emits the worker + static assets
  bunx wrangler deploy # requires a wrangler.toml with your account_id and the build output paths
  ```
  Set `LOVABLE_API_KEY` (built-in AI gateway) as a Worker secret: `bunx wrangler secret put LOVABLE_API_KEY`.
  Users who supply their own Anthropic key need no server secret.

## PWA

`public/manifest.webmanifest` plus the 192/512 icons make the app installable on Android
("Add to Home screen" / install prompt in Chrome) and iOS Safari ("Add to Home Screen").
There is no service worker, so the app requires a connection — which it needs anyway for translations.
