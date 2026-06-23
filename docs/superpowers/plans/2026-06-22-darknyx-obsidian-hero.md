# Darknyx Obsidian Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the existing hero section in `apps/demo/src/app/landing/page.tsx` into a monumental obsidian stone chamber where pillars, wall, engraved logo, and engraved headline feel like a single architectural structure carved from black stone.

**Architecture:** The existing `hero-columns.png` image provides architectural form (pillar positions, stone depth); a CSS layer stack adds material identity (obsidian tint, directional beam, depth shadows, stone bands, gold veins, roughness grain); an SVG filter pipeline engraves the logo and headline physically into the surface. No parallax, no cursor interaction, no dust particles in V1. Architecture is static. Light moves.

**Tech Stack:** Next.js 15 (App Router), React, Tailwind v4, CSS custom properties (`@property`), SVG filters (`feTurbulence`, `feSpecularLighting`, `fePointLight`, `feDisplacementMap`, `feBlend`, `feGaussianBlur`, `feOffset`, `feComposite`), `background-clip: text`.

## Global Constraints

- Touch only: `apps/demo/src/app/landing/page.tsx` (hero block), `apps/demo/src/app/site.css` (hero classes), and two new component files. Everything else is off-limits.
- No new npm dependencies.
- No `requestAnimationFrame` for spotlight motion — CSS `@keyframes` only.
- No parallax, no cursor interaction in V1.
- No dust particles in V1.
- Color palette strictly: `#050505`, `#0f0f0f`, `#1a1a1a`, `#d6b36a`. No others introduced.
- Headline stays HTML (selectable, responsive). Do not bake text into images.
- The `fePointLight` position in SVG filters is set once at render time — it does not update.
- Pillar scale is an art-direction value: start at 125%, test, then 130%, then 135%. Use the value where pillars feel structurally dominant but architectural detail in the capitals remains readable.
- Read `apps/demo/AGENTS.md` before writing any Next.js code — this version has breaking API changes.
- Silence test: hero must feel atmospheric and institutional as a static screenshot, before any animation plays.
- Grayscale/blur test: chamber must read as monumental with all color and texture removed.

---

## File Map

| File | Status | Responsibility |
|---|---|---|
| `apps/demo/src/app/landing/page.tsx` | Modify (lines 154–244) | Hero `<header>` block — replace current hero with obsidian chamber |
| `apps/demo/src/app/site.css` | Modify (append) | Add `.hero-obsidian` CSS class and all hero-specific CSS |
| `apps/demo/src/components/landing/engraved-logo.tsx` | Create | `<EngravedLogo>` component — NyxMark with `#engrave-mark` SVG filter |
| `apps/demo/src/components/landing/engraved-text.tsx` | Create | `<EngravedText>` component — h1 with `#engrave-inscription` SVG filter + background-clip text |

---

## Task 1: SVG Filter Definitions + `<EngravedLogo>` Component

Build the `#engrave-mark` filter and the component that uses it. The logo should appear stamped into stone — same material as the wall, specular highlight from upper-left.

**Files:**
- Create: `apps/demo/src/components/landing/engraved-logo.tsx`

**Interfaces:**
- Produces: `<EngravedLogo />` — zero props, self-contained. Used in Task 4.
- Produces: SVG `<defs>` block with filter IDs `engrave-mark` and `engrave-grain-source` that Task 2 also references.

- [ ] **Step 1: Create the file**

