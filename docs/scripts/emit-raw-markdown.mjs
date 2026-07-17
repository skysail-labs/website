#!/usr/bin/env node
// Emits a raw-markdown copy of every published doc into static/, so each page
// is served same-origin at /docs/<slug>.md. Powers the per-page "Copy page" /
// "View as Markdown" dropdown (and gives agents a clean plain-text source).
//
// Purely additive: reads apps/docs/docs/** and writes apps/docs/static/**/*.md.
// It never mutates the source docs or the build output. Slug/exclude logic
// mirrors apps/demo/scripts/build-docs-index.mjs so the .md paths line up with
// each page's permalink.
import {
  readdirSync, readFileSync, mkdirSync, writeFileSync, existsSync, statSync, rmSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = join(__dirname, "..", "docs");
const CONFIG_FILE = join(__dirname, "..", "docusaurus.config.ts");
const OUT_DIR = join(__dirname, "..", "static");
// Generated files are dropped here so a stale run can be cleaned deterministically.
const MANIFEST = join(OUT_DIR, ".raw-markdown-manifest.json");

function stripOrderPrefix(name) {
  return name.replace(/^\d+-/, "");
}

function toSlugPart(fileName) {
  return stripOrderPrefix(fileName.replace(/\.mdx?$/, ""));
}

// Strip the leading YAML frontmatter fence; keep the body verbatim (including
// `# H1` and `:::info`/`:::warning` admonitions — faithful source for LLMs).
function stripFrontmatter(raw) {
  const m = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return (m ? raw.slice(m[0].length) : raw).replace(/^\s*\n/, "");
}

// Directories the Docusaurus config excludes from publishing (no routes).
function readExcludedDirs() {
  if (!existsSync(CONFIG_FILE)) return [];
  const src = readFileSync(CONFIG_FILE, "utf8");
  const m = src.match(/exclude:\s*\[([^\]]*)\]/);
  if (!m) return [];
  return [...m[1].matchAll(/["']([^"']+)["']/g)].map((x) => x[1].split("/")[0]);
}

if (!existsSync(DOCS_DIR)) {
  console.warn(`emit-raw-markdown: docs source not found at ${DOCS_DIR}; skipping`);
  process.exit(0);
}

// Remove files written by a previous run (keeps static/ clean when a page is
// renamed or deleted). Only touches paths we recorded in the manifest.
if (existsSync(MANIFEST)) {
  try {
    const prev = JSON.parse(readFileSync(MANIFEST, "utf8"));
    for (const rel of prev.files ?? []) {
      const p = join(OUT_DIR, rel);
      if (existsSync(p)) rmSync(p);
    }
  } catch {
    /* corrupt manifest — ignore and overwrite */
  }
}

const excludedDirs = readExcludedDirs();
const sections = readdirSync(DOCS_DIR)
  .filter((name) => statSync(join(DOCS_DIR, name)).isDirectory())
  .sort();

const written = [];

for (const dir of sections) {
  // Unpublished: underscore convention or config-excluded — no routes exist.
  if (dir.startsWith("_") || excludedDirs.includes(dir)) continue;
  const dirPath = join(DOCS_DIR, dir);
  const files = readdirSync(dirPath).filter((f) => /\.mdx?$/.test(f));
  for (const file of files) {
    const slug = `${dir}/${toSlugPart(file)}`;
    const body = stripFrontmatter(readFileSync(join(dirPath, file), "utf8")).trimEnd();
    const outRel = `${slug}.md`;
    const outPath = join(OUT_DIR, outRel);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, `${body}\n`);
    written.push(outRel);
  }
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(MANIFEST, JSON.stringify({ files: written.sort() }, null, 2));
console.log(`emit-raw-markdown: wrote ${written.length} .md files → static/`);
