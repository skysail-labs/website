# Darknyx

[darknyx.trade](https://darknyx.trade) — a privacy-first dark pool on Solana.

Orders match inside a Confidential VM (Intel TDX). Funds are held in a shielded note pool on-chain. Nothing about your position — size, price, or identity — is visible to other participants.

## Repo

```
/                   Next.js website (darknyx.trade)
├── docs/           Docusaurus documentation site (/docs)
├── portal/         Source of truth for all doc page content
├── design-system/  Brand assets, tokens, favicons
└── scripts/        Build and sync utilities
```

## Docs

The documentation lives at [darknyx.trade/docs](https://darknyx.trade/docs). To update it, edit files in `portal/` and run the sync — see `docs/CLAUDE.md` for the exact workflow.
