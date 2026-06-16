import Link from "next/link";
import type { ReactNode } from "react";

import { slugifyHeading } from "@/lib/docs";
import { MermaidBlock } from "@/components/docs/mermaid-block";
import { SyntaxCodeBlock } from "@/components/docs/syntax-code-block";

type Block =
  | { type: "heading"; depth: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string }
  | { type: "code"; lang: string; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "table"; rows: string[][] }
  | { type: "hr" };

function isDiagram(text: string, lang: string) {
  if (!["text", "txt"].includes(lang.toLowerCase())) return false;
  return /[┌┐└┘├┤│─╭╮╰╯▼▲◄►→←↔]|\s--?>\s|=>|\+\-+\+/.test(text);
}

function pipelineParts(text: string) {
  const compact = text.trim();
  if (!compact.includes("→") && !compact.includes("->")) return null;
  if (compact.includes("\n") && compact.split(/\r?\n/).length > 3) return null;
  return compact
    .split(/(?:→|->)/)
    .map((part) => part.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);
}

function boxGroups(text: string) {
  const lines = text.split(/\r?\n/);
  const groups: string[][] = [];
  let current: string[] = [];
  let inBox = false;

  for (const line of lines) {
    if (/[┌╭]\S*[┐╮]/.test(line)) {
      inBox = true;
      current = [];
      continue;
    }

    if (/[└╰]\S*[┘╯]/.test(line)) {
      if (current.length) groups.push(current);
      inBox = false;
      current = [];
      continue;
    }

    if (inBox && line.includes("│")) {
      const cleaned = line
        .replace(/[│]/g, " ")
        .replace(/[┌┐└┘├┤─╭╮╰╯]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (cleaned) current.push(cleaned);
    }
  }

  return groups.filter((group) => group.some(Boolean));
}

function treeItems(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => {
      const match = line.match(/^(\s*[│ ]*)(?:├──|└──|[-*])\s*(.+)$/);
      if (!match) return null;
      const depth = Math.floor(match[1].replace(/│/g, " ").length / 4);
      return { depth, text: match[2].trim() };
    })
    .filter((item): item is { depth: number; text: string } => Boolean(item));
}

