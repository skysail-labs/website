import { Reveal } from "./reveal";
import { ArticleCard } from "./article-card";
import { ARTICLES, THESIS } from "./copy";

export function Thesis() {
  return (
    <section className="dn-section dn-thesis" id="thesis">
      <div className="dn-thesis-plate" aria-hidden="true" />
      <div className="dn-thesis-veil" aria-hidden="true" />

      <div className="dn-shell">
        <div className="dn-head">
          <Reveal as="p" className="dn-eyebrow">
            {THESIS.label}
          </Reveal>
          <Reveal as="h2" className="dn-display" delay={80}>
            {THESIS.title}
          </Reveal>
          <Reveal as="p" className="dn-lede" delay={160}>
            {THESIS.lede}
          </Reveal>
        </div>

        <div className="dn-articles">
          {ARTICLES.map((article, i) => (
            <Reveal key={article.href} delay={i * 110}>
              <ArticleCard article={article} priority={i === 0} />
            </Reveal>
          ))}
        </div>

        <Reveal className="dn-thesis-closing">
          <p className="dn-thesis-closing-lines">
            {THESIS.closing.lines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
          <p className="dn-body">{THESIS.closing.body}</p>
        </Reveal>
      </div>
    </section>
  );
}
