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
          <Reveal as="p" className="dn-lede" delay={220}>
            {MARKET_GAP.intro2}
          </Reveal>
        </div>

        <div className="dn-stats">
          {MARKET_GAP.stats.map((stat, i) => (
            <Reveal key={stat.value} as="article" className="dn-stat" delay={i * 110}>
              <span className="dn-stat-n">{stat.value}</span>
              <p className="dn-stat-l">{stat.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
