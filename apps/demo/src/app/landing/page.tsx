"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Star {
  id: number;
  width: number;
  height: number;
  left: string;
  top: string;
  o0: string;
  o1: string;
  tw: string;
  delay: string;
}

function Starfield({ count = 40 }: { count?: number }) {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const newStars = Array.from({ length: count }).map((_, i) => {
      const big = Math.random() < 0.14;
      const sz = big ? 2 : 1;
      const o = 0.2 + Math.random() * 0.55;
      return {
        id: i,
        width: sz,
        height: sz,
        left: (Math.random() * 100).toFixed(2) + "%",
        top: (Math.random() * 100).toFixed(2) + "%",
        o0: (o * 0.4).toFixed(2),
        o1: o.toFixed(2),
        tw: (2.5 + Math.random() * 4).toFixed(1) + "s",
        delay: (Math.random() * 4).toFixed(1) + "s",
      };
    });
    setStars(newStars);
  }, [count]);

  return (
    <div className="stars">
      {stars.map((s) => (
        <span
          key={s.id}
          style={{
            width: `${s.width}px`,
            height: `${s.height}px`,
            left: s.left,
            top: s.top,
            opacity: parseFloat(s.o1),
            animation: "twinkle var(--tw, 4s) ease-in-out infinite alternate",
            animationDelay: s.delay,
            // @ts-ignore
            "--o0": s.o0,
            "--o1": s.o1,
            "--tw": s.tw,
          }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("custody");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-revealed"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("is-revealed"); observer.unobserve(entry.target); }
      }),
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* ===== Greek scene line-art symbols (retained exactly from static site design) ===== */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <symbol id="t-grand" viewBox="0 0 460 240">
          <polyline points="60,72 230,30 400,72"/>
          <line x1="56" y1="76" x2="404" y2="76"/><line x1="62" y1="84" x2="398" y2="84"/>
          <line x1="84" y1="84" x2="84" y2="188"/><line x1="121" y1="84" x2="121" y2="188"/><line x1="157" y1="84" x2="157" y2="188"/>
          <line x1="194" y1="84" x2="194" y2="188"/><line x1="230" y1="84" x2="230" y2="188"/><line x1="266" y1="84" x2="266" y2="188"/>
          <line x1="303" y1="84" x2="303" y2="188"/><line x1="339" y1="84" x2="339" y2="188"/><line x1="376" y1="84" x2="376" y2="188"/>
          <line x1="74" y1="188" x2="386" y2="188"/><line x1="66" y1="198" x2="394" y2="198"/><line x1="58" y1="208" x2="402" y2="208"/>
          <line x1="0" y1="226" x2="460" y2="226"/>
        </symbol>
        <symbol id="t-skyline" viewBox="0 0 620 150">
          <polyline points="40,70 95,48 150,70"/><line x1="36" y1="74" x2="154" y2="74"/>
          <line x1="52" y1="74" x2="52" y2="118"/><line x1="72" y1="74" x2="72" y2="118"/><line x1="92" y1="74" x2="92" y2="118"/><line x1="112" y1="74" x2="112" y2="118"/><line x1="132" y1="74" x2="132" y2="118"/>
          <line x1="34" y1="118" x2="156" y2="118"/>
          <polyline points="185,80 230,62 275,80"/><line x1="182" y1="84" x2="278" y2="84"/>
          <line x1="196" y1="84" x2="196" y2="118"/><line x1="216" y1="84" x2="216" y2="118"/><line x1="236" y1="84" x2="236" y2="118"/><line x1="256" y1="84" x2="256" y2="118"/>
          <line x1="180" y1="118" x2="280" y2="118"/>
          <polyline points="300,90 330,77 360,90"/><line x1="298" y1="93" x2="362" y2="93"/>
          <line x1="310" y1="93" x2="310" y2="118"/><line x1="330" y1="93" x2="330" y2="118"/><line x1="350" y1="93" x2="350" y2="118"/>
          <polyline points="392,93 416,81 440,93"/><line x1="390" y1="96" x2="442" y2="96"/>
          <line x1="400" y1="96" x2="400" y2="118"/><line x1="420" y1="96" x2="420" y2="118"/>
          <line x1="475" y1="100" x2="600" y2="100"/>
          <line x1="475" y1="100" x2="475" y2="120"/><line x1="500" y1="100" x2="500" y2="120"/><line x1="525" y1="100" x2="525" y2="120"/><line x1="550" y1="100" x2="550" y2="120"/><line x1="575" y1="100" x2="575" y2="120"/><line x1="600" y1="100" x2="600" y2="120"/>
          <path d="M475,108 A12 12 0 0 1 500,108"/><path d="M500,108 A12 12 0 0 1 525,108"/><path d="M525,108 A12 12 0 0 1 550,108"/><path d="M550,108 A12 12 0 0 1 575,108"/><path d="M575,108 A12 12 0 0 1 600,108"/>
          <line x1="0" y1="120" x2="620" y2="120"/>
        </symbol>
        <symbol id="t-forum" viewBox="0 0 620 240">
          <line x1="0" y1="150" x2="300" y2="150"/><line x1="0" y1="162" x2="286" y2="162"/>
          <polyline points="60,70 150,44 240,70"/><line x1="56" y1="74" x2="244" y2="74"/><line x1="56" y1="82" x2="244" y2="82"/>
          <line x1="72" y1="82" x2="72" y2="146"/><line x1="96" y1="82" x2="96" y2="146"/><line x1="120" y1="82" x2="120" y2="146"/><line x1="144" y1="82" x2="144" y2="146"/><line x1="168" y1="82" x2="168" y2="146"/><line x1="192" y1="82" x2="192" y2="146"/><line x1="216" y1="82" x2="216" y2="146"/>
          <line x1="64" y1="146" x2="236" y2="146"/>
          <line x1="175" y1="238" x2="430" y2="150"/><line x1="560" y1="238" x2="452" y2="150"/>
          <line x1="300" y1="190" x2="492" y2="190"/><line x1="270" y1="214" x2="520" y2="214"/><line x1="240" y1="236" x2="548" y2="236"/>
          <line x1="500" y1="118" x2="500" y2="150"/><line x1="494" y1="116" x2="506" y2="116"/><line x1="535" y1="124" x2="535" y2="150"/><line x1="529" y1="122" x2="541" y2="122"/>
        </symbol>
        <symbol id="nyx-mark" viewBox="0 0 120 120">
          <clipPath id="hor-clip"><rect x="0" y="0" width="120" height="66"/></clipPath>
          <circle cx="60" cy="60" r="36" fill="currentColor" clipPath="url(#hor-clip)"/>
          <rect x="18" y="66" width="84" height="4" fill="currentColor"/>
          <rect x="18" y="78" width="60" height="4" fill="currentColor" opacity="0.5"/>
        </symbol>
      </svg>

      {/* ===================== HERO ===================== */}
      <header
        className="hero-parallax"
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundImage: "url('/bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderBottom: "2px solid #000",
        }}
      >
        {/* NAV */}
        <div className="hero-rise hero-rise-1" style={{ position: "relative", zIndex: 20, width: "100%", padding: "1.5rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo: half-moon mark + Space Grotesk "darknyx" */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "11px", textDecoration: "none" }}>
            <svg className="mark" width="26" height="26" viewBox="0 0 120 120">
              <use href="#nyx-mark"/>
            </svg>
            <b style={{ fontWeight: 600, fontSize: "26px", letterSpacing: "-0.04em", color: "var(--cobalt-bright)", fontFamily: "var(--font)" }}>darknyx</b>
          </Link>
          {/* Gold pill nav */}
          <nav style={{ display: "flex", alignItems: "center", background: "var(--cobalt)", color: "#000", padding: "0.5rem 1rem", border: "1px solid rgba(0,0,0,0.5)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", gap: "1.25rem", boxShadow: "2px 2px 0px rgba(0,0,0,0.6)", fontFamily: "var(--mono)" }}>
            <a href="#third-option" style={{ color: "#000", textDecoration: "none" }}>Overview</a>
            <Link href="/docs" style={{ color: "#000", textDecoration: "none" }}>Docs</Link>
          </nav>
        </div>
        {/* Layered backdrop: sunken reliefs, navy marble tint */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(4,5,9,0.88) 0%, rgba(4,5,9,0.66) 14%, rgba(4,5,9,0.26) 34%, rgba(4,5,9,0.14) 50%, rgba(4,5,9,0.26) 66%, rgba(4,5,9,0.66) 86%, rgba(4,5,9,0.88) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 55% at 28% 30%, rgba(23,33,63,0.6), transparent 70%), radial-gradient(ellipse 60% 50% at 74% 62%, rgba(16,24,47,0.55), transparent 70%), radial-gradient(ellipse 110% 85% at 50% 55%, rgba(12,16,36,0.5), transparent 80%)", mixBlendMode: "screen" as const }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 55% 50% at 50% 50%, transparent 40%, rgba(4,5,9,0.35) 100%)" }} />
        </div>

        {/* Hero card */}
        <div style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 1rem" }}>
          <div
            className="hero-rise hero-rise-2"
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
            {/* Badge */}
            <div className="hero-rise hero-rise-3" style={{ position: "relative", zIndex: 10, marginBottom: "2rem" }}>
              <div style={{ display: "inline-block", border: "1px solid #c5a059", color: "#c5a059", padding: "0.25rem 0.875rem", fontFamily: "var(--mono)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 600, background: "rgba(197,160,89,0.05)" }}>
                Darkpool protocol · Solana
              </div>
            </div>

            {/* Headline */}
            <div className="hero-rise hero-rise-4" style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", margin: "1.5rem 0" }}>
              <h1 style={{ margin: 0, fontWeight: 300, letterSpacing: "-0.02em", lineHeight: 1.02, color: "#c5a059", fontSize: "clamp(3rem, 8vw, 5.5rem)", fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif" }}>
                <span style={{ color: "#fff", fontWeight: 300 }}>Settle </span>
                <span style={{ fontStyle: "italic", color: "#fff", fontWeight: 300 }}>in the </span>
                <span style={{ fontWeight: 300 }}>Dark</span>
                <br />
                <span style={{ fontWeight: 300 }}>Prove </span>
                <span style={{ fontStyle: "italic", color: "#fff", fontWeight: 300 }}>in the </span>
                <span style={{ color: "#fff", fontWeight: 300 }}>Light</span>
              </h1>
            </div>

            {/* Bottom row */}
            <div className="hero-rise hero-rise-5" style={{ position: "relative", zIndex: 10, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "2rem", borderTop: "1px solid var(--line-2)", paddingTop: "2rem", marginTop: "1rem" }}>
              <div style={{ maxWidth: "28rem" }}>
                <p style={{ margin: "0 0 0.75rem", fontSize: "12px", color: "var(--chalk-dim)", lineHeight: 1.7 }}>
                  A privacy-preserving order book where intent is hidden inside attested hardware and every fill settles trustlessly on Solana, verified, never trusted.
                </p>
                <p style={{ margin: 0, fontSize: "11px", color: "var(--chalk-mute)", lineHeight: 1.75 }}>
                  Built for active traders, market makers, and institutions that need discretion without giving up custody or auditability.
                </p>
              </div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "transparent",
                  color: "var(--cobalt)",
                  border: "1px solid var(--cobalt)",
                  fontWeight: 700,
                  padding: "0.75rem 2rem",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: "var(--mono)",
                  flexShrink: 0,
                  opacity: 0.7,
                  cursor: "default",
                }}
              >
                Private Beta Soon
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="section-divider">
        <div className="line"></div>
        <svg className="divider-mark" viewBox="0 0 120 120">
          <use href="#nyx-mark"/>
        </svg>
        <div className="line"></div>
      </div>

      {/* ===================== SECTION 1 — THE THIRD OPTION ===================== */}
      <section className="section" id="third-option">
        <div className="layout-line-left"></div>
        <div className="layout-line-right"></div>
        <div className="layout-node left"></div>
        <div className="layout-node right"></div>
        <div className="wrap">
          <div data-reveal className="dark-section-head">
            <span className="badge">The third option</span>
            <h2 className="display h-lg" style={{ marginTop: "16px", fontWeight: 300, fontFamily: "var(--font-cormorant)", letterSpacing: "-0.01em" }}>
              A dark pool you don't have to trust
            </h2>
            <div data-reveal="line" style={{ "--reveal-delay": "0.3s" } as React.CSSProperties} className="dark-section-divider" />
            <p className="lede" style={{ marginTop: "32px", maxWidth: "64ch" }}>
              Public order books leak every intention to bots and competitors. <br />Off-chain dark pools take your custody. Darknyx is neither, orders meet inside an attested enclave the operator cannot read, and funds only ever move under a proof verified on Solana.
            </p>
          </div>

          <div className="dark-cards-grid">
            <div data-reveal>
              <div className="dark-card">
                <div className="dark-card-num">01</div>
                <h3 className="dark-card-title">
                  Orders stay dark
                  <br />
                  until they clear.
                </h3>
                <p className="dark-card-body">
                  Side, size, and limit price are visible only to the enclave — never in a mempool, log, or account an observer can read before settlement.
                </p>
              </div>
            </div>
            <div data-reveal style={{ "--reveal-delay": "0.15s" } as React.CSSProperties}>
              <div className="dark-card">
                <div className="dark-card-num">02</div>
                <h3 className="dark-card-title">
                  Custody risk
                  <br />
                  is zero.
                </h3>
                <p className="dark-card-body">
                  Funds rest in a non-upgradeable Solana vault. The matcher can propose fills, but only your zero-knowledge proof can move assets out.
                </p>
              </div>
            </div>
            <div data-reveal style={{ "--reveal-delay": "0.3s" } as React.CSSProperties}>
              <div className="dark-card">
                <div className="dark-card-num">03</div>
                <h3 className="dark-card-title">
                  Settlement can
                  <br />
                  be checked.
                </h3>
                <p className="dark-card-body">
                  Every fill lands on-chain bound to a validity proof and the attested TEE signature — auditable by anyone, without exposing your strategy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider">
        <div className="line"></div>
        <svg className="divider-mark" viewBox="0 0 120 120">
          <use href="#nyx-mark"/>
        </svg>
        <div className="line"></div>
      </div>

      {/* ===================== PANTHEON — "From private intent" ===================== */}
      <section className="section pantheon-section" id="how">
        <div className="layout-line-left"></div>
        <div className="layout-line-right"></div>
        <div className="layout-node left"></div>
        <div className="layout-node right"></div>
        <div className="wrap">

          <div data-reveal className="pantheon-head">
            <span className="pantheon-badge">How it works</span>
            <h2 className="pantheon-title">From private intent to verified settlement</h2>
            <div data-reveal="line" style={{ "--reveal-delay": "300ms" } as React.CSSProperties} className="pantheon-line" />
          </div>

          <div className="pantheon-grid">

            <div data-reveal>
              <div className="pantheon-card">
                <div className="pantheon-card-num">01</div>
                <h3 className="pantheon-card-name">Fund privately</h3>
                <span className="pantheon-card-sub">Deposit into the vault</span>
                <p className="pantheon-card-body">
                  Your assets never appear as a named trading balance. When you deposit into the Solana vault, funds are converted into private note commitments: cryptographic hashes that are visible on-chain but carry no information about size or owner. No bot, counterparty, or block explorer can link your balance to your orders before a fill is settled.
                </p>
                <div className="pantheon-card-foot">
                  <span className="pantheon-card-foot-label">Pre-Trade Privacy</span>
                  <span className="pantheon-card-tag">SOLANA VAULT</span>
                </div>
              </div>
            </div>

            <div data-reveal style={{ "--reveal-delay": "150ms" } as React.CSSProperties}>
              <div className="pantheon-card">
                <div className="pantheon-card-num">02</div>
                <h3 className="pantheon-card-name">Orders clear in the dark</h3>
                <span className="pantheon-card-sub">The Matching Engine</span>
                <p className="pantheon-card-body">
                  Your signed order intent is routed directly into an Intel TDX confidential VM, a hardware-attested enclave the operator cannot inspect. Inside, compatible orders are matched every two seconds using a frequent batch auction at one uniform clearing price. No participant can see the order book, jump the queue, or extract value by reading flow ahead of settlement.
                </p>
                <div className="pantheon-card-foot">
                  <span className="pantheon-card-foot-label">PRIVATE MATCHING</span>
                  <span className="pantheon-card-tag">INTEL TDX · FBA</span>
                </div>
              </div>
            </div>

            <div data-reveal style={{ "--reveal-delay": "300ms" } as React.CSSProperties}>
              <div className="pantheon-card">
                <div className="pantheon-card-num">03</div>
                <h3 className="pantheon-card-name">Settle on-chain</h3>
                <span className="pantheon-card-sub">Fills land verifiably</span>
                <p className="pantheon-card-body">
                  Every matched fill is posted to Solana alongside a validity proof and the registered TEE attestation signature. The on-chain vault program verifies both before releasing any funds. The matching engine can only propose a fill, never force one. When you withdraw, a zero-knowledge spend proof generated on your own device is the only key that moves assets out.
                </p>
                <div className="pantheon-card-foot">
                  <span className="pantheon-card-foot-label">On-Chain Settlement</span>
                  <span className="pantheon-card-tag">ZK PROOFS</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <div className="section-divider">
        <div className="line"></div>
        <svg className="divider-mark" viewBox="0 0 120 120">
          <use href="#nyx-mark"/>
        </svg>
        <div className="line"></div>
      </div>

      {/* ===================== ARCHITECTURE — "Three layers" ===================== */}
      <section className="section" id="architecture">
        <div className="layout-line-left"></div>
        <div className="layout-line-right"></div>
        <div className="layout-node left"></div>
        <div className="layout-node right"></div>

        <div className="wrap">
          <div data-reveal className="dark-section-head">
            <span className="badge">System design</span>
            <h2 className="display h-lg" style={{ marginTop: "16px", fontWeight: 300, fontFamily: "var(--font-cormorant)", letterSpacing: "-0.01em" }}>
              Three layers, one chain of trust.
            </h2>
            <div data-reveal="line" style={{ "--reveal-delay": "0.3s" } as React.CSSProperties} className="dark-section-divider" />
            <p className="lede" style={{ marginTop: "32px", maxWidth: "52ch", margin: "32px auto 0" }}>
              Whatever needs to be trusted goes on-chain; whatever needs to be private goes in-TEE; whatever must remain a secret stays on your device.
            </p>
          </div>

          <div className="arch-grid">
            <div className="arch-nav">
              <button
                className={`arch-tab-btn ${activeTab === "custody" ? "active" : ""}`}
                onClick={() => setActiveTab("custody")}
              >
                <span className="num">LAYER 1</span>
                <span className="title">Custody Layer</span>
              </button>
              <button
                className={`arch-tab-btn ${activeTab === "matching" ? "active" : ""}`}
                onClick={() => setActiveTab("matching")}
              >
                <span className="num">LAYER 2</span>
                <span className="title">Matching Layer</span>
              </button>
              <button
                className={`arch-tab-btn ${activeTab === "client" ? "active" : ""}`}
                onClick={() => setActiveTab("client")}
              >
                <span className="num">LAYER 3</span>
                <span className="title">Client / SDK</span>
              </button>
            </div>

            <div className="arch-pane">
              {activeTab === "custody" && (
                <div className="arch-pane-content">
                  <div>
                    <h3 className="arch-pane-title">On-Chain Solana Vault Program</h3>
                    <p className="arch-pane-desc">
                      The foundation of the trust model. Records note commitments, spent-note nullifiers, and verifies match validity proofs. Since it is non-upgradeable, no operator or TEE can touch or exit your funds without a valid zero-knowledge spend proof signed by your key.
                    </p>
                  </div>
                  <div className="arch-features">
                    <div className="arch-feature">
                      <span className="label">Location</span>
                      <span className="val">On-Chain (Solana RPC)</span>
                    </div>
                    <div className="arch-feature">
                      <span className="label">Responsibility</span>
                      <span className="val">Deposits, Withdrawals, Nullifiers</span>
                    </div>
                    <div className="arch-feature">
                      <span className="label">Trust Assumption</span>
                      <span className="val">Cryptography + L1 Validators</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "matching" && (
                <div className="arch-pane-content">
                  <div>
                    <h3 className="arch-pane-title">In-TEE Private Matching Engine</h3>
                    <p className="arch-pane-desc">
                      A single process running inside an attested Intel TDX confidential VM. It manages the private order intake, conducts uniform-clearing-price matching loops on fixed intervals to eliminate front-running, and submits signed batch settlements directly to Solana.
                    </p>
                  </div>
                  <div className="arch-features">
                    <div className="arch-feature">
                      <span className="label">Location</span>
                      <span className="val">Intel TDX Enclave</span>
                    </div>
                    <div className="arch-feature">
                      <span className="label">Responsibility</span>
                      <span className="val">FBA Matching, Order Book Privacy</span>
                    </div>
                    <div className="arch-feature">
                      <span className="label">Trust Assumption</span>
                      <span className="val">Intel TDX Hardware Attestation</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "client" && (
                <div className="arch-pane-content">
                  <div>
                    <h3 className="arch-pane-title">Local Cryptographic Client (SDK)</h3>
                    <p className="arch-pane-desc">
                      Runs locally on the user's machine. It generates client-side zero-knowledge spend proofs for deposits and withdrawals, verifiably measures and checks TEE attestation before submitting orders, and signs order intents using a dedicated, isolated trading key.
                    </p>
                  </div>
                  <div className="arch-features">
                    <div className="arch-feature">
                      <span className="label">Location</span>
                      <span className="val">User Device (Local JS/TS)</span>
                    </div>
                    <div className="arch-feature">
                      <span className="label">Responsibility</span>
                      <span className="val">ZK Proof Gen, TEE Measurement Check</span>
                    </div>
                    <div className="arch-feature">
                      <span className="label">Trust Assumption</span>
                      <span className="val">Zero (Self-generated proofs)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider">
        <div className="line"></div>
        <svg className="divider-mark" viewBox="0 0 120 120">
          <use href="#nyx-mark"/>
        </svg>
        <div className="line"></div>
      </div>

      {/* ===================== NEW: DIFFERENTIATION SECTION ===================== */}
      <section className="section" id="differentiation">
        <div className="layout-line-left"></div>
        <div className="layout-line-right"></div>
        <div className="layout-node left"></div>
        <div className="layout-node right"></div>

        <div className="wrap">
          <div data-reveal className="dark-section-head">
            <span className="badge">Comparison</span>
            <h2 className="display h-lg" style={{ marginTop: "16px", fontWeight: 300, fontFamily: "var(--font-cormorant)", letterSpacing: "-0.01em" }}>
              How Darknyx compares
            </h2>
            <div data-reveal="line" style={{ "--reveal-delay": "0.3s" } as React.CSSProperties} className="dark-section-divider" />
            <p className="lede" style={{ maxWidth: "52ch", margin: "32px auto 0" }}>
              Honest trade-offs across order privacy, custody risk, matching speed, and L1 compatibility.
            </p>
          </div>

          {/* Column header row */}
          <div data-reveal className="cmp-grid">
            <div className="cmp-label-col">
              <div className="cmp-header-cell cmp-dim-header" />
              {["Order Privacy", "Custody Risk", "Matching Speed", "Liquidity Access", "Defensibility"].map(dim => (
                <div key={dim} className="cmp-dim-cell">{dim}</div>
              ))}
            </div>

            {/* Darknyx — highlighted column */}
            <div className="cmp-col cmp-col-darknyx" data-reveal style={{ "--reveal-delay": "0.1s" } as React.CSSProperties}>
              <div className="cmp-header-cell cmp-col-title">
                <span className="cmp-col-name">Darknyx</span>
                <span className="cmp-col-sub">TEE + ZK</span>
              </div>
              {[
                "Hidden in-enclave",
                "Zero — Solana vault",
                "Sub-millisecond",
                "Direct Solana assets",
                "Batched private settlement",
              ].map(val => (
                <div key={val} className="cmp-val-cell cmp-val-gold">{val}</div>
              ))}
            </div>

            {/* MPC Pools */}
            <div className="cmp-col" data-reveal style={{ "--reveal-delay": "0.2s" } as React.CSSProperties}>
              <div className="cmp-header-cell cmp-col-title">
                <span className="cmp-col-name">MPC Pools</span>
                <span className="cmp-col-sub">e.g. Renegade</span>
              </div>
              {[
                "Hidden via MPC",
                "Zero — on-chain vault",
                "Slow (100ms–1s overhead)",
                "Isolated / bridged",
                "MPC cryptography",
              ].map(val => (
                <div key={val} className="cmp-val-cell">{val}</div>
              ))}
            </div>

            {/* Public DEXs */}
            <div className="cmp-col" data-reveal style={{ "--reveal-delay": "0.3s" } as React.CSSProperties}>
              <div className="cmp-header-cell cmp-col-title">
                <span className="cmp-col-name">Public DEXs</span>
                <span className="cmp-col-sub">CLOBs / AMMs</span>
              </div>
              {[
                "Public — front-runnable",
                "Zero — on-chain",
                "Block-level delay",
                "Direct L1 liquidity",
                "Network effects",
              ].map(val => (
                <div key={val} className="cmp-val-cell cmp-val-warn">{val}</div>
              ))}
            </div>

            {/* CEXs */}
            <div className="cmp-col" data-reveal style={{ "--reveal-delay": "0.4s" } as React.CSSProperties}>
              <div className="cmp-header-cell cmp-col-title">
                <span className="cmp-col-name">CEXs</span>
                <span className="cmp-col-sub">Centralized</span>
              </div>
              {[
                "Visible to operator",
                "Total operator custody",
                "Sub-millisecond",
                "Deep custodian book",
                "Brand & licensing",
              ].map(val => (
                <div key={val} className="cmp-val-cell cmp-val-warn">{val}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider">
        <div className="line"></div>
        <svg className="divider-mark" viewBox="0 0 120 120">
          <use href="#nyx-mark"/>
        </svg>
        <div className="line"></div>
      </div>

      {/* ===================== FOOTER ===================== */}
      <footer className="footer">
        <div className="layout-line-left"></div>
        <div className="layout-line-right"></div>
        <div className="layout-node left" style={{ top: "0" }}></div>
        <div className="layout-node right" style={{ top: "0" }}></div>
        <div className="scene-wrap">
          <Starfield count={70} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="scene-art faint" src="/assets/footer.png" alt="Ancient columns under a starry sky" />
        </div>

        <div className="footer-inner wrap">
          <svg className="mark" viewBox="0 0 120 120">
            <use href="#nyx-mark"/>
          </svg>
          <p className="eyebrow" style={{ fontSize: "16px", letterSpacing: "0.2em" }}>Privacy without sacrificing auditability</p>
          {/* <h2 className="display h-md" style={{ marginTop: "16px", maxWidth: "18ch", marginLeft: "auto", marginRight: "auto" }}>
            Privacy Without Sacrificing Auditability.
          </h2> */}
          {/* <p className="lede">
            The docs lay out the trust model, the settlement pipeline, the cryptography, and honest comparisons against every comparable venue.
          </p> */}
          <div className="footer-cta">
            <Link className="btn" href="/docs">
              Read the docs <span className="arr">→</span>
            </Link>
          </div>
        </div>

      </footer>

      <div className="footer-foot">
        <div className="row">
          <div className="lock">
            <svg className="mark" viewBox="0 0 120 120">
              <use href="#nyx-mark"/>
            </svg>
            <b>darknyx</b>
            <span className="tagline" style={{ marginLeft: "14px" }}>
              Settle in the dark · Prove in the light
            </span>
          </div>
          <div className="fl">
            <a href="#third-option">Overview</a>
            <Link href="/docs">Docs</Link>
          </div>
        </div>
      </div>
    </>
  );
}
