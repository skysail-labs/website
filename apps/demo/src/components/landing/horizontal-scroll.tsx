"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { RefObject, useRef } from "react";
import { Hyperspeed } from "./hyperspeed";
import { LaserFlow } from "./laser-flow";

interface HorizontalScrollProps {
  containerRef?: RefObject<HTMLDivElement | null>;
  darkPoolSlotRef?: RefObject<HTMLSpanElement | null>;
}

export function HorizontalScroll({ containerRef: externalContainerRef, darkPoolSlotRef }: HorizontalScrollProps) {
  const internalContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = externalContainerRef ?? internalContainerRef;
  const [activeTab, setActiveTab] = useState("matching");

  // We track the scroll of the outer container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Horizontal translation over 3 panels (0%, -33.3333%, -66.6667%)
  const x = useTransform(
    scrollYProgress,
    [0, 0.20, 0.70, 0.82, 1.0],
    ["0%", "-33.3333%", "-33.3333%", "-66.6667%", "-66.6667%"]
  );

  // Synchronized fade-out for Panel 1 text
  const panel1Opacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  // Vertical scroll translation of Panel 2's right column content
  const verticalY = useTransform(
    scrollYProgress,
    [0.24, 0.66],
    ["0%", "-50%"]
  );

  // Dynamic styling for bottom-left indicators (Tab 1: How It Works, Tab 2: Trust Model)
  const tab1Color = useTransform(
    scrollYProgress,
    [0.20, 0.42, 0.48, 0.70],
    ["#dbb885", "#dbb885", "#f3effc", "#f3effc"]
  );
  const tab1Opacity = useTransform(
    scrollYProgress,
    [0.20, 0.42, 0.48, 0.70],
    [1, 1, 0.4, 0.4]
  );
  const tab1LineWidth = useTransform(
    scrollYProgress,
    [0.20, 0.42, 0.48, 0.70],
    ["100px", "100px", "40px", "40px"]
  );

  const tab2Color = useTransform(
    scrollYProgress,
    [0.20, 0.42, 0.48, 0.70],
    ["#f3effc", "#f3effc", "#dbb885", "#dbb885"]
  );
  const tab2Opacity = useTransform(
    scrollYProgress,
    [0.20, 0.42, 0.48, 0.70],
    [0.4, 0.4, 1, 1]
  );
  const tab2LineWidth = useTransform(
    scrollYProgress,
    [0.20, 0.42, 0.48, 0.70],
    ["40px", "40px", "100px", "100px"]
  );

  // Dynamic cross-fade for left-column titles and descriptions
  const content1Opacity = useTransform(
    scrollYProgress,
    [0.20, 0.42, 0.48, 0.70],
    [1, 1, 0, 0]
  );
  const content2Opacity = useTransform(
    scrollYProgress,
    [0.20, 0.42, 0.48, 0.70],
    [0, 0, 1, 1]
  );

  const hyperspeedOptions = useMemo(() => ({
    distortion: 'turbulentDistortion',
    length: 400,
    roadWidth: 6.5,
    islandWidth: 0.3,
    lanesPerRoad: 2,
    fov: 90,
    fovSpeedUp: 150,
    speedUp: 2,
    carLightsFade: 0.4,
    totalSideLightSticks: 10,
    lightPairsPerRoadWay: 30,
    shoulderLinesWidthPercentage: 0.05,
    brokenLinesWidthPercentage: 0.1,
    brokenLinesLengthPercentage: 0.5,
    lightStickWidth: [0.04, 0.15] as [number, number],
    lightStickHeight: [0.6, 1.1] as [number, number],
    movingAwaySpeed: [60, 80] as [number, number],
    movingCloserSpeed: [-120, -160] as [number, number],
    carLightsLength: [10, 60] as [number, number],
    carLightsRadius: [0.025, 0.08] as [number, number],
    carWidthPercentage: [0.15, 0.3] as [number, number],
    carShiftX: [-0.3, 0.3] as [number, number],
    carFloorSeparation: [0, 2] as [number, number],
    colors: {
      roadColor: 0x0a0a0a,
      islandColor: 0x0a0a0a,
      background: 0x0a0a0a,
      shoulderLines: 0x1a1a1a,
      brokenLines: 0x1a1a1a,
      leftCars: [0xc99e55, 0xfcecd7, 0xa68249],
      rightCars: [0xd856bf, 0x9d4edd, 0xfcecd7],
      sticks: 0xc99e55
    }
  }), []);

  // Entrance animations for panels
  const panelVariants: Variants = {
    hidden: { opacity: 0, y: 25, scale: 0.99 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as const,
        staggerChildren: 0.06
      }
    }
  };

  const childVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }
    }
  };

  return (
    <div
      ref={containerRef}
      className="hscroll-outer"
    >
      <div className="hscroll-sticky">
        <motion.div
          className="hscroll-track"
          style={{ x }}
        >
          {/* Panel 1 */}
          <div className="hscroll-panel" id="third-option" style={{ position: "relative" }}>
            <motion.div
              className="hscroll-panel-inner"
              variants={panelVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.25 }}
            >
              <motion.div className="panel-split-left" style={{ opacity: panel1Opacity }}>
                <motion.div variants={childVariants} className="hscroll-badge">Concept</motion.div>
                <motion.h2
                  variants={childVariants}
                  className="hscroll-title"
                  aria-label="A dark pool you don't have to trust."
                >
                  A <span ref={darkPoolSlotRef} className="hscroll-morph-slot" aria-hidden="true">dark pool</span> you don&apos;t have to trust.
                </motion.h2>
                <motion.p variants={childVariants} className="hscroll-lede">
                  Decoupled logic executing locally,<br />
                  matching confidentially,<br />
                  and settling on-chain.
                </motion.p>
              </motion.div>
            </motion.div>
            <div className="panel-split-right">
              <Hyperspeed effectOptions={hyperspeedOptions} />
            </div>
          </div>

          {/* Panel 2: Monad-style Split Section */}
          <div className="hscroll-panel" id="how-it-works-split" style={{ position: "relative" }}>
            <div className="monad-layout">
              {/* Left Column */}
              <div className="monad-left-col">
                {/* Upper Left Box */}
                <div className="monad-upper-left">
                  <div className="monad-badge-wrap">
                    <motion.span className="hscroll-badge" style={{ opacity: content1Opacity, position: "absolute", left: 0, top: 0 }}>HOW IT WORKS</motion.span>
                    <motion.span className="hscroll-badge" style={{ opacity: content2Opacity, position: "absolute", left: 0, top: 0 }}>TRUST MODEL</motion.span>
                  </div>
                  
                  <div style={{ position: "relative", flex: 1, marginTop: "24px" }}>
                    <motion.div style={{ opacity: content1Opacity, position: "absolute", top: 0, left: 0, right: 0 }}>
                      <h2 className="monad-main-title">
                        From private intent to verified settlement.
                      </h2>
                      <p className="monad-main-desc" style={{ marginTop: "16px" }}>
                        You sign custody actions with your wallet and orders with a separate trading key. The sensitive path stays private inside the enclave; the money path stays verifiable on-chain.
                      </p>
                    </motion.div>
                    
                    <motion.div style={{ opacity: content2Opacity, position: "absolute", top: 0, left: 0, right: 0 }}>
                      <h2 className="monad-main-title">
                        No custodial black box.
                      </h2>
                      <p className="monad-main-desc" style={{ marginTop: "16px" }}>
                        Public order books leak every intention to bots and competitors. Off-chain dark pools take your custody. Darknyx is neither — orders meet inside an attested enclave the operator cannot read, and funds only ever move under a proof verified on Solana.
                      </p>
                    </motion.div>
                  </div>
                  
                  <div className="monad-cta-wrap">
                    <Link href="/docs" className="btn ghost">
                      Read The Documentation <span className="arr">→</span>
                    </Link>
                  </div>
                </div>

                {/* Bottom Left Box */}
                <div className="monad-bottom-left">
                  <motion.div className="monad-tab" style={{ color: tab1Color, opacity: tab1Opacity }}>
                    <span className="tab-num">1</span>
                    <motion.div className="tab-line" style={{ width: tab1LineWidth, backgroundColor: tab1Color, flexGrow: 0 }} />
                    <span className="tab-text">HOW IT WORKS</span>
                  </motion.div>
                  
                  <motion.div className="monad-tab" style={{ color: tab2Color, opacity: tab2Opacity }}>
                    <span className="tab-num">2</span>
                    <motion.div className="tab-line" style={{ width: tab2LineWidth, backgroundColor: tab2Color, flexGrow: 0 }} />
                    <span className="tab-text">TRUST MODEL</span>
                  </motion.div>
                </div>
              </div>

              {/* Right Column */}
              <div className="monad-right-col">
                {/* Corner Frame Accents */}
                <div className="monad-corner-frame">
                  <div className="monad-corner-frame-inner" />
                </div>
                
                {/* Aligned Scrolling Viewport */}
                <div className="monad-right-inner-viewport">
                  <motion.div className="monad-vertical-scroll-content" style={{ y: verticalY }}>
                    {/* Section 1: How It Works content */}
                    <div className="monad-vertical-section">
                      <div className="monad-step-card-stack">
                        {/* Step 1 */}
                        <div className="monad-step-card">
                          <div className="m-card-header">
                            <span className="m-card-label">FUND PRIVATELY</span>
                            <span className="m-card-num">01</span>
                          </div>
                          <h3>Deposit into the vault.</h3>
                          <p>Funds become private note commitments instead of a public, trackable trading balance.</p>
                        </div>
                        {/* Step 2 */}
                        <div className="monad-step-card">
                          <div className="m-card-header">
                            <span className="m-card-label">MATCH IN BATCHES</span>
                            <span className="m-card-num">02</span>
                          </div>
                          <h3>Orders clear in the dark.</h3>
                          <p>Signed intent meets inside an attested TDX enclave. Compatible orders clear every two seconds at one uniform price.</p>
                        </div>
                        {/* Step 3 */}
                        <div className="monad-step-card">
                          <div className="m-card-header">
                            <span className="m-card-label">SETTLE ON-CHAIN</span>
                            <span className="m-card-num">03</span>
                          </div>
                          <h3>Fills land verifiably.</h3>
                          <p>Settlement posts to Solana with proof material and the registered TEE signature. Withdrawals stay user-controlled.</p>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Trust Model content */}
                    <div className="monad-vertical-section">
                      <div className="monad-step-card-stack">
                        {/* Step 1 */}
                        <div className="monad-step-card">
                          <div className="m-card-header">
                            <span className="m-card-label">PRIVACY</span>
                            <span className="m-card-num">01</span>
                          </div>
                          <h3>Orders stay dark until they clear.</h3>
                          <p>Side, size, and limit price are visible only to the enclave — never in a mempool, log, or account an observer can read before settlement.</p>
                        </div>
                        {/* Step 2 */}
                        <div className="monad-step-card">
                          <div className="m-card-header">
                            <span className="m-card-label">CUSTODY</span>
                            <span className="m-card-num">02</span>
                          </div>
                          <h3>Custody risk is zero.</h3>
                          <p>Funds rest in a non-upgradeable Solana vault. The matcher can propose fills, but only your zero-knowledge proof can move assets out.</p>
                        </div>
                        {/* Step 3 */}
                        <div className="monad-step-card">
                          <div className="m-card-header">
                            <span className="m-card-label">VERIFIABILITY</span>
                            <span className="m-card-num">03</span>
                          </div>
                          <h3>Settlement can be checked.</h3>
                          <p>Every fill lands on-chain bound to a validity proof and the attested TEE signature — auditable by anyone, without exposing your strategy.</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 3: Slogan */}
          <div className="hscroll-panel" id="vision" style={{ position: "relative" }}>
            {/* Laser flow background overlay */}
            <div className="laser-flow-overlay">
              <LaserFlow
                color="#c99e55" // Gold theme accent
                horizontalBeamOffset={0.25} // Shift to the right
                verticalBeamOffset={-0.12} // Align flare on the top edge of bottom container
                wispIntensity={7.0}
                fogIntensity={0.6}
                flowSpeed={0.35}
                verticalSizing={2.0}
                horizontalSizing={0.6}
              />
            </div>

            {/* Dotted grid card at the bottom */}
            <div className="panel-bottom-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "48px 24px" }}>
              <span className="hscroll-badge" style={{ marginBottom: "16px" }}>THE MISSING LAYER</span>
              <h2 className="panel-bottom-title" style={{ fontSize: "clamp(24px, 3.5vw, 44px)", textAlign: "center", maxWidth: "800px", margin: 0, lineHeight: 1.2 }}>
                The private execution layer Web3 has been waiting for.
              </h2>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
