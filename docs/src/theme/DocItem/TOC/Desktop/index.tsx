import React from "react";
import TOCDesktop from "@theme-original/DocItem/TOC/Desktop";
import type TOCDesktopType from "@theme/DocItem/TOC/Desktop";
import type {WrapperProps} from "@docusaurus/types";

import styles from "./styles.module.css";

type Props = WrapperProps<typeof TOCDesktopType>;

function TocIcon(): React.ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 6h11M9 12h11M9 18h6" />
      <path d="M4.5 6h.01M4.5 12h.01M4.5 18h.01" />
    </svg>
  );
}

// Wrap the desktop TOC to add an "On this page" heading with an icon above the
// original (untouched) list. The wrapper carries the sticky positioning so the
// heading stays pinned together with the list.
export default function TOCDesktopWrapper(props: Props): React.ReactElement {
  return (
    <div className={styles.tocDesktop}>
      <div className={styles.tocHeading}>
        <TocIcon />
        <span>On this page</span>
      </div>
      <TOCDesktop {...props} />
    </div>
  );
}
