"use client";

export function EngravedText() {
  return (
    /*
     * Technique: filter on the wrapper div, background-clip:text on the h1 child.
     * Both cannot live on the same element — filter creates a new stacking context
     * that clips background-clip:text. Wrapper handles depth; h1 handles material.
     */
    <div style={{ filter: "url(#engrave-inscription)" }}>
      <h1
        style={{
          margin: 0,
          fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
          fontSize: "clamp(24px, 3.6vw, 52px)",
          fontWeight: 700,
          letterSpacing: "0.02em",
          lineHeight: 1.15,
          textAlign: "center",
          whiteSpace: "nowrap",
          /*
           * Stone material: warm near-white at top catches light (like a real carved edge),
           * graduating to dark gold-grey at base — same temperature as the wall.
           * The engraving filter adds shadow/bevel depth on top of this.
           */
          backgroundImage:
            "linear-gradient(175deg, #c8b898 0%, #9a8a6a 35%, #6e5e42 70%, #3a3020 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          color: "transparent",
          userSelect: "text",
        }}
      >
        <span style={{ display: "block" }}>Settle in the dark</span>
        <span style={{ display: "block" }}>Prove in the light</span>
      </h1>
    </div>
  );
}
