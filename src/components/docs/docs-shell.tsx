import Link from "next/link";

import { DocsSearch } from "@/components/docs/docs-search";
import { DocsThemeProvider } from "@/components/docs/docs-theme-provider";
import { MarkdownRenderer } from "@/components/docs/markdown-renderer";
import { NyxFooter } from "@/components/brand/nyx-footer";
import { NyxNav } from "@/components/brand/nyx-nav";
import type { DocPageData } from "@/lib/docs";
import { getAllDocs, getDocsNav, getDocsSearchIndex } from "@/lib/docs";

export function DocsShell({ doc }: { doc: DocPageData }) {
  const nav = getDocsNav();
  const searchItems = getDocsSearchIndex();
  const orderedDocs = getAllDocs();
  const activeDocIndex = orderedDocs.findIndex((item) => item.slug === doc.slug);
  const previousDoc = activeDocIndex > 0 ? orderedDocs[activeDocIndex - 1] : null;
  const nextDoc =
    activeDocIndex >= 0 && activeDocIndex < orderedDocs.length - 1
      ? orderedDocs[activeDocIndex + 1]
      : null;

  return (
    <DocsThemeProvider>
      <NyxNav tone="chalk" active="docs" launchHref="/dapp" />
      <main className="mx-auto w-full max-w-[1400px] px-4 pb-14 pt-6 sm:px-7 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)_230px]">
          <aside className="hidden lg:block">
            <div className="nyx-doc-sidebar">
              <div className="flex items-center justify-between gap-2">
                <Link href="/docs" className="nyx-doc-sidebar-title">
                  Darknyx Documentation
                </Link>
              </div>
              <p className="mt-1 text-xs leading-5 text-stone-500">
                Protocol architecture, trust assumptions, API, and integration notes.
              </p>
              <div className="mt-4">
                <DocsSearch items={searchItems} />
              </div>
              <nav className="mt-6 space-y-6">
                {nav.map((section) => (
                  <div key={section.group}>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500">
                      {section.group}
                    </div>
                    <div className="mt-2.5 space-y-1">
                      {section.items.map((item) => (
                        <Link
                          key={item.slug}
                          href={`/docs/${item.slug}`}
                          className={`nyx-doc-nav-link ${
                            item.slug === doc.slug ? "nyx-doc-nav-link-active" : ""
                          }`}
                        >
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          <article className="min-w-0">
            <div className="mb-4 rounded-xl border border-stone-200/80 bg-white/85 p-4 backdrop-blur-sm lg:hidden">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500">
                  Browse docs
                </div>
              </div>
              <div className="mt-3">
                <DocsSearch items={searchItems} />
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {orderedDocs.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/docs/${item.slug}`}
                    className={`nyx-doc-mobile-link ${
                      item.slug === doc.slug ? "nyx-doc-mobile-link-active" : ""
                    }`}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>

            <div className="nyx-doc-article-card">
              <header className="nyx-doc-article-header">
                <span className="nyx-doc-badge">{doc.group}</span>
                <h1 className="mt-4 text-3xl font-semibold leading-tight text-stone-950 sm:text-4xl">
                  {doc.title}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-8 text-stone-600">{doc.description}</p>
              </header>
              <MarkdownRenderer content={doc.content} />
              {previousDoc || nextDoc ? (
                <div className="mt-14 grid gap-3 border-t border-stone-200 pt-7 sm:grid-cols-2">
                  {previousDoc ? (
                    <Link href={`/docs/${previousDoc.slug}`} className="nyx-doc-pager-link">
                      <div className="text-xs uppercase tracking-[0.09em] text-stone-500">Previous</div>
                      <div className="mt-1.5 text-sm font-medium text-stone-900">{previousDoc.title}</div>
                    </Link>
                  ) : (
                    <div />
                  )}
                  {nextDoc ? (
                    <Link href={`/docs/${nextDoc.slug}`} className="nyx-doc-pager-link text-left sm:text-right">
                      <div className="text-xs uppercase tracking-[0.09em] text-stone-500">Next</div>
                      <div className="mt-1.5 text-sm font-medium text-stone-900">{nextDoc.title}</div>
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </div>
          </article>

          <aside className="hidden py-2 xl:block">
            <div className="nyx-doc-toc">
              <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500">
                On this page
              </div>
              {doc.headings.length ? (
                <nav className="mt-3 space-y-1.5">
                  {doc.headings.map((heading) => (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      className={`nyx-doc-toc-link ${heading.depth === 3 ? "nyx-doc-toc-link-nested" : ""}`}
                    >
                      {heading.text}
                    </a>
                  ))}
                </nav>
              ) : (
                <p className="mt-3 text-xs leading-5 text-stone-500">
                  No sections available for this page yet.
                </p>
              )}
            </div>
          </aside>
        </div>
      </main>
      <NyxFooter tone="chalk" />
    </DocsThemeProvider>
  );
}
