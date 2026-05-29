import fs from "node:fs";
import path from "node:path";

export interface DocNavItem {
  slug: string;
  title: string;
  group: "Introduction" | "Architecture" | "Pipeline" | "Market";
  order: number;
}

export interface DocPageData extends DocNavItem {
  content: string;
  description: string;
  headings: Array<{ id: string; text: string; depth: number }>;
}

export interface DocSearchItem {
  slug: string;
  title: string;
  description: string;
  content: string;
  order: number;
}

const DOCS_DIR = path.resolve(process.cwd(), "../../docs/site");

const GROUPS: Array<DocNavItem["group"]> = [
  "Introduction",
  "Architecture",
  "Pipeline",
  "Market",
];

function groupFor(order: number): DocNavItem["group"] {
  if (order === 1) return "Introduction";
  if (order >= 2 && order <= 6) return "Architecture";
  if (order >= 7 && order <= 8) return "Pipeline";
  return "Market";
}

export function slugifyDocFile(fileName: string) {
  return fileName.replace(/^\d+-/, "").replace(/\.md$/, "");
}

export function slugifyHeading(value: string) {
  return value
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function readDocFile(fileName: string): DocPageData {
  const content = fs.readFileSync(path.join(DOCS_DIR, fileName), "utf8");
  const order = Number(fileName.match(/^(\d+)/)?.[1] ?? 99);
  const slug = slugifyDocFile(fileName);
  const title = content.match(/^#\s+(.+)$/m)?.[1] ?? slug;
  const description =
    content
      .match(/^>\s+(.+)$/m)?.[1]
      ?.replace(/\s+/g, " ")
      .trim() ?? "Darknyx protocol documentation.";

  const headings = Array.from(content.matchAll(/^(#{2,3})\s+(.+)$/gm)).map((match) => ({
    id: slugifyHeading(match[2]),
    text: match[2].replace(/`/g, ""),
    depth: match[1].length,
  }));

  return {
    slug,
    title,
    group: groupFor(order),
    order,
    content,
    description,
    headings,
  };
}

export function getDocsNav() {
  const files = fs
    .readdirSync(DOCS_DIR)
    .filter(
      (file) =>
        /^\d+-.+\.md$/.test(file) &&
        !file.endsWith("glossary.md") &&
        !file.endsWith("roadmap-and-status.md"),
    )
    .sort();

  const items = files.map(readDocFile);

  return GROUPS.map((group) => ({
    group,
    items: items.filter((item) => item.group === group),
  }));
}

export function getAllDocs() {
  return getDocsNav().flatMap((section) => section.items);
}

export function getDocBySlug(slug: string) {
  const doc = getAllDocs().find((item) => item.slug === slug);
  if (!doc) return null;

  const fileName = `${String(doc.order).padStart(2, "0")}-${doc.slug}.md`;
  return readDocFile(fileName);
}

export function getFirstDoc() {
  return getAllDocs()[0];
}

export function getDocsSearchIndex(): DocSearchItem[] {
  return getAllDocs().map((doc) => ({
    slug: doc.slug,
    title: doc.title,
    description: doc.description,
    content: doc.content
      .replace(/^#.+$/gm, "")
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/[>*_`|#-]/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
    order: doc.order,
  }));
}
