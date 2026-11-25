/**
 * Resets the scroll on any hash-less location change.
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls the window to top on pathname or hash change when the hash is empty.
 * Hash section targets are handled by Home instead.
 *
 * @returns `null` (side-effect only).
 */
export function ScrollToTop(): null {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
