import { createMcpHandler } from "mcp-handler";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  closestConcepts, closestSlugs, concepts, getPage, meta, navigation, pages,
} from "@/lib/docs-mcp/store";
import { findExamples, searchDocs } from "@/lib/docs-mcp/search";
import { getDocContext, relatedDocs, traceConcept } from "@/lib/docs-mcp/context";

const INSTRUCTIONS = `Darknyx protocol documentation server (retrieval only — you do the explaining).
Preferred workflow:
- General question: search_docs, then read_doc on the best slug, then related_docs if needed.
- Complex or multi-part question: get_doc_context (one call returns the full bundle).
- Deep-dive on a named protocol concept (e.g. "Settlement", "TEE"): trace.
- Need example code: find_examples.
- Need the documentation structure: get_navigation.
Always cite the returned darknyx.trade URLs when answering from these docs.`;

const json = (data: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
});
const errorResult = (message: string) => ({
  isError: true,
  content: [{ type: "text" as const, text: message }],
});

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "search_docs",
      {
        description:
          "Search the Darknyx documentation for a concept, protocol feature, SDK component, or keyword. Returns ranked pages with snippets, slugs, and URLs. Prefer this as the first call for any general question, before read_doc.",
        inputSchema: {
          query: z.string().min(1).describe("Search terms, e.g. 'settlement proof' or 'TEE attestation'"),
        },
      },
      async ({ query }) => {
        const results = searchDocs(query);
        if (results.length === 0) return json({ results: [], message: "No matching documentation found." });
        return json({ results });
      },
    );

    server.registerTool(
      "read_doc",
      {
        description:
          "Read one documentation page in full by slug (e.g. 'how-it-works/settlement'). Returns the complete markdown body, headings, structured code blocks, and related page slugs. Use after search_docs identifies the right page.",
        inputSchema: {
          slug: z.string().min(1).describe("Page slug, e.g. 'how-it-works/settlement'"),
        },
      },
      async ({ slug }) => {
        const page = getPage(slug);
        if (!page) {
          const suggestions = closestSlugs(slug);
          return errorResult(
            `Page not found: "${slug}".${suggestions.length ? ` Did you mean: ${suggestions.join(", ")}` : ""}`,
          );
        }
        const { title, url, body, headings, codeBlocks, related } = page;
        return json({ title, slug: page.slug, url, body, headings, codeBlocks, related });
      },
    );

    server.registerTool(
      "related_docs",
      {
        description:
          "List pages closely related to a given page — same topic cluster, linked pages, shared concepts. Use to widen reading after read_doc.",
        inputSchema: {
          slug: z.string().min(1).describe("Page slug to find neighbors of"),
        },
      },
      async ({ slug }) => {
        const related = relatedDocs(slug);
        if (related === null) {
          const suggestions = closestSlugs(slug);
          return errorResult(
            `Page not found: "${slug}".${suggestions.length ? ` Did you mean: ${suggestions.join(", ")}` : ""}`,
          );
        }
        return json({ slug, related });
      },
    );

    server.registerTool(
      "get_navigation",
      {
        description:
          "Return the full documentation sidebar hierarchy: sections in order, each with its pages (title, slug, url, description). Use to understand documentation structure or list what documentation exists, without searching.",
      },
      async () => json({ sections: navigation() }),
    );

    server.registerTool(
      "find_examples",
      {
        description:
          "Search only code examples across the documentation. Returns matching code blocks with language, the code itself, and the source page (title, slug, url). Use when the user asks for example code, snippets, or 'how do I write…'.",
        inputSchema: {
          query: z.string().min(1).describe("What the example should show, e.g. 'deposit' or 'typescript client'"),
        },
      },
      async ({ query }) => {
        const examples = findExamples(query);
        if (examples.length === 0) return json({ examples: [], message: "No matching code examples found." });
        return json({ examples });
      },
    );

    server.registerTool(
      "get_doc_context",
      {
        description:
          "Retrieve a complete context bundle for a complex question in one call: the primary matching page, related pages, relevant glossary concepts, important headings, example code, and documentation URLs. Prefer this over multiple search/read calls for multi-part or architectural questions.",
        inputSchema: {
          query: z.string().min(1).describe("The question or topic to gather documentation context for"),
        },
      },
      async ({ query }) => {
        const ctx = getDocContext(query);
        if (!ctx) return json({ message: "No matching documentation found." });
        return json(ctx);
      },
    );

    server.registerTool(
      "trace",
      {
        description:
          "Traverse the documentation knowledge graph from a named protocol concept (e.g. 'Settlement', 'TEE', 'nullifier'). Resolves aliases, then returns everything connected to the concept: docs, code examples, related concepts, headings, and pages. Use for concept deep-dives; use get_doc_context for free-text questions instead.",
        inputSchema: {
          concept: z.string().min(1).describe("Concept name or alias, e.g. 'TEE' or 'Trusted Execution Environment'"),
        },
      },
      async ({ concept }) => {
        const trace = traceConcept(concept);
        if (!trace) {
          const suggestions = closestConcepts(concept);
          return errorResult(
            `No matching concept found: "${concept}".${suggestions.length ? ` Did you mean: ${suggestions.join(", ")}` : ""}`,
          );
        }
        return json(trace);
      },
    );

    server.registerResource(
      "docs-navigation",
      "docs://navigation",
      {
        description: "Documentation sidebar tree: sections in order with page titles, slugs, and URLs",
        mimeType: "application/json",
      },
      async (uri) => ({
        contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(navigation(), null, 2) }],
      }),
    );

    server.registerResource(
      "docs-knowledge",
      "docs://knowledge",
      {
        description: "Protocol concept index: concepts with aliases, keywords, and the pages that cover them",
        mimeType: "application/json",
      },
      async (uri) => ({
        contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(concepts, null, 2) }],
      }),
    );

    server.registerResource(
      "docs-metadata",
      "docs://metadata",
      {
        description: "Index metadata: version, generation timestamp, document and concept counts",
        mimeType: "application/json",
      },
      async (uri) => ({
        contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(meta, null, 2) }],
      }),
    );

    server.registerResource(
      "docs-page",
      new ResourceTemplate("docs://page/{+slug}", {
        list: async () => ({
          resources: pages.map((p) => ({
            uri: `docs://page/${p.slug}`,
            name: p.title,
            description: p.description,
            mimeType: "text/markdown",
          })),
        }),
      }),
      {
        description: "Complete markdown of one documentation page, by slug",
        mimeType: "text/markdown",
      },
      async (uri, variables) => {
        const slug = Array.isArray(variables.slug) ? variables.slug.join("/") : String(variables.slug ?? "");
        const page = getPage(slug);
        if (!page) throw new Error(`Page not found: ${slug}`);
        return {
          contents: [{ uri: uri.href, mimeType: "text/markdown", text: page.body }],
        };
      },
    );
  },
  { instructions: INSTRUCTIONS },
  { basePath: "/api", maxDuration: 60, verboseLogs: false },
);

export { handler as GET, handler as POST, handler as DELETE };
