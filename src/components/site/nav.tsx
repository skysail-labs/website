"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lockup } from "./lockup";
import { SiteLink } from "./site-link";
import { NAV_LINKS, HERO, DEMO, contactHref } from "./copy";

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The drawer overlays the page; keep the body from scrolling underneath it.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <nav className={`dn-nav ${scrolled ? "is-scrolled" : ""}`}>
        <div className="dn-shell dn-nav-inner">
          <Link href="/" className="dn-nav-brand" aria-label="Darknyx home">
            <Lockup markSize={34} fontSize={20} />
          </Link>

          <div className="dn-nav-links">
            {NAV_LINKS.map((link) => (
              <SiteLink key={link.label} href={link.href}>
                {link.label}
              </SiteLink>
            ))}
          </div>

          <div className="dn-nav-end">
            <SiteLink className="dn-btn dn-btn--ghost dn-btn--pill dn-btn--pill-plain" href={DEMO.href}>
              {DEMO.label}
            </SiteLink>
            <SiteLink className="dn-btn dn-btn--primary dn-btn--pill" href={contactHref}>
              {HERO.primaryCta}
              <span className="dn-btn-arr" aria-hidden="true">
                →
              </span>
            </SiteLink>
            <button
              type="button"
              className="dn-nav-toggle"
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <span />
            </button>
          </div>
        </div>
      </nav>

      <div className={`dn-nav-drawer ${open ? "is-open" : ""}`}>
        {NAV_LINKS.map((link) => (
          <SiteLink key={link.label} href={link.href} onClick={() => setOpen(false)}>
            {link.label}
          </SiteLink>
        ))}
        <SiteLink
          className="dn-btn dn-btn--ghost dn-btn--pill dn-btn--pill-plain"
          href={DEMO.href}
          onClick={() => setOpen(false)}
        >
          {DEMO.label}
        </SiteLink>
        <SiteLink
          className="dn-btn dn-btn--primary dn-btn--pill"
          href={contactHref}
          onClick={() => setOpen(false)}
        >
          {HERO.primaryCta}
          <span className="dn-btn-arr" aria-hidden="true">
            →
          </span>
        </SiteLink>
      </div>
    </>
  );
}
