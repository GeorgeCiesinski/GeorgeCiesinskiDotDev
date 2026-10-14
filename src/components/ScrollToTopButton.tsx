/**
 * Floating control that scrolls to the top of the page and clears any
 * `#section` hash from the URL (no fake top fragment).
 */

import { useEffect, useState } from "react";

/** Show the button after scrolling past this many pixels. */
const SHOW_AFTER_PX = 400;

/**
 * Fixed “Back to top” button for long pages (e.g. blog posts).
 * Visible only after the user has scrolled down.
 */
export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    };

    const frame = requestAnimationFrame(update);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
    };
  }, []);

  const handleClick = () => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Drop section hash without adding a history entry or a top fragment.
    if (window.location.hash) {
      const path = `${window.location.pathname}${window.location.search}`;
      window.history.replaceState(null, "", path);
    }

    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      className="scroll-to-top"
      onClick={handleClick}
      aria-label="Back to top"
    >
      Top
    </button>
  );
}
