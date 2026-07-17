"use client";

import Link from "next/link";
import { NyxMark } from "@/components/brand/nyx-mark";
import { hero } from "@/components/landing/landing-copy";

export function LandingHero() {
  return (
    <section
      className="relative isolate overflow-hidden"
      style={{
        height: "calc(100dvh - 52px)",
        minHeight: "580px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Full-bleed column image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/hero-columns.png"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />

      {/* Subtle vignette to deepen the center darkness and ground the text */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 55% 70% at 50% 50%, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.55) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Bottom fade into the next section */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "160px",
          background: "linear-gradient(to bottom, transparent, #14121d)",
          pointerEvents: "none",
        }}
      />

      {/* Hero content — centred between the columns */}
      <div
        className="relative z-10 flex flex-col items-center text-center"
        style={{
          maxWidth: "560px",
          padding: "0 24px",
          gap: "0",
        }}
      >
        {/* Mark */}
        <div className="nyx-rise mb-6" style={{ opacity: 0, animationFillMode: "forwards" }}>
          <NyxMark
            size={44}
            style={{ color: "var(--nyx-chalk)", margin: "0 auto" }}
          />
        </div>

        {/* Wordmark */}
        <div
          className="nyx-rise nyx-rise-delay-1 mb-8"
          style={{ opacity: 0, animationFillMode: "forwards" }}
        >
          <span
            style={{
              fontFamily: "var(--nyx-font-display)",
              fontSize: "clamp(13px, 1.4vw, 15px)",
              fontWeight: 600,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(245,243,238,0.45)",
            }}
          >
            darknyx
          </span>
        </div>

        {/* Headline */}
        <h1
          className="nyx-rise nyx-rise-delay-2"
          style={{
            opacity: 0,
            animationFillMode: "forwards",
            fontFamily: "var(--nyx-font-display)",
            fontSize: "clamp(36px, 5.5vw, 64px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            margin: "0 0 24px",
          }}
        >
          <span style={{ display: "block", color: "var(--nyx-chalk)" }}>
            Settle in the{" "}
            <span style={{ color: "var(--nyx-accent)" }}>dark</span>.
          </span>
          <span style={{ display: "block", color: "var(--nyx-accent)" }}>
            Prove in the{" "}
            <span style={{ color: "var(--nyx-chalk)" }}>light</span>.
          </span>
        </h1>

        {/* Lede */}
        <p
          className="nyx-rise nyx-rise-delay-3"
          style={{
            opacity: 0,
            animationFillMode: "forwards",
            fontFamily: "var(--nyx-font-body)",
            fontSize: "clamp(13px, 1.5vw, 15px)",
            lineHeight: 1.75,
            color: "rgba(245,243,238,0.58)",
            margin: "0 0 36px",
            maxWidth: "420px",
          }}
        >
          {hero.lede}
        </p>

        {/* CTAs */}
        <div
          className="nyx-rise nyx-rise-delay-4"
          style={{
            opacity: 0,
            animationFillMode: "forwards",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Link
            href="/docs/architecture-overview"
            style={{
              fontFamily: "var(--nyx-font-mono)",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              padding: "10px 22px",
              background: "var(--nyx-accent-soft)",
              border: "1px solid oklch(0.62 0.14 260 / 0.45)",
              color: "var(--nyx-accent)",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            How it works
            <span style={{ opacity: 0.7 }}>→</span>
          </Link>

          <Link
            href="/docs"
            style={{
              fontFamily: "var(--nyx-font-mono)",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              padding: "10px 22px",
              background: "transparent",
              border: "1px solid rgba(245,243,238,0.15)",
              color: "rgba(245,243,238,0.55)",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(245,243,238,0.35)";
              e.currentTarget.style.color = "rgba(245,243,238,0.85)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(245,243,238,0.15)";
              e.currentTarget.style.color = "rgba(245,243,238,0.55)";
            }}
          >
            Read the docs
          </Link>
        </div>

        {/* Status badge */}
        <div
          className="nyx-rise nyx-rise-delay-5"
          style={{
            opacity: 0,
            animationFillMode: "forwards",
            marginTop: "40px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--nyx-signal-green)",
              boxShadow: "0 0 8px var(--nyx-signal-green)",
              display: "inline-block",
              animation: "nyx-pulse-soft 2.4s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontFamily: "var(--nyx-font-mono)",
              fontSize: "10px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(245,243,238,0.35)",
            }}
          >
            Testnet · Solana · Intel TDX
          </span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        style={{
          position: "absolute",
          bottom: "32px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          opacity: 0.35,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <div
          style={{
            width: 1,
            height: 40,
            background: "linear-gradient(to bottom, transparent, rgba(245,243,238,0.6))",
          }}
        />
      </div>
    </section>
  );
}
