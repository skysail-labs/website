import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Anything that leaves the site opens in a new tab, so a visitor reading the
 * page never loses their place. In-page anchors and `mailto:` stay in place.
 *
 * `/docs` counts as leaving: it 301s to the Mintlify docs (see next.config.ts).
 *
 * `/demo` counts too, for a different reason: it is a self-contained static
 * bundle in `public/demo/`, outside the Next router. Routing it through
 * `next/link` would client-navigate to a route that does not exist and render
 * not-found, so it needs a plain anchor and a real document load.
 */
export function isOffsite(href: string) {
  return (
    /^https?:\/\//.test(href) ||
    href === "/docs" ||
    href.startsWith("/docs/") ||
    href === "/demo" ||
    href.startsWith("/demo/") ||
    href.startsWith("/demo?")
  );
}

export function SiteLink({
  href,
  className,
  children,
  onClick,
  "aria-label": ariaLabel,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  "aria-label"?: string;
}) {
  const common = { className, onClick, "aria-label": ariaLabel };

  if (href.startsWith("#")) {
    return (
      <a href={href} {...common}>
        {children}
      </a>
    );
  }

  // Checked before the generic scheme test below, which would otherwise match
  // the `https:` in an absolute URL and skip the new-tab treatment.
  if (isOffsite(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...common}>
        {children}
      </a>
    );
  }

  // mailto:, tel: — open in place, handled by the OS.
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) {
    return (
      <a href={href} {...common}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} {...common}>
      {children}
    </Link>
  );
}
