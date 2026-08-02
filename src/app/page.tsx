import { HydrationMarker } from "@/components/site/hydration-marker";
import { SiteNav } from "@/components/site/nav";
import { Hero } from "@/components/site/hero";
import { MarketGap } from "@/components/site/market-gap";
import { Solution } from "@/components/site/solution";
import { Architecture } from "@/components/site/architecture";
import { Thesis } from "@/components/site/thesis";
import { Contact } from "@/components/site/contact";
import { SiteFooter } from "@/components/site/footer";

/**
 * Darknyx — landing page.
 *
 * The page is a single argument, read top to bottom:
 *   hero        conviction — what this is, and why it matters
 *   market gap  the problem, and why existing venues do not close it
 *   protocol    how Darknyx closes it
 *   architecture the technical case that it actually works
 *   thesis      why this becomes market infrastructure
 *   contact     the way in
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
        <Solution />
        <hr className="dn-rule" />
        <Architecture />
        <hr className="dn-rule" />
        <Thesis />
        <hr className="dn-rule" />
        <Contact />
      </main>

      <SiteFooter />
      <div className="dn-grain" aria-hidden="true" />
    </div>
  );
}
