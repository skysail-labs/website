"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Stagger in ms, applied as a CSS transition-delay. */
  delay?: number;
  as?: ElementType;
  className?: string;
  id?: string;
  /** Fraction of the element that must be visible before it reveals. */
  threshold?: number;
}

/**
 * Reveals its children once, when they scroll into view.
 *
 * Deliberately CSS-driven (a single `is-in` class) rather than animated in JS —
 * the page has many of these and the motion needs to stay slow and cheap.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
  id,
  threshold = 0.15,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || shown) return;

    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shown, threshold]);

  return (
    <Tag
      ref={ref}
      id={id}
      className={`dn-reveal ${shown ? "is-in" : ""} ${className}`.trim()}
      style={delay ? ({ "--dn-reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
