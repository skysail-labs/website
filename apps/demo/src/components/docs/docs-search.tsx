"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { DocSearchItem } from "@/lib/docs";

function excerpt(content: string, query: string) {
  const normalized = content.replace(/\s+/g, " ");
  const index = normalized.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return normalized.slice(0, 150);
  return normalized.slice(Math.max(0, index - 60), index + 140);
}

export function DocsSearch({ items }: { items: DocSearchItem[] }) {
  const [query, setQuery] = useState("");
  const trimmed = query.trim();

  const results = useMemo(() => {
    if (trimmed.length < 2) return [];
    const needle = trimmed.toLowerCase();

    return items
      .map((item) => {
        const haystack = `${item.title} ${item.description} ${item.content}`.toLowerCase();
        const titleHit = item.title.toLowerCase().includes(needle);
        const bodyHit = haystack.includes(needle);
        return bodyHit ? { item, score: titleHit ? 2 : 1 } : null;
      })
      .filter((result): result is { item: DocSearchItem; score: number } => Boolean(result))
      .sort((a, b) => b.score - a.score || a.item.order - b.item.order)
      .slice(0, 8);
  }, [items, trimmed]);

  return (
    <div className="relative">
      <label htmlFor="docs-search" className="sr-only">
        Search documentation
      </label>
      <input
        id="docs-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search docs..."
        className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-950 shadow-sm outline-none transition placeholder:text-stone-400 focus-visible:border-[var(--nyx-accent)] focus-visible:ring-2 focus-visible:ring-[oklch(0.62_0.14_260_/_0.18)]"
      />
      {trimmed.length >= 2 ? (
        <div className="absolute left-0 right-0 top-12 z-20 max-h-96 overflow-auto rounded-xl border border-stone-200 bg-white p-2 shadow-lg">
          {results.length ? (
            <div className="space-y-1">
              {results.map(({ item }) => (
                <Link
                  key={item.slug}
                  href={`/docs/${item.slug}`}
                  className="block rounded-md px-3 py-2 transition hover:bg-stone-50 focus-visible:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.62_0.14_260_/_0.22)]"
                >
                  <div className="text-sm font-medium text-stone-950">{item.title}</div>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-stone-600">
                    {excerpt(item.content, trimmed)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-3 py-4 text-sm text-stone-500">No docs match that search.</div>
          )}
        </div>
      ) : null}
    </div>
  );
}

