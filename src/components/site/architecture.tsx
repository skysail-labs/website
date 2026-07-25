import { Reveal } from "./reveal";
import { SiteLink } from "./site-link";
import { ARCHITECTURE } from "./copy";

export function Architecture() {
  return (
    <section className="dn-section dn-arch" id="architecture">
      <div className="dn-arch-plate" aria-hidden="true" />

      <div className="dn-shell">
        <div className="dn-head">
          <Reveal as="p" className="dn-eyebrow">
            {ARCHITECTURE.label}
          </Reveal>
          <Reveal as="h2" className="dn-display" delay={80}>
            {ARCHITECTURE.title}
          </Reveal>
          <Reveal as="p" className="dn-lede" delay={160}>
            {ARCHITECTURE.intro}
          </Reveal>
        </div>

        <div className="dn-layers">
          {ARCHITECTURE.layers.map((layer, i) => (
            <Reveal key={layer.name} delay={i * 90}>
              <article className="dn-layer">
                <div className="dn-layer-tier">
                  <span className="dn-num">{layer.tier}</span>
                  <span className="dn-name">{layer.name}</span>
                </div>

                <div className="dn-layer-main">
                  <span className="dn-layer-chip">{layer.label}</span>
                  <p className="dn-body">{layer.body}</p>
                </div>

                <div className="dn-layer-cta">
                  <SiteLink className="dn-link" href={layer.href}>
                    {layer.cta}
                    <span className="dn-link-arr" aria-hidden="true">
                      →
                    </span>
                  </SiteLink>
                </div>
              </article>

              {i < ARCHITECTURE.layers.length - 1 && (
                <div className="dn-layer-connector" aria-hidden="true">
                  constrains the layer below
                </div>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
