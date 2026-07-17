// Graph-flavored retrieval: related pages, concept tracing, and one-call
// context bundles. Pure retrieval — assembles indexed data, never synthesizes.
import {
  concepts, getPage, pageSummary, resolveConcept,
  type Concept, type PageSummary,
} from "./store";
import { findExamples, searchDocs, type ExampleResult } from "./search";

export interface TraceResult {
  concept: string;
  aliases: string[];
  docs: PageSummary[];
  examples: ExampleResult[];
  relatedConcepts: string[];
  headings: string[];
  pages: string[];
}

export interface DocContext {
  query: string;
  primary: PageSummary & { headings: string[]; readingTime: number };
  related: PageSummary[];
  concepts: { name: string; keywords: string[]; pages: string[] }[];
  headings: string[];
  examples: ExampleResult[];
  urls: string[];
}

export function relatedDocs(slug: string): PageSummary[] | null {
  const page = getPage(slug);
  if (!page) return null;
  return page.related
    .map((s) => getPage(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map(pageSummary);
}

function conceptsSharingPages(name: string, concept: Concept): string[] {
  const mine = new Set(concept.pages);
  const related = new Set<string>(concept.keywords);
  for (const [other, c] of Object.entries(concepts)) {
    if (other === name) continue;
    if (c.pages.some((p) => mine.has(p))) related.add(other);
  }
  related.delete(name);
  return [...related].slice(0, 8);
}

export function traceConcept(input: string): TraceResult | null {
  const resolved = resolveConcept(input);
  if (!resolved) return null;
  const { name, concept } = resolved;
  const docPages = concept.pages
    .map((s) => getPage(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const examples = findExamples(name, 6).filter((e) =>
    concept.pages.includes(e.page.slug),
  );
  return {
    concept: name,
    aliases: concept.aliases,
    docs: docPages.map(pageSummary),
    examples,
    relatedConcepts: conceptsSharingPages(name, concept),
    headings: [...new Set(docPages.flatMap((p) => p.headings))].slice(0, 15),
    pages: docPages.map((p) => p.slug),
  };
}

export function getDocContext(query: string): DocContext | null {
  const hits = searchDocs(query, 6);
  if (hits.length === 0) return null;
  const primary = getPage(hits[0].slug)!;

  const relatedSlugs = new Set<string>();
  for (const s of primary.related) relatedSlugs.add(s);
  for (const h of hits.slice(1)) relatedSlugs.add(h.slug);
  relatedSlugs.delete(primary.slug);
  const related = [...relatedSlugs]
    .slice(0, 5)
    .map((s) => getPage(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map(pageSummary);

  const ql = query.toLowerCase();
  const matched = Object.entries(concepts)
    .filter(([name, c]) =>
      ql.includes(name.toLowerCase()) ||
      c.aliases.some((a) => ql.includes(a.toLowerCase())) ||
      c.pages.includes(primary.slug),
    )
    .slice(0, 5)
    .map(([name, c]) => ({ name, keywords: c.keywords, pages: c.pages }));

  const headings = [
    ...primary.headings,
    ...related.flatMap((r) => getPage(r.slug)?.headings.slice(0, 2) ?? []),
  ].slice(0, 15);

  return {
    query,
    primary: {
      ...pageSummary(primary),
      headings: primary.headings,
      readingTime: primary.readingTime,
    },
    related,
    concepts: matched,
    headings,
    examples: findExamples(query, 3),
    urls: [primary.url, ...related.map((r) => r.url)],
  };
}
