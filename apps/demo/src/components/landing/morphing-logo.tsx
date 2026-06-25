"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, RefObject } from "react";

interface MorphingLogoProps {
  placeholderRef: RefObject<HTMLDivElement | null>;
  roadmapPlaceholderRef: RefObject<HTMLDivElement | null>;
}

const getStaticCoords = (el: HTMLElement) => {
  let offsetTop = 0;
  let offsetLeft = 0;
  let current: HTMLElement | null = el;

  const section = el.closest(".roadmap-section") as HTMLElement;
  if (!section) return { x: 0, y: 0 };

  while (current && current !== section && current !== document.body) {
    offsetTop += current.offsetTop;
    offsetLeft += current.offsetLeft;
    current = current.offsetParent as HTMLElement;
  }

  const sectionRect = section.getBoundingClientRect();
  const sectionX = sectionRect.left + window.scrollX;
  const sectionY = sectionRect.top + window.scrollY;

  return {
    x: sectionX + offsetLeft,
    y: sectionY + offsetTop,
  };
};

export function MorphingLogo({ placeholderRef, roadmapPlaceholderRef }: MorphingLogoProps) {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [mounted, setMounted] = useState(false);
  const [startCoords, setStartCoords] = useState({ x: 0, y: 0 });
  const [endCoords, setEndCoords] = useState({ x: 0, y: 0 });

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

      if (roadmapPlaceholderRef.current) {
        const coords = getStaticCoords(roadmapPlaceholderRef.current);
        setEndCoords(coords);
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
  }, [placeholderRef, roadmapPlaceholderRef]);

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

  // site.css roadmap logo size: clamp(72px, 8vw, 96px)
  const getClampedRoadmapSize = (w: number) => {
    const vwSize = w * 0.08;
    return Math.max(72, Math.min(96, vwSize));
  };

  const roadmapSize = getClampedRoadmapSize(dimensions.width);
  const endScale = roadmapSize / 120;

  // Coordinate interpolations: Hero -> Bottom Left Wheel -> Roadmap Sticky Logo
  const x = useTransform(scrollY, (latest) => {
    if (latest <= H) {
      const progress = latest / H;
      return startCoords.x + (finalX - startCoords.x) * progress;
    }
    if (latest <= 4 * H) {
      return finalX;
    }
    const endXVal = endCoords.x || (finalX + 60 * (1 - endScale));
    const targetEndX = endXVal - 60 * (1 - endScale);
    if (latest <= 5 * H) {
      const progress = (latest - 4 * H) / H;
      return finalX + (targetEndX - finalX) * progress;
    }
    return targetEndX;
  });

  const y = useTransform(scrollY, (latest) => {
    if (latest <= H) {
      const progress = latest / H;
      const currentStart = startCoords.y - latest;
      return currentStart + (finalY - currentStart) * progress;
    }
    if (latest <= 4 * H) {
      return finalY;
    }
    const endYVal = endCoords.y || (finalY + latest + 60 * (1 - endScale));
    
    // finalTargetViewportY is the final stuck/resting location in the viewport.
    // On desktop (> 900px width), it is 180. On mobile/tablet, it is endYVal - 5 * H.
    const finalTargetViewportY = dimensions.width > 900
      ? 180
      : endYVal - 5 * H;

    const targetEndY = finalTargetViewportY - 60 * (1 - endScale);

    if (latest <= 5 * H) {
      const progress = (latest - 4 * H) / H;
      return finalY + (targetEndY - finalY) * progress;
    }

    // Beyond 5 * H, track the placeholder's actual viewport Y (handles scrolling on mobile, sticky on desktop)
    const currentViewportY = dimensions.width > 900
      ? Math.max(180, endYVal - latest)
      : endYVal - latest;

    return currentViewportY - 60 * (1 - endScale);
  });

  const scale = useTransform(scrollY, (latest) => {
    if (latest <= H) {
      const progress = latest / H;
      return 1.0 + (finalScale - 1.0) * progress;
    }
    if (latest <= 4 * H) {
      return finalScale;
    }
    if (latest <= 5 * H) {
      const progress = (latest - 4 * H) / H;
      return finalScale + (endScale - finalScale) * progress;
    }
    return endScale;
  });

  // Rotate during the slide, rotate as we scroll horizontally, then lock upright on Panel 3
  const rotate = useTransform(scrollY, [0, H, 4 * H, 5 * H], [0, 360, 1080, 1080]);

  // Fade out overall container when handoff to inline logo completes
  const opacity = useTransform(scrollY, (latest) => {
    if (latest < 4.9 * H) return 1;
    if (latest > 5.1 * H) return 0;
    return 1 - (latest - 4.9 * H) / (0.2 * H);
  });

  // Cross-fade shapes: Start Logo -> Wheel -> End Logo
  const startLogoOpacity = useTransform(scrollY, [0, H * 0.45], [1, 0]);
  const endLogoOpacity = useTransform(scrollY, [4 * H, H * 4.6], [0, 1]);
  const wheelOpacity = useTransform(
    scrollY,
    [H * 0.25, H * 0.75, 4 * H, H * 4.6],
    [0, 1, 1, 0]
  );

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
      {/* 1. Start Logo Shape (Engraved) */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          opacity: startLogoOpacity,
          filter: "url(#engrave-mark)",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id="engrave-logo-clip-morph">
              <rect x="0" y="0" width="120" height="66" />
            </clipPath>
          </defs>
          <circle cx="60" cy="60" r="36" fill="#a68249" clipPath="url(#engrave-logo-clip-morph)" />
          <rect x="18" y="66" width="84" height="4" fill="#a68249" />
          <rect x="18" y="78" width="60" height="4" fill="#6b5128" opacity="0.8" />
        </svg>
      </motion.div>

      {/* 2. End Logo Shape (Clean Brand Gold, morphs back on Panel 3) */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          opacity: endLogoOpacity,
        }}
      >
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id="end-logo-clip-morph">
              <rect x="0" y="0" width="120" height="66" />
            </clipPath>
          </defs>
          <circle cx="60" cy="60" r="36" fill="var(--cobalt)" clipPath="url(#end-logo-clip-morph)" />
          <rect x="18" y="66" width="84" height="4" fill="var(--cobalt)" />
          <rect x="18" y="78" width="60" height="4" fill="var(--cobalt)" opacity="0.5" />
        </svg>
      </motion.div>

      {/* 3. Wheel Shape */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          opacity: wheelOpacity,
          filter: "drop-shadow(0 0 12px rgba(201, 158, 85, 0.15))",
        }}
      >
        <svg viewBox="0 0 200 200" width="120" height="120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <g id="spoke-morph">
              <line x1="100" y1="100" x2="100" y2="35" stroke="var(--cobalt)" strokeWidth="4" strokeLinecap="round" />
              <circle cx="100" cy="70" r="4.5" fill="var(--ink)" stroke="var(--cobalt)" strokeWidth="2" />
              <path d="M 97,35 C 96,30 94,28 94,22 C 94,15 97,12 97,8 C 97,4 103,4 103,8 C 103,12 106,15 106,22 C 106,28 104,30 103,35 Z" fill="var(--cobalt)" stroke="var(--ink)" strokeWidth="1.5" />
            </g>
          </defs>

          {/* 8 spokes */}
          <g transform="rotate(0 100 100)"><use href="#spoke-morph" /></g>
          <g transform="rotate(45 100 100)"><use href="#spoke-morph" /></g>
          <g transform="rotate(90 100 100)"><use href="#spoke-morph" /></g>
          <g transform="rotate(135 100 100)"><use href="#spoke-morph" /></g>
          <g transform="rotate(180 100 100)"><use href="#spoke-morph" /></g>
          <g transform="rotate(225 100 100)"><use href="#spoke-morph" /></g>
          <g transform="rotate(270 100 100)"><use href="#spoke-morph" /></g>
          <g transform="rotate(315 100 100)"><use href="#spoke-morph" /></g>

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
        </svg>
      </motion.div>
    </motion.div>
  );
}
