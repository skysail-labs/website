import React from "react";

// Small, monochrome line/mark icons for the "Copy page" menu. All use
// currentColor so they inherit the menu's text color in every theme.
type IconProps = {size?: number; className?: string};

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export function CopyIcon({size = 18, className}: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden>
      <rect x="9" y="9" width="11" height="11" rx="2.5" />
      <path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function MarkdownIcon({size = 18, className}: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" />
      <path d="M6 15.5v-6l3 3 3-3v6" />
      <path d="M16.5 9.5v6M16.5 15.5 14.7 13.5M16.5 15.5 18.3 13.5" />
    </svg>
  );
}

export function ChevronIcon({size = 16, className}: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ExternalIcon({size = 12, className}: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden>
      <path d="M8 6h10v10M18 6 6 18" />
    </svg>
  );
}

export function CheckIcon({size = 18, className}: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}
