import { Reveal } from "./reveal";
import { ExecutionFlow } from "./execution-flow";
import { PillarIcon, type PillarIconName } from "./icons";
import { SOLUTION } from "./copy";

export function Solution() {
  return (
    <section className="dn-section dn-sol" id="protocol">
      <div className="dn-sol-plate" aria-hidden="true" />

      <div className="dn-shell">
        <div className="dn-head">
          <Reveal as="p" className="dn-eyebrow">
            {SOLUTION.label}
          </Reveal>
          <Reveal as="h2" className="dn-display" delay={80}>
            {SOLUTION.title}
          </Reveal>
          <Reveal as="p" className="dn-lede" delay={160}>
            {SOLUTION.intro}
          </Reveal>
        </div>

        <div className="dn-pillars">
          {SOLUTION.pillars.map((pillar, i) => (
            <Reveal key={pillar.heading} as="article" className="dn-pillar" delay={(i % 2) * 110}>
              <div className="dn-pillar-top">
                <PillarIcon name={pillar.icon as PillarIconName} className="dn-pillar-icon" />
                <span className="dn-pillar-kicker">{pillar.kicker}</span>
              </div>
              <h3>{pillar.heading}</h3>
              <p className="dn-body">{pillar.body}</p>
              <div className="dn-pillar-check">
                <span className="dn-pillar-check-label">What you check</span>
                <p>{pillar.check}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <ExecutionFlow />
      </div>
    </section>
  );
}
