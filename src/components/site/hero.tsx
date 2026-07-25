import { Reveal } from "./reveal";
import { SiteLink } from "./site-link";
import { HERO, contactHref } from "./copy";

export function Hero() {
  return (
    <header className="dn-hero">
      <div className="dn-hero-plate" aria-hidden="true" />
      <div className="dn-hero-veil" aria-hidden="true" />
      <div className="dn-hero-light" aria-hidden="true" />

      <div className="dn-shell">
        <div className="dn-hero-inner">
          <Reveal as="p" className="dn-eyebrow" delay={0} threshold={0}>
            {HERO.eyebrow}
          </Reveal>

          <Reveal as="h1" className="dn-display dn-display--hero" delay={90} threshold={0}>
            {HERO.headline}
          </Reveal>

          <Reveal as="p" className="dn-lede" delay={180} threshold={0}>
            {HERO.body}
          </Reveal>

          <Reveal className="dn-hero-actions" delay={260} threshold={0}>
            <SiteLink className="dn-btn dn-btn--primary" href={contactHref}>
              {HERO.primaryCta}
              <span className="dn-btn-arr" aria-hidden="true">
                →
              </span>
            </SiteLink>
            <a className="dn-btn dn-btn--ghost" href="#protocol">
              {HERO.secondaryCta}
              <span className="dn-btn-arr" aria-hidden="true">
                ↓
              </span>
            </a>
          </Reveal>
        </div>
      </div>
    </header>
  );
}
