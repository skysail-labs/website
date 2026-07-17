import { describe, test, expect } from "bun:test";
import docsIndex from "../src/generated/docs-index.json";
import knowledge from "../src/generated/knowledge-index.json";

type CodeBlock = { language: string; code: string; heading?: string };
type DocPage = {
  slug: string; title: string; section: string; sectionPosition: number;
  position: number; description?: string; url: string; headings: string[];
  tags: string[]; body: string; codeBlocks: CodeBlock[]; readingTime: number;
  related: string[];
};

const index = docsIndex as unknown as {
  meta: { version: string; generatedAt: string; docCount: number; conceptCount: number };
  pages: DocPage[];
};
const concepts = knowledge as unknown as Record<
  string, { aliases: string[]; pages: string[]; keywords: string[] }
>;
const slugs = new Set(index.pages.map((p) => p.slug));

describe("docs-index.json", () => {
  test("meta block is consistent", () => {
    expect(index.meta.version).toBe("1.0");
    expect(Date.parse(index.meta.generatedAt)).toBeGreaterThan(0);
    expect(index.meta.docCount).toBe(index.pages.length);
    expect(index.meta.conceptCount).toBe(Object.keys(concepts).length);
    expect(index.pages.length).toBeGreaterThanOrEqual(15);
  });

  test("every page has canonical slug, url and required fields", () => {
    for (const p of index.pages) {
      expect(p.slug).toMatch(/^[a-z0-9-]+\/[a-z0-9-]+$/);
      expect(p.slug).not.toMatch(/\/\d+-/); // numeric prefixes stripped
      expect(p.url).toBe(`https://darknyx.trade/docs/${p.slug}`);
      expect(p.title.length).toBeGreaterThan(0);
      expect(p.section.length).toBeGreaterThan(0);
      expect(p.readingTime).toBeGreaterThanOrEqual(1);
      expect(p.body).not.toMatch(/^---\n/); // frontmatter stripped
      expect(p.body).not.toContain("\n:::"); // admonition markers unwrapped
      for (const cb of p.codeBlocks) {
        expect(cb.language.length).toBeGreaterThan(0);
        expect(typeof cb.code).toBe("string");
      }
      for (const r of p.related) expect(slugs.has(r)).toBe(true);
      expect(p.related.length).toBeLessThanOrEqual(5);
      expect(p.related).not.toContain(p.slug);
    }
  });

  test("unpublished dirs (underscore or config-excluded) are not indexed", () => {
    for (const p of index.pages) expect(p.slug.startsWith("_")).toBe(false);
    expect([...slugs].some((s) => s.startsWith("reference/"))).toBe(false);
    expect([...slugs].some((s) => s.startsWith("reference-data/"))).toBe(false);
  });

  test("known pages are indexed", () => {
    expect(slugs.has("get-started/overview")).toBe(true);
    expect(slugs.has("how-it-works/settlement")).toBe(true);
    expect(slugs.has("how-it-works/tee-architecture")).toBe(true);
    expect(slugs.has("account/deposit")).toBe(true);
    expect(slugs.has("account/withdraw")).toBe(true);
  });

  test("slugs are unique", () => {
    expect(slugs.size).toBe(index.pages.length);
  });
});

describe("knowledge-index.json", () => {
  test("has glossary-derived concepts mapping to published pages", () => {
    expect(Object.keys(concepts).length).toBeGreaterThanOrEqual(15);
    for (const [name, c] of Object.entries(concepts)) {
      expect(name.length).toBeGreaterThan(0);
      expect(Array.isArray(c.aliases)).toBe(true);
      expect(Array.isArray(c.keywords)).toBe(true);
      for (const slug of c.pages) expect(slugs.has(slug)).toBe(true);
    }
  });

  test("at least one concept has aliases", () => {
    expect(Object.values(concepts).some((c) => c.aliases.length > 0)).toBe(true);
  });
});
