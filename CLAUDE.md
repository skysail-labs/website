# Darknyx — agent guide

> Also see `AGENTS.md` — both files carry the same standing rules. If the two ever appear to conflict, the human maintainer should resolve it; do not guess.

## Standing rules

- Never commit on your own — always show the proposed commit message and wait for explicit approval.
- Never include co-author lines or any mention of AI tools in commit messages.
- Never skip hooks (`--no-verify`) or force-push unless explicitly instructed.

## Repo layout

```
/                       Next.js app (the website)
├── src/                App Router pages, components, API routes
├── public/             Static assets served by Next.js
├── design-system/      Brand assets, tokens, favicons
├── vercel.json
├── CLAUDE.md           ← this file
└── AGENTS.md
```

## Docs

Docs are hosted on Mintlify at [docs.darknyx.trade](https://docs.darknyx.trade) and live in a **separate repo** — they are not part of this repository. `darknyx.trade/docs` (and `/docs/*`) 301-redirects there; the redirect is defined in `next.config.ts`. To change where docs point, edit that redirect and the `CONTACT.docs` URL in `src/components/site/copy.ts`.

## Local dev

```bash
bun run dev    # http://localhost:3000
```
