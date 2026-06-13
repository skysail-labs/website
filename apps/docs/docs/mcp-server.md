---
sidebar_position: 99
title: MCP Server
description: Connect AI agents to Nyx documentation via the Model Context Protocol.
hide_table_of_contents: true
---

# MCP Server

The Nyx MCP server lets AI agents (Claude, Cursor, Copilot, and any MCP-compatible client) query the full Nyx documentation programmatically.

## Available tools

| Tool | Description |
|---|---|
| `list_docs` | List all documentation pages and their slugs |
| `get_doc` | Retrieve a specific page by slug |
| `search_docs` | Search across all pages by keyword |

## Connect

The server speaks the [MCP Streamable HTTP transport](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports#streamable-http).

**Endpoint:** `https://mcp.nyx.trade/mcp`

Add this to your MCP client config:

```json
{
  "mcpServers": {
    "nyx-docs": {
      "url": "https://mcp.nyx.trade/mcp"
    }
  }
}
```

## Health check

```
GET https://mcp.nyx.trade/health
```

Returns `{ "status": "ok", "sessions": <n> }`.