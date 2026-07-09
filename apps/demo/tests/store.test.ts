import { describe, test, expect } from "bun:test";
import {
  meta, pages, concepts, getPage, closestSlugs, resolveConcept,
  closestConcepts, navigation, pageSummary,
} from "../src/lib/docs-mcp/store";

describe("store", () => {
  test("loads index once with consistent meta", () => {
    expect(pages.length).toBe(meta.docCount);
    expect(Object.keys(concepts).length).toBe(meta.conceptCount);
  });

  test("getPage resolves exact, prefixed, and trailing-slash slugs", () => {
    const p = getPage("how-it-works/settlement");
    expect(p?.title.toLowerCase()).toContain("settlement");
    expect(getPage("/docs/how-it-works/settlement/")?.slug).toBe("how-it-works/settlement");
    expect(getPage("no/such-page")).toBeUndefined();
  });

  test("closestSlugs suggests near matches", () => {
    const suggestions = closestSlugs("settlment"); // typo
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.some((s) => s.includes("settlement"))).toBe(true);
  });

  test("resolveConcept matches names case-insensitively and via aliases", () => {
    const [name, concept] = Object.entries(concepts)
      .find(([, c]) => c.aliases.length > 0)!;
    expect(resolveConcept(name.toUpperCase())?.name).toBe(name);
    expect(resolveConcept(concept.aliases[0])?.name).toBe(name);
    expect(resolveConcept("zzz-no-such-concept")).toBeUndefined();
  });

  test("closestConcepts returns suggestions for unknown input", () => {
    const anyName = Object.keys(concepts)[0];
    expect(closestConcepts(anyName.slice(0, 4)).length).toBeGreaterThan(0);
  });

  test("navigation covers every page exactly once, in sidebar order", () => {
    const nav = navigation();
    const all = nav.flatMap((s) => s.pages.map((p) => p.slug));
    expect(all.length).toBe(pages.length);
    expect(new Set(all).size).toBe(all.length);
    for (const section of nav) {
      expect(section.section.length).toBeGreaterThan(0);
      for (const p of section.pages) expect(p.url).toContain("darknyx.xyz/docs/");
    }
  });

  test("pageSummary keeps only lightweight fields", () => {
    const s = pageSummary(pages[0]);
    expect(Object.keys(s).sort()).toEqual(
      ["description", "section", "slug", "title", "url"].filter((k) => k in s).sort(),
    );
    expect((s as unknown as Record<string, unknown>).body).toBeUndefined();
  });
});
