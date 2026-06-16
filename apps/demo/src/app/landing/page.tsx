"use client";

import { useEffect, useState, useRef } from "react";
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
  const howCompletedRef = useRef(false);
  const isLockedRef = useRef(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const direction = currentScrollY > lastScrollY ? "down" : "up";
      lastScrollY = currentScrollY;

      setScrolled(currentScrollY > 10);

      const howSection = document.getElementById("how");
      if (!howSection) return;

      const rect = howSection.getBoundingClientRect();
      const sectionTop = currentScrollY + rect.top;
      const sectionHeight = rect.height;
      const targetScrollY = Math.round(sectionTop + (sectionHeight / 2) - (window.innerHeight / 2));

      // Reset completed flag if they scroll far above the section
      if (currentScrollY < targetScrollY - window.innerHeight) {
        howCompletedRef.current = false;
        howSection.classList.remove("in-view");
      }

      // If scrolling down, not completed yet, and not already locked
      if (direction === "down" && !howCompletedRef.current && !isLockedRef.current) {
        // Capture range around targetScrollY
        if (currentScrollY >= targetScrollY - 80 && currentScrollY < targetScrollY + 80) {
          // Snap scroll to target position
          window.scrollTo(0, targetScrollY);

          isLockedRef.current = true;

          const prevent = (e: Event) => e.preventDefault();
          const preventKey = (e: KeyboardEvent) => {
            if ([32, 33, 34, 35, 36, 37, 38, 39, 40].includes(e.keyCode)) {
              e.preventDefault();
            }
          };

          window.addEventListener("wheel", prevent, { passive: false });
          window.addEventListener("touchmove", prevent, { passive: false });
          window.addEventListener("keydown", preventKey, { passive: false });

          // Trigger card slide up animation
          howSection.classList.add("in-view");

          setTimeout(() => {
            window.removeEventListener("wheel", prevent);
            window.removeEventListener("touchmove", prevent);
            window.removeEventListener("keydown", preventKey);
            isLockedRef.current = false;
            howCompletedRef.current = true;
          }, 1500);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
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

      {/* ===================== NAV ===================== */}
      <nav className={`nav ${scrolled ? "scrolled" : ""}`} id="nav">
        <Link className="lock" href="/">
          <svg className="mark" viewBox="0 0 120 120">
            <use href="#nyx-mark"/>
          </svg>
          <b>darknyx</b>
        </Link>
        <div className="links">
          <a href="#third-option">Overview</a>
          <Link href="/docs">Docs</Link>
        </div>
        <div className="end">
          <span className="btn ghost status">
            <span className="pdot"></span>Private beta soon
          </span>
        </div>
      </nav>

      {/* ===================== HERO ===================== */}
      <header className="hero">
        <div className="layout-node left" style={{ top: "30px" }}></div>
        <div className="layout-node right" style={{ top: "30px" }}></div>
        <div className="hero-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/final.png" alt="Ancient Greek city in white line-art under a starfield" />
        </div>
        <div className="hero-scrim"></div>
        <div className="hero-glow"></div>

        <div className="hero-inner">
          <div
            className="rise d2"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "760px",
              background: "#14121d",
              border: "2px solid #000",
              padding: "clamp(1.5rem, 3vw, 2rem)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "12px 12px 0px rgba(0,0,0,0.95)",
              overflow: "hidden",
            }}
          >
            {/* Badge */}
            <div className="rise d1" style={{ position: "relative", zIndex: 10, marginBottom: "2rem" }}>
              <div style={{ display: "inline-block", border: "1px solid var(--cobalt-line)", color: "var(--cobalt)", padding: "0.25rem 0.875rem", fontFamily: "var(--mono)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 600, background: "rgba(197,160,89,0.05)" }}>
                Darkpool protocol · Solana
              </div>
            </div>

            {/* Headline */}
            <div style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", margin: "1.5rem 0" }}>
              <h1 className="display" style={{ marginTop: 0, fontSize: "clamp(32px, 4.2vw, 62px)", whiteSpace: "nowrap" }}>
                <span style={{ display: "block", color: "var(--cobalt)" }}>Settle in the <span className="tag-lo">dark</span>.</span>
                <span style={{ display: "block", color: "var(--cobalt-bright)" }}>Prove in the <span className="tag-hi">light</span>.</span>
              </h1>
            </div>

            {/* Bottom row */}
            <div
              className="rise d3"
              style={{
                position: "relative",
                zIndex: 10,
                display: "flex",
                flexWrap: "nowrap",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: "2rem",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                paddingTop: "2rem",
                marginTop: "1rem",
              }}
            >
              <div style={{ maxWidth: "28rem" }}>
                <p style={{ margin: "0 0 0.75rem", fontSize: "13px", color: "var(--chalk-dim)", lineHeight: 1.7 }}>
                  A privacy-preserving order book where intent is hidden inside attested hardware and every fill settles trustlessly on Solana - verified, never trusted.
                </p>
                <p style={{ margin: 0, fontSize: "11px", color: "var(--chalk-mute)", lineHeight: 1.75 }}>
                  Built for active traders, market makers, and institutions that need discretion without giving up custody or auditability.
                </p>
              </div>
              <div className="hero-actions">
                <Link className="btn" href="/docs">
                  How Darknyx works <span className="arr">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-meta rise d5">
          {/* <div className="net">
            Network · <b>Solana</b>
            <br />
            Matching · <b>Intel TDX</b>
            <br />
            Status · <b>TDX rollout</b>
          </div> */}
        </div>
      </header>

      <div className="section-divider" style={{ background: "var(--ink)" }}>
        <div className="line"></div>
        <svg className="divider-mark" viewBox="0 0 120 120">
          <use href="#nyx-mark"/>
        </svg>
        <div className="line"></div>
      </div>

      {/* ===================== SECTION 1 - THE THIRD OPTION ===================== */}
      <section className="section" id="third-option">
        <div className="layout-line-left"></div>
        <div className="layout-line-right"></div>
        <div className="layout-node left"></div>
        <div className="layout-node right"></div>
        <div className="wrap">
          <div className="section-head">
            <span className="badge">The third option</span>
            <h2 className="display h-lg" style={{ marginTop: "16px", fontWeight: 300, fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif", letterSpacing: "-0.01em" }}>
              A dark pool you don't
              <br />
              have to trust.
            </h2>
            <p className="lede">
              Public order books leak every intention to bots and competitors. Off-chain dark pools take your custody. Darknyx is neither - orders meet inside an attested enclave the operator cannot read, and funds only ever move under a proof verified on Solana.
            </p>
          </div>

          <div className="pillars">
            <div className="pillar">
              <div className="ix">01</div>
              <h3>
                Orders stay dark
                <br />
                until they clear.
              </h3>
              <p>
                Side, size, and limit price are visible only to the enclave - never in a mempool, log, or account an observer can read before settlement.
              </p>
              <div className="rule"></div>
            </div>
            <div className="pillar">
              <div className="ix">02</div>
              <h3>
                Custody risk
                <br />
                is zero.
              </h3>
              <p>
                Funds rest in a non-upgradeable Solana vault. The matcher can propose fills, but only your zero-knowledge proof can move assets out.
              </p>
              <div className="rule"></div>
            </div>
            <div className="pillar">
              <div className="ix">03</div>
              <h3>
                Settlement can
                <br />
                be checked.
              </h3>
              <p>
                Every fill lands on-chain bound to a validity proof and the attested TEE signature - auditable by anyone, without exposing your strategy.
              </p>
              <div className="rule"></div>
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

      {/* ===================== NEW: ARCHITECTURE SECTION ===================== */}
      <section className="section" id="architecture">
        <div className="layout-line-left"></div>
        <div className="layout-line-right"></div>
        <div className="layout-node left"></div>
        <div className="layout-node right"></div>

        <div className="wrap">
          <div className="section-head">
            <span className="badge">System design</span>
            <h2 className="display h-lg" style={{ marginTop: "16px", fontWeight: 300, fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif", letterSpacing: "-0.01em" }}>
              Three layers,
              <br />
              one chain of trust.
            </h2>
            <p className="lede">
              Whatever needs to be trusted goes on-chain; whatever needs to be private goes in-TEE; whatever must remain a secret stays on your device.
            </p>
          </div>

          <div className="arch-grid">
            <div className="arch-nav">
              <button
                className={`arch-tab-btn ${activeTab === "custody" ? "active" : ""}`}
                onMouseEnter={() => setActiveTab("custody")}
                onClick={() => setActiveTab("custody")}
              >
                <span className="num">LAYER 1</span>
                <span className="title">Custody Layer</span>
              </button>
              <button
                className={`arch-tab-btn ${activeTab === "matching" ? "active" : ""}`}
                onMouseEnter={() => setActiveTab("matching")}
                onClick={() => setActiveTab("matching")}
              >
                <span className="num">LAYER 2</span>
                <span className="title">Matching Layer</span>
              </button>
              <button
                className={`arch-tab-btn ${activeTab === "client" ? "active" : ""}`}
                onMouseEnter={() => setActiveTab("client")}
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

      <section className="section" id="how">
        <div className="layout-line-left"></div>
        <div className="layout-line-right"></div>
        <div className="layout-node left"></div>
        <div className="layout-node right"></div>
        <div className="wrap how-container">
          <div className="how-left">
            <div className="section-head">
              <span className="badge">How it works</span>
              <h2 className="display h-lg" style={{ marginTop: "16px", fontWeight: 300, fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif", letterSpacing: "-0.01em" }}>
                From private intent
                <br />
                to verified settlement.
              </h2>
              <p className="lede">
                You sign custody actions with your wallet and orders with a separate trading key. The sensitive path stays private inside the enclave; the money path stays verifiable on-chain.
              </p>
            </div>

            <div style={{ marginTop: "clamp(30px,4vw,40px)" }}>
              <Link className="btn ghost" href="/docs/category/how-it-works">
                Learn how it works <span className="arr">→</span>
              </Link>
            </div>
          </div>

          <div className="steps">
            <div className="step">
              <span className="n">01</span>
              <div className="stage">Fund privately</div>
              <h3>Deposit into the vault.</h3>
              <p>Funds become private note commitments instead of a public, trackable trading balance.</p>
              <span className="tech">Solana vault</span>
            </div>
            <div className="step">
              <span className="n">02</span>
              <div className="stage">Match in batches</div>
              <h3>Orders clear in the dark.</h3>
              <p>Signed intent meets inside an attested TDX enclave. Compatible orders clear every two seconds at one uniform price.</p>
              <span className="tech">Intel TDX · FBA</span>
            </div>
            <div className="step">
              <span className="n">03</span>
              <div className="stage">Settle on-chain</div>
              <h3>Fills land verifiably.</h3>
              <p>Settlement posts to Solana with proof material and the registered TEE signature. Withdrawals stay user-controlled.</p>
              <span className="tech">ZK proofs</span>
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
          <div className="section-head">
            <span className="badge">Comparison</span>
            <h2 className="display h-lg" style={{ marginTop: "16px", fontWeight: 300, fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif", letterSpacing: "-0.01em" }}>
              How Darknyx compares
            </h2>
            <p className="lede">
              Honest trade-offs across order privacy, custody risk, matching speed, and L1 compatibility.
            </p>
          </div>

          <div className="diff-table-wrapper">
            <table className="diff-table">
              <thead>
                <tr>
                  <th>Dimension</th>
                  <th>Darknyx</th>
                  <th>Public DEXs / CLOBs</th>
                  <th>Centralized Exchanges</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Order Privacy</b></td>
                  <td><span className="highlight">Hidden (In-TEE)</span></td>
                  <td>Public (Front-runnable)</td>
                  <td>Visible to operator</td>
                </tr>
                <tr>
                  <td><b>Custody Risk</b></td>
                  <td><span className="highlight">Zero (ZK proofs)</span></td>
                  <td>Zero (On-chain)</td>
                  <td>Total operator custody</td>
                </tr>
                <tr>
                  <td><b>Matching Speed</b></td>
                  <td><span className="highlight">Sub-millisecond</span></td>
                  <td>Block-level delay</td>
                  <td>Sub-millisecond</td>
                </tr>
                <tr>
                  <td><b>Liquidity Access</b></td>
                  <td><span className="highlight">Direct (Solana assets)</span></td>
                  <td>Direct L1 liquidity</td>
                  <td>Deep custodian book</td>
                </tr>
                <tr>
                  <td><b>Moat / Defensibility</b></td>
                  <td><span className="highlight">Batched private settlement</span></td>
                  <td>Network effects</td>
                  <td>Brand & licensing</td>
                </tr>
              </tbody>
            </table>
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
              <Link href="/docs">Docs</Link>
              <Link href="/docs/architecture-overview">Architecture</Link>
              <Link href="/docs/glossary">Glossary</Link>
              <a href="https://github.com/skysail-labs/website" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </div>
          </div>
        </div>
    </>
  );
}
