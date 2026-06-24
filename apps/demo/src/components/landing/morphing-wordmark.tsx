"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { RefObject, useEffect, useRef, useState } from "react";

interface MorphingWordmarkProps {
  sourceRef: RefObject<HTMLDivElement | null>;
  targetRef: RefObject<HTMLSpanElement | null>;
  sectionRef: RefObject<HTMLDivElement | null>;
}

interface WordmarkLayout {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  endScroll: number;
  sectionScrollDistance: number;
  startFontSize: number;
  endFontSize: number;
  viewportWidth: number;
}

const defaultLayout: WordmarkLayout = {
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0,
  endScroll: 1,
  sectionScrollDistance: 1,
  startFontSize: 18,
  endFontSize: 42,
  viewportWidth: 1200,
};

function readFontSize(element: Element, fallback: number) {
  const value = Number.parseFloat(window.getComputedStyle(element).fontSize);
  return Number.isFinite(value) ? value : fallback;
}

export function MorphingWordmark({ sourceRef, targetRef, sectionRef }: MorphingWordmarkProps) {
  const [mounted, setMounted] = useState(false);
  const [layout, setLayout] = useState<WordmarkLayout>(defaultLayout);
  const [viewportHeight, setViewportHeight] = useState(800);
  const { scrollY } = useScroll();
  const hasLockedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    let measured100 = false;
    let measuredNear = false;

    const measure = () => {
      setViewportHeight(window.innerHeight);

      const source = sourceRef.current;
      const target = targetRef.current;
      const section = sectionRef.current;

      if (!source || !target || !section) return;

      const sourceRect = source.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();

      const stickyContainer = section.querySelector(".hscroll-sticky");
      const track = section.querySelector(".hscroll-track");
      const stickyRect = stickyContainer ? stickyContainer.getBoundingClientRect() : sectionRect;
      const trackRect = track ? track.getBoundingClientRect() : stickyRect;

      const sectionTop = sectionRect.top + window.scrollY;
      const endFontSize = readFontSize(target, 42);

      setLayout({
        startX: sourceRect.left + window.scrollX,
        startY: sourceRect.top + window.scrollY,
        endX: targetRect.left - trackRect.left + stickyRect.left,
        endY: targetRect.top - stickyRect.top + 3,
        endScroll: Math.max(1, sectionTop),
        sectionScrollDistance: Math.max(1, section.offsetHeight - window.innerHeight),
        startFontSize: readFontSize(source, 18),
        endFontSize,
        viewportWidth: window.innerWidth,
      });
    };

    measure();
    window.addEventListener("resize", measure);

    // Remeasure when fonts are loaded
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => {
        setTimeout(measure, 100);
      });
    }

    // Remeasure once during scroll to catch late layout shifts
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (!measured100 && currentScroll > 100) {
        measured100 = true;
        measure();
      }
      const section = sectionRef.current;
      if (section) {
        const sectionTop = section.getBoundingClientRect().top + currentScroll;
        if (!measuredNear && currentScroll > sectionTop - 600) {
          measuredNear = true;
          measure();
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    const timer = window.setTimeout(measure, 180);
    const timer2 = window.setTimeout(measure, 1000);

    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", handleScroll);
      window.clearTimeout(timer);
      window.clearTimeout(timer2);
    };
  }, [sectionRef, sourceRef, targetRef]);

  // Lock scroll for 0.5s the first time the wordmark lands in position
  useEffect(() => {
    if (!layout.endScroll || layout.endScroll <= 1) return;
    const unsubscribe = scrollY.on("change", (latest) => {
      if (!hasLockedRef.current && latest >= layout.endScroll) {
        hasLockedRef.current = true;
        const lockAt = latest;
        const onWheel = (e: Event) => e.preventDefault();
        const onTouch = (e: Event) => e.preventDefault();
        window.scrollTo({ top: lockAt });
        window.addEventListener("wheel", onWheel, { passive: false });
        window.addEventListener("touchmove", onTouch, { passive: false });
        setTimeout(() => {
          window.removeEventListener("wheel", onWheel);
          window.removeEventListener("touchmove", onTouch);
        }, 500);
      }
    });
    return () => unsubscribe();
  }, [scrollY, layout.endScroll]);

  const {
    startX,
    startY,
    endX,
    endY,
    endScroll,
    sectionScrollDistance,
    startFontSize,
    endFontSize,
    viewportWidth,
  } = layout;
  const glitchStart = endScroll * 0.58;
  const glitchEnd = endScroll * 0.82;

  const holdDistance = sectionScrollDistance * 0.15;

  const x = useTransform(scrollY, (latest) => {
    if (latest < endScroll) {
      const progress = latest / endScroll;
      return startX + (endX - startX) * progress;
    }
    const sectionProgress = Math.min(1, (latest - endScroll) / (sectionScrollDistance * (200 / 150)));
    return endX - viewportWidth * sectionProgress;
  });
  const y = useTransform(scrollY, (latest) => {
    if (latest >= endScroll) return endY;
    const progress = latest / endScroll;
    const currentStart = startY - latest;
    return currentStart + (endY - currentStart) * progress;
  });
  const fontSize = useTransform(scrollY, [0, endScroll], [startFontSize, endFontSize]);
  const letterSpacing = useTransform(scrollY, [0, endScroll * 0.5], ["0.32em", "0.02em"]);
  const nyxOpacity = useTransform(scrollY, [glitchStart, glitchEnd], [1, 0]);
  const poolOpacity = useTransform(scrollY, [glitchStart, glitchEnd], [0, 1]);
  const glitchOpacity = useTransform(
    scrollY,
    [glitchStart, endScroll * 0.7, glitchEnd],
    [0, 1, 0]
  );
  const opacity = useTransform(
    scrollY,
    [0, endScroll, endScroll + holdDistance],
    [1, 1, 1]
  );

  if (!mounted) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="morphing-wordmark"
      style={{
        x,
        y,
        fontSize,
        letterSpacing,
        opacity,
      }}
    >
      <span className="morphing-wordmark-dark">dark</span>
      <span className="morphing-wordmark-tail">
        <motion.span style={{ opacity: nyxOpacity }}>NYX</motion.span>
        <motion.span className="morphing-wordmark-pool" style={{ opacity: poolOpacity }}>
          {"\u00a0"}pool
        </motion.span>
        <motion.span className="morphing-wordmark-glitch" style={{ opacity: glitchOpacity }}>
          nyx
        </motion.span>
      </span>
    </motion.div>
  );
}
