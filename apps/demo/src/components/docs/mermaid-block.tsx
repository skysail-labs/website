"use client";

import mermaid from "mermaid";
import { useEffect, useMemo, useState } from "react";

let mermaidReady = false;

function ensureMermaid() {
  if (mermaidReady) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: "neutral",
    securityLevel: "strict",
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
    suppressErrorRendering: true,
  });
  mermaidReady = true;
}

function safeId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}

export function MermaidBlock({ chart }: { chart: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const id = useMemo(
    () => safeId(`nyx-mermaid-${Math.random().toString(36).slice(2)}`),
    [],
  );

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      try {
        ensureMermaid();
        const { svg: renderedSvg } = await mermaid.render(id, chart);
        if (!cancelled) {
          setSvg(renderedSvg);
          setError(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setSvg(null);
        }
      }
    };

    void render();

    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  if (error) {
    return (
      <div className="nyx-doc-diagram">
        <pre className="nyx-doc-diagram-fallback">
          <code>{chart}</code>
        </pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="nyx-doc-diagram">
        <div className="nyx-doc-flow-line">Rendering diagram…</div>
      </div>
    );
  }

  return (
    <div
      className="nyx-doc-diagram nyx-doc-mermaid"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