```tsx
// apps/demo/src/components/landing/engraved-logo.tsx
"use client";

export function EngravedLogo() {
  return (
    <>
      {/* SVG filter definitions — referenced by both EngravedLogo and EngravedText */}
      <svg width="0" height="0" style={{ position: "absolute", overflow: "hidden" }} aria-hidden="true">
        <defs>
          {/* Shared turbulence source for displacement — very fine grain */}
          <filter id="engrave-grain-source" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65 0.75"
              numOctaves="4"
              seed="8"
              result="grain"
            />
          </filter>

          {/* Logo engraving — shallow stamp, 1.5px depth */}
          <filter id="engrave-mark" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
            {/* Step 1: blur the source to create bevel mask */}
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
            {/* Step 2: offset downward to create shadow ledge */}
            <feOffset in="blur" dx="0" dy="1.5" result="offsetBlur" />
            {/* Step 3: clip offset blur to original shape */}
            <feComposite in="offsetBlur" in2="SourceGraphic" operator="in" result="shadow" />
            {/* Step 4: displace by grain so edges inherit stone texture */}
            <feTurbulence type="fractalNoise" baseFrequency="0.65 0.75" numOctaves="4" seed="8" result="grain" />
            <feDisplacementMap in="shadow" in2="grain" scale="1.5" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            {/* Step 5: specular highlight — light catches upper bevel edge */}
            <feSpecularLighting
              in="displaced"
              surfaceScale="2"
              specularConstant="0.8"
              specularExponent="20"
              lightingColor="#d6b36a"
              result="specular"
            >
              <fePointLight x="120" y="80" z="180" />
            </feSpecularLighting>
            {/* Step 6: blend highlight into stone surface */}
            <feComposite in="specular" in2="SourceGraphic" operator="in" result="litSpecular" />
            <feBlend in="SourceGraphic" in2="litSpecular" mode="screen" result="final" />
            {/* Step 7: darken overall — logo is stone, not bright */}
            <feComponentTransfer in="final">
              <feFuncA type="linear" slope="0.9" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

      {/* Logo mark — stone fill, engraved */}
      <div style={{ filter: "url(#engrave-mark)", display: "inline-block" }}>
        <svg
          width="52"
          height="52"
          viewBox="0 0 120 120"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <clipPath id="engrave-logo-clip">
              <rect x="0" y="0" width="120" height="66" />
            </clipPath>
          </defs>
          {/* Fill with stone tone, not white/gold — the filter adds the specular highlight */}
          <circle cx="60" cy="60" r="36" fill="#2a2820" clipPath="url(#engrave-logo-clip)" />
          <rect x="18" y="66" width="84" height="4" fill="#2a2820" />
          <rect x="18" y="78" width="60" height="4" fill="#1e1c18" opacity="0.7" />
        </svg>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verify the file has no TypeScript errors**

```bash
cd apps/demo && npx tsc --noEmit 2>&1 | grep engraved-logo
```

Expected: no output (no errors).

---

## Task 2: `<EngravedText>` Component

Build the `#engrave-inscription` filter and the headline component. The headline should feel excavated — deeper than the logo, more like a temple carving than a stamp. Uses the same grain source defined in Task 1.

**Files:**
- Create: `apps/demo/src/components/landing/engraved-text.tsx`

**Interfaces:**
- Consumes: SVG filter `engrave-grain-source` defined in Task 1's `<EngravedLogo />` (must render first in the DOM)
- Produces: `<EngravedText />` — zero props, renders the two-line headline. Used in Task 4.

- [ ] **Step 1: Create the file**

```tsx
// apps/demo/src/components/landing/engraved-text.tsx
"use client";

export function EngravedText() {
  return (
    <>
      {/* Inscription filter — deeper carve than the mark */}
      <svg width="0" height="0" style={{ position: "absolute", overflow: "hidden" }} aria-hidden="true">
        <defs>
          <filter id="engrave-inscription" x="-5%" y="-15%" width="110%" height="130%" colorInterpolationFilters="sRGB">
            {/* Wider blur = deeper bevel */}
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            {/* Deeper offset = more depth */}
            <feOffset in="blur" dx="0" dy="4" result="offsetBlur" />
            <feComposite in="offsetBlur" in2="SourceGraphic" operator="in" result="shadow" />
            {/* Same grain frequency as logo for material consistency */}
            <feTurbulence type="fractalNoise" baseFrequency="0.65 0.75" numOctaves="4" seed="8" result="grain" />
            <feDisplacementMap in="shadow" in2="grain" scale="2.5" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            {/* Specular — same fePointLight position as logo for unified light source */}
            <feSpecularLighting
              in="displaced"
              surfaceScale="3.5"
              specularConstant="0.6"
              specularExponent="14"
              lightingColor="#d6b36a"
              result="specular"
            >
              <fePointLight x="120" y="80" z="180" />
            </feSpecularLighting>
            <feComposite in="specular" in2="SourceGraphic" operator="in" result="litSpecular" />
            <feBlend in="SourceGraphic" in2="litSpecular" mode="screen" />
          </filter>
        </defs>
      </svg>

      {/*
        Technique: filter on wrapper div, background-clip:text on h1 inside it.
        filter and background-clip:text cannot be on the same element.
        The wrapper applies depth; the h1 applies stone material to the letterforms.
      */}
      <div style={{ filter: "url(#engrave-inscription)" }}>
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
            fontSize: "clamp(32px, 4.2vw, 62px)",
            fontWeight: 700,
            letterSpacing: "0.02em",
            lineHeight: 1.1,
            textAlign: "center",
            // Stone material on letterforms — same dark gradient as the wall
            backgroundImage: "linear-gradient(170deg, #2a2820 0%, #1a1814 40%, #0f0e0a 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
            // Ensure text remains selectable
            userSelect: "text",
          }}
        >
          <span style={{ display: "block" }}>Settle in the dark</span>
          <span style={{ display: "block" }}>Prove in the light</span>
        </h1>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd apps/demo && npx tsc --noEmit 2>&1 | grep engraved-text
```

