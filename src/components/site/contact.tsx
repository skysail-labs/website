import { Reveal } from "./reveal";
import { SiteLink } from "./site-link";
import { CONTACT_SECTION, CONTACT, contactHref } from "./copy";

export function Contact() {
  return (
    <section className="dn-section dn-section--tight" id="contact">
      <div className="dn-shell">
        <Reveal className="dn-contact-inner">
          <div className="dn-contact-copy">
            <p className="dn-eyebrow">{CONTACT_SECTION.label}</p>
            <h2 className="dn-display">{CONTACT_SECTION.title}</h2>
            <p className="dn-lede">{CONTACT_SECTION.body}</p>

            <div className="dn-contact-actions">
              <SiteLink className="dn-btn dn-btn--primary" href={contactHref}>
                {CONTACT_SECTION.primaryCta}
                <span className="dn-btn-arr" aria-hidden="true">
                  →
                </span>
              </SiteLink>
              <SiteLink className="dn-btn dn-btn--ghost" href={CONTACT.docs}>
                {CONTACT_SECTION.secondaryCta}
                <span className="dn-btn-arr" aria-hidden="true">
                  →
                </span>
              </SiteLink>
            </div>
          </div>

          <div className="dn-contact-side">
            <p className="dn-mono-label">Who we work with</p>
            <ul className="dn-audiences">
              {CONTACT_SECTION.audiences.map((audience) => (
                <li key={audience}>{audience}</li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
