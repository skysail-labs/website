import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express, { type Request, type Response } from "express";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = path.resolve(__dirname, "../../docs/docs");
const CACHE_TTL_MS = 30_000;
const PORT = Number(process.env.PORT ?? 3020);
const MODE = process.env.MCP_TRANSPORT ?? "http"; // "stdio" | "http"

interface DocEntry {
  slug: string;
  filePath: string;
}

interface DocCache {
  entries: DocEntry[];
  contents: Map<string, string>;
  builtAt: number;
}

let cache: DocCache | null = null;

function log(level: "info" | "warn" | "error", msg: string, meta?: object) {
  process.stderr.write(
    JSON.stringify({ level, msg, ...meta, ts: new Date().toISOString() }) + "\n"
  );
}

async function buildCache(): Promise<DocCache> {
  const entries: DocEntry[] = [];
  const contents = new Map<string, string>();

  async function walk(dir: string, prefix: string) {
    let dirEntries;
    try {
      dirEntries = await fs.readdir(dir, { withFileTypes: true });
    } catch (err) {
      log("warn", "Cannot read directory", { dir, err: String(err) });
      return;
    }
    for (const entry of dirEntries) {
      const fullPath = path.join(dir, entry.name);
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        await walk(fullPath, rel);
      } else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
        const slug = rel
          .replace(/\.mdx?$/, "")
          .replace(/^\d+-/, "")
          .replace(/\/\d+-/g, "/");
        try {
          const raw = await fs.readFile(fullPath, "utf-8");
          const content = raw.replace(/^---[\s\S]*?---\n/, "").trim();
          entries.push({ slug, filePath: fullPath });
          contents.set(slug, content);
        } catch (err) {
          log("warn", "Cannot read file", { fullPath, err: String(err) });
        }
      }
    }
  }

  await walk(DOCS_DIR, "");
  log("info", "Docs cache built", { count: entries.length });
  return { entries, contents, builtAt: Date.now() };
}

async function getDocs(): Promise<DocCache> {
  if (!cache || Date.now() - cache.builtAt > CACHE_TTL_MS) {
    cache = await buildCache();
  }
  return cache;
}

function safeSlug(input: string): string | null {
  const normalized = path.normalize(input).replace(/\\/g, "/");
  if (normalized.includes("..") || path.isAbsolute(normalized)) return null;
  return normalized;
}

function findDoc(docs: DocCache, slug: string) {
  if (docs.contents.has(slug)) {
    return { slug, content: docs.contents.get(slug)! };
  }
  const entry = docs.entries.find((e) => e.slug.endsWith(`/${slug}`));
  if (entry && docs.contents.has(entry.slug)) {
    return { slug: entry.slug, content: docs.contents.get(entry.slug)! };
  }
  return null;
}

function createServer(): McpServer {
  const server = new McpServer({ name: "nyx-docs", version: "1.0.0" });

  server.registerTool(
    "list_docs",
    {
      title: "List Docs",
      description: "List all available Nyx documentation pages with their slugs.",
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const docs = await getDocs();
        const text = docs.entries.map((d) => d.slug).join("\n");
        return { content: [{ type: "text" as const, text }] };
      } catch (err) {
        log("error", "list_docs failed", { err: String(err) });
        return {
          content: [{ type: "text" as const, text: "Failed to list docs." }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "get_doc",
    {
      title: "Get Doc",
      description: "Retrieve a specific Nyx documentation page by its slug.",
      inputSchema: {
        slug: z
          .string()
          .min(1)
          .max(200)
          .describe("Page slug e.g. 'get-started/overview' or 'how-it-works/settlement'"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ slug }) => {
      try {
        const safe = safeSlug(slug);
        if (!safe) {
          return { content: [{ type: "text" as const, text: "Invalid slug." }], isError: true };
        }
        const docs = await getDocs();
        const match = findDoc(docs, safe);
        if (!match) {
          const list = docs.entries.map((d) => d.slug).join("\n");
          return {
            content: [
              { type: "text" as const, text: `Page "${slug}" not found. Available:\n${list}` },
            ],
            isError: true,
          };
        }
        return { content: [{ type: "text" as const, text: match.content }] };
      } catch (err) {
        log("error", "get_doc failed", { slug, err: String(err) });
        return {
          content: [{ type: "text" as const, text: "Failed to retrieve page." }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "search_docs",
    {
      title: "Search Docs",
      description: "Search Nyx documentation by keyword. Returns matching page slugs and excerpts.",
      inputSchema: {
        query: z.string().min(1).max(200).describe("Keyword or phrase to search for"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(20)
          .default(10)
          .describe("Max number of results to return"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ query, limit }) => {
      try {
        const docs = await getDocs();
        const q = query.toLowerCase();
        const matches: { slug: string; excerpt: string }[] = [];

        for (const { slug } of docs.entries) {
          if (matches.length >= limit) break;
          const content = docs.contents.get(slug) ?? "";
          const idx = content.toLowerCase().indexOf(q);
          if (idx !== -1) {
            const start = Math.max(0, idx - 100);
            const end = Math.min(content.length, idx + 200);
            const excerpt = "..." + content.slice(start, end).replace(/\n+/g, " ") + "...";
            matches.push({ slug, excerpt });
          }
        }

        if (matches.length === 0) {
          return { content: [{ type: "text" as const, text: `No results for "${query}".` }] };
        }

        const text = matches.map((m) => `**${m.slug}**\n${m.excerpt}`).join("\n\n---\n\n");
        return { content: [{ type: "text" as const, text }] };
      } catch (err) {
        log("error", "search_docs failed", { query, err: String(err) });
        return {
          content: [{ type: "text" as const, text: "Search failed." }],
          isError: true,
        };
      }
    }
  );

  return server;
}

async function startHttp() {
  const app = express();
  app.use(express.json());

  // session map: sessionId → transport
  const sessions = new Map<string, StreamableHTTPServerTransport>();

  app.post("/mcp", async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    // reuse existing session
    if (sessionId && sessions.has(sessionId)) {
      const transport = sessions.get(sessionId)!;
      await transport.handleRequest(req, res, req.body);
      return;
    }

    // new session
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
    });

    transport.onclose = () => {
      if (transport.sessionId) {
        sessions.delete(transport.sessionId);
        log("info", "Session closed", { sessionId: transport.sessionId });
      }
    };

    const server = createServer();
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);

    if (transport.sessionId) {
      sessions.set(transport.sessionId, transport);
      log("info", "Session created", { sessionId: transport.sessionId });
    }
  });

  // SSE stream for server-initiated messages
  app.get("/mcp", async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !sessions.has(sessionId)) {
      res.status(400).json({ error: "Invalid or missing session ID" });
      return;
    }
    const transport = sessions.get(sessionId)!;
    await transport.handleRequest(req, res);
  });

  // DELETE to cleanly close a session
  app.delete("/mcp", async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !sessions.has(sessionId)) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    const transport = sessions.get(sessionId)!;
    await transport.close();
    sessions.delete(sessionId);
    res.status(204).end();
  });

  // health check
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", sessions: sessions.size });
  });

  app.listen(PORT, () => {
    log("info", `Nyx MCP HTTP server listening`, { port: PORT, endpoint: `http://0.0.0.0:${PORT}/mcp` });
  });
}

async function startStdio() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  log("info", "Nyx MCP stdio server started");
}

if (MODE === "stdio") {
  await startStdio();
} else {
  await startHttp();
}