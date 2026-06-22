# Darknyx Obsidian Hero — Design Specification

**Date:** 2026-06-22  
**Status:** Approved for implementation  
**Scope:** Hero section only — `apps/demo/src/app/landing/page.tsx` lines 154–244

---

## Core Philosophy

> Favor architecture over decoration.  
> Favor material realism over visual effects.  
> Favor permanence over trendiness.

The hero must feel like **a place**, not a webpage. If a first-time viewer describes it as "cool effects," the implementation has failed. If they describe it as "a place," it has succeeded.

---

## Emotional Target

```
75%  institution
15%  monument
10%  technology
```

Never:
```
40%  technology
40%  visual effects
20%  architecture
```

---

## What This Is Not

- Not cyberpunk
- Not glassmorphism
- Not neon
- Not a shader showcase
- Not a crypto startup aesthetic
- Not a fancy SVG filter demo

---

## What This Is

An ancient financial institution carved into black obsidian stone. The visual language of BlackRock + Ancient Greek temple + cryptographic settlement.

---

## Architecture First: The Chamber

The hero is a single monumental chamber. The viewer is standing inside it.

```
viewport
┌──────────────────────────────────────────────────┐
│▓▓▓▓           WALL FACE              ▓▓▓▓▓▓▓▓▓▓│
│▓PIL│                                 │PIL▓▓▓▓▓▓│
│▓LAR│    [engraved mark]              │LAR▓▓▓▓▓▓│
│▓ B │    SETTLE IN THE DARK           │ B ▓▓▓▓▓▓│
│▓ L │    PROVE IN THE LIGHT           │ L ▓▓▓▓▓▓│
│▓ E │                                 │ E ▓▓▓▓▓▓│
│▓ E │    [lede · CTA]                 │ E ▓▓▓▓▓▓│
│▓ D │_________________________________│ D ▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓  basalt sill  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
└──────────────────────────────────────────────────┘
         ↑ pillars bleed off-screen on both sides
```

The pillars are 20–30% larger than current and bleed off-screen at both horizontal edges. The viewer subconsciously assumes the structure extends beyond the viewport.

---

## Pillar Integration

`hero-columns.png` is **not split into strips**. It is the chamber itself — a single image, scaled to ~130% width, centered. The pillars emerge from the image's natural edges.

**The image provides architectural form. The material system provides identity.**

If the image is later replaced with a 3D render, the design language survives unchanged because the material system — CSS layers — carries the identity.

**Material unification:** Pillars and wall share identical:
- Color temperature (near-black, same dark value)
- Spotlight source (one light, one angle, touches everything)
- Gold vein treatment (veins originate near pillar edges, angle inward)
- Shadow language
- Atmospheric haze

The viewer cannot identify where pillar material ends and wall material begins.

**Junction shadows:** Two narrow vertical gradient overlays at ~12% and ~88% x-position create inward darkness at the pillar-wall junction — implying depth beyond the visible chamber.

---

## Material Layer Stack

Ordered by importance. Architecture carries the composition. Texture is the last thing discovered.

| # | Layer | Technique | Notes |
|---|---|---|---|
| 1 | Architectural form | `hero-columns.png` at 130% scale, `object-fit: cover`, dark tone overlay | Image provides form |
| 2 | Obsidian base tint | `rgba(5,5,5,0.55)` overlay | Darkens image to near-black without destroying depth |
| 3 | Directional beam | Angled `linear-gradient` + `conic-gradient` haze, `mix-blend-mode: screen` | Primary visual event — see Spotlight section |
| 4 | Depth system | Corner/edge vignette radial gradient, junction shadow verticals | Creates chamber depth |
| 5 | Stone surface bands | 3–4 very low-contrast vertical `linear-gradient` bands | Wall face has mass, not flatness |
| 6 | Gold veins | 2 CSS `linear-gradient` lines, originating near pillar edges, ~25–35° angle | `#d6b36a`, opacity 0.08–0.10 |
| 7 | Roughness grain | SVG `feTurbulence` overlay div, opacity 0.04–0.06 | Nearly invisible. Supports, never dominates. |
| 8 | Engraving (logo + text) | SVG filter pipeline — see Engraving section | Most important technical feature |
| 9 | Dust particles | 4–6 absolute divs, upper-left quadrant only | opacity 0.12–0.20 |
| 10 | Basalt sill | 3px rule + 1px gold highlight above | Foundation connecting everything |

### Material Test

Take a screenshot. Convert to grayscale. Blur heavily.

If the chamber still reads as: large dark structure, light from upper-left, pillars flanking a wall — architecture is working.

If the design collapses without texture detail, texture has been given too much responsibility. Architecture and light must carry the experience.

---

## Directional Spotlight

The spotlight is a narrative device, not a visual effect. It directly reinforces: *"Settle in the dark. Prove in the light."*

The page feels dark until light touches it.

**Character:** Light entering a chamber through an unseen opening. Directional, angled, not a point source.

```
  ╲
   ╲  ← beam
    ╲
     ╲
```

Not:
```
  ○  ← radial orb (rejected)
```

**Implementation:**

```css
/* Beam: angled linear-gradient, mix-blend-mode: screen */
background: linear-gradient(
  145deg,
  rgba(214,179,106,0.08) 0%,
  rgba(214,179,106,0.04) 30%,
  transparent 60%
);

/* Volumetric haze: wide soft cone */
/* conic-gradient from upper-left, very low opacity */
```

**Motion:** CSS `@keyframes` only. No `requestAnimationFrame`. No JS sync with the SVG filter.

- `animation-duration: 24s`
- `animation-direction: alternate`
- `animation-timing-function: ease-in-out`
- Beam x-position drifts: 26% → 36%
- Beam angle shifts: ±3°

Motion is so slow users attribute it to their eyes adjusting. Not to animation.

The `fePointLight` in the SVG engraving filter is set once at render time. It does not update during spotlight drift.

---

## Engraving System

The most important technical feature. The logo and headline appear physically carved into the stone — not placed on top of it.

### Two Separate Filter Pipelines

**`#engrave-mark`** — for the NyxMark logo:
```
σ = 1.2    (feGaussianBlur)
dy = 1.5   (feOffset)
depth impression: stamp in stone
```

**`#engrave-inscription`** — for the headline:
```
σ = 2.5    (feGaussianBlur)
dy = 4.0   (feOffset)
depth impression: temple inscription, excavated
```

Differentiation creates hierarchy: the mark is stamped, the headline is carved.

### Filter Architecture (both pipelines share this structure):

```
source graphic
    ↓
feGaussianBlur           ← soft bevel mask
    ↓
feOffset                 ← shifts shadow downward
    ↓
feComposite (in)         ← clips to shape
    ↓
feDisplacementMap        ← inherits stone grain from turbulence source
    ↓
feSpecularLighting       ← light catches upper bevel edge
    ↓
fePointLight             ← same position as directional beam (static)
    ↓
feBlend (multiply)       ← merges into stone surface
```

### Logo Color

`fill` color: `#1a1a1a` — same dark stone tone as the wall. Not gold. Not chalk.

The `feSpecularLighting` specular highlight is warm stone (`#d6b36a`). The logo is illuminated stone, not a colored asset. It appears discovered by light.

### Headline Color

`background-image`: wall texture gradient  
`-webkit-background-clip: text`  
`background-clip: text`  
`color: transparent`

The headline shares identical material with the wall. The letters feel excavated from the surface.

Text remains HTML. Remains selectable. Remains responsive.

### Components

Two new reusable components:

**`EngravedLogo`** (`src/components/landing/engraved-logo.tsx`)
- Wraps NyxMark SVG
- Applies `#engrave-mark` filter
- Sets fill to wall-stone tone

**`EngravedText`** (`src/components/landing/engraved-text.tsx`)
- Renders headline as HTML `<h1>`
- Applies background-clip text for material sharing
- Sibling SVG trick for filter + background-clip coexistence on same element

---

## Basalt Sill

Elevated to structural element. Symbolic. Foundation.

```
PILLAR → SILL → PILLAR
```

The sill is the base of the institution.

**Implementation:**
- 3px solid line, `#1a1a1a`
- 1px highlight line immediately above: `rgba(214,179,106,0.18)` — the beam grazes it
- Spans full hero width
- Anchored to bottom of hero viewport
- Visible in grayscale/blur test — a foundation, not a CSS detail

---

## Dust Particles

4–6 particles. Upper-left quadrant only (where beam enters).

- Size: 1–2px, `border-radius: 50%`
- Color: `rgba(214,179,106,0.18)`
- Opacity range: 0.12–0.20
- Motion: slow upward drift + slight horizontal wander, `@keyframes`, staggered delays
- `prefers-reduced-motion`: particles static, opacity 0.08

If a user notices them consciously, opacity is too high.

---

## Color Palette

| Name | Value | Use |
|---|---|---|
| Obsidian | `#050505` | Base wall color |
| Stone | `#0f0f0f` | Secondary surface |
| Stone highlight | `#1a1a1a` | Engraving fill, sill |
| Gold | `#d6b36a` | Veins, sill highlight, specular |
| No other colors | — | Strict |

---

## Typography

The headline remains large, monumental, left-aligned. No changes to font choice (Space Grotesk) or sizing (`clamp(32px, 4.2vw, 62px)`). Letter-spacing increases to `0.02em` to reinforce inscription quality.

The lede and CTA below the headline are unchanged in copy. Visual weight reduced slightly — the engraved headline must dominate.

---

## Parallax

On `mousemove`, three layers shift at different rates:

| Layer | Travel |
|---|---|
| Background image | ~2% |
| Engraved content | ~1% |
| Dust particles | ~3% |

Implemented via `useRef` + `requestAnimationFrame` with throttling. `transform: translate3d` only — no layout reflow.

Disabled entirely under `prefers-reduced-motion`.

---

## Files Changed

| File | Change |
|---|---|
| `apps/demo/src/app/landing/page.tsx` | Hero block (lines 154–244) fully rewritten |
| `apps/demo/src/app/site.css` | Hero-specific classes added |
| `apps/demo/src/components/landing/engraved-text.tsx` | New component |
| `apps/demo/src/components/landing/engraved-logo.tsx` | New component |

## Files Untouched

Nav, all sections below hero, footer, `globals.css`, design tokens, `NyxMark`, `landing-copy.ts`, `hero.tsx` (unused).

---

## Acceptance Criteria

1. **Grayscale/blur test passes** — chamber reads as monumental with color and texture removed
2. **Emotional test passes** — first-time viewer describes it as "a place," not "cool effects"
3. **Architecture test passes** — hide logo and copy; the chamber still feels intentional and institutional
4. **Material hierarchy respected** — turbulence layer is never the first thing noticed
5. **Pillar test passes** — viewer perceives one chamber, not [image] + [wall] + [image]
6. **Motion test passes** — motion is noticed only on second viewing, never on first
7. **Sill test passes** — foundation line visible even in grayscale
