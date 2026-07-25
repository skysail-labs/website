/**
 * Line glyphs for the four protocol pillars.
 *
 * Each is a single-stroke abstraction of what the pillar does — no padlocks,
 * no shields. Drawn on a 40-unit grid, inheriting `currentColor`.
 */

type IconProps = { className?: string };

const base = {
  viewBox: "0 0 40 40",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/** Orders converging from the open market into a closed boundary. */
function FlowIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M2 8h12l6 12" />
      <path d="M2 20h10l8 0" />
      <path d="M2 32h12l6-12" />
      <circle cx="27" cy="20" r="9" strokeDasharray="2 3" />
      <circle cx="27" cy="20" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Bids and asks resolving to one uniform clearing price. */
function MatchIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 6v28" />
      <path d="M36 6v28" />
      <path d="M4 14h9" />
      <path d="M4 22h6" />
      <path d="M27 12h9" />
      <path d="M30 26h6" />
      <path d="M14 20h12" opacity="0.45" />
      <circle cx="20" cy="20" r="3.5" />
    </svg>
  );
}

/** A public record whose contents stay behind the veil. */
function VeilIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="5" y="7" width="30" height="26" rx="1" />
      <path d="M5 15h30" />
      <path d="M11 22h7" opacity="0.5" />
      <path d="M11 27h4" opacity="0.5" />
      <path d="M23 20.5l3.2 3.2 3.2-3.2" opacity="0.5" />
      <path d="M22 27h8" opacity="0.5" />
      <path d="M2 30L38 10" />
    </svg>
  );
}

/** Assets held in a vault whose transitions are proof-constrained. */
function VaultIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M20 3l15 7v11c0 8.4-6.1 14.6-15 16-8.9-1.4-15-7.6-15-16V10z" />
      <path d="M20 14v12" opacity="0.55" />
      <path d="M14 20h12" opacity="0.55" />
      <circle cx="20" cy="20" r="6.5" />
    </svg>
  );
}

const ICONS = {
  flow: FlowIcon,
  match: MatchIcon,
  veil: VeilIcon,
  vault: VaultIcon,
} as const;

export type PillarIconName = keyof typeof ICONS;

export function PillarIcon({ name, className }: { name: PillarIconName; className?: string }) {
  const Glyph = ICONS[name];
  return <Glyph className={className} />;
}

export function XIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