Expected: no output.

---

## Task 3: Hero CSS Classes

Add the obsidian hero CSS to `site.css`. These classes implement the full 10-layer material stack. Do not remove any existing classes — only append.

**Files:**
- Modify: `apps/demo/src/app/site.css` (append to end of file)

**Interfaces:**
- Produces: CSS classes `.hero-obsidian`, `.hero-chamber-img`, `.hero-obsidian-tint`, `.hero-beam`, `.hero-depth`, `.hero-stone-bands`, `.hero-vein`, `.hero-grain`, `.hero-sill`, `.hero-content` used in Task 4.

- [ ] **Step 1: Append the following CSS block to the end of `site.css`**

Open [apps/demo/src/app/site.css](apps/demo/src/app/site.css) and append:

```css
/* ============================================================
   OBSIDIAN HERO — Darknyx Monumental Chamber
   Layer order: form → tint → beam → depth → bands → veins → grain → content → sill
   ============================================================ */

/* Spotlight beam drift — CSS only, no JS */
@property --beam-x {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 26%;
}
@property --beam-angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 145deg;
}

@keyframes hero-beam-drift {
  0%   { --beam-x: 26%; --beam-angle: 143deg; }
  100% { --beam-x: 36%; --beam-angle: 148deg; }
}
@media (prefers-reduced-motion: reduce) {
  @keyframes hero-beam-drift { 0%, 100% { --beam-x: 30%; --beam-angle: 145deg; } }
}

/* Root container */
.hero-obsidian {
  position: relative;
  width: 100%;
  min-height: 100svh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #050505;
  /* Animate beam properties */
  animation: hero-beam-drift 24s ease-in-out infinite alternate;
}

/* Layer 1: architectural form — the chamber image */
.hero-chamber-img {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.hero-chamber-img img {
  width: 125%; /* Art-direction: start at 125%, tune up to 135% */
  height: 100%;
  object-fit: cover;
  object-position: center center;
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  /* Slightly darken the raw photo — material system takes over from here */
  filter: brightness(0.55) contrast(1.05);
}

/* Layer 2: obsidian base tint */
.hero-obsidian-tint {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: rgba(5, 5, 5, 0.55);
}

/* Layer 3: directional beam — light entering from upper-left through unseen opening */
.hero-beam {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  /* Primary beam: long directional gradient */
  background:
    linear-gradient(
      var(--beam-angle),
      rgba(214, 179, 106, 0.09) 0%,
      rgba(214, 179, 106, 0.05) 22%,
      rgba(214, 179, 106, 0.02) 40%,
      transparent 62%
    ),
    /* Volumetric haze: wide soft cone at beam origin */
    conic-gradient(
      from 135deg at var(--beam-x) 0%,
      transparent 0deg,
      rgba(214, 179, 106, 0.04) 18deg,
      transparent 36deg
    );
  mix-blend-mode: screen;
}

/* Layer 4: depth system */
.hero-depth {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  background:
    /* Corner/edge vignette */
    radial-gradient(
      ellipse 90% 85% at 50% 50%,
      transparent 40%,
      rgba(5, 5, 5, 0.5) 80%,
      rgba(5, 5, 5, 0.82) 100%
    ),
    /* Left junction shadow — pillar meets wall */
    linear-gradient(
      90deg,
      rgba(5, 5, 5, 0.55) 0%,
      rgba(5, 5, 5, 0.25) 10%,
      transparent 20%
    ),
    /* Right junction shadow */
    linear-gradient(
      270deg,
      rgba(5, 5, 5, 0.55) 0%,
      rgba(5, 5, 5, 0.25) 10%,
      transparent 20%
    ),
    /* Bottom depth — implies floor below */
    linear-gradient(
      180deg,
      transparent 55%,
      rgba(5, 5, 5, 0.6) 100%
    );
}

/* Layer 5: stone surface bands — wall face has mass */
.hero-stone-bands {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
  background:
    linear-gradient(90deg,
      transparent 0%,
      rgba(20, 18, 14, 0.06) 28%,
      transparent 34%,
      rgba(10, 9, 7, 0.04) 52%,
      transparent 58%,
      rgba(18, 16, 12, 0.05) 74%,
      transparent 82%
    );
}

/* Layer 6: gold veins — geological, originating near pillars */
.hero-vein {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  background:
    /* Left vein: originates near left pillar edge, angles inward */
    linear-gradient(
      155deg,
      transparent 0%,
      transparent 12%,
      rgba(214, 179, 106, 0.05) 13%,
      rgba(214, 179, 106, 0.04) 14%,
      transparent 15%,
      transparent 100%
    ),
    /* Right vein: mirrors from right pillar edge */
    linear-gradient(
      205deg,
      transparent 0%,
      transparent 14%,
      rgba(214, 179, 106, 0.04) 15%,
      rgba(214, 179, 106, 0.03) 16%,
      transparent 17%,
      transparent 100%
    );
}

/* Layer 7: roughness grain — nearly invisible, supports material, never dominates */
.hero-grain {
  position: absolute;
  inset: 0;
  z-index: 6;
  pointer-events: none;
  opacity: 0.05;
  /* SVG turbulence as background-image data URI */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 300px 300px;
  mix-blend-mode: overlay;
}

/* Layer 8 (content): hero content centred in chamber */
.hero-obsidian-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0 clamp(24px, 5vw, 80px);
  max-width: 640px;
  width: 100%;
  gap: 0;
}

/* Wordmark row under logo */
.hero-wordmark {
  font-family: var(--font-space-grotesk), system-ui, sans-serif;
  font-size: clamp(11px, 1.2vw, 13px);
  font-weight: 600;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: rgba(214, 179, 106, 0.35);
  margin-top: 10px;
  margin-bottom: 28px;
}

/* Lede */
.hero-obsidian-lede {
  margin: 28px 0 0;
  font-family: var(--font-space-grotesk), system-ui, sans-serif;
  font-size: clamp(13px, 1.3vw, 15px);
  line-height: 1.75;
  color: rgba(214, 179, 106, 0.38);
  max-width: 38ch;
  text-align: center;
}

/* CTA row */
.hero-obsidian-cta {
  margin-top: 32px;
  display: flex;
  align-items: center;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Layer 10: basalt sill — structural foundation connecting pillar bases */
.hero-sill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9;
  pointer-events: none;
}
.hero-sill::before {
  /* Gold highlight — beam grazes the sill edge */
  content: "";
  display: block;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(214, 179, 106, 0.18) 20%,
    rgba(214, 179, 106, 0.22) 50%,
    rgba(214, 179, 106, 0.18) 80%,
    transparent 100%
  );
}
.hero-sill::after {
  /* Sill body — 3px, stone tone */
  content: "";
  display: block;
  height: 3px;
  background: linear-gradient(
    90deg,
    #050505 0%,
    #1a1a1a 15%,
    #1a1a1a 85%,
    #050505 100%
  );
}

/* Reduced motion: freeze beam */
@media (prefers-reduced-motion: reduce) {
  .hero-obsidian {
    animation: none;
    --beam-x: 30%;
    --beam-angle: 145deg;
  }
}

/* Mobile adjustments */
@media (max-width: 760px) {
  .hero-chamber-img img {
    width: 180%; /* pillars bleed more aggressively on mobile */
    object-position: center top;
  }
}
```

