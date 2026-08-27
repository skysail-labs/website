import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/docs",
        destination: "https://darknyx.mintlify.site/",
        permanent: true,
      },
      {
        source: "/docs/:path*",
        destination: "https://darknyx.mintlify.site/",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    // The interactive demo is a self-contained static bundle in `public/demo/`,
    // built out of the darknyx-showcase project, not a Next route. `public`
    // serves files rather than directory indexes, so `/demo` on its own would
    // 404. Array-form rewrites are checked after the filesystem, which makes
    // this the fallback for exactly that path and leaves the real asset URLs
    // under /demo/assets/ untouched.
    return [
      {
        source: "/demo",
        destination: "/demo/index.html",
      },
    ];
  },
  async headers() {
    return [
      {
        // Vite content-addresses these, and `public` would otherwise serve them
        // with the max-age=0 it applies to everything static.
        source: "/demo/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // The demo holds a decrypted seed in a Worker, so sever the opener
        // relationship with any cross-origin popup.
        //
        // Cross-Origin-Embedder-Policy is deliberately NOT set here: it blocks
        // the demo's TradingView chart iframe under every value, because that
        // page asserts neither CORP nor its own COEP. If a CSP is ever added to
        // this site it must allow s3.tradingview.com (script-src),
        // www.tradingview-widget.com (frame-src), fonts.googleapis.com
        // (style-src) and fonts.gstatic.com (font-src), or the demo degrades.
        source: "/demo/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
      {
        // Circuit artefacts are content-addressed by the upstream build and
        // never mutated in-place. Cache aggressively so repeat proofs reuse
        // the in-memory snarkjs cache without re-downloading 5MB+ assets.
        source: "/circuits/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            // Required so a future Web Worker fetch from a different origin
            // (e.g. preview deploys behind a CDN) doesn't get blocked.
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
