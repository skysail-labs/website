"use client";

import hljs from "highlight.js/lib/common";
import { useEffect, useRef } from "react";

export function SyntaxCodeBlock({ lang, text }: { lang: string; text: string }) {
  const codeRef = useRef<HTMLElement | null>(null);
  const normalizedLang = lang.toLowerCase();

  useEffect(() => {
    if (!codeRef.current) return;
    if (hljs.getLanguage(normalizedLang)) {
      hljs.highlightElement(codeRef.current);
    }
  }, [normalizedLang, text]);

  return (
    <div className="nyx-doc-code-block">
      <div className="nyx-doc-code-label">{normalizedLang || "text"}</div>
      <pre>
        <code ref={codeRef} className={`language-${normalizedLang || "plaintext"}`}>
          {text}
        </code>
      </pre>
    </div>
  );
}
