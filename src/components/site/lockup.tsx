import { NyxMark } from "@/components/brand/nyx-mark";

/**
 * The Darknyx lockup: gold mark + wordmark, sharing one baseline.
 *
 * The mark's horizon rule sits at 55% of its own height (y=66 on the 120-unit
 * grid). The wordmark's baseline sits ~0.847em below the top of a
 * `line-height: 1` box in Arial. Offsetting the mark by the difference puts the
 * horizon and the letter baseline on the same line, so the rule reads as the
 * support the type is standing on.
 */
export function Lockup({
  markSize = 34,
  fontSize = 20,
}: {
  markSize?: number;
  fontSize?: number;
}) {
  return (
    <span
      className="dn-lockup"
      style={
        {
          "--dn-lockup-mark": `${markSize}px`,
          "--dn-lockup-fs": `${fontSize}px`,
        } as React.CSSProperties
      }
    >
      <NyxMark size={markSize} className="dn-lockup-mark" />
      <span className="dn-lockup-word">
        dark<span>nyx</span>
      </span>
    </span>
  );
}
