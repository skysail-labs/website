import React from "react";
import clsx from "clsx";
import {ThemeClassNames} from "@docusaurus/theme-common";
import useBaseUrl from "@docusaurus/useBaseUrl";
import type {Props} from "@theme/Footer/Layout";

import styles from "./styles.module.css";

// Custom footer layout: darknyx brand (logo + wordmark, gold) on the left, the
// configured link columns pushed to the right, copyright below. The link
// columns still come from `footer.links` in docusaurus.config.ts.
export default function FooterLayout({style, links, copyright}: Props): React.ReactElement {
  return (
    <footer
      className={clsx(ThemeClassNames.layout.footer.container, "footer", {
        "footer--dark": style === "dark",
      })}
    >
      <div className="container container-fluid">
        <div className={styles.top}>
          <a className={styles.brand} href="/" aria-label="darknyx home">
            <img
              className={styles.brandLogo}
              src={useBaseUrl("/img/favicon-dark.svg")}
              alt="darknyx"
              width={26}
              height={26}
            />
            <span className={styles.brandName}>darknyx</span>
          </a>
          <div className={styles.links}>{links}</div>
        </div>
        {copyright && <div className={styles.bottom}>{copyright}</div>}
      </div>
    </footer>
  );
}
