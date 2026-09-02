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

export function GithubIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.12-.31-.54-1.54.12-3.21 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.05.14 3 .4 2.29-1.55 3.3-1.23 3.3-1.23.66 1.67.24 2.9.12 3.21.77.84 1.24 1.91 1.24 3.23 0 4.63-2.81 5.65-5.49 5.95.43.37.82 1.1.82 2.22v3.29c0 .32.21.7.82.58C20.56 22.29 24 17.79 24 12.5 24 5.87 18.63.5 12 .5z" />
    </svg>
  );
}
