import Link from "next/link";

import { NyxLockup } from "@/components/brand/nyx-mark";
import { hero } from "@/components/landing/landing-copy";

const mono = "font-sans";
const muted = "rgba(245, 243, 238, 0.72)";

export function LandingHeroCopy() {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "896px",
        background: "#14121d",
        border: "2px solid #000",
        padding: "clamp(2rem, 5vw, 3.5rem)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "480px",
        boxShadow: "12px 12px 0px rgba(0,0,0,0.95)",
        overflow: "hidden",
      }}
    >
      <div className="mb-9 sm:mb-10" style={{ position: "relative", zIndex: 10 }}>
        <NyxLockup size={76} markSize={116} tone="chalk" />
      </div>
      <div style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", margin: "1.5rem 0" }}>
        <h1
          className={`${mono} font-semibold leading-tight`}
          style={{
            fontSize: "clamp(28px, 4.5vw, 44px)",
            letterSpacing: "-0.02em",
          }}
        >
          <span className="block" style={{ color: "var(--nyx-chalk)" }}>
            Settle in the <span style={{ color: "var(--nyx-accent)" }}>dark</span>.
          </span>
          <span className="mt-2 block" style={{ color: "var(--nyx-accent)" }}>
            Prove in the <span style={{ color: "var(--nyx-chalk)" }}>light</span>.
          </span>
        </h1>
      </div>
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "2rem",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingTop: "2rem",
          marginTop: "1rem",
        }}
      >
        <div style={{ maxWidth: "28rem" }}>
          <p className={`${mono} text-[13px] leading-[1.85] sm:text-[14px]`} style={{ color: muted, margin: "0 0 0.75rem" }}>
            {hero.lede}
          </p>
          <p className={`${mono} text-[12px] leading-[1.75]`} style={{ color: "rgba(174,172,176,0.78)", margin: 0 }}>
            {hero.aside}
          </p>
        </div>
        <div>
          <Link
            href="/docs/architecture-overview"
            className={`${mono} inline-flex items-center rounded-sm px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nyx-accent focus-visible:ring-offset-4`}
            style={{
              background: "var(--nyx-accent-soft)",
              border: "1px solid oklch(0.62 0.14 260 / 0.45)",
              color: "var(--nyx-accent)",
            }}
          >
            How Darknyx works
          </Link>
        </div>
      </div>
    </div>
  );
}
