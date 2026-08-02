import Image from "next/image";

import { articleDate, type Article } from "./copy";

/**
 * An article card.
 *
 * The whole card is one link. The title carries the accessible name, and the
 * "Read more" and arrow that follow it are decorative — announcing "read more"
 * to a screen reader adds nothing to a link that already reads as its title.
 *
 * `priority` is passed by the grid to its first card only: on a long page this
 * image is far below the fold, so the default lazy behaviour is what we want
 * everywhere else.
 */
export function ArticleCard({
  article,
  priority = false,
}: {
  article: Article;
  priority?: boolean;
}) {
  return (
    <a
      className="dn-article"
      href={article.href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="dn-article-media">
        <Image
          className="dn-article-img"
          src={article.image}
          alt={article.alt}
          width={1600}
          height={640}
          priority={priority}
          /* Roughly the card's rendered width at each breakpoint, so the
             browser never downloads more pixels than it paints. */
          sizes="(max-width: 760px) 92vw, (max-width: 1240px) 60vw, 700px"
        />
      </span>

      <span className="dn-article-scrim" aria-hidden="true" />

      <span className="dn-article-body">
        <span className="dn-article-title">
          {article.title}
          <span className="dn-article-more" aria-hidden="true">
            Read more
          </span>
        </span>

        <span className="dn-article-meta">
          <time dateTime={article.date}>{articleDate(article.date)}</time>
          <span className="dn-article-arr" aria-hidden="true">
            ↗
          </span>
        </span>
      </span>
    </a>
  );
}
