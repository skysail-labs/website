"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, RefObject } from "react";

interface MorphingLogoProps {
  placeholderRef: RefObject<HTMLDivElement | null>;
}

export function MorphingLogo({ placeholderRef }: MorphingLogoProps) {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [mounted, setMounted] = useState(false);
  const [startCoords, setStartCoords] = useState({ x: 0, y: 0 });

  const { scrollY } = useScroll();

  useEffect(() => {
    setMounted(true);

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      if (placeholderRef.current) {
        const rect = placeholderRef.current.getBoundingClientRect();
        // Calculate absolute position on the page
        setStartCoords({
          x: rect.left + window.scrollX,
          y: rect.top + window.scrollY,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Dynamic timeout to ensure page fonts and initial layouts have fully settled
    const timer = setTimeout(handleResize, 150);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [placeholderRef]);

  const H = dimensions.height;

  // Compute final wheel parameters dynamically to match CSS clamp layout constraints
  const getClampedWheelSize = (w: number) => {
    // site.css: width: clamp(60px, 8vw, 90px)
    const vwSize = w * 0.08;
    return Math.max(60, Math.min(90, vwSize));
  };

  const getClampedOffset = (w: number) => {
    // site.css: left: clamp(20px, 3vw, 36px)
    const vwOffset = w * 0.03;
    return Math.max(20, Math.min(36, vwOffset));
  };

  const wheelSize = getClampedWheelSize(dimensions.width);
  const offset = getClampedOffset(dimensions.width);

  // Align visual center of scaled element (120px bounding box)
  const finalCenter = offset + wheelSize / 2;
  const finalX = finalCenter - 60;
  const finalY = H - finalCenter - 60;
  const finalScale = wheelSize / 120;

  // Coordinate interpolations
  const x = useTransform(scrollY, [0, H], [startCoords.x, finalX]);

  // y moves from scrolling page position (startCoords.y - scrollY) to fixed screen target (finalY)
  const y = useTransform(scrollY, (latest) => {
    if (latest >= H) return finalY;
    const progress = latest / H;
    const currentStart = startCoords.y - latest;
    return currentStart + (finalY - currentStart) * progress;
  });

  const scale = useTransform(scrollY, [0, H], [1.0, finalScale]);
  
  // Rotate during the slide and then continue rotating as we scroll horizontally
  const rotate = useTransform(scrollY, [0, H, H * 4], [0, 360, 1440]);
  
  // Fade out when scrolling towards the footer
  const opacity = useTransform(scrollY, [0, H * 4, H * 4 + 150], [1, 1, 0]);

  // Sequential morphing steps
  const logoClipHeight = useTransform(scrollY, [0, H * 0.25], [110, 200]);
  const barOpacity = useTransform(scrollY, [0, H * 0.25], [1, 0]);
  const bar2Opacity = useTransform(scrollY, [0, H * 0.25], [0.8, 0]);
  const barY = useTransform(scrollY, [0, H * 0.25], [0, 30]);

  const solidCircleOpacity = useTransform(scrollY, [0, H * 0.4, H * 0.65], [1, 1, 0]);
  const wheelDetailsOpacity = useTransform(scrollY, [0, H * 0.4, H * 0.6], [0, 0, 1]);

  const spokeOpacity = useTransform(scrollY, [0, H * 0.25, H * 0.45], [0, 0, 1]);
  const spokeY = useTransform(scrollY, [0, H * 0.25, H * 0.55], [60, 60, 0]);

  const angles = [0, 45, 90, 135, 180, 225, 270, 315];

  if (!mounted) return null;

  return (
    <motion.div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: 120,
        height: 120,
        x,
        y,
        scale,
        rotate,
        opacity,
        zIndex: 90,
        pointerEvents: "none",
      }}
    >
      <svg
        viewBox="0 0 200 200"
        width="120"
        height="120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: "100%",
          height: "100%",
          overflow: "visible",
        }}
      >
        <defs>
          <clipPath id="engrave-logo-clip-morph">
            <motion.rect x="0" y="0" width="200" height={logoClipHeight} />
          </clipPath>

          <g id="spoke-morph-template">
            <line x1="0" y1="0" x2="0" y2="-65" stroke="var(--cobalt)" strokeWidth="4" strokeLinecap="round" />
            <circle cx="0" cy="-30" r="4.5" fill="var(--ink)" stroke="var(--cobalt)" strokeWidth="2" />
            <path d="M -3,-65 C -4,-70 -6,-72 -6,-78 C -6,-85 -3,-88 -3,-92 C -3,-96 3,-96 3,-92 C 3,-88 6,-85 6,-78 C 6,-72 4,-70 3,-65 Z" fill="var(--cobalt)" stroke="var(--ink)" strokeWidth="1.5" />
          </g>
        </defs>

        {/* 1. Logo Bars (sinking and fading) */}
        <motion.g style={{ opacity: barOpacity, filter: "url(#engrave-mark)" }}>
          <motion.rect x="30" y="110" width="140" height="6.67" fill="#6e5e42" style={{ y: barY }} />
          <motion.rect x="30" y="130" width="100" height="6.67" fill="#4a3e2a" style={{ opacity: bar2Opacity, y: barY }} />
        </motion.g>

        {/* 2. Solid Circle (expanding to full circle, then fading out) */}
        <motion.circle
          cx="100"
          cy="100"
          r="60"
          fill="#6e5e42"
          clipPath="url(#engrave-logo-clip-morph)"
          style={{
            opacity: solidCircleOpacity,
            filter: "url(#engrave-mark)",
          }}
        />

        {/* 3. Wheel Outlines & Hub (fading in) */}
        <motion.g
          style={{
            opacity: wheelDetailsOpacity,
            filter: "drop-shadow(0 0 12px rgba(197, 160, 89, 0.15))",
          }}
        >
          {/* Outer Rim */}
          <circle cx="100" cy="100" r="60" stroke="var(--cobalt)" strokeWidth="7" />
          <circle cx="100" cy="100" r="54.5" stroke="var(--ink)" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="65.5" stroke="var(--ink)" strokeWidth="1.5" />

          {/* Inner Rim */}
          <circle cx="100" cy="100" r="40" stroke="var(--cobalt)" strokeWidth="4" />
          <circle cx="100" cy="100" r="36" stroke="var(--ink)" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="44" stroke="var(--ink)" strokeWidth="1.5" />

          {/* Center Hub */}
          <circle cx="100" cy="100" r="22" fill="var(--ink)" stroke="var(--cobalt)" strokeWidth="3" />
          <circle cx="100" cy="100" r="14" fill="var(--cobalt)" />
          <circle cx="100" cy="100" r="6" fill="var(--ink)" />
        </motion.g>

        {/* 4. Spokes/Spikes (emerging and fading in) */}
        {angles.map((angle) => (
          <motion.g
            key={angle}
            transform={`rotate(${angle} 100 100)`}
            style={{
              opacity: spokeOpacity,
              filter: "drop-shadow(0 0 12px rgba(197, 160, 89, 0.15))",
            }}
          >
            <motion.g style={{ y: spokeY }}>
              <use href="#spoke-morph-template" x="100" y="100" />
            </motion.g>
          </motion.g>
        ))}
      </svg>
    </motion.div>
  );
}
