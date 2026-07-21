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
├── gitbook/            GitBook doc source — edit here to update darknyx.gitbook.io/darknyx
├── vercel.json
├── CLAUDE.md           ← this file
└── AGENTS.md
```

## Updating the docs

Docs are hosted on GitBook at [darknyx.gitbook.io/darknyx](https://darknyx.gitbook.io/darknyx) and synced from the `gitbook/` directory in this repo. To update a doc page:

1. Edit the relevant `.md` file inside `gitbook/`
2. Commit and push — GitBook picks up the change automatically via GitHub sync

No build step, no scripts, no copy commands. GitBook handles everything on its end.

## Local dev

```bash
bun run dev    # http://localhost:3000
```
