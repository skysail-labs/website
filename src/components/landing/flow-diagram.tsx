"use client";

import Link from "next/link";

import { flow } from "@/components/landing/landing-copy";

const accent = "var(--nyx-accent)";

export function FlowDiagram() {
  return (
    <section
      className="relative isolate overflow-hidden border-t"
      style={{
        borderColor: "rgba(10,10,13,0.08)",
        backgroundColor: "rgb(250,250,249)",
        backgroundImage: "radial-gradient(rgba(10,10,13,0.08) 1px, transparent 1px)",
        backgroundSize: "18px 18px",
      }}
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-7 sm:py-16">
        <div className="flex max-w-2xl flex-col items-start gap-2">
          <span
            className="font-sans text-[10px] uppercase tracking-[0.18em]"
            style={{ color: accent }}
          >
            {flow.eyebrow}
          </span>
          <h2
            className="font-sans font-semibold leading-tight tracking-[-0.02em]"
            style={{ fontSize: "clamp(18px, 2.2vw, 28px)" }}
          >
            <span style={{ color: "rgb(28,25,23)" }}>{flow.title}</span>
            <br />
            <span style={{ color: "rgb(87,83,78)" }}>{flow.titleMuted}</span>
          </h2>
          <p
            className="mt-3 max-w-xl font-sans text-[12px] leading-[1.85]"
            style={{ color: "rgb(87,83,78)" }}
          >
            {flow.lede}
          </p>
        </div>

        <ol className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {flow.stages.map((s, idx) => (
            <li key={s.title}>
              <div
                className={`group h-full p-6 transition-all duration-500 nyx-rise nyx-rise-delay-${idx + 1}`}
                style={{
                  border: "1px solid rgb(231,229,228)",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.88)",
                  boxShadow: "0 1px 2px rgba(28,25,23,0.04)",
                }}
              >
                <span
                  className="font-sans text-[20px] leading-none"
                  style={{ color: accent }}
                >
                  0{idx + 1}
                </span>
                <h3
                  className="mt-4 font-sans text-[14px] font-semibold leading-snug"
                  style={{ color: "rgb(28,25,23)" }}
                >
                  {s.title}
                </h3>
                <p
                  className="mt-3 font-sans text-[11.5px] leading-[1.8]"
                  style={{ color: "rgb(87,83,78)" }}
                >
                  {s.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 h-px w-full bg-stone-200" />

        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <p className="max-w-xl font-sans text-[12px] leading-[1.75] text-stone-600">
            {flow.footnote}
          </p>
          <Link
            href="/docs/architecture-overview"
            className="inline-flex items-center gap-2 rounded-sm font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-600 transition hover:text-[var(--nyx-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nyx-accent)] focus-visible:ring-offset-4"
          >
            Architecture deep-dive
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
              <path
                d="M2 5.5h7m0 0L5.5 2m3.5 3.5L5.5 9"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
