import { Reveal } from "./reveal";
import { SiteLink } from "./site-link";
import { WHITEPAPER, whitepaperHref } from "./copy";

/**
 * A full-bleed rule-framed band pointing at the whitepaper. Deliberately quiet
 * — one line of intent and a single action — so it reads as a doorway between
 * the argument above it and the contact section below.
 */
export function Whitepaper() {
  return (
    <section className="dn-section dn-section--tight" id="whitepaper">
      <div className="dn-shell">
        <Reveal className="dn-paper-cta">
          <div className="dn-paper-copy">
            <p className="dn-eyebrow">{WHITEPAPER.label}</p>
            <h2 className="dn-title">{WHITEPAPER.title}</h2>
            <p className="dn-body">{WHITEPAPER.body}</p>
          </div>
          <div className="dn-paper-action">
            <SiteLink className="dn-btn dn-btn--primary" href={whitepaperHref}>
              {WHITEPAPER.cta}
              <span className="dn-btn-arr" aria-hidden="true">
                →
              </span>
            </SiteLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
