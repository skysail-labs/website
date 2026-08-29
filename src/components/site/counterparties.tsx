import { Fragment } from "react";
import { Reveal } from "./reveal";
import { COUNTERPARTIES } from "./copy";

/**
 * Who it's for — the two counterparties a block needs, set facing each other
 * across a spine. Side A puts a position on; side B takes one off. The spine
 * is a three-column grid (side · rail · side); the rail carries a single mark
 * at its centre — the cross.
 */
export function Counterparties() {
  return (
    <section className="dn-section" id="counterparties">
      <div className="dn-shell">
        <div className="dn-head">
          <Reveal as="p" className="dn-eyebrow">
            {COUNTERPARTIES.label}
          </Reveal>
          <Reveal as="h2" className="dn-display" delay={80}>
            {COUNTERPARTIES.title}
          </Reveal>
          <Reveal as="p" className="dn-lede" delay={160}>
            {COUNTERPARTIES.intro}
          </Reveal>
        </div>

        <Reveal className="dn-spine">
          {COUNTERPARTIES.sides.map((side, i) => (
            <Fragment key={side.tag}>
              {i === 1 && <span className="dn-spine-rail" aria-hidden="true" />}
              <div className={`dn-side dn-side--${side.side}`}>
                <span className="dn-side-tag">{side.tag}</span>
                <h3 className="dn-side-title">{side.heading}</h3>
                <p className="dn-body">{side.body}</p>
                <ul className="dn-side-list">
                  {side.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </Fragment>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
