"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

export function DocsGateway() {
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 900);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const BAR_COUNT = 220;
  // Jagged, peaky math formula to resemble the reference screenshot
  const barHeights = Array.from({ length: BAR_COUNT }).map((_, i) => {
    const progress = i / BAR_COUNT;
    
    // Base upward slope
    const base = 8 + progress * 40; 
    
    // Jagged wave fluctuations (combining multiple frequencies)
    const w1 = Math.sin(progress * Math.PI * 6.5) * 16;  // medium frequency
    const w2 = Math.cos(progress * Math.PI * 18.2) * 12; // high frequency (creates jagged peaks)
    const w3 = Math.sin(progress * Math.PI * 34.5) * 6;  // very high frequency (micro peaks)
    
    // Custom sharp spikes/peaks in specific regions
    let spike = 0;
    if (progress > 0.12 && progress < 0.18) {
      spike = (1 - Math.abs((progress - 0.15) / 0.03)) * 28;
    } else if (progress > 0.42 && progress < 0.52) {
      spike = (1 - Math.abs((progress - 0.47) / 0.05)) * 32;
    } else if (progress > 0.78 && progress < 0.88) {
      spike = (1 - Math.abs((progress - 0.83) / 0.05)) * 42;
    } else if (progress > 0.88) {
      spike = (1 - Math.abs((progress - 1.0) / 0.12)) * 12;
    }
    
    const val = base + w1 + w2 + w3 + spike;

    // Minimum height to cover the space below the white card
    // On mobile, the card covers the whole width, so we need a high minimum height everywhere.
    // On desktop, the card covers the middle region (approx 0.25 to 0.85).
    let minH = 4;
    if (isMobile) {
      const noise = (w2 * 0.6 + w3 * 0.6);
      minH = Math.max(52, 54 + noise);
    } else {
      if (progress >= 0.2 && progress <= 0.88) {
        let rampBase = 4;
        let noiseScale = 0;
        if (progress < 0.35) {
          const t = (progress - 0.2) / 0.15;
          rampBase = 4 + t * 50; // ramp from 4 to 54
          noiseScale = t;
        } else if (progress > 0.75) {
          const t = (0.88 - progress) / 0.13;
          rampBase = 4 + t * 50; // ramp from 54 to 4
          noiseScale = t;
        } else {
          rampBase = 54;
          noiseScale = 1;
        }
        const noise = (w2 * 0.6 + w3 * 0.6) * noiseScale;
        minH = Math.max(4, rampBase + noise);
      }
    }

    const maxH = progress > 0.75 ? 98 : 92;
    return Math.min(maxH, Math.max(minH, val));
  });

  return (
    <section 
      ref={containerRef}
      className={`docs-gateway-section ${inView ? "in-view" : ""}`}
    >
      {/* 1. Animated Graph Bars at bottom */}
      <div className="gateway-graph-wrap" aria-hidden="true">
        {barHeights.map((h, i) => (
          <div 
            key={i}
            className="gateway-bar"
            style={{
              // @ts-expect-error: Custom CSS variable keys not typed in standard style prop
              "--h": `${h}%`,
              "--delay": `${i * 0.0035}s`,
            }}
          />
        ))}
      </div>

      {/* 2. Concentric Target & Question Mark on Right */}
      <div className="gateway-target-wrap" aria-hidden="true">
        <div className="gateway-target-glow" />
        <div className="gateway-target-ring-1" />
        <div className="gateway-target-ring-2" />
        <div className="gateway-target-ring-3" />
        <div className="gateway-target-center">
          <svg 
            width="28" 
            height="28" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            {/* Left Bracket */}
            <path d="M 6 7 L 2 12 L 6 17" />
            {/* Forward Slash */}
            <path d="M 14.5 4.5 L 9.5 19.5" />
            {/* Right Bracket */}
            <path d="M 18 7 L 22 12 L 18 17" />
          </svg>
        </div>
        <div className="gateway-target-line" />
      </div>

      {/* 3. Overlay Content Cards */}
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
              <span className="gateway-tech-val">Intel TDX enclave</span>
            </div>
            <div className="gateway-tech-item">
              <span className="gateway-tech-label">Cryptographic Engine</span>
              <span className="gateway-tech-val">ZK validated</span>
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
