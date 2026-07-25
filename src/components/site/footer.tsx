import Link from "next/link";
import { Lockup } from "./lockup";
import { SiteLink } from "./site-link";
import { XIcon } from "./icons";
import { FOOTER, CONTACT } from "./copy";

const YEAR = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="dn-footer">
      <div className="dn-footer-plate" aria-hidden="true" />

      <div className="dn-shell">
        <div className="dn-footer-top">
          <div className="dn-footer-brand">
            <Link href="/" className="dn-nav-brand" aria-label="Darknyx home">
              <Lockup markSize={38} fontSize={22} />
            </Link>
            <p className="dn-footer-tagline">{FOOTER.tagline}</p>
          </div>

          {FOOTER.columns.map((column) => (
            <div key={column.title} className="dn-footer-col">
              <h4>{column.title}</h4>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <SiteLink href={link.href}>{link.label}</SiteLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="dn-footer-bottom">
          <span>
            © {YEAR} {FOOTER.legal}
          </span>
          <div className="dn-footer-social">
            <SiteLink href={CONTACT.x} aria-label="Darknyx on X">
              <XIcon size={13} />
            </SiteLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
