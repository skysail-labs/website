import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocsShell } from "@/components/docs/docs-shell";
import { getFirstDoc, getDocBySlug } from "@/lib/docs";

export const metadata: Metadata = {
  title: "Darknyx · docs",
  description: "Public documentation for Darknyx's private Solana CLOB architecture, trust model, API, and integration surface.",
};

export default function DocsIndexPage() {
  const firstDoc = getFirstDoc();
  const doc = firstDoc ? getDocBySlug(firstDoc.slug) : null;

  if (!doc) notFound();

  return <DocsShell doc={doc} />;
}
