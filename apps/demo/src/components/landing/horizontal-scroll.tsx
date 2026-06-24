"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { RefObject, useRef } from "react";
import { Hyperspeed } from "./hyperspeed";

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

  // Since we have exactly 3 panels, we translate by 200vw (which is 66.6667% of a 300vw track)
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-66.6667%"]);

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
      leftCars: [0xd6be8b, 0xffffff, 0xe5d0a6],
      rightCars: [0xd856bf, 0x9d4edd, 0xffffff],
      sticks: 0xd6be8b
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
              <div className="panel-split-left">
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
              </div>
            </motion.div>
            <div className="panel-split-right">
              <Hyperspeed effectOptions={hyperspeedOptions} />
            </div>
          </div>

          {/* Panel 2 */}
          <div className="hscroll-panel" id="architecture">
            <motion.div
              className="hscroll-panel-inner"
              variants={panelVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.25 }}
            >
              <motion.div variants={childVariants} className="hscroll-badge">Architecture</motion.div>
              <motion.h2 variants={childVariants} className="hscroll-title">Three layers. One chain of trust.</motion.h2>
              <motion.p variants={childVariants} className="hscroll-lede">
                Decoupled logic executing locally,<br />
                matching confidentially,<br />
                and settling on-chain.
              </motion.p>
              <motion.div
                className="hscroll-stack-flow"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.06 } }
                }}
                onMouseMove={(e) => {
                  const cards = e.currentTarget.getElementsByClassName('hscroll-stack-card');
                  for (let i = 0; i < cards.length; i++) {
                    const card = cards[i] as HTMLElement;
                    const rect = card.getBoundingClientRect();
                    card.style.setProperty('--x', `${e.clientX - rect.left}px`);
                    card.style.setProperty('--y', `${e.clientY - rect.top}px`);
                  }
                }}
              >
                <motion.div
                  variants={childVariants}
                  className={`hscroll-stack-card${activeTab === "client" ? " active" : ""}`}
                  onMouseEnter={() => setActiveTab("client")}
                >
                  <span className="num">Layer 1</span>
                  <h4>Local SDK</h4>
                  <p>Generates client-side zero-knowledge spend proofs and verifies enclaves locally.</p>
                </motion.div>
                <motion.div
                  variants={childVariants}
                  className={`hscroll-stack-card${activeTab === "matching" ? " active" : ""}`}
                  onMouseEnter={() => setActiveTab("matching")}
                >
                  <span className="num">Layer 2</span>
                  <h4>TEE Matcher</h4>
                  <p>Executes uniform-clearing-price matches inside attested Intel TDX enclaves.</p>
                </motion.div>
                <motion.div
                  variants={childVariants}
                  className={`hscroll-stack-card${activeTab === "vault" ? " active" : ""}`}
                  onMouseEnter={() => setActiveTab("vault")}
                >
                  <span className="num">Layer 3</span>
                  <h4>On-Chain Vault</h4>
                  <p>Smart contracts on Solana enforcing balance preservation and verifying proofs.</p>
                </motion.div>
              </motion.div>

            </motion.div>
          </div>

          {/* Panel 3 */}
          <div className="hscroll-panel" id="how">
            <motion.div
              className="hscroll-panel-inner"
              variants={panelVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.25 }}
            >
              <motion.div variants={childVariants} className="hscroll-badge">Lifecycle</motion.div>
              <motion.h2 variants={childVariants} className="hscroll-title">From intent to verified settlement.</motion.h2>
              <motion.p variants={childVariants} className="hscroll-lede">
                A simple three-step lifecycle ensures execution privacy and cryptographic security.
              </motion.p>
              <motion.div
                className="hscroll-pipeline"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.08 } }
                }}
              >
                <motion.div variants={childVariants} className="hscroll-pipeline-step">
                  <span className="step-num">01</span>
                  <h4>Deposit</h4>
                  <p>Lock assets into the Solana vault to receive encrypted private commitments.</p>
                </motion.div>
                <div className="hscroll-pipeline-arrow">→</div>
                <motion.div variants={childVariants} className="hscroll-pipeline-step">
                  <span className="step-num">02</span>
                  <h4>Match</h4>
                  <p>Batch orders clear confidentially inside enclaves at a uniform clearing price.</p>
                </motion.div>
                <div className="hscroll-pipeline-arrow">→</div>
                <motion.div variants={childVariants} className="hscroll-pipeline-step">
                  <span className="step-num">03</span>
                  <h4>Settle</h4>
                  <p>Matches post on-chain bound to zero-knowledge validity proofs.</p>
                </motion.div>
              </motion.div>
              <motion.div variants={childVariants} className="hscroll-action">
                <Link className="btn ghost" href="/docs/category/how-it-works">
                  Read Specifications <span className="arr">→</span>
                </Link>
              </motion.div>
            </motion.div>
          </div>



        </motion.div>
      </div>
    </div>
  );
}
