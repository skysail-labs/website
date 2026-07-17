import React, {useCallback, useEffect, useRef, useState} from "react";
import {useDoc} from "@docusaurus/plugin-content-docs/client";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import clsx from "clsx";

import {
  CheckIcon,
  ChevronIcon,
  CopyIcon,
  ExternalIcon,
  MarkdownIcon,
} from "./icons";
import OpenAIIcon from "./brand/openai.svg";
import ClaudeIcon from "./brand/claude.svg";
import CursorIcon from "./brand/cursor.svg";
import McpIcon from "./brand/mcp.svg";
import styles from "./styles.module.css";

// The hosted docs MCP server (lives on the demo app at the apex domain, same
// origin as these docs). Kept as a constant so the value — and the Cursor
// deep-link config derived from it below — stay in sync and SSR-stable.
const MCP_URL = "https://darknyx.trade/api/mcp";
// btoa(JSON.stringify({ url: MCP_URL })) — precomputed so the href is identical
// on server and client (no hydration mismatch, no window.btoa at render).
const CURSOR_CONFIG_B64 = "eyJ1cmwiOiJodHRwczovL2RhcmtueXgudHJhZGUvYXBpL21jcCJ9";

async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    return true;
  } catch {
    return false;
  }
}

type LinkItem = {
  kind: "link";
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon: React.ReactNode;
};
type ActionItem = {
  kind: "action";
  id: string;
  title: string;
  subtitle: string;
  onSelect: () => void | Promise<void>;
  icon: React.ReactNode;
};
type MenuItem = LinkItem | ActionItem;

export default function CopyPageMenu(): React.ReactElement {
  const {metadata} = useDoc();
  const {siteConfig} = useDocusaurusContext();

  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Absolute URLs for the current page and its raw-markdown twin (served at
  // /docs/<slug>.md by scripts/emit-raw-markdown.mjs).
  const path = metadata.permalink.replace(/\/$/, "");
  const pageUrl = `${siteConfig.url}${path}`;
  const mdUrl = `${pageUrl}.md`;
  const askPrompt = `Read ${mdUrl} so I can ask questions about the "${metadata.title}" page of the Darknyx docs.`;
  const enc = encodeURIComponent(askPrompt);

  const flashCopied = useCallback((id: string) => {
    setCopied(id);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(null), 1600);
  }, []);

  const copyPage = useCallback(async () => {
    let md = "";
    try {
      const res = await fetch(mdUrl);
      if (res.ok) md = await res.text();
    } catch {
      /* fall back to a link + title below */
    }
    const ok = await copyText(md || `# ${metadata.title}\n${pageUrl}`);
    if (ok) flashCopied("page");
  }, [mdUrl, pageUrl, metadata.title, flashCopied]);

  const copyMcp = useCallback(async () => {
    if (await copyText(MCP_URL)) flashCopied("mcp");
  }, [flashCopied]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(
    () => () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    },
    [],
  );

  const items: MenuItem[] = [
    {
      kind: "action",
      id: "page",
      title: "Copy page",
      subtitle: "Copy page as Markdown for LLMs",
      onSelect: copyPage,
      icon: <CopyIcon />,
    },
    {
      kind: "link",
      id: "markdown",
      title: "View as Markdown",
      subtitle: "View this page as plain text",
      href: mdUrl,
      icon: <MarkdownIcon />,
    },
    {
      kind: "link",
      id: "chatgpt",
      title: "Open in ChatGPT",
      subtitle: "Ask questions about this page",
      href: `https://chatgpt.com/?hints=search&q=${enc}`,
      icon: <OpenAIIcon className={styles.brandIcon} />,
    },
    {
      kind: "link",
      id: "claude",
      title: "Open in Claude",
      subtitle: "Ask questions about this page",
      href: `https://claude.ai/new?q=${enc}`,
      icon: <ClaudeIcon className={styles.brandIcon} />,
    },
    {
      kind: "link",
      id: "cursor",
      title: "Connect to Cursor",
      subtitle: "Install MCP Server on Cursor",
      href: `cursor://anysphere.cursor-deeplink/mcp/install?name=darknyx-docs&config=${CURSOR_CONFIG_B64}`,
      icon: <CursorIcon className={styles.brandIcon} />,
    },
    {
      kind: "action",
      id: "mcp",
      title: "Copy MCP Server",
      subtitle: "Copy MCP Server URL to clipboard",
      onSelect: copyMcp,
      icon: <McpIcon className={styles.brandIcon} />,
    },
  ];

  const externalIds = new Set(["markdown", "chatgpt", "claude", "cursor"]);

  return (
    <div className={styles.wrap}>
      <div className={clsx(styles.root, open && styles.rootOpen)} ref={rootRef}>
        <div className={styles.split}>
          <button
            type="button"
            className={styles.primary}
            onClick={copyPage}
            title="Copy this page as Markdown"
          >
            {copied === "page" ? <CheckIcon /> : <CopyIcon />}
            <span>{copied === "page" ? "Copied" : "Copy page"}</span>
          </button>
          <button
            type="button"
            className={styles.toggle}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label="Open page actions"
            onClick={() => setOpen((v) => !v)}
          >
            <ChevronIcon className={clsx(styles.chevron, open && styles.chevronOpen)} />
          </button>
        </div>

        {open && (
          <div className={styles.menu} role="menu">
            {items.map((item) => {
              const isExternal = externalIds.has(item.id);
              const inner = (
                <>
                  <span className={styles.itemIcon}>
                    {copied === item.id ? <CheckIcon /> : item.icon}
                  </span>
                  <span className={styles.itemText}>
                    <span className={styles.itemTitle}>
                      {item.title}
                      {isExternal && <ExternalIcon className={styles.extIcon} />}
                    </span>
                    <span className={styles.itemSub}>
                      {copied === item.id ? "Copied to clipboard" : item.subtitle}
                    </span>
                  </span>
                </>
              );
              if (item.kind === "link") {
                return (
                  <a
                    key={item.id}
                    className={styles.item}
                    role="menuitem"
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                  >
                    {inner}
                  </a>
                );
              }
              return (
                <button
                  key={item.id}
                  type="button"
                  className={styles.item}
                  role="menuitem"
                  onClick={() => {
                    void item.onSelect();
                  }}
                >
                  {inner}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