function DiagramBlock({ text }: { text: string }) {
  const pipeline = pipelineParts(text);
  if (pipeline && pipeline.length > 1) {
    return (
      <div className="nyx-doc-diagram nyx-doc-pipeline">
        {pipeline.map((part, index) => (
          <div key={`${part}-${index}`} className="contents">
            <div className="nyx-doc-pipeline-chip">{part}</div>
            {index < pipeline.length - 1 ? <div className="nyx-doc-pipeline-arrow">→</div> : null}
          </div>
        ))}
      </div>
    );
  }

  const boxes = boxGroups(text);
  if (boxes.length > 1) {
    return (
      <div className="nyx-doc-diagram">
        {boxes.map((box, index) => (
          <div key={`${box.join("-")}-${index}`} className="nyx-doc-flow-row">
            <div className="nyx-doc-flow-card">
              <div className="nyx-doc-flow-title">{box[0]}</div>
              {box.slice(1).map((line) => (
                <div key={line} className="nyx-doc-flow-line">
                  {line}
                </div>
              ))}
            </div>
            {index < boxes.length - 1 ? <div className="nyx-doc-flow-arrow">↓</div> : null}
          </div>
        ))}
      </div>
    );
  }

  const tree = treeItems(text);
  if (tree.length > 2) {
    return (
      <div className="nyx-doc-diagram nyx-doc-tree">
        {tree.map((item, index) => (
          <div key={`${item.text}-${index}`} className="nyx-doc-tree-row" style={{ marginLeft: item.depth * 18 }}>
            <span className="nyx-doc-tree-dot" aria-hidden />
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="nyx-doc-diagram">
      <pre className="nyx-doc-diagram-fallback">
        <code>{text}</code>
      </pre>
    </div>
  );
}

function CodeBlock({ lang, text }: { lang: string; text: string }) {
  const normalizedLang = lang.toLowerCase();
  if (normalizedLang === "mermaid") return <MermaidBlock chart={text} />;
  if (isDiagram(text, lang)) return <DiagramBlock text={text} />;
  return <SyntaxCodeBlock lang={normalizedLang} text={text} />;
}

function parseBlocks(markdown: string): Block[] {
  const lines = markdown.split(/\r?\n/);
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    const codeStart = line.match(/^```(\w+)?/);
    if (codeStart) {
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) {
        code.push(lines[i]);
        i += 1;
      }
      blocks.push({ type: "code", lang: codeStart[1] ?? "text", text: code.join("\n") });
      i += 1;
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      blocks.push({ type: "heading", depth: heading[1].length, text: heading[2] });
      i += 1;
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      blocks.push({ type: "hr" });
      i += 1;
      continue;
    }

    if (line.startsWith(">")) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        quote.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      blocks.push({ type: "quote", text: quote.join(" ") });
      continue;
    }

    if (/^\|.+\|$/.test(line.trim())) {
      const rows: string[][] = [];
      while (i < lines.length && /^\|.+\|$/.test(lines[i].trim())) {
        if (!/^\|\s*-+/.test(lines[i])) {
          rows.push(
            lines[i]
              .trim()
              .replace(/^\||\|$/g, "")
              .split("|")
              .map((cell) => cell.trim()),
          );
        }
        i += 1;
      }
      blocks.push({ type: "table", rows });
      continue;
    }

    if (/^\s*(-|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items: string[] = [];
      while (i < lines.length && /^\s*(-|\d+\.)\s+/.test(lines[i])) {
        const itemParts = [lines[i].replace(/^\s*(-|\d+\.)\s+/, "").trim()];
        i += 1;

        while (
          i < lines.length &&
          lines[i].trim() &&
          /^\s{2,}\S/.test(lines[i]) &&
          !/^\s*(-|\d+\.)\s+/.test(lines[i])
        ) {
          itemParts.push(lines[i].trim());
          i += 1;
        }

        items.push(itemParts.join(" "));
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    if (/^\s{2,}\S/.test(line) && blocks.at(-1)?.type === "paragraph") {
      const previous = blocks.pop();
      const paragraph = [previous?.type === "paragraph" ? previous.text : "", line.trim()];
      i += 1;
      while (i < lines.length && lines[i].trim() && /^\s{2,}\S/.test(lines[i])) {
        paragraph.push(lines[i].trim());
        i += 1;
      }
      blocks.push({ type: "paragraph", text: paragraph.join(" ") });
      continue;
    }

    const paragraph: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^```/.test(lines[i]) &&
      !/^(#{1,3})\s+/.test(lines[i]) &&
      !/^---+$/.test(lines[i].trim()) &&
      !lines[i].startsWith(">") &&
      !/^\|.+\|$/.test(lines[i].trim()) &&
      !/^\s*(-|\d+\.)\s+/.test(lines[i])
    ) {
      paragraph.push(lines[i]);
      i += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
  }

  return blocks;
}

function docHref(href: string) {
  if (/^https?:\/\//.test(href)) return href;
  const cleaned = href.replace(/^\.\//, "").replace(/\.md(#.*)?$/, "");
  return `/docs/${cleaned.replace(/^\d+-/, "")}`;
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));

    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(<strong key={`${token}-${match.index}`}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      nodes.push(<code key={`${token}-${match.index}`}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("![")) {
      const img = token.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (img) {
        nodes.push(
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${img[2]}-${match.index}`}
            src={img[2]}
            alt={img[1]}
            className="my-6 max-w-full rounded-lg border border-stone-200/80 dark:border-white/10"
          />
        );
      }
    } else {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) {
        const href = docHref(link[2]);
        nodes.push(
          <Link key={`${href}-${match.index}`} href={href}>
            {link[1]}
          </Link>,
        );
      }
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

export function MarkdownRenderer({ content }: { content: string }) {
  const blocks = parseBlocks(content);

  return (
    <div className="nyx-doc-prose">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          if (block.depth === 1) return null;
          const id = slugifyHeading(block.text);
          const Heading = block.depth === 2 ? "h2" : "h3";
          return (
            <Heading key={`${id}-${index}`} id={id}>
              {renderInline(block.text)}
            </Heading>
          );
        }

        if (block.type === "paragraph") {
          const isImgOnly = /^!\[[^\]]*\]\([^)]+\)$/.test(block.text.trim());
          if (isImgOnly) {
            const imgMatch = block.text.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
            if (imgMatch) {
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={index}
                  src={imgMatch[2]}
                  alt={imgMatch[1]}
                  className="my-6 max-w-full rounded-lg border border-stone-200/80 dark:border-white/10 block mx-auto"
                />
              );
            }
          }
          return <p key={index}>{renderInline(block.text)}</p>;
        }

        if (block.type === "quote") {
          return <blockquote key={index}>{renderInline(block.text)}</blockquote>;
        }

        if (block.type === "code") {
          return <CodeBlock key={index} lang={block.lang} text={block.text} />;
        }

        if (block.type === "list") {
          const List = block.ordered ? "ol" : "ul";
          return (
            <List key={index}>
              {block.items.map((item) => (
                <li key={item}>{renderInline(item)}</li>
              ))}
            </List>
          );
        }

        if (block.type === "table") {
          const [head, ...body] = block.rows;
          return (
            <div key={index} className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    {head.map((cell) => (
                      <th key={cell}>{renderInline(cell)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {body.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={`${cell}-${cellIndex}`}>{renderInline(cell)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return <hr key={index} />;
      })}
    </div>
  );
}
