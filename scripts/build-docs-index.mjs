#!/usr/bin/env node
// Build-time docs indexer. Scans docs/docs/** and emits
// src/generated/{docs-index,knowledge-index}.json. Deterministic; no LLM.
import {
  readdirSync, readFileSync, mkdirSync, writeFileSync, existsSync, statSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = join(__dirname, "..", "docs", "docs");
const CONFIG_FILE = join(__dirname, "..", "docs", "docusaurus.config.ts");
const OUT_DIR = join(__dirname, "..", "src", "generated");
const BASE_URL = "https://darknyx.trade/docs";
const INDEX_VERSION = "1.0";

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "with", "how",
  "it", "is", "are", "was", "what", "why", "when", "your", "our", "this",
  "that", "from", "into", "via", "as", "by", "you", "not", "its", "at", "be",
]);

// Hand-maintained synonyms attached to matching concepts (case-insensitive).
const STATIC_ALIASES = {
  TEE: ["Trusted Execution Environment", "Intel TDX", "TDX", "Confidential VM", "CVM", "enclave"],
  Groth16: ["Groth proof", "proof system", "zero-knowledge proof", "zk proof", "zkp"],
  Settlement: ["settlement pipeline", "on-chain settlement"],
  Nullifier: ["nullifiers"],
};

function fail(msg) {
  console.error(`build-docs-index: ${msg}`);
  process.exit(1);
}

function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { attrs: {}, body: raw };
  const attrs = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (kv) attrs[kv[1]] = kv[2].replace(/^["']|["']$/g, "").trim();
  }
  return { attrs, body: raw.slice(m[0].length) };
}

