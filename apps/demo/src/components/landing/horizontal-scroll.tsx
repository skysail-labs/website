"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { RefObject, useRef } from "react";

interface HorizontalScrollProps {
  containerRef?: RefObject<HTMLDivElement | null>;
  darkPoolSlotRef?: RefObject<HTMLSpanElement | null>;
}

export function HorizontalScroll({ containerRef: externalContainerRef, darkPoolSlotRef }: HorizontalScrollProps) {
  const internalContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = externalContainerRef ?? internalContainerRef;
  const [activeTab, setActiveTab] = useState("custody");

  // We track the scroll of the outer container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Since we have exactly 3 panels, we translate by 200vw (which is 66.6667% of a 300vw track)
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-66.6667%"]);

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
          <div className="hscroll-panel" id="third-option">
            <motion.div 
              className="hscroll-panel-inner"
              variants={panelVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.25 }}
            >
              <motion.div variants={childVariants} className="hscroll-badge">The third option</motion.div>
              <motion.h2
                variants={childVariants}
                className="hscroll-title"
                aria-label="A dark pool you don't have to trust."
              >
                A <span ref={darkPoolSlotRef} className="hscroll-morph-slot" aria-hidden="true">dark pool</span> you don&apos;t have to trust.
              </motion.h2>
              <motion.p variants={childVariants} className="hscroll-lede">
                Traditional dark pools take custody. Public order books leak intentions. Darknyx is neither—private execution inside TEEs, trustless settlement on Solana.
              </motion.p>
              <motion.div 
                className="hscroll-pillars"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.06 } }
                }}
              >
                <motion.div variants={childVariants} className="hscroll-pillar">
                  <div className="hscroll-pillar-num">01</div>
                  <h3>Private execution</h3>
                  <p>Order intents are visible only inside the enclave—never exposed in a public mempool.</p>
                </motion.div>
                <motion.div variants={childVariants} className="hscroll-pillar">
                  <div className="hscroll-pillar-num">02</div>
                  <h3>Zero custody risk</h3>
                  <p>Assets remain locked in a Solana vault, controlled only by your zero-knowledge proofs.</p>
                </motion.div>
                <motion.div variants={childVariants} className="hscroll-pillar">
                  <div className="hscroll-pillar-num">03</div>
                  <h3>Public auditability</h3>
                  <p>Fills post to Solana bound to cryptographic proofs, fully verifiable by anyone.</p>
                </motion.div>
              </motion.div>
            </motion.div>
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
              <motion.div variants={childVariants} className="hscroll-badge">System design</motion.div>
              <motion.h2 variants={childVariants} className="hscroll-title">Three layers, one chain of trust.</motion.h2>
              <motion.p variants={childVariants} className="hscroll-lede">
                Sensitive data stays private on your device and inside the enclave; settlement remains fully public and secure on-chain.
              </motion.p>
              <motion.div variants={childVariants} className="hscroll-arch">
                <div className="hscroll-arch-tabs">
                  {(["custody", "matching", "client"] as const).map((tab, i) => (
                    <button key={tab}
                      className={`hscroll-arch-btn${activeTab === tab ? " active" : ""}`}
                      onClick={() => setActiveTab(tab)}
                      onMouseEnter={() => setActiveTab(tab)}
                    >
                      <span className="num">LAYER {i + 1}</span>
                      <span className="title">{tab === "custody" ? "Solana Vault" : tab === "matching" ? "TDX Matcher" : "Client SDK"}</span>
                    </button>
                  ))}
                </div>
                <div className="hscroll-arch-pane">
                  {activeTab === "custody" && (
                    <motion.div 
                      key="custody"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
                    >
                      <h3>On-Chain Solana Vault Program</h3>
                      <p>Non-upgradeable smart contracts enforcing balance preservation. Records commitments and nullifiers. No operator can touch funds without valid ZK spend proofs.</p>
                      <div className="hscroll-arch-features">
                        <div><span>Location</span><span>On-Chain (Solana L1)</span></div>
                        <div><span>Responsibility</span><span>Deposits, Withdrawals, Nullifiers</span></div>
                        <div><span>Trust Assumption</span><span>Cryptography + L1 Validators</span></div>
                      </div>
                    </motion.div>
                  )}
                  {activeTab === "matching" && (
                    <motion.div 
                      key="matching"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
                    >
                      <h3>In-TEE Private Matching Engine</h3>
                      <p>Uniform-clearing-price matches run in secure hardware enclaves (Intel TDX). Manages private order intakes and submits signed batch settlements directly to Solana.</p>
                      <div className="hscroll-arch-features">
                        <div><span>Location</span><span>Intel TDX Enclave</span></div>
                        <div><span>Responsibility</span><span>FBA Matching, Order Book Privacy</span></div>
                        <div><span>Trust Assumption</span><span>Intel TDX Hardware Attestation</span></div>
                      </div>
                    </motion.div>
                  )}
                  {activeTab === "client" && (
                    <motion.div 
                      key="client"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
                    >
                      <h3>Local Cryptographic Client (SDK)</h3>
                      <p>Generates client-side zero-knowledge spend proofs locally. Measures TEE attestation before submitting orders and signs intents using a dedicated isolated trading key.</p>
                      <div className="hscroll-arch-features">
                        <div><span>Location</span><span>User Device (Local JS/TS)</span></div>
                        <div><span>Responsibility</span><span>Local ZK Proof Gen, Key Security</span></div>
                        <div><span>Trust Assumption</span><span>Zero (Self-generated proofs)</span></div>
                      </div>
                    </motion.div>
                  )}
                </div>
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
              <motion.div variants={childVariants} className="hscroll-badge">How it works</motion.div>
              <motion.h2 variants={childVariants} className="hscroll-title">From intent to verified settlement.</motion.h2>
              <motion.p variants={childVariants} className="hscroll-lede">
                A simple three-step lifecycle ensures execution privacy and cryptographic security.
              </motion.p>
              <motion.div 
                className="hscroll-steps"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.08 } }
                }}
              >
                <motion.div variants={childVariants} className="hscroll-step">
                  <span className="n">01</span>
                  <div className="stage">Deposit</div>
                  <h3>Fund privately</h3>
                  <p>Lock tokens into the Solana vault to receive encrypted private commitments.</p>
                  <span className="tech">Solana vault</span>
                </motion.div>
                <motion.div variants={childVariants} className="hscroll-step">
                  <span className="n">02</span>
                  <div className="stage">Match</div>
                  <h3>Match in batches</h3>
                  <p>Orders clear every 2 seconds at a uniform price inside an attested Intel TDX enclave.</p>
                  <span className="tech">Intel TDX · FBA</span>
                </motion.div>
                <motion.div variants={childVariants} className="hscroll-step">
                  <span className="n">03</span>
                  <div className="stage">Settle</div>
                  <h3>Settle on-chain</h3>
                  <p>Matches publish on-chain with zero-knowledge validity proofs, updating your balance.</p>
                  <span className="tech">ZK proofs</span>
                </motion.div>
              </motion.div>
              <motion.div variants={childVariants} style={{ marginTop: "24px" }}>
                <Link className="btn ghost" href="/docs/category/how-it-works">
                  Learn how it works <span className="arr">→</span>
                </Link>
              </motion.div>
            </motion.div>
          </div>



        </motion.div>
      </div>
    </div>
  );
}
