"use client";

import { useEffect, useRef, useState } from "react";
import { SOLUTION } from "./copy";

const STAGES = SOLUTION.flow;

/**
 * The execution pipeline.
 *
 * Two things are happening here, and they are deliberately separate.
 *
 * On scroll-in, the four stages illuminate one after another and the rail
 * fills behind them — a single slow gesture that shows the sequence *is* a
 * sequence, played once. It is ambient; it asks nothing of the reader.
 *
 * After that the component is an interactive tablist. A reader who wants the
 * detail selects a stage and the panel below swaps to it. Selection is real
 * tab semantics — roving tabindex, arrow keys, Home/End — because this is a
 * control, and a technical audience will try to keyboard it.
 *
 * The autoplay yields the moment the reader takes over.
 */
export function ExecutionFlow() {
  const trackRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /** How many stages have illuminated. Drives the rail and the lit styling. */
  const [lit, setLit] = useState(0);
  /** Which stage's detail panel is open. */
  const [active, setActive] = useState(0);
  /** Set once the reader picks a stage; freezes the intro animation. */
  const [taken, setTaken] = useState(false);

  const takenRef = useRef(false);
  useEffect(() => {
    takenRef.current = taken;
  }, [taken]);

  useEffect(() => {
    const node = trackRef.current;
    if (!node) return;

    const total = STAGES.length;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setLit(total);
      return;
    }

    let timers: ReturnType<typeof setTimeout>[] = [];

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        timers = Array.from({ length: total }, (_, i) =>
          setTimeout(() => {
            // If the reader has already engaged, don't yank the rail around
            // underneath them — just make sure everything is lit.
            if (takenRef.current) {
              setLit(total);
              return;
            }
            setLit(i + 1);
          }, 260 + i * 520)
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

  const select = (i: number) => {
    setTaken(true);
    setLit(STAGES.length);
    setActive(i);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = STAGES.length - 1;
    let next: number | null = null;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = active === last ? 0 : active + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = active === 0 ? last : active - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;

    if (next === null) return;
    e.preventDefault();
    select(next);
    tabRefs.current[next]?.focus();
  };

  /*
   * The rail runs from the first node to the last, not across the full track —
   * each node sits at the leading edge of its own column, so the track's final
   * column is trailing space with nothing in it. The CSS shortens the rail by
   * one column; this is the fraction of *that* rail the light has travelled,
   * so a value of 1 lands exactly on the last node instead of past it.
   */
  const reached = taken ? active + 1 : lit;
  const progress = reached <= 1 ? 0 : (reached - 1) / (STAGES.length - 1);

  const stage = STAGES[active];

  return (
    <div className="dn-flow">
      <p className="dn-eyebrow dn-eyebrow--muted">{SOLUTION.flowLabel}</p>

      <div
        ref={trackRef}
        className="dn-flow-track"
        role="tablist"
        aria-label={SOLUTION.flowLabel}
        onKeyDown={onKeyDown}
        style={
          {
            "--dn-flow-steps": STAGES.length,
            "--dn-flow-progress": progress,
          } as React.CSSProperties
        }
      >
        {STAGES.map((s, i) => (
          <button
            key={s.step}
            type="button"
            role="tab"
            id={`dn-flow-tab-${s.step}`}
            aria-selected={i === active}
            aria-controls={`dn-flow-panel-${s.step}`}
            tabIndex={i === active ? 0 : -1}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            className={`dn-flow-step ${i < lit ? "is-lit" : ""} ${i === active ? "is-active" : ""}`}
            onClick={() => select(i)}
          >
            <span className="dn-flow-num">{s.step}</span>
            <span className="dn-flow-label">{s.label}</span>
            <span className="dn-flow-note">{s.note}</span>
          </button>
        ))}
      </div>

      <div
        className="dn-flow-panel"
        role="tabpanel"
        id={`dn-flow-panel-${stage.step}`}
        aria-labelledby={`dn-flow-tab-${stage.step}`}
        tabIndex={0}
      >
        {/* Keyed so the panel re-mounts on change and replays its entrance. */}
        <div className="dn-flow-panel-inner" key={stage.step}>
          <div className="dn-flow-panel-copy">
            <p className="dn-body">{stage.detail}</p>
          </div>

          <dl className="dn-flow-spec">
            {stage.spec.map((row) => (
              <div key={row.k} className="dn-flow-spec-row">
                <dt>{row.k}</dt>
                <dd>{row.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