- [ ] **Step 2: Verify the CSS parses without errors by checking the dev server starts cleanly**

```bash
cd apps/demo && npm run dev 2>&1 | head -20
```

Expected: no CSS parse errors in output.

---

## Task 4: Wire the Hero in `page.tsx`

Replace the existing hero block (lines 154–244) with the obsidian chamber. Import the two new components. Keep all markup above line 154 (nav, SVG symbols) and all markup after line 244 (section divider, sections, footer) completely untouched.

**Files:**
- Modify: `apps/demo/src/app/landing/page.tsx`

**Interfaces:**
- Consumes: `<EngravedLogo />` from Task 1, `<EngravedText />` from Task 2, CSS classes from Task 3.

- [ ] **Step 1: Add imports at the top of `page.tsx`**

After the existing imports (line 5 currently has `import { LandingHero } from ...`), add:

```tsx
import { EngravedLogo } from "@/components/landing/engraved-logo";
import { EngravedText } from "@/components/landing/engraved-text";
```

The existing `import { LandingHero }` line can stay — `LandingHero` is imported but never rendered in the JSX, so it's harmless. Do not remove it.

- [ ] **Step 2: Replace the hero `<header>` block**

Find and replace the entire block from:
```tsx
      {/* ===================== HERO ===================== */}
      <header className="hero hero-parallax" style={{ backgroundImage: "url('/assets/hero-columns.png')" }}>
```
to (and including):
```tsx
      </header>
```
(that's lines 154–244 in the current file)

Replace with:

```tsx
      {/* ===================== HERO — OBSIDIAN CHAMBER ===================== */}
      <header className="hero-obsidian">

        {/* Layer 1: architectural form */}
        <div className="hero-chamber-img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/hero-columns.png"
            alt=""
            aria-hidden="true"
            fetchPriority="high"
          />
        </div>

        {/* Layer 2: obsidian tint */}
        <div className="hero-obsidian-tint" aria-hidden="true" />

        {/* Layer 3: directional beam */}
        <div className="hero-beam" aria-hidden="true" />

        {/* Layer 4: depth system */}
        <div className="hero-depth" aria-hidden="true" />

        {/* Layer 5: stone surface bands */}
        <div className="hero-stone-bands" aria-hidden="true" />

        {/* Layer 6: gold veins */}
        <div className="hero-vein" aria-hidden="true" />

        {/* Layer 7: roughness grain */}
        <div className="hero-grain" aria-hidden="true" />

        {/* Layer 8: content — engraved into the chamber face */}
        <div className="hero-obsidian-content">

          {/* Engraved mark — stamped, shallow */}
          <EngravedLogo />

          {/* Wordmark */}
          <div className="hero-wordmark" aria-hidden="true">darknyx</div>

          {/* Engraved headline — temple inscription, excavated */}
          <EngravedText />

          {/* Lede */}
          <p className="hero-obsidian-lede">
            A privacy-preserving order book where intent is hidden inside attested hardware and every fill settles trustlessly on Solana — verified, never trusted.
          </p>

          {/* CTA */}
          <div className="hero-obsidian-cta">
            <Link className="btn" href="/docs">
              How Darknyx works <span className="arr">→</span>
            </Link>
          </div>
        </div>

        {/* Layer 9: basalt sill — PILLAR → SILL → PILLAR */}
        <div className="hero-sill" aria-hidden="true" />

      </header>
```

- [ ] **Step 3: Verify no TypeScript errors across the file**

```bash
cd apps/demo && npx tsc --noEmit 2>&1 | grep "landing/page"
```

Expected: no output.

- [ ] **Step 4: Start the dev server and open the page**

```bash
cd apps/demo && npm run dev
```

Open `http://localhost:3001/landing` (or wherever the landing route is served).

**Visual checks (silence test first):**

1. Take a mental screenshot before any animation plays. Does the chamber feel atmospheric and institutional? If not, the architecture needs fixing before the beam animation matters.
2. Pillars bleed off both horizontal edges — increase `width` in `.hero-chamber-img img` from 125% toward 130% then 135% until pillars feel structurally dominant but pillar capital detail stays readable.
3. The sill appears as a clean horizontal foundation at the bottom of the viewport.
4. The gold veins are subtle — you should need to look for them. If you see them immediately on page load, reduce their opacity further.
5. The roughness grain is invisible on first look. If you can see noise artifacts, reduce `.hero-grain` opacity below 0.05.
6. The beam enters from upper-left at an angle — it does not look like a circular glow.
7. Logo and headline appear carved into the stone, not floating above it.
8. Headline is center-aligned.

**Grayscale test:**
Take a screenshot. Paste into any image editor. Convert to grayscale. Apply heavy blur (radius ~20px). You should still see: dark chamber, light pooling from upper-left, pillars flanking the wall face, foundation sill at base. If the composition collapses, the material layers are doing too much work — reduce opacity on layers 5–7.

---

## Task 5: Art-Direction Pass — Pillar Scale and Layer Tuning

This task is deliberately open — it's an art-direction pass, not a code task. The correct values cannot be known without seeing the result.

**Files:**
- Modify: `apps/demo/src/app/site.css` — tune opacity and scale values only

**Checks to run in order:**

- [ ] **Pillar scale** — In `.hero-chamber-img img`, try `width: 125%`, then `130%`, then `135%`. Choose the value where:
  - Pillars feel oversized and load-bearing, not decorative
  - Chamber feels larger than the viewport
  - Architectural detail in pillar capitals (the carved tops) is still readable
  
- [ ] **Gold vein opacity** — The spec is `0.04–0.06`. If veins are noticed immediately, lower to `0.03`. They should feel discovered after several seconds of looking, not seen on first glance.

- [ ] **Roughness grain opacity** — `.hero-grain { opacity: 0.05 }`. If texture reads as a pattern, lower to `0.03`. If the wall feels perfectly flat, try `0.06`. Never go above `0.07`.

- [ ] **Beam opacity** — If the beam reads as a UI glow rather than light entering the chamber, reduce `rgba(214, 179, 106, 0.09)` to `0.06` in `.hero-beam`. The beam should be noticed as light, not as an effect.

- [ ] **Obsidian tint** — `.hero-obsidian-tint` at `rgba(5,5,5,0.55)`. If the image looks flat and textureless, reduce to `0.45`. If architectural detail in the pillars is too visible/bright, increase to `0.62`.

- [ ] **Final silence test** — Take a screenshot with all browser animation disabled (`chrome://flags/#disable-accelerated-video-decode` or `prefers-reduced-motion` via devtools). The chamber must feel monumental. If it doesn't, the architecture needs more work before shipping.

---

## Self-Review Against Spec

**Spec coverage check:**

| Spec requirement | Task that covers it |
|---|---|
| Image provides form, material provides identity | Task 3 (CSS layers over the image), Task 4 (layer ordering) |
| Directional beam, not radial orb | Task 3 (`.hero-beam` uses `linear-gradient` + `conic-gradient`, not `radial-gradient`) |
| Beam: CSS `@keyframes` only, no RAF | Task 3 (`@property` + `@keyframes hero-beam-drift`, no JS) |
| Beam drifts 26%→36% over 24s | Task 3 (`@keyframes hero-beam-drift`, `animation: hero-beam-drift 24s`) |
| `fePointLight` set once, static | Task 1, Task 2 (hardcoded `x="120" y="80" z="180"`, no update) |
| Two filter depths: σ=1.2/dy=1.5 (mark), σ=2.5/dy=4 (inscription) | Task 1, Task 2 |
| Logo fill: stone tone `#2a2820`, not gold | Task 1 |
| Headline: background-clip text, stone gradient | Task 2 |
| Headline center-aligned | Task 2 (CSS `text-align: center`) |
| Letter-spacing `0.02em` | Task 2 |
| Gold veins originate near pillars, opacity 0.04–0.06 | Task 3 (`.hero-vein`) |
| Junction shadows at ~12% and ~88% | Task 3 (`.hero-depth` left/right gradients) |
| Grain opacity 0.04–0.06 | Task 3 (`.hero-grain { opacity: 0.05 }`) |
| Sill: 3px stone + 1px gold highlight | Task 3 (`.hero-sill::before` and `::after`) |
| Sill spans full width | Task 3 (`left: 0; right: 0`) |
| No parallax | Correct — no mousemove listeners anywhere |
| No dust particles | Correct — no particle elements |
| No new npm dependencies | Correct — pure CSS/SVG |
| Pillar scale art-direction | Task 4 (start at 125%, tune in Task 5) |
| Silence test | Task 4 and Task 5 (explicit check steps) |
| Grayscale/blur test | Task 4 (explicit check step) |
| `prefers-reduced-motion` | Task 3 (media query freezes beam, stops animation) |

**Placeholder scan:** No TBDs, no TODOs, all code blocks complete.

**Type consistency:** `EngravedLogo` and `EngravedText` are both zero-prop components — no interface mismatch possible. CSS class names used in Task 4 JSX match exactly the class names defined in Task 3.
