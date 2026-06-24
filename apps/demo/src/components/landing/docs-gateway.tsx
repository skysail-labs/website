"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function DocsGateway() {
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setCoords({ x: -1000, y: -1000 });
  };

  return (
    <section 
      className="docs-gateway-section"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        "--mouse-x": `${coords.x}px`,
        "--mouse-y": `${coords.y}px`
      } as React.CSSProperties}
    >
      {/* 1. Cryptographic / Mathematical Vector Blueprints */}
      <div className="gateway-blueprints" aria-hidden="true">
        <svg width="100%" height="100%" viewBox="0 0 1400 600" preserveAspectRatio="none" className="blueprint-svg">
          {/* Blueprint Grid Patterns */}
          <defs>
            <pattern id="blueprint-grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(197, 160, 89, 0.025)" strokeWidth="1"/>
            </pattern>
            <pattern id="blueprint-subgrid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(197, 160, 89, 0.008)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          
          <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
          <rect width="100%" height="100%" fill="url(#blueprint-subgrid)" />

          {/* Cryptographic Curve / Waves */}
          <path 
            d="M 50,300 C 250,120 350,480 550,300 C 750,120 850,480 1050,300 C 1250,120 1350,480 1500,300" 
            fill="none" 
            stroke="rgba(197, 160, 89, 0.04)" 
            strokeWidth="1.5" 
            strokeDasharray="4,6" 
          />
          
          {/* Merkle Tree Structural Network */}
          <g stroke="rgba(197, 160, 89, 0.03)" strokeWidth="1" fill="none">
            {/* Tree connections */}
            <line x1="700" y1="70" x2="400" y2="180" />
            <line x1="700" y1="70" x2="1000" y2="180" />
            
            <line x1="400" y1="180" x2="250" y2="290" />
            <line x1="400" y1="180" x2="550" y2="290" />
            
            <line x1="1000" y1="180" x2="850" y2="290" />
            <line x1="1000" y1="180" x2="1150" y2="290" />
            
            <line x1="250" y1="290" x2="180" y2="400" />
            <line x1="250" y1="290" x2="320" y2="400" />
            <line x1="550" y1="290" x2="480" y2="400" />
            <line x1="550" y1="290" x2="620" y2="400" />

            {/* Tree Nodes */}
            <circle cx="700" cy="70" r="12" fill="#020202" stroke="rgba(197, 160, 89, 0.15)" strokeWidth="2" />
            <circle cx="400" cy="180" r="9" fill="#020202" stroke="rgba(197, 160, 89, 0.1)" strokeWidth="1.5" />
            <circle cx="1000" cy="180" r="9" fill="#020202" stroke="rgba(197, 160, 89, 0.1)" strokeWidth="1.5" />
            
            <circle cx="250" cy="290" r="7" fill="#020202" stroke="rgba(197, 160, 89, 0.08)" strokeWidth="1" />
            <circle cx="550" cy="290" r="7" fill="#020202" stroke="rgba(197, 160, 89, 0.08)" strokeWidth="1" />
            <circle cx="850" cy="290" r="7" fill="#020202" stroke="rgba(197, 160, 89, 0.08)" strokeWidth="1" />
            <circle cx="1150" cy="290" r="7" fill="#020202" stroke="rgba(197, 160, 89, 0.08)" strokeWidth="1" />

            <circle cx="180" cy="400" r="5" fill="#020202" stroke="rgba(197, 160, 89, 0.06)" />
            <circle cx="320" cy="400" r="5" fill="#020202" stroke="rgba(197, 160, 89, 0.06)" />
            <circle cx="480" cy="400" r="5" fill="#020202" stroke="rgba(197, 160, 89, 0.06)" />
            <circle cx="620" cy="400" r="5" fill="#020202" stroke="rgba(197, 160, 89, 0.06)" />
          </g>

          {/* Elliptic Curve Grid / Targets */}
          <g stroke="rgba(197, 160, 89, 0.02)" fill="none">
            <circle cx="150" cy="150" r="100" />
            <circle cx="150" cy="150" r="150" strokeDasharray="3,3" />
            <circle cx="1200" cy="400" r="120" />
            <circle cx="1200" cy="400" r="180" strokeDasharray="4,4" />
          </g>

          {/* Cryptographic Blueprint Text Labels */}
          {mounted && (
            <g fill="rgba(197, 160, 89, 0.22)" fontFamily="var(--mono)" fontSize="9" letterSpacing="0.1em">
              {/* Math / zk proofs notes */}
              <text x="725" y="74" fill="rgba(197, 160, 89, 0.35)">ROOT: POSEIDON_HASH(L, R)</text>
              <text x="420" y="184">H(Node_Left)</text>
              <text x="1020" y="184">H(Node_Right)</text>
              
              <text x="80" y="80" fill="rgba(197, 160, 89, 0.08)">y² = x³ + ax + b (secp256k1 / alt_bn128)</text>
              <text x="1100" y="220" fill="rgba(197, 160, 89, 0.08)">e(g₁, g₂) = e(h₁, h₂)</text>
              <text x="80" y="520" fill="rgba(197, 160, 89, 0.08)">TFHE CONFIDENTIAL COMPUTATION GRID</text>
              <text x="1050" y="540" fill="rgba(197, 160, 89, 0.08)">GROTH16 VALID_SPEND PROVER</text>
            </g>
          )}
        </svg>
      </div>

      {/* 2. Radial Gradient Overlay to fade grid edges */}
      <div className="gateway-fade-overlay" aria-hidden="true" />

      {/* 3. Dynamic Floating Aura Blobs & Spotlight */}
      <div className="gateway-aurora-wrap" aria-hidden="true">
        <div className="gateway-aurora-blob aura-1"></div>
        <div className="gateway-aurora-blob aura-2"></div>
        <div className="gateway-aurora-blob aura-3"></div>
      </div>
      <div className="gateway-spotlight" aria-hidden="true" />

      {/* 4. Overlay Content Cards */}
      <div className="gateway-content-wrap">
        <div className="gateway-card-main">
          <div className="gateway-card-small">
            Curious?
          </div>

          <div className="gateway-card-header">
            DOCS × ARCHITECTURE
          </div>
          
          <p className="gateway-card-desc">
            Curious how it works? Refer to our docs for in-depth architecture, protocols, and cryptographic specifications.
          </p>

          {/* Badges / Tech Row */}
          <div className="gateway-tech-row">
            <div className="gateway-tech-item">
              <span className="gateway-tech-label">Core Architecture</span>
              <span className="gateway-tech-val">fhEVM · ZK-Proofs</span>
            </div>
            <div className="gateway-tech-item">
              <span className="gateway-tech-label">Cryptographic Engine</span>
              <span className="gateway-tech-val">TFHE · Halo2</span>
            </div>
          </div>

          <div className="gateway-cta">
            <Link href="/docs" className="btn gateway-btn">
              Explore the docs <span className="arr">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
