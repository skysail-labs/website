import { Reveal } from "./reveal";
import { MARKET_GAP } from "./copy";

export function MarketGap() {
  return (
    <section className="dn-section" id="market">
      <div className="dn-shell">
        <div className="dn-head">
          <Reveal as="p" className="dn-eyebrow">
            {MARKET_GAP.label}
          </Reveal>
          <Reveal as="h2" className="dn-display" delay={80}>
            {MARKET_GAP.title}
          </Reveal>
          <Reveal as="p" className="dn-lede" delay={160}>
            {MARKET_GAP.intro}
          </Reveal>
        </div>

        <div className="dn-gap-grid">
          {MARKET_GAP.panels.map((panel, i) => (
            <Reveal key={panel.venue} as="article" className="dn-gap-panel" delay={i * 110}>
              <span className="dn-gap-index" aria-hidden="true">
                {panel.index}
              </span>
              <h3 className="dn-gap-venue">{panel.venue}</h3>
              <p className="dn-gap-verdict">{panel.heading}</p>
              <p className="dn-body">{panel.body}</p>
            </Reveal>
          ))}
        </div>

        <div className="dn-gap-conclusion">
          <Reveal as="p">{MARKET_GAP.conclusion}</Reveal>
          <Reveal as="div" className="dn-transition" delay={120}>
            {MARKET_GAP.transition.map((step) => (
              <div key={step.text} className="dn-transition-step" data-state={step.state}>
                <span className="dn-dot" aria-hidden="true" />
                {step.text}
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
