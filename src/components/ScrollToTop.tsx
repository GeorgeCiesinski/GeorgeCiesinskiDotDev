/**
 * Resets the scroll on any hash-less location change.
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls to top when pathname/hash change and there is no hash. Returns early if there is a hash.
 *
 * Section links are handled by Home.
 *
 * @returns null
 */
export function ScrollToTop(): null {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
