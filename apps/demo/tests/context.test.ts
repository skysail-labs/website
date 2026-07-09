import { describe, test, expect } from "bun:test";
import { relatedDocs, traceConcept, getDocContext } from "../src/lib/docs-mcp/context";
import { pages, concepts } from "../src/lib/docs-mcp/store";

describe("relatedDocs", () => {
  test("returns expanded summaries for a page with relations", () => {
    const donor = pages.find((p) => p.related.length > 0)!;
    expect(donor).toBeDefined();
    const related = relatedDocs(donor.slug)!;
    expect(related.length).toBe(donor.related.length);
    for (const r of related) {
      expect(r.url).toContain("darknyx.xyz/docs/");
      expect(r.title.length).toBeGreaterThan(0);
    }
  });

  test("unknown slug returns null", () => {
    expect(relatedDocs("no/such-page")).toBeNull();
  });
});

describe("traceConcept", () => {
  const [aliasedName, aliased] = Object.entries(concepts)
    .find(([, c]) => c.aliases.length > 0 && c.pages.length > 0)!;

  test("resolves a concept by name with full bundle", () => {
    const t = traceConcept(aliasedName)!;
    expect(t.concept).toBe(aliasedName);
    expect(t.pages.length).toBeGreaterThan(0);
    expect(t.docs.length).toBe(t.pages.length);
    expect(t.headings.length).toBeGreaterThan(0);
    expect(Array.isArray(t.relatedConcepts)).toBe(true);
    expect(t.relatedConcepts).not.toContain(aliasedName);
  });

  test("resolves the same concept via alias, case-insensitively", () => {
    const viaAlias = traceConcept(aliased.aliases[0].toUpperCase());
    expect(viaAlias?.concept).toBe(aliasedName);
  });

  test("unknown concept returns null", () => {
    expect(traceConcept("xyzzyplughfrobozz")).toBeNull();
  });
});

describe("getDocContext", () => {
  test("bundles primary page, related, concepts, and urls", () => {
    const ctx = getDocContext("how does settlement work")!;
    expect(ctx).not.toBeNull();
    expect(ctx.primary.slug).toBe("how-it-works/settlement");
    expect(ctx.primary.headings.length).toBeGreaterThan(0);
    expect(ctx.urls).toContain(ctx.primary.url);
    for (const r of ctx.related) expect(r.slug).not.toBe(ctx.primary.slug);
    expect(ctx.urls.length).toBeGreaterThanOrEqual(1 + ctx.related.length);
  });

  test("no matches returns null", () => {
    expect(getDocContext("xyzzyplughfrobozz")).toBeNull();
  });
});
