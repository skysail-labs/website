"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

export function DocsGateway() {
  const [mounted, setMounted] = useState(false);
  const [cols, setCols] = useState(36);
  const [cells, setCells] = useState<{ id: number }[]>([]);
  const [coveredCellIds, setCoveredCellIds] = useState<Set<number>>(new Set());

  const gridRef = useRef<HTMLDivElement>(null);
  const cardMainRef = useRef<HTMLDivElement>(null);
  const cardSmallRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const handleResize = () => {
      const isMobile = window.innerWidth < 900;
      const currentCols = isMobile ? 18 : 36;
      setCols(currentCols);
      
      // Keep grid dimensions consistent: 15 rows
      const totalCells = currentCols * 15;
      const newCells = Array.from({ length: totalCells }).map((_, i) => ({ id: i }));
      setCells(newCells);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate grid cells covered by the white content cards
  useEffect(() => {
    if (!mounted || cells.length === 0) return;

    const checkIntersections = () => {
      const grid = gridRef.current;
      const cardMain = cardMainRef.current;
      const cardSmall = cardSmallRef.current;
      if (!grid) return;

      const mainRect = cardMain ? cardMain.getBoundingClientRect() : null;
      const smallRect = cardSmall ? cardSmall.getBoundingClientRect() : null;

      const newCovered = new Set<number>();
      const children = grid.children;

      // 4px buffer around content cards to ensure edges don't blink
      const buffer = 4;

      for (let i = 0; i < children.length; i++) {
        const child = children[i] as HTMLElement;
        const cellIdAttr = child.getAttribute("data-cell-id");
        if (!cellIdAttr) continue;
        const cellId = parseInt(cellIdAttr, 10);
        const cellRect = child.getBoundingClientRect();

        const overlaps = (rect: DOMRect) => {
          return !(
            cellRect.right - buffer < rect.left ||
            cellRect.left + buffer > rect.right ||
            cellRect.bottom - buffer < rect.top ||
            cellRect.top + buffer > rect.bottom
          );
        };

        let isOverlapped = false;
        if (mainRect && overlaps(mainRect)) {
          isOverlapped = true;
        }
        if (smallRect && overlaps(smallRect)) {
          isOverlapped = true;
        }

        if (isOverlapped) {
          newCovered.add(cellId);
        }
      }

      setCoveredCellIds(newCovered);
    };

    // Wait slightly for layout/fonts to settle before measuring
    const timeoutId = setTimeout(checkIntersections, 100);

    window.addEventListener("resize", checkIntersections);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", checkIntersections);
    };
  }, [cells, cols, mounted]);

  return (
    <section className="docs-gateway-section">
      {/* 1. Interactive Blinking Checkerboard Grid Background */}
      <div 
        ref={gridRef}
        className="gateway-grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
        }}
      >
        {cells.map((cell) => {
          const col = cell.id % cols;
          const row = Math.floor(cell.id / cols);
          const isEven = (col + row) % 2 === 0;

          let cellStyle: React.CSSProperties = {};
          
          if (mounted) {
            const isCovered = coveredCellIds.has(cell.id);

            if (isCovered) {
              cellStyle = {
                animation: "none",
                opacity: 0.02,
                color: "#2a2216",
                borderColor: "rgba(214, 179, 106, 0.005)",
                background: "transparent",
              };
            } else {
              // Sparse check: Only a fraction of cells should blink
              const isBlinkingCell = isEven 
                ? (cell.id % 4 === 0) 
                : (cell.id % 6 === 0);

              if (isBlinkingCell) {
                // Slower random durations (6s to 10s) and wider delays
                const delay = ((cell.id * 23) % 47) * 0.2;
                const duration = 6.0 + ((cell.id * 11) % 5) * 0.8;
                
                cellStyle = {
                  animationName: isEven ? "grid-blink" : "grid-dot-blink",
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`,
                  animationIterationCount: "infinite",
                  animationTimingFunction: "ease-in-out",
                };
              } else {
                // Static idle state
                cellStyle = {
                  animation: "none",
                  opacity: isEven ? 0.05 : 0.15,
                };
              }
            }
          } else {
            // Default server-render styles
            cellStyle = {
              opacity: isEven ? 0.05 : 0.15,
            };
          }

          if (isEven) {
            // Box cell
            return (
              <div
                key={cell.id}
                data-cell-id={cell.id}
                className="gateway-grid-cell gateway-grid-cell-box"
                style={cellStyle}
              >
                <svg viewBox="0 0 120 120" className="gateway-cell-logo" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 24,60 A 36,36 0 0 1 96,60 Z" fill="currentColor" />
                  <rect x="18" y="66" width="84" height="4" fill="currentColor" />
                  <rect x="18" y="78" width="60" height="4" fill="currentColor" opacity="0.6" />
                </svg>
              </div>
            );
          } else {
            // Dot cell
            return (
              <div
                key={cell.id}
                data-cell-id={cell.id}
                className="gateway-grid-cell gateway-grid-cell-dot"
                style={cellStyle}
              >
                <svg viewBox="0 0 20 20" className="gateway-cell-logo-dot" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="2.5" fill="currentColor" />
                </svg>
              </div>
            );
          }
        })}
      </div>

      {/* 2. Radial Gradient Overlay to fade grid edges */}
      <div className="gateway-fade-overlay" aria-hidden="true" />

      {/* 3. Overlay Content Cards */}
      <div className="gateway-content-wrap">
        {/* Main Docs Card */}
        <div ref={cardMainRef} className="gateway-card-main">
          {/* Small Intro Card (nested inside main card to anchor absolute coordinates on desktop) */}
          <div ref={cardSmallRef} className="gateway-card-small">
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
