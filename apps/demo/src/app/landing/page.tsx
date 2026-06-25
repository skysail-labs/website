"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { LandingHero } from "@/components/landing/hero";
import { EngravedLogo } from "@/components/landing/engraved-logo";
import { EngravedText } from "@/components/landing/engraved-text";
import { HorizontalScroll } from "@/components/landing/horizontal-scroll";
import { MorphingLogo } from "@/components/landing/morphing-logo";
import { MorphingWordmark } from "@/components/landing/morphing-wordmark";
import { DocsGateway } from "@/components/landing/docs-gateway";
import { SideRays } from "@/components/landing/side-rays";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

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
            // @ts-expect-error: Custom CSS variable keys not typed in standard style prop
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
  const [mounted, setMounted] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [activePhase, setActivePhase] = useState("P1");
  const [showRoadmapLogo, setShowRoadmapLogo] = useState(false);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const heroWordmarkRef = useRef<HTMLDivElement>(null);
  const darkPoolSlotRef = useRef<HTMLSpanElement>(null);
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const roadmapPlaceholderRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    const releaseTimer = setTimeout(() => {
      setInitializing(false);
      document.body.style.overflow = "";
    }, 2000);
    return () => {
      clearTimeout(releaseTimer);
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const roadmapSection = document.querySelector(".roadmap-section") as HTMLElement;

    const handleScroll = () => {
      const H = window.innerHeight;
      setScrolled(window.scrollY > H - 80);
      setShowRoadmapLogo(window.scrollY >= 4 * H - 10);

      if (roadmapSection) {
        const rect = roadmapSection.getBoundingClientRect();
        const vh = window.innerHeight;

        // Progress starts when the top of the section is 80% down the viewport
        // and completes when the bottom of the section is 20% down the viewport
        const startOffset = vh * 0.8;
        const endOffset = vh * 0.2;

        const total = rect.height + startOffset - endOffset;
        const current = startOffset - rect.top;

        const progress = Math.max(0, Math.min(1, current / total));
        roadmapSection.style.setProperty("--roadmap-scroll-progress", progress.toFixed(4));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initialize immediately on mount
    handleScroll();

    // Roadmap intersection observer
    const phaseElements = document.querySelectorAll(".roadmap-phase-item");
    const roadmapObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const phase = entry.target.getAttribute("data-phase");
            if (phase) {
              setActivePhase(phase);
            }
          }
        });
      },
      {
        rootMargin: "-45% 0px -45% 0px", // Trigger when phase crosses vertical center
      }
    );
    phaseElements.forEach((el) => roadmapObserver.observe(el));

    const howSection = document.getElementById("how");
    if (howSection) {
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) howSection.classList.add("in-view"); },
        { threshold: 0.2 }
      );
      observer.observe(howSection);
      return () => {
        window.removeEventListener("scroll", handleScroll);
        roadmapObserver.disconnect();
        observer.disconnect();
      };
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      roadmapObserver.disconnect();
    };
  }, []);

  return (
    <>
      {/* ===== Greek scene line-art symbols (retained exactly from static site design) ===== */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <symbol id="t-grand" viewBox="0 0 460 240">
          <polyline points="60,72 230,30 400,72" />
          <line x1="56" y1="76" x2="404" y2="76" /><line x1="62" y1="84" x2="398" y2="84" />
          <line x1="84" y1="84" x2="84" y2="188" /><line x1="121" y1="84" x2="121" y2="188" /><line x1="157" y1="84" x2="157" y2="188" />
          <line x1="194" y1="84" x2="194" y2="188" /><line x1="230" y1="84" x2="230" y2="188" /><line x1="266" y1="84" x2="266" y2="188" />
          <line x1="303" y1="84" x2="303" y2="188" /><line x1="339" y1="84" x2="339" y2="188" /><line x1="376" y1="84" x2="376" y2="188" />
          <line x1="74" y1="188" x2="386" y2="188" /><line x1="66" y1="198" x2="394" y2="198" /><line x1="58" y1="208" x2="402" y2="208" />
          <line x1="0" y1="226" x2="460" y2="226" />
        </symbol>
        <symbol id="t-skyline" viewBox="0 0 620 150">
          <polyline points="40,70 95,48 150,70" /><line x1="36" y1="74" x2="154" y2="74" />
          <line x1="52" y1="74" x2="52" y2="118" /><line x1="72" y1="74" x2="72" y2="118" /><line x1="92" y1="74" x2="92" y2="118" /><line x1="112" y1="74" x2="112" y2="118" /><line x1="132" y1="74" x2="132" y2="118" />
          <line x1="34" y1="118" x2="156" y2="118" />
          <polyline points="185,80 230,62 275,80" /><line x1="182" y1="84" x2="278" y2="84" />
          <line x1="196" y1="84" x2="196" y2="118" /><line x1="216" y1="84" x2="216" y2="118" /><line x1="236" y1="84" x2="236" y2="118" /><line x1="256" y1="84" x2="256" y2="118" />
          <line x1="180" y1="118" x2="280" y2="118" />
          <polyline points="300,90 330,77 360,90" /><line x1="298" y1="93" x2="362" y2="93" />
          <line x1="310" y1="93" x2="310" y2="118" /><line x1="330" y1="93" x2="330" y2="118" /><line x1="350" y1="93" x2="350" y2="118" />
          <polyline points="392,93 416,81 440,93" /><line x1="390" y1="96" x2="442" y2="96" />
          <line x1="400" y1="96" x2="400" y2="118" /><line x1="420" y1="96" x2="420" y2="118" />
          <line x1="475" y1="100" x2="600" y2="100" />
          <line x1="475" y1="100" x2="475" y2="120" /><line x1="500" y1="100" x2="500" y2="120" /><line x1="525" y1="100" x2="525" y2="120" /><line x1="550" y1="100" x2="550" y2="120" /><line x1="575" y1="100" x2="575" y2="120" /><line x1="600" y1="100" x2="600" y2="120" />
          <path d="M475,108 A12 12 0 0 1 500,108" /><path d="M500,108 A12 12 0 0 1 525,108" /><path d="M525,108 A12 12 0 0 1 550,108" /><path d="M550,108 A12 12 0 0 1 575,108" /><path d="M575,108 A12 12 0 0 1 600,108" />
          <line x1="0" y1="120" x2="620" y2="120" />
        </symbol>
        <symbol id="t-forum" viewBox="0 0 620 240">
          <line x1="0" y1="150" x2="300" y2="150" /><line x1="0" y1="162" x2="286" y2="162" />
          <polyline points="60,70 150,44 240,70" /><line x1="56" y1="74" x2="244" y2="74" /><line x1="56" y1="82" x2="244" y2="82" />
          <line x1="72" y1="82" x2="72" y2="146" /><line x1="96" y1="82" x2="96" y2="146" /><line x1="120" y1="82" x2="120" y2="146" /><line x1="144" y1="82" x2="144" y2="146" /><line x1="168" y1="82" x2="168" y2="146" /><line x1="192" y1="82" x2="192" y2="146" /><line x1="216" y1="82" x2="216" y2="146" />
          <line x1="64" y1="146" x2="236" y2="146" />
          <line x1="175" y1="238" x2="430" y2="150" /><line x1="560" y1="238" x2="452" y2="150" />
          <line x1="300" y1="190" x2="492" y2="190" /><line x1="270" y1="214" x2="520" y2="214" /><line x1="240" y1="236" x2="548" y2="236" />
          <line x1="500" y1="118" x2="500" y2="150" /><line x1="494" y1="116" x2="506" y2="116" /><line x1="535" y1="124" x2="535" y2="150" /><line x1="529" y1="122" x2="541" y2="122" />
        </symbol>
        <symbol id="nyx-mark" viewBox="0 0 120 120">
          <clipPath id="hor-clip"><rect x="0" y="0" width="120" height="66" /></clipPath>
          <circle cx="60" cy="60" r="36" fill="currentColor" clipPath="url(#hor-clip)" />
          <rect x="18" y="66" width="84" height="4" fill="currentColor" />
          <rect x="18" y="78" width="60" height="4" fill="currentColor" opacity="0.5" />
        </symbol>
      </svg>

      {/* ===================== NAV ===================== */}
      <nav className={`nav ${scrolled ? "scrolled" : ""}`} id="nav">
        <Link className="lock" href="/">
          <svg className="mark" viewBox="0 0 120 120">
            <use href="#nyx-mark" />
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

      {/* ===================== HERO — OBSIDIAN CHAMBER ===================== */}
      <header className="hero-obsidian">

        {/* Layer 1: architectural form — image provides structure, material system provides identity */}
        <div className="hero-chamber-img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/hero-columns.png" alt="" aria-hidden="true" fetchPriority="high" />
        </div>

        {/* Layer 2: obsidian base tint */}
        <div className="hero-obsidian-tint" aria-hidden="true" />

        {/* Layer 3: directional beam — WebGL SideRays animation inside the color-dodge container */}
        <div className="hero-beam" aria-hidden="true">
          <SideRays
            speed={2.0}
            rayColor1="#dbb885"
            rayColor2="#96c8ff"
            intensity={2.2}
            spread={3.5}
            origin="top-right"
            tilt={0}
            saturation={1.2}
            blend={0.5}
            falloff={1.1}
            opacity={0.9}
          />
        </div>

        {/* Layer 4: depth system — vignette + pillar-wall junction shadows */}
        <div className="hero-depth" aria-hidden="true" />

        {/* Layer 5: stone surface bands — wall face has mass */}
        <div className="hero-stone-bands" aria-hidden="true" />

        {/* Layer 6: gold veins — geological, discovered not designed */}
        <div className="hero-vein" aria-hidden="true" />

        {/* Layer 7: roughness grain — nearly invisible, supports material */}
        <div className="hero-grain" aria-hidden="true" />


        {/* Layer 9: content — engraved into the chamber face */}
        <div className="hero-obsidian-content">
          <div ref={placeholderRef} style={{ width: 120, height: 120, display: "inline-block", opacity: mounted ? 0 : 1 }}>
            <EngravedLogo />
          </div>
          <div
            ref={heroWordmarkRef}
            className="hero-wordmark"
            aria-hidden="true"
            style={{ opacity: mounted ? 0 : 1 }}
          >
            darknyx
          </div>
          <EngravedText />
          <div className="hero-obsidian-cta">
            <a className="btn" href="#features">
              Explore the Protocol <span className="arr">→</span>
            </a>
          </div>
        </div>

        {/* Basalt sill — PILLAR → SILL → PILLAR, the foundation of the institution */}
        <div className="hero-sill" aria-hidden="true" />

      </header>

      <div className="section-divider" style={{ background: "var(--ink)" }}>
        <div className="line"></div>
        <svg className="divider-mark" viewBox="0 0 120 120">
          <use href="#nyx-mark" />
        </svg>
        <div className="line"></div>
      </div>

      <div id="features">
        <HorizontalScroll containerRef={horizontalScrollRef} darkPoolSlotRef={darkPoolSlotRef} />
      </div>











      {/* ===== ROADMAP (STICKY SPLIT SECTION) ===== */}
      <section className="roadmap-section">
        <div className="roadmap-inner wrap">
          {/* Left Column (Sticky Panel - 50% width) */}
          <div className="roadmap-left">
            <div className="roadmap-sticky-box">
              <div 
                ref={roadmapPlaceholderRef} 
                className="roadmap-logo-container"
                style={{ 
                  width: "clamp(72px, 8vw, 96px)", 
                  height: "clamp(72px, 8vw, 96px)",
                  position: "relative"
                }} 
              >
                <svg 
                  className="roadmap-logo" 
                  viewBox="0 0 120 120"
                  style={{ 
                    width: "100%", 
                    height: "100%", 
                    color: "var(--cobalt)",
                    opacity: showRoadmapLogo ? 1 : 0,
                    transition: "opacity 0.15s ease"
                  }}
                >
                  <use href="#nyx-mark" />
                </svg>
              </div>
              <h2 className="roadmap-title">Roadmap</h2>
            </div>
          </div>

          {/* Right Column (Scrolling Phases - 50% width) */}
          <div className="roadmap-right">
            <div className="roadmap-phase-item" data-phase="P1">
              <div className="roadmap-phase-header">
                <span className="roadmap-phase-num">PHASE 01</span>
                <span className="roadmap-status-badge complete">Active</span>
              </div>
              <h3 className="roadmap-phase-title">Stabilize</h3>
              <p className="roadmap-phase-text">
                Lock the API surface. No breaking changes past this point.
              </p>
            </div>

            <div className="roadmap-phase-item" data-phase="P2">
              <div className="roadmap-phase-header">
                <span className="roadmap-phase-num">PHASE 02</span>
                <span className="roadmap-status-badge in-progress">In Progress</span>
              </div>
              <h3 className="roadmap-phase-title">Attested Execution</h3>
              <p className="roadmap-phase-text">
                Validate the matching engine on attested H200 GPU hardware. First production proof that confidential compute scales beyond CPU enclaves.
              </p>
            </div>

            <div className="roadmap-phase-item" data-phase="P3">
              <div className="roadmap-phase-header">
                <span className="roadmap-phase-num">PHASE 03</span>
                <span className="roadmap-status-badge planned">Planned</span>
              </div>
              <h3 className="roadmap-phase-title">Client Wallet & Relayer</h3>
              <p className="roadmap-phase-text">
                Ship the first production-grade client-side wallet relayer. Full ZK proof generation on the client, no operator key exposure.
              </p>
            </div>

            <div className="roadmap-phase-item" data-phase="P4">
              <div className="roadmap-phase-header">
                <span className="roadmap-phase-num">PHASE 04</span>
                <span className="roadmap-status-badge planned">Planned</span>
              </div>
              <h3 className="roadmap-phase-title">Scalable Settlement Layer</h3>
              <p className="roadmap-phase-text">
                Migrate fills to a hybrid SSE indexer. Partial fill notes indexed per-account on-chain. TEE scope narrows to order ingestion and matching only — settlement becomes stateless and horizontally scalable.
              </p>
            </div>
          </div>

          {/* Central Vertical Line (Absolutely positioned at 50%) */}
          <div className="roadmap-center-line" aria-hidden="true">
            <div className="roadmap-badge-sticky">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={activePhase}
                  initial={{ opacity: 0, y: 12, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.9 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="roadmap-badge-text"
                >
                  {activePhase}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider">
        <div className="line"></div>
        <svg className="divider-mark" viewBox="0 0 120 120">
          <use href="#nyx-mark" />
        </svg>
        <div className="line"></div>
      </div>

      <DocsGateway />

      <div className="section-divider">
        <div className="line"></div>
        <svg className="divider-mark" viewBox="0 0 120 120">
          <use href="#nyx-mark" />
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
            <use href="#nyx-mark" />
          </svg>
          <p className="eyebrow" style={{ fontSize: "16px", letterSpacing: "0.2em" }}>Privacy without sacrificing auditability</p>
          <div className="footer-cta">
            <span className="btn ghost status" style={{ display: "inline-flex", alignItems: "center" }}>
              <span className="pdot"></span>Private beta soon
            </span>
          </div>
        </div>

      </footer>

      <div className="footer-foot">
        <div className="row">
          <div className="lock">
            <svg className="mark" viewBox="0 0 120 120">
              <use href="#nyx-mark" />
            </svg>
            <b>darknyx</b>
            <span className="tagline" style={{ marginLeft: "14px" }}>
              Settle in the dark · Prove in the light
            </span>
          </div>
          <div className="fl">
            <Link href="/docs">Docs</Link>
            <Link href="/docs/how-it-works/trade-flow">Learn how it works</Link>
            <a href="https://x.com/DarkNyxProtocol" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="X (Twitter)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* <a href="https://github.com/skysail-labs/darknyx" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="GitHub">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              </a> */}
          </div>
        </div>
      </div>
      {mounted && <MorphingLogo placeholderRef={placeholderRef} roadmapPlaceholderRef={roadmapPlaceholderRef} />}
      {mounted && (
        <MorphingWordmark
          sourceRef={heroWordmarkRef}
          targetRef={darkPoolSlotRef}
          sectionRef={horizontalScrollRef}
        />
      )}

      <AnimatePresence>
        {initializing && (
          <motion.div
            key="init-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "all",
            }}
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.6, 1] }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              style={{
                fontFamily: "var(--mono)",
                fontSize: "11px",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "var(--cobalt)",
              }}
            >
              initializing
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
