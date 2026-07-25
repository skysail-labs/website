"use client";

import { useEffect } from "react";

/**
 * Confirms to the page that React actually took over.
 *
 * The inline script in the root layout adds `dn-js` (which is what hides
 * scroll-reveal content) and starts a timer to remove it again. This marks
 * `dn-hydrated` so that timer stands down. If hydration never happens the flag
 * never appears, the timer fires, and the content is shown unanimated rather
 * than staying invisible.
 *
 * Also covers back/forward restores: a page returned from the bfcache does not
 * re-run effects, so `pageshow` is where we re-assert the flag.
 */
export function HydrationMarker() {
  useEffect(() => {
    const mark = () => document.documentElement.classList.add("dn-hydrated");
    mark();
    window.addEventListener("pageshow", mark);
    return () => window.removeEventListener("pageshow", mark);
  }, []);

  return null;
}
