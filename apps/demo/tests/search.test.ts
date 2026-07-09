import { describe, test, expect } from "bun:test";
import { searchDocs, findExamples, expandQuery } from "../src/lib/docs-mcp/search";
import { pages, concepts } from "../src/lib/docs-mcp/store";

describe("searchDocs", () => {
  test("finds settlement page for settlement query, ranked first", () => {
    const results = searchDocs("settlement");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].slug).toBe("how-it-works/settlement");
    expect(results[0].score).toBeGreaterThan(0);
    expect(results[0].snippet.length).toBeGreaterThan(0);
    expect(results[0].url).toBe("https://darknyx.xyz/docs/how-it-works/settlement");
  });

  test("results are sorted by descending score and capped", () => {
    const results = searchDocs("order", 5);
    expect(results.length).toBeLessThanOrEqual(5);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  test("title match outranks body-only match", () => {
    // "merkle" appears in the merkle-proofs title; other pages mention it in body.
    const results = searchDocs("merkle");
    expect(results[0].slug).toBe("account/merkle-proofs");
  });

  test("alias expansion: long form reaches the TEE architecture page", () => {
    const viaAlias = searchDocs("Trusted Execution Environment");
    expect(viaAlias.some((r) => r.slug === "how-it-works/tee-architecture")).toBe(true);
  });

  test("no matches returns empty array", () => {
    expect(searchDocs("xyzzyplughfrobozz")).toEqual([]);
  });
});

describe("expandQuery", () => {
  test("adds canonical concept tokens for alias hits", () => {
    const withAliases = Object.entries(concepts).find(([, c]) => c.aliases.length > 0);
    if (!withAliases) return; // knowledge index guarantees at least one (task 1 test)
    const [name, concept] = withAliases;
    const expanded = expandQuery(concept.aliases[0]);
    const nameTokens = name.toLowerCase().match(/[a-z0-9]+/g) ?? [];
    expect(nameTokens.every((t) => expanded.includes(t))).toBe(true);
  });
});

describe("findExamples", () => {
  // Data-driven: pick a real token from a real indexed code block, so the
  // test never depends on specific doc content.
  const donor = pages.find((p) => p.codeBlocks.length > 0);

  test("docs contain at least one code block to search", () => {
    expect(donor).toBeDefined();
  });

  test("finds code blocks by content token, with page attribution", () => {
    const token = donor!.codeBlocks[0].code.match(/[A-Za-z_]{4,}/)?.[0];
    expect(token).toBeDefined();
    const results = findExamples(token!);
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.language.length).toBeGreaterThan(0);
      expect(r.code.length).toBeGreaterThan(0);
      expect(r.page.url).toContain("darknyx.xyz/docs/");
    }
    expect(results.some((r) => r.code.includes(token!))).toBe(true);
  });

  test("no matches returns empty array", () => {
    expect(findExamples("xyzzyplughfrobozz")).toEqual([]);
  });
});
