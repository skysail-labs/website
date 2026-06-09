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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
        <div className="hero-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/final.png" alt="Ancient Greek city in white line-art under a starfield" />
        </div>
        <div className="hero-scrim"></div>
        <div className="hero-glow"></div>

        <div className="hero-inner">
          <div className="hero-copy">
            <svg className="mark glow rise d1" viewBox="0 0 120 120">
              <use href="#nyx-mark"/>
            </svg>
            <p className="kicker rise d1">
              <span className="dot"></span>Darkpool protocol · Solana
            </p>
            <h1 className="display h-xl rise d2" style={{ marginTop: "18px" }}>
              <span className="tag-lo">Settle in the dark.</span>
              <span className="tag-hi">Prove in the light.</span>
            </h1>
            <p className="lede rise d3">
              A privacy-preserving order book where intent is hidden inside attested hardware and every fill settles trustlessly on Solana — verified, never trusted.
            </p>
            <div className="hero-actions rise d4">
              <Link className="btn" href="/docs">
                How Darknyx works <span className="arr">→</span>
              </Link>
              <a className="btn ghost" href="#third-option">
                The idea
              </a>
            </div>
          </div>
        </div>

        <div className="hero-meta rise d5">
          <div className="net">
            Network · <b>Solana</b>
            <br />
            Matching · <b>Intel TDX</b>
            <br />
            Status · <b>TDX rollout</b>
          </div>
          <a className="scroll-cue" href="#third-option">
            <span>Scroll</span>
            <span className="line"></span>
          </a>
        </div>
      </header>

      {/* ===== crest: faint skyline cresting the horizon ===== */}
      <div className="crest">
        <Starfield count={40} />
        <svg className="scene-art ghost" viewBox="0 0 620 150" preserveAspectRatio="xMidYMax slice">
          <use href="#t-skyline"/>
        </svg>
      </div>

      {/* ===================== SECTION 1 — THE THIRD OPTION ===================== */}
      <section className="section" id="third-option">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">The third option</p>
            <h2 className="display h-lg" style={{ marginTop: "18px" }}>
              A dark pool you don't
              <br />
              have to trust.
            </h2>
            <p className="lede">
              Public order books leak every intention to bots and competitors. Off-chain dark pools take your custody. Darknyx is neither — orders meet inside an attested enclave the operator cannot read, and funds only ever move under a proof verified on Solana.
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
                Side, size, and limit price are visible only to the enclave — never in a mempool, log, or account an observer can read before settlement.
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
                Every fill lands on-chain bound to a validity proof and the attested TEE signature — auditable by anyone, without exposing your strategy.
              </p>
              <div className="rule"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== crest: temple cresting the horizon ===== */}
      <div className="crest">
        <Starfield count={46} />
        <svg className="scene-art ghost" viewBox="0 0 460 240" preserveAspectRatio="xMidYMax slice">
          <use href="#t-grand"/>
        </svg>
      </div>

      {/* ===================== SECTION 2 — HOW IT WORKS ===================== */}
      <section className="section" id="how">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">How it works</p>
            <h2 className="display h-lg" style={{ marginTop: "18px" }}>
              From private intent
              <br />
              to verified settlement.
            </h2>
            <p className="lede">
              You sign custody actions with your wallet and orders with a separate trading key. The sensitive path stays private inside the enclave; the money path stays verifiable on-chain.
            </p>
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

          <div style={{ marginTop: "clamp(40px,6vw,60px)" }}>
            <Link className="btn ghost" href="/docs/architecture-overview">
              Read the architecture <span className="arr">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="footer">
        <div className="scene-wrap">
          <Starfield count={70} />
          <svg className="scene-art faint" viewBox="0 0 620 240" preserveAspectRatio="xMidYMax slice">
            <use href="#t-forum"/>
          </svg>
        </div>

        <div className="footer-inner wrap">
          <svg className="mark" viewBox="0 0 120 120">
            <use href="#nyx-mark"/>
          </svg>
          <p className="eyebrow">Privacy without sacrificing auditability</p>
          <h2 className="display h-md" style={{ marginTop: "16px", maxWidth: "18ch", marginLeft: "auto", marginRight: "auto" }}>
            Start where the homework is.
          </h2>
          <p className="lede">
            The docs lay out the trust model, the settlement pipeline, the cryptography, and honest comparisons against every comparable venue.
          </p>
          <div className="footer-cta">
            <Link className="btn" href="/docs">
              Read the docs <span className="arr">→</span>
            </Link>
          </div>
        </div>

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
      </footer>
    </>
  );
}
