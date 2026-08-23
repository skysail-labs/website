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
├── gitbook/            GitBook doc source — two spaces, published as two tabs
│   ├── docs.yaml       site structure; `path:` values are load-bearing (see below)
│   ├── documentation/  tab 1 — prose: concepts, how-it-works, SDK
│   └── api-reference/  tab 2 — wire surface, rendered from a GENERATED OpenAPI spec
├── vercel.json
├── CLAUDE.md           ← this file
└── AGENTS.md
```

## Updating the docs

Docs are hosted on GitBook at [darknyx.gitbook.io/darknyx](https://darknyx.gitbook.io/darknyx) and synced from `gitbook/` in this repo. Edit the relevant `.md` file, commit and push — GitBook picks up the change automatically. No build step.

`gitbook/` is a **site-wide Git Sync layout**: one `docs.yaml` at the top and two self-contained space directories, each published as a tab. Three things about it are easy to break.

**Cross-space links must be site-absolute.** A space cannot read a sibling directory, so `../trading-concepts/order-types.md` resolves to nothing once published. Links that cross spaces are written `/documentation/trading-concepts/order-types` — leading slash, no `.md`. There are 52 of them and they depend on the `path:` values in `docs.yaml`. Changing a `path` breaks all of them at once; grep for `](/api-reference/` and `](/documentation/` before touching it.

**Never hand-edit `api-reference/openapi/darknyx-public.yaml`.** It is generated from the internal spec in the `darknyx` repo by `scripts/build-public-openapi.py`, which drops every operation tagged `admin` and prunes unreachable components. Hand edits are reverted on the next regeneration. Two traps are encoded in that generator: `GET /admin/metrics/settlement` carries both a `settlement` and an `admin` tag, so filtering on the primary tag alone publishes the operator surface; and `securitySchemes` are referenced by *name* from `security:` blocks rather than by `$ref`, so a `$ref`-only prune silently deletes `BearerAuth` and the published reference stops saying the API needs a token.

**The 34 `{% openapi %}` blocks fetch the spec over HTTP**, from its raw URL in the public `skysail-labs/darknyx` repo — not from the copy in this directory, which is a reference copy only. GitBook re-fetches roughly every 6 hours. If the spec moves, rewrite the `src` in all 34 blocks together.

Two things about the published site are configured in GitBook's dashboard, not in this repo, and cannot be changed by pushing: the section paths (`/documentation`, `/api-reference`) and the "Test it" panel. **Keep "Test it" off.** The engine terminates TLS itself with a self-signed, boot-random, quote-bound certificate that clients verify against `GET /transport-attestation`, not against a public CA — a browser try-it panel calling the live enclave fails TLS, and the apparent fix (disabling certificate verification) is precisely what these docs tell readers never to do. `servers:` also still lists placeholder hosts (`api.darknyx.example.com`).

The WebSocket pages under `api-reference/websocket/` are hand-written on purpose: `/v1/stream` is described by a custom `x-websocket` extension GitBook does not render, and GitBook does not support AsyncAPI.

## Local dev

```bash
bun run dev    # http://localhost:3000
```
