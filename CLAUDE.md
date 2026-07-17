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
│   └── docs/           Pre-built Docusaurus output — gitignored, rebuilt on deploy
├── design-system/      Brand assets, tokens, favicons
├── docs/               Docusaurus site source
│   ├── docs/           Generated page content — do not edit directly (see below)
│   └── src/            Theme, swizzled components, CSS
├── portal/             Source of truth for all doc page content ← edit here
├── scripts/
│   ├── sync-portal.js          Copies portal/ → docs/docs/ with Mermaid conversion
│   └── build-docs-index.mjs   Generates src/generated/docs-index.json for MCP
├── vercel.json
├── CLAUDE.md           ← this file
└── AGENTS.md
```

## Updating the docs — read this before touching anything in docs/

The docs pipeline has three layers. Getting them wrong makes changes look like they did nothing, or worse, silently breaks the site design.

```
portal/          ← EDIT HERE
    │
    │  node scripts/sync-portal.js        (from repo root)
    ▼
docs/docs/       ← generated, do not edit directly
    │
    │  cd docs && bun run build
    ▼
docs/build/      ← Docusaurus output
    │
    │  cp -r build/* ../public/docs/
    ▼
public/docs/     ← what the Next.js site actually serves
```

**Full update sequence:**

```bash
# 1. Edit content in portal/

# 2. Sync to docs/docs/ (handles Mermaid conversion, YAML quoting, category links)
node scripts/sync-portal.js

# 3. Build Docusaurus
cd docs && bun run build

# 4. Copy build output into the Next.js static folder
cp -r build/* ../public/docs/
```

On Vercel the copy is automatic via `vercel.json` `buildCommand`, so a deploy regenerates `public/docs/` for you. Locally you must do step 4 yourself or changes won't appear on `localhost:3000/docs`.

**⚠ Do not:**
- Edit files inside `docs/docs/` directly — the sync script overwrites them and your edit is lost.
- Run `rsync` or raw file copies from `portal/` to anywhere other than via `scripts/sync-portal.js`. The script applies per-file Mermaid diagram rules, YAML quoting, and category link stripping that a plain copy skips — bypassing it breaks diagrams and can corrupt the sidebar.
- Run `rsync portal/ docs/` or similar short paths — the target must be `docs/docs/`, not `docs/`. Targeting the wrong level wipes Docusaurus config files.

**Theme and config (edit directly, not via portal sync):**
- `docs/docusaurus.config.ts` — site metadata, navbar, sidebar behaviour
- `docs/src/css/custom.css` — design tokens (`--nyx-*`), light/dark themes
- `docs/src/theme/` — swizzled components (CopyPageMenu, Footer, TOC)

See `docs/CLAUDE.md` for deeper detail on the docs site.

## Local dev

```bash
# Next.js website
bun run dev              # http://localhost:3000

# Docusaurus (live preview of docs — no copy step needed here)
cd docs && bun start     # http://localhost:3010/docs
```
