/**
 * Generic scroll-spy: tracks which element id is “current” under the sticky nav.
 * Same algorithm idea as the home Navbar spy, but accepts any ordered id list.
 *
 * Offset matches blog `h2` scroll-margin (`5rem` nav + `0.5rem`) plus slack so
 * hash jumps land past the threshold. Near the page bottom, the last id wins
 * so short trailing sections (e.g. Sources) can still become active.
 */

import { useEffect, useState } from "react";

/** Pixels from document end that count as “near bottom”. */
const NEAR_BOTTOM_PX = 100;

/**
 * Returns the id of the last listed element whose top has crossed under the
 * sticky nav offset. Defaults to the first id when none have crossed yet.
 * Forces the last id when scrolled near the document bottom.
 *
 * @param ids - Element ids in document order (e.g. heading fragment ids).
 * @returns Active id, or `null` when `ids` is empty.
 */
export function useScrollSpy(ids: readonly string[]): string | null {
  const idsKey = ids.join("\0");
  const [activeId, setActiveId] = useState<string | null>(() => ids[0] ?? null);

  useEffect(() => {
    const idList = idsKey.length > 0 ? idsKey.split("\0") : [];

    const updateActive = () => {
      if (idList.length === 0) {
        setActiveId(null);
        return;
      }

      // Match `.blog-prose h2 { scroll-margin-top: calc(5rem + 0.5rem) }` plus
      // a little slack so a heading parked by a #fragment counts as active.
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const offset = rem * 5.5 + 16;
      let current: string | null = null;

      for (const id of idList) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= offset) {
          current = id;
        }
      }

      if (current === null) {
        current = idList[0] ?? null;
      }

      // Short final sections often cannot scroll their heading up to `offset`.
      const nearBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - NEAR_BOTTOM_PX;
      if (nearBottom) {
        current = idList[idList.length - 1] ?? current;
      }

      setActiveId(current);
    };

    // Defer initial read so setState is not synchronous in the effect body.
    const frame = requestAnimationFrame(updateActive);
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    window.addEventListener("hashchange", updateActive);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
      window.removeEventListener("hashchange", updateActive);
    };
  }, [idsKey]);

  return activeId;
}
