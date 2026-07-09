// In-memory keyword search. Deterministic field weights per spec:
// title x5, headings x3, tags x2, body x1. Alias-aware via the knowledge index.
import { pages, concepts } from "./store";

export interface SearchResult {
  title: string;
  slug: string;
  url: string;
  section: string;
  score: number;
  snippet: string;
}

export interface ExampleResult {
  language: string;
  code: string;
  heading?: string;
  page: { title: string; slug: string; url: string };
}

const WEIGHT_TITLE = 5;
const WEIGHT_HEADINGS = 3;
const WEIGHT_TAGS = 2;
const WEIGHT_BODY = 1;
const BODY_HITS_CAP = 5; // per term, so long pages don't drown title matches

function tokenize(s: string): string[] {
  return s.toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

function count(haystack: string, needle: string): number {
  let n = 0;
  let i = haystack.indexOf(needle);
  while (i !== -1) { n += 1; i = haystack.indexOf(needle, i + needle.length); }
  return n;
}

// Expand query tokens through concept aliases in both directions:
// alias in query → add canonical name tokens; name in query → add alias tokens.
export function expandQuery(query: string): string[] {
  const ql = query.toLowerCase();
  const expanded = new Set(tokenize(query));
  for (const [name, concept] of Object.entries(concepts)) {
    const nameInQuery = ql.includes(name.toLowerCase());
    const aliasInQuery = concept.aliases.some((a) => ql.includes(a.toLowerCase()));
    if (aliasInQuery) for (const t of tokenize(name)) expanded.add(t);
    if (nameInQuery && concept.aliases.length > 0) {
      for (const t of tokenize(concept.aliases[0])) expanded.add(t);
    }
  }
  return [...expanded];
}

function makeSnippet(body: string, terms: string[]): string {
  const lower = body.toLowerCase();
  let at = -1;
  for (const t of terms) {
    const i = lower.indexOf(t);
    if (i !== -1 && (at === -1 || i < at)) at = i;
  }
  if (at === -1) at = 0;
  const start = Math.max(0, at - 100);
  const end = Math.min(body.length, at + 160);
  const raw = body.slice(start, end).replace(/\s+/g, " ").trim();
  return `${start > 0 ? "…" : ""}${raw}${end < body.length ? "…" : ""}`;
}

export function searchDocs(query: string, limit = 8): SearchResult[] {
  const terms = expandQuery(query);
  if (terms.length === 0) return [];
  return pages
    .map((p) => {
      const title = p.title.toLowerCase();
      const headings = p.headings.join("\n").toLowerCase();
      const tags = p.tags.join(" ");
      const body = p.body.toLowerCase();
      let score = 0;
      for (const t of terms) {
        score += count(title, t) * WEIGHT_TITLE;
        score += count(headings, t) * WEIGHT_HEADINGS;
        score += count(tags, t) * WEIGHT_TAGS;
        score += Math.min(count(body, t), BODY_HITS_CAP) * WEIGHT_BODY;
      }
      return { page: p, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.page.slug.localeCompare(b.page.slug))
    .slice(0, limit)
    .map(({ page, score }) => ({
      title: page.title,
      slug: page.slug,
      url: page.url,
      section: page.section,
      score,
      snippet: makeSnippet(page.body, terms),
    }));
}

export function findExamples(query: string, limit = 10): ExampleResult[] {
  const terms = expandQuery(query);
  if (terms.length === 0) return [];
  const scored: { result: ExampleResult; score: number }[] = [];
  for (const p of pages) {
    for (const cb of p.codeBlocks) {
      const code = cb.code.toLowerCase();
      const heading = (cb.heading ?? "").toLowerCase();
      const title = p.title.toLowerCase();
      let score = 0;
      for (const t of terms) {
        score += Math.min(count(code, t), BODY_HITS_CAP) * 2;
        score += count(heading, t) * 3;
        score += count(title, t) * 1;
        if (t === cb.language.toLowerCase()) score += 5;
      }
      if (score > 0) {
        const result: ExampleResult = {
          language: cb.language,
          code: cb.code,
          page: { title: p.title, slug: p.slug, url: p.url },
        };
        if (cb.heading) result.heading = cb.heading;
        scored.push({ result, score });
      }
    }
  }
  return scored
    .sort((a, b) => b.score - a.score || a.result.page.slug.localeCompare(b.result.page.slug))
    .slice(0, limit)
    .map((s) => s.result);
}
