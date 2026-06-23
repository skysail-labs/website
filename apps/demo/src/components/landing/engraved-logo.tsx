"use client";

export function EngravedLogo() {
  return (
    <>
      {/* SVG filter defs — shared by EngravedLogo and EngravedText (must render first in DOM) */}
      <svg
        width="0"
        height="0"
        style={{ position: "absolute", overflow: "hidden" }}
        aria-hidden="true"
      >
        <defs>
          {/* Logo: shallow stamp, 1.5px depth */}
          <filter
            id="engrave-mark"
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
            <feOffset in="blur" dx="0" dy="1.5" result="offsetBlur" />
            <feComposite in="offsetBlur" in2="SourceGraphic" operator="in" result="shadow" />
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65 0.75"
              numOctaves="4"
              seed="8"
              result="grain"
            />
            <feDisplacementMap
              in="shadow"
              in2="grain"
              scale="1.5"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
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
            <feComposite in="specular" in2="SourceGraphic" operator="in" result="litSpecular" />
            <feBlend in="SourceGraphic" in2="litSpecular" mode="screen" result="blended" />
            <feComponentTransfer in="blended">
              <feFuncA type="linear" slope="0.9" />
            </feComponentTransfer>
          </filter>

          {/* Headline: deep temple inscription, 4px depth */}
          <filter
            id="engrave-inscription"
            x="-5%"
            y="-15%"
            width="110%"
            height="130%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feOffset in="blur" dx="0" dy="4" result="offsetBlur" />
            <feComposite in="offsetBlur" in2="SourceGraphic" operator="in" result="shadow" />
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65 0.75"
              numOctaves="4"
              seed="8"
              result="grain"
            />
            <feDisplacementMap
              in="shadow"
              in2="grain"
              scale="2.5"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
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

      {/* Mark — stone fill, filter adds specular highlight */}
      <div style={{ filter: "url(#engrave-mark)", display: "inline-block" }}>
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <clipPath id="engrave-logo-clip">
              <rect x="0" y="0" width="120" height="66" />
            </clipPath>
          </defs>
          {/* Stone tone — warm mid-dark so the specular catch reads against it */}
          <circle
            cx="60"
            cy="60"
            r="36"
            fill="#6e5e42"
            clipPath="url(#engrave-logo-clip)"
          />
          <rect x="18" y="66" width="84" height="4" fill="#6e5e42" />
          <rect x="18" y="78" width="60" height="4" fill="#4a3e2a" opacity="0.8" />
        </svg>
      </div>
    </>
  );
}
