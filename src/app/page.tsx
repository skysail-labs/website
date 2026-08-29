import { HydrationMarker } from "@/components/site/hydration-marker";
import { SiteNav } from "@/components/site/nav";
import { Hero } from "@/components/site/hero";
import { MarketGap } from "@/components/site/market-gap";
import { Counterparties } from "@/components/site/counterparties";
import { Solution } from "@/components/site/solution";
import { Architecture } from "@/components/site/architecture";
import { Thesis } from "@/components/site/thesis";
// Whitepaper band is parked until the paper is published — see whitepaper.tsx.
// import { Whitepaper } from "@/components/site/whitepaper";
import { Contact } from "@/components/site/contact";
import { SiteFooter } from "@/components/site/footer";

/**
 * Darknyx — landing page.
 *
 * The page is a single argument, read top to bottom:
 *   hero          conviction — what this is, and why it matters
 *   market gap    the problem: Solana solved retail, not size
 *   counterparties who the venue is for — the two sides of a block
 *   protocol      how Darknyx closes it, and its honest limits
 *   architecture  the technical case that it actually works
 *   thesis        why this becomes market infrastructure
 *   contact       the way in
 *
 * A whitepaper band sits between thesis and contact once the paper ships; it is
 * built (whitepaper.tsx) but commented out below until then.
 */
export default function HomePage() {
  return (
    <div className="dn">
      <HydrationMarker />
      <SiteNav />

      <main>
        <Hero />
        <hr className="dn-rule" />
        <MarketGap />
        <hr className="dn-rule" />
        <Counterparties />
        <hr className="dn-rule" />
        <Solution />
        <hr className="dn-rule" />
        <Architecture />
        <hr className="dn-rule" />
        <Thesis />
        {/* <hr className="dn-rule" />
        <Whitepaper /> */}
        <hr className="dn-rule" />
        <Contact />
      </main>

      <SiteFooter />
      <div className="dn-grain" aria-hidden="true" />
    </div>
  );
}
