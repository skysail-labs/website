"use client";

import { useEffect, useRef, useState } from "react";
import { SOLUTION } from "./copy";

/**
 * The four-stage execution sequence.
 *
 * Once the track scrolls into view the stages illuminate one after another and
 * the rail fills behind them — a single slow gesture, played once.
 */
export function ExecutionFlow() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [lit, setLit] = useState(0);

  useEffect(() => {
    const node = trackRef.current;
    if (!node) return;

    const total = SOLUTION.flow.length;

    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setLit(total);
      return;
    }

    let timers: ReturnType<typeof setTimeout>[] = [];

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        timers = Array.from({ length: total }, (_, i) =>
          setTimeout(() => setLit(i + 1), 260 + i * 520)
        );
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  // The rail stops at the centre of the last lit stage rather than running past it.
  const progress = lit === 0 ? 0 : ((lit - 0.5) / SOLUTION.flow.length) * 100;

  return (
    <div className="dn-flow">
      <p className="dn-eyebrow dn-eyebrow--muted">Execution sequence</p>
      <div
        ref={trackRef}
        className="dn-flow-track"
        style={{ "--dn-flow-progress": `${progress}%` } as React.CSSProperties}
      >
        {SOLUTION.flow.map((stage, i) => (
          <div key={stage.step} className={`dn-flow-step ${i < lit ? "is-lit" : ""}`}>
            <span className="dn-flow-num">{stage.step}</span>
            <span className="dn-flow-label">{stage.label}</span>
            <span className="dn-flow-note">{stage.note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
