import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk, Cormorant_Garamond } from "next/font/google";

import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
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
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${cormorant.variable} h-full antialiased`}
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
      <body className="min-h-full flex flex-col bg-nyx-ink text-nyx-chalk">{children}</body>
    </html>
  );
}
