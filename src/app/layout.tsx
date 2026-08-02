import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter, Newsreader } from "next/font/google";

import "./globals.css";

/**
 * Three faces, three jobs, one argument.
 *
 *   Newsreader   display — headlines and pull quotes. The brand voice.
 *   Inter        text    — every running word on the page.
 *   IBM Plex Mono label  — eyebrows, tiers, spec values. Anything tracked.
 *
 * The display face was Cormorant Garamond, which was working against the page
 * in two ways. Its associations are literary and decorative rather than
 * institutional; and as a high-contrast Garamond revival its hairlines thin
 * optically when set light-on-dark, so the headlines rendered fragile on the
 * near-black ground. Newsreader is an editorial face drawn for screens: lower
 * stroke contrast, so it holds its weight inverted, with enough authority to
 * carry a market thesis.
 *
 * Inter and Plex Mono share a rationalist, closed-aperture skeleton with
 * Newsreader's roman, so the three read as one system rather than three
 * borrowed voices. Plex Mono also sets tighter than JetBrains Mono at the
 * micro sizes the eyebrows use, where 0.24em of tracking otherwise sprawls.
 */
const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-text",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-label",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Darknyx",
  description:
    "A privacy-preserving darkpool on Solana with TEE-attested execution and zero-knowledge settlement.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Darknyx - settle in the dark, prove in the light",
    description:
      "A privacy-preserving darkpool on Solana with TEE-attested execution and zero-knowledge settlement.",
    images: ["/brand/og-default.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Darknyx - settle in the dark, prove in the light",
    description:
      "A privacy-preserving darkpool on Solana with TEE-attested execution and zero-knowledge settlement.",
    images: ["/brand/og-default.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${inter.variable} ${plexMono.variable}`}
      // The inline script below adds `dn-js` to this element before React
      // hydrates, so the client className legitimately differs from the
      // server's. Without this, React logs a hydration mismatch on every load.
      suppressHydrationWarning
    >
      <head>
        {/*
          Scroll-reveal content starts at opacity 0, which means it is only
          visible if JavaScript runs. That is a bad trade for a marketing page:
          a blocked or failed chunk, or a back/forward navigation the browser
          serves without re-hydrating, leaves the page with backgrounds but no
          text. So the hiding is gated on this flag instead.

          Runs synchronously before first paint, so there is no flash. If the
          app never hydrates, the timer drops the flag and everything shows.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=document.documentElement;d.classList.add('dn-js');
setTimeout(function(){if(!d.classList.contains('dn-hydrated'))d.classList.remove('dn-js');},2500);})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
