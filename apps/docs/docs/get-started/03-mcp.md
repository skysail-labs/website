---
sidebar_position: 3
title: MCP Server
description: Connect Claude Code, Cursor, or VS Code to the Darknyx documentation over the Model Context Protocol and ask questions directly against these docs.
---

# MCP Server

These docs are available as a hosted **MCP (Model Context Protocol) server**, so
AI coding tools can query them as structured knowledge instead of scraping web
pages.

```
https://darknyx.xyz/api/mcp
```

:::info
The server is stateless, read-only retrieval. Your assistant does the
reasoning; the server returns grounded documentation with canonical URLs.
:::

## Connect

### Claude Code

```bash
claude mcp add --transport http darknyx-docs https://darknyx.xyz/api/mcp
```

### Cursor

Add to `.cursor/mcp.json` (project) or `~/.cursor/mcp.json` (global):

```json
{
  "mcpServers": {
    "darknyx-docs": {
      "url": "https://darknyx.xyz/api/mcp"
    }
  }
}
```

### VS Code

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "darknyx-docs": {
      "type": "http",
      "url": "https://darknyx.xyz/api/mcp"
    }
  }
}
```

## What it exposes

| Tool | Purpose |
| --- | --- |
| `search_docs` | Ranked keyword search across every page |
| `read_doc` | Full markdown of one page by slug |
| `related_docs` | Pages linked to a given page |
| `get_navigation` | The full docs hierarchy |
| `find_examples` | Search code examples only |
| `get_doc_context` | One-call context bundle for complex questions |
| `trace` | Traverse the concept graph (e.g. `TEE`, `Settlement`) |

Pages are also exposed as MCP resources (`docs://page/<slug>`,
`docs://navigation`, `docs://knowledge`).

## Try it

Once connected, ask your assistant things like:

- "How does settlement work in Darknyx?"
- "Show me the withdrawal flow."
- "Find the deposit code examples."
- "What should I read before integrating the SDK?"

Answers come back grounded in these docs, with links to the exact pages.