// Strip markdown decorations from heading/inline text.
function cleanText(s) {
  return s
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[`*_]/g, "")
    .trim();
}

// Remove Docusaurus admonition fences (:::info ... :::) but keep their content.
function cleanBody(body) {
  return body
    .split("\n")
    .filter((line) => !/^\s*:{3,}/.test(line))
    .join("\n")
    .trim();
}

function extractHeadings(body) {
  const out = [];
  let inFence = false;
  for (const line of body.split("\n")) {
    if (/^```/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;
    const h = line.match(/^#{2,3}\s+(.*)/);
    if (h) out.push(cleanText(h[1]));
  }
  return out;
}

function extractCodeBlocks(body) {
  const blocks = [];
  let heading;
  let inFence = false;
  let lang = "";
  let buf = [];
  for (const line of body.split("\n")) {
    const fence = line.match(/^```(\S*)/);
    if (fence) {
      if (!inFence) {
        inFence = true;
        lang = fence[1] || "text";
        buf = [];
      } else {
        inFence = false;
        const block = { language: lang, code: buf.join("\n") };
        if (heading) block.heading = heading;
        blocks.push(block);
      }
      continue;
    }
    if (inFence) { buf.push(line); continue; }
    const h = line.match(/^#{2,3}\s+(.*)/);
    if (h) heading = cleanText(h[1]);
  }
  return blocks;
}

function stripOrderPrefix(name) {
  return name.replace(/^\d+-/, "");
}

function toSlugPart(fileName) {
  return stripOrderPrefix(fileName.replace(/\.mdx?$/, ""));
}

function deriveTags(title, headings) {
  const words = `${title} ${headings.join(" ")}`
    .toLowerCase()
    .match(/[a-z0-9][a-z0-9_-]{2,}/g) ?? [];
  return [...new Set(words.filter((w) => !STOPWORDS.has(w)))].slice(0, 12);
}

// Resolve a markdown link href to a canonical slug, or null if external/anchor.
function resolveLink(href, currentSection) {
  let h = href.split("#")[0].trim();
  if (!h) return null;
  if (/https?:\/\//.test(h)) {
    const m = h.match(/darknyx\.(?:xyz|trade)\/docs\/(.+)/);
    if (!m) return null;
    h = m[1];
  } else if (h.startsWith("/docs/")) h = h.slice("/docs/".length);
  else if (h.startsWith("/")) h = h.slice(1);
  else if (h.startsWith("./")) h = `${currentSection}/${h.slice(2)}`;
  else if (h.startsWith("../")) h = h.slice(3);
  else h = `${currentSection}/${h}`;
  h = h.replace(/\/$/, "").replace(/\.mdx?$/, "");
  return h.split("/").map(stripOrderPrefix).join("/");
}

function extractLinks(body, currentSection) {
  const out = [];
  for (const m of body.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const slug = resolveLink(m[1], currentSection);
    if (slug) out.push(slug);
  }
  return out;
}

function countOccurrences(haystack, needle) {
  if (!needle) return 0;
  let count = 0;
  let i = haystack.indexOf(needle);
  while (i !== -1) { count += 1; i = haystack.indexOf(needle, i + needle.length); }
  return count;
}

// Directories the Docusaurus config excludes from publishing (no routes),
// e.g. exclude: ["reference-data/**", "reference/**"].
function readExcludedDirs() {
  if (!existsSync(CONFIG_FILE)) return [];
  const src = readFileSync(CONFIG_FILE, "utf8");
  const m = src.match(/exclude:\s*\[([^\]]*)\]/);
  if (!m) return [];
  return [...m[1].matchAll(/["']([^"']+)["']/g)].map((x) => x[1].split("/")[0]);
}

// ---- scan pages ----
// If the docs source isn't in the build environment (e.g. Vercel root directory
// set to apps/demo without outside-root files), keep the committed index
// rather than failing the deploy. Fail only when there is no index at all.
if (!existsSync(DOCS_DIR)) {
  if (existsSync(join(OUT_DIR, "docs-index.json")) && existsSync(join(OUT_DIR, "knowledge-index.json"))) {
    console.warn(`build-docs-index: docs source not found at ${DOCS_DIR}; keeping previously generated index`);
    process.exit(0);
  }
  fail(`docs source not found: ${DOCS_DIR}`);
}

const sections = readdirSync(DOCS_DIR)
  .filter((name) => statSync(join(DOCS_DIR, name)).isDirectory())
  .sort();
const excludedDirs = readExcludedDirs();

const pages = [];
const linksByPage = new Map(); // slug -> raw link slugs

for (const dir of sections) {
  // Unpublished: underscore convention or config-excluded — no routes exist.
  if (dir.startsWith("_") || excludedDirs.includes(dir)) continue;
  const dirPath = join(DOCS_DIR, dir);
  const categoryPath = join(dirPath, "_category_.json");
  let sectionLabel = dir.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  let sectionPosition = 999;
  if (existsSync(categoryPath)) {
    const cat = JSON.parse(readFileSync(categoryPath, "utf8"));
    if (cat.label) sectionLabel = cat.label;
    if (typeof cat.position === "number") sectionPosition = cat.position;
  }
  const files = readdirSync(dirPath).filter((f) => /\.mdx?$/.test(f)).sort();
  for (const file of files) {
    const raw = readFileSync(join(dirPath, file), "utf8");
    const { attrs, body: rawBody } = parseFrontmatter(raw);
    const body = cleanBody(rawBody);
    const firstH1 = body.match(/^#\s+(.*)$/m);
    const title = attrs.title || (firstH1 && cleanText(firstH1[1]));
    if (!title) fail(`no title (frontmatter or H1) in ${dir}/${file}`);
    const slug = `${dir}/${toSlugPart(file)}`;
    const headings = extractHeadings(body);
    const words = body.match(/\S+/g)?.length ?? 0;
    const page = {
      slug,
      title,
      section: sectionLabel,
      sectionPosition,
      position: Number(attrs.sidebar_position) || 999,
      url: `${BASE_URL}/${slug}`,
      headings,
      tags: deriveTags(title, headings),
      body,
      codeBlocks: extractCodeBlocks(body),
      readingTime: Math.max(1, Math.round(words / 200)),
      related: [],
    };
    if (attrs.description) page.description = attrs.description;
    pages.push(page);
    linksByPage.set(slug, extractLinks(body, dir));
  }
}

if (pages.length === 0) fail("no documentation pages found");
pages.sort((a, b) => a.sectionPosition - b.sectionPosition || a.position - b.position);
const slugSet = new Set(pages.map((p) => p.slug));

// ---- knowledge index (glossary + page titles) ----
// The glossary seeds the concept index even when its section is unpublished.
function findGlossaryFile() {
  for (const dir of sections) {
    for (const f of readdirSync(join(DOCS_DIR, dir))) {
      if (/glossary\.mdx?$/i.test(f)) return join(DOCS_DIR, dir, f);
    }
  }
  return null;
}

function parseGlossary() {
  const glossaryFile = findGlossaryFile();
  if (!glossaryFile) {
    console.warn("build-docs-index: glossary not found, knowledge index will be title-only");
    return [];
  }
  const { body } = parseFrontmatter(readFileSync(glossaryFile, "utf8"));
  const entries = [];
  for (const part of cleanBody(body).split(/^###\s+/m).slice(1)) {
    const headingLine = cleanText(part.split("\n")[0]);
    if (!headingLine) continue;
    let name = headingLine;
    const aliases = [];
    const paren = name.match(/^(.*?)\s*\((.*?)\)\s*$/);
    if (paren) { name = paren[1].trim(); aliases.push(paren[2].trim()); }
    const variants = name.split("/").map((s) => s.trim()).filter(Boolean);
    if (variants.length > 1) { name = variants[0]; aliases.push(...variants.slice(1)); }
    entries.push({ name, aliases });
  }
  return entries;
}

function conceptPages(terms) {
  const lower = terms.map((t) => t.toLowerCase()).filter(Boolean);
  return pages
    .map((p) => {
      let score = 0;
      const title = p.title.toLowerCase();
      const heads = p.headings.join("\n").toLowerCase();
      const body = p.body.toLowerCase();
      for (const t of lower) {
        score += countOccurrences(title, t) * 5;
        score += countOccurrences(heads, t) * 3;
        score += Math.min(countOccurrences(body, t), 10);
      }
      return { slug: p.slug, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug))
    .slice(0, 6)
    .map((s) => s.slug);
}

const knowledge = {};
const glossaryEntries = parseGlossary();

for (const entry of glossaryEntries) {
  const staticKey = Object.keys(STATIC_ALIASES)
    .find((k) => k.toLowerCase() === entry.name.toLowerCase());
  const aliases = [...new Set([
    ...entry.aliases,
    ...(staticKey ? STATIC_ALIASES[staticKey] : []),
  ].filter((a) => a.toLowerCase() !== entry.name.toLowerCase()))];
  const mapped = conceptPages([entry.name, ...aliases]);
  knowledge[entry.name] = { aliases, pages: mapped, keywords: [] };
}
// Static aliases whose concept isn't in the glossary become concepts too.
for (const [name, aliases] of Object.entries(STATIC_ALIASES)) {
  if (Object.keys(knowledge).some((k) => k.toLowerCase() === name.toLowerCase())) continue;
  knowledge[name] = { aliases, pages: conceptPages([name, ...aliases]), keywords: [] };
}
// Page titles as concepts (skip ones colliding with glossary concepts).
for (const p of pages) {
  if (Object.keys(knowledge).some((k) => k.toLowerCase() === p.title.toLowerCase())) continue;
  knowledge[p.title] = {
    aliases: [],
    pages: [p.slug, ...conceptPages([p.title]).filter((s) => s !== p.slug).slice(0, 4)],
    keywords: p.tags.slice(0, 6),
  };
}
// Keywords for glossary concepts: co-occurring concept names in their pages.
const conceptNames = Object.keys(knowledge);
for (const [name, c] of Object.entries(knowledge)) {
  if (c.keywords.length > 0) continue;
  const texts = c.pages
    .map((slug) => pages.find((p) => p.slug === slug))
    .filter(Boolean)
    .map((p) => `${p.title}\n${p.headings.join("\n")}`.toLowerCase());
  c.keywords = conceptNames
    .filter((other) => other !== name &&
      texts.some((t) => t.includes(other.toLowerCase())))
    .slice(0, 8);
}

// ---- related pages: links (x3), shared concepts (x1), section adjacency (x1) ----
const conceptsBySlug = new Map();
for (const [name, c] of Object.entries(knowledge)) {
  for (const slug of c.pages) {
    if (!conceptsBySlug.has(slug)) conceptsBySlug.set(slug, new Set());
    conceptsBySlug.get(slug).add(name);
  }
}
for (const page of pages) {
  const scores = new Map();
  const bump = (slug, n) => {
    if (slug === page.slug || !slugSet.has(slug)) return;
    scores.set(slug, (scores.get(slug) ?? 0) + n);
  };
  for (const target of linksByPage.get(page.slug) ?? []) bump(target, 3);
  for (const [other, targets] of linksByPage) {
    if (targets.includes(page.slug)) bump(other, 3);
  }
  const myConcepts = conceptsBySlug.get(page.slug) ?? new Set();
  for (const other of pages) {
    if (other.slug === page.slug) continue;
    const otherConcepts = conceptsBySlug.get(other.slug) ?? new Set();
    for (const c of myConcepts) if (otherConcepts.has(c)) bump(other.slug, 1);
    if (other.section === page.section &&
        Math.abs(other.position - page.position) === 1) bump(other.slug, 1);
  }
  page.related = [...scores.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([slug]) => slug);
}

// ---- write ----
const meta = {
  version: INDEX_VERSION,
  generatedAt: new Date().toISOString(),
  docCount: pages.length,
  conceptCount: Object.keys(knowledge).length,
};
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, "docs-index.json"), JSON.stringify({ meta, pages }, null, 2));
writeFileSync(join(OUT_DIR, "knowledge-index.json"), JSON.stringify(knowledge, null, 2));
console.log(`build-docs-index: ${pages.length} pages, ${meta.conceptCount} concepts → src/generated/`);
