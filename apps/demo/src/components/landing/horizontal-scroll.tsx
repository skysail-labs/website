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

  // Horizontal translation completes at 0.5, locking Panel 2 on screen
  const x = useTransform(scrollYProgress, [0, 0.5, 1], ["0%", "-50%", "-50%"]);

  // Vertical merge animation: cards slide up together from 0.5 to 0.7, lock from 0.7 to 0.95, and then unstick
  const mergeY = useTransform(
    scrollYProgress,
    [0, 0.5, 0.7, 0.95, 1],
    ["0px", "0px", "-330px", "-330px", "-330px"]
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
          <div className="hscroll-panel" id="architecture" style={{ position: "relative" }}>
            {/* Laser flow background overlay for Panel 2 only */}
            <div className="laser-flow-overlay">
              <LaserFlow
                color="#d6be8b" // Gold theme accent
                horizontalBeamOffset={0.25} // Shift to the right
                verticalBeamOffset={-0.12} // Align flare on the top edge of bottom container (38% height box)
                wispIntensity={7.0}
                fogIntensity={0.6}
                flowSpeed={0.35}
                verticalSizing={2.0}
                horizontalSizing={0.6}
              />
            </div>

            {/* Dotted grid card at the bottom */}
            <motion.div className="panel-bottom-card" style={{ y: mergeY }}>
              {/* Row of 3 step cards inside the main box */}
              <div className="panel-inner-cards-row">
                <div className="small-step-card">
                  <span className="step-num">01</span>
                  <h3>Orders stay dark until they clear</h3>
                  <p>Side, size, and limit price can never be read before settlement.</p>
                </div>

                <div className="small-step-card">
                  <span className="step-num">02</span>
                  <h3>Custody risk is zero</h3>
                  <p>Funds stay in a non-upgradeable Solana vault, only your ZK proof can unlock them.</p>
                </div>

                <div className="small-step-card">
                  <span className="step-num">03</span>
                  <h3>Settlement can be checked</h3>
                  <p>Every settlement includes a ZK proof and TEE signature—publicly verifiable, privately executed.</p>
                </div>
              </div>

              {/* Bottom text strip spanning all 3 cards width */}
              <div className="panel-bottom-strip">
                <span className="hscroll-badge">Trust Model</span>
                <h2 className="panel-bottom-title">Three layers, one chain of trust</h2>
                <p className="panel-bottom-lede">
                  Whatever needs to be trusted goes on-chain; whatever needs to be private goes in-TEE; whatever must remain a secret stays on your device.
                </p>
              </div>
            </motion.div>

            {/* Inverted card positioned below the viewport (top: 100%) */}
            <motion.div className="panel-top-card-inverted" style={{ y: mergeY }}>
              {/* Top text strip spanning all 3 cards width */}
              <div className="panel-top-strip">
                <span className="hscroll-badge">Flow</span>
                <h2 className="panel-bottom-title" style={{ margin: '0 0 6px 0' }}>
                  From private intent to verified settlement.
                </h2>
                <p className="panel-bottom-lede">
                  You sign custody actions with your wallet and orders with a separate trading key. The sensitive path stays private inside the enclave; the money path stays verifiable on-chain.
                </p>
              </div>

              {/* Row of 3 step cards inside the main box */}
              <div className="panel-inner-cards-row">
                <div className="small-step-card-inverted">
                  <div className="card-badge-wrap">
                    <span className="card-badge">SOLANA VAULT</span>
                  </div>
                  <h3>FUND PRIVATELY</h3>
                  <p>Deposit into the vault.</p>
                </div>

                <div className="small-step-card-inverted">
                  <div className="card-badge-wrap">
                    <span className="card-badge">INTEL TDX · FBA</span>
                  </div>
                  <h3>MATCH IN BATCHES</h3>
                  <p>Orders clear in the dark.</p>
                </div>

                <div className="small-step-card-inverted">
                  <div className="card-badge-wrap">
                    <span className="card-badge">ZK PROOFS</span>
                  </div>
                  <h3>SETTLE ON-CHAIN</h3>
                  <p>Fills land verifiably.</p>
                </div>
              </div>
            </motion.div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
