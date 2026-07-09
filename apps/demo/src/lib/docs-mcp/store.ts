// Loads the build-time docs index once at module init. All retrieval modules
// read from these in-memory structures; runtime never touches the filesystem.
import rawIndex from "@/generated/docs-index.json";
import rawKnowledge from "@/generated/knowledge-index.json";

export interface CodeBlock {
  language: string;
  code: string;
  heading?: string;
}

export interface DocPage {
  slug: string;
  title: string;
  section: string;
  sectionPosition: number;
  position: number;
  description?: string;
  url: string;
  headings: string[];
  tags: string[];
  body: string;
  codeBlocks: CodeBlock[];
  readingTime: number;
  related: string[];
}

export interface Concept {
  aliases: string[];
  pages: string[];
  keywords: string[];
}

export interface IndexMeta {
  version: string;
  generatedAt: string;
  docCount: number;
  conceptCount: number;
}

export interface PageSummary {
  title: string;
  slug: string;
  url: string;
  section: string;
  description?: string;
}

export interface NavSection {
  section: string;
  pages: PageSummary[];
}

const index = rawIndex as unknown as { meta: IndexMeta; pages: DocPage[] };

export const meta: IndexMeta = index.meta;
export const pages: DocPage[] = index.pages;
export const concepts = rawKnowledge as unknown as Record<string, Concept>;

const bySlug = new Map(pages.map((p) => [p.slug, p]));

function normalizeSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "")
    .replace(/^docs\//, "");
}

export function getPage(slug: string): DocPage | undefined {
  return bySlug.get(normalizeSlug(slug));
}

export function pageSummary(p: DocPage): PageSummary {
  const s: PageSummary = { title: p.title, slug: p.slug, url: p.url, section: p.section };
  if (p.description) s.description = p.description;
  return s;
}

function tokens(s: string): Set<string> {
  return new Set(s.toLowerCase().match(/[a-z0-9]+/g) ?? []);
}

// Similarity for "did you mean" — token overlap plus substring/prefix affinity.
function similarity(a: string, b: string): number {
  const ta = tokens(a);
  const tb = tokens(b);
  let score = 0;
  for (const t of ta) {
    if (tb.has(t)) { score += 2; continue; }
    for (const u of tb) {
      if (u.includes(t) || t.includes(u)) { score += 1; break; }
      let prefix = 0;
      while (prefix < Math.min(t.length, u.length) && t[prefix] === u[prefix]) prefix++;
      if (prefix >= 4) { score += 1; break; }
    }
  }
  return score;
}

export function closestSlugs(input: string, n = 3): string[] {
  return pages
    .map((p) => ({ slug: p.slug, s: similarity(input, `${p.slug} ${p.title}`) }))
    .sort((a, b) => b.s - a.s || a.slug.localeCompare(b.slug))
    .slice(0, n)
    .filter((x) => x.s > 0)
    .map((x) => x.slug);
}

export function resolveConcept(
  input: string,
): { name: string; concept: Concept } | undefined {
  const q = input.trim().toLowerCase();
  if (!q) return undefined;
  for (const [name, concept] of Object.entries(concepts)) {
    const candidates = [name, ...concept.aliases].map((c) => c.toLowerCase());
    if (candidates.some((c) => c === q || c === `${q}s` || `${c}s` === q)) {
      return { name, concept };
    }
  }
  return undefined;
}

export function closestConcepts(input: string, n = 3): string[] {
  return Object.entries(concepts)
    .map(([name, c]) => ({
      name,
      s: similarity(input, [name, ...c.aliases].join(" ")),
    }))
    .sort((a, b) => b.s - a.s || a.name.localeCompare(b.name))
    .slice(0, n)
    .filter((x) => x.s > 0)
    .map((x) => x.name);
}

export function navigation(): NavSection[] {
  const ordered: NavSection[] = [];
  const byLabel = new Map<string, NavSection>();
  // `pages` is already sorted by sectionPosition then position at build time.
  for (const p of pages) {
    let section = byLabel.get(p.section);
    if (!section) {
      section = { section: p.section, pages: [] };
      byLabel.set(p.section, section);
      ordered.push(section);
    }
    section.pages.push(pageSummary(p));
  }
  return ordered;
}
