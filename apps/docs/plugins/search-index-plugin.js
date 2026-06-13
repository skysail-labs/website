const fs = require("fs");
const path = require("path");

function extractText(content) {
  return content
    .replace(/^---[\s\S]*?---/, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/#+\s/g, "")
    .replace(/\*\*|__|\*|_|~~|`/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/:::[\w]*/g, "")
    .replace(/import\s+.*from\s+['"].*['"]/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\|[^\n]+\|/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractTitle(content, filePath) {
  const frontmatterMatch = content.match(/^---[\s\S]*?title:\s*(.+?)[\n\r]/);
  if (frontmatterMatch) return frontmatterMatch[1].trim().replace(/['"]/g, "");
  const h1Match = content.match(/^#\s+(.+)/m);
  if (h1Match) return h1Match[1].trim();
  return path.basename(filePath, path.extname(filePath)).replace(/-/g, " ");
}

function extractSections(content) {
  const sections = [];
  const h2Regex = /^##\s+(.+)/gm;
  let match;
  while ((match = h2Regex.exec(content)) !== null) {
    sections.push(match[1].trim());
  }
  return sections;
}

function filePathToRoute(filePath, docsDir) {
  const rel = path.relative(docsDir, filePath);
  const noExt = rel.replace(/\.(md|mdx)$/, "");
  const parts = noExt.split(path.sep).map((p) => p.replace(/^\d+-/, ""));
  return "/docs/" + parts.join("/");
}

module.exports = function searchIndexPlugin(context) {
  return {
    name: "nyx-search-index",
    async loadContent() {
      const docsDir = path.join(context.siteDir, "docs");
      const files = [];

      function walk(dir) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) walk(full);
          else if (/\.(md|mdx)$/.test(entry.name)) files.push(full);
        }
      }
      walk(docsDir);

      const index = files.map((file, i) => {
        const content = fs.readFileSync(file, "utf8");
        return {
          id: i,
          title: extractTitle(content, file),
          text: extractText(content).slice(0, 2000),
          sections: extractSections(content).join(" "),
          url: filePathToRoute(file, docsDir),
        };
      });

      return index;
    },
    async contentLoaded({ content, actions }) {
      const { createData } = actions;
      await createData("search-index.json", JSON.stringify(content));
    },
  };
};