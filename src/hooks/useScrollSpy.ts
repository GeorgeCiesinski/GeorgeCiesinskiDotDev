/**
 * Generic scroll-spy: tracks which element id is “current” under the sticky nav.
 * Same algorithm idea as the home Navbar spy, but accepts any ordered id list.
 *
 * Offset matches blog heading scroll-margin (`5rem` nav + `0.5rem`) plus slack so
 * hash jumps land past the threshold. Near the page bottom (after the user has
 * scrolled), the last id wins so short trailing sections can still become active.
 */

import { useEffect, useState } from "react";

/** Pixels from document end that count as “near bottom”. */
export const SCROLL_SPY_NEAR_BOTTOM_PX = 100;

/**
 * Pure scroll-spy picker (exported for unit tests).
 *
 * @param idList - Element ids in document order.
 * @param tops - Map of id → `getBoundingClientRect().top`.
 * @param offset - Y threshold under the sticky nav (plus slack).
 * @param scrollY - `window.scrollY`.
 * @param distanceFromBottom - `scrollHeight - (scrollY + innerHeight)`.
 * @param nearBottomPx - Near-bottom threshold (default {@link SCROLL_SPY_NEAR_BOTTOM_PX}).
 * @returns Active id, or `null` when `idList` is empty.
 */
export function pickScrollSpyId(
  idList: readonly string[],
  tops: ReadonlyMap<string, number>,
  offset: number,
  scrollY: number,
  distanceFromBottom: number,
  nearBottomPx: number = SCROLL_SPY_NEAR_BOTTOM_PX,
): string | null {
  if (idList.length === 0) return null;

  let current: string | null = null;

  for (const id of idList) {
    const top = tops.get(id);
    if (top === undefined) continue;
    if (top <= offset) {
      current = id;
    }
  }

  if (current === null) {
    current = idList[0] ?? null;
  }

  // Require scrollY > 0 so short pages that fit in the viewport do not
  // always force the last heading while still at the top.
  if (scrollY > 0 && distanceFromBottom <= nearBottomPx) {
    current = idList[idList.length - 1] ?? current;
  }

  return current;
}

/**
 * Returns the id of the last listed element whose top has crossed under the
 * sticky nav offset. Defaults to the first id when none have crossed yet.
 * Forces the last id when scrolled near the document bottom (and not at y=0).
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

      // Match `.blog-prose h1–h6 { scroll-margin-top: calc(5rem + 0.5rem) }` plus
      // a little slack so a heading parked by a #fragment counts as active.
      const rem = parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      );
      const offset = rem * 5.5 + 16;
      const tops = new Map<string, number>();

      for (const id of idList) {
        const el = document.getElementById(id);
        if (el) tops.set(id, el.getBoundingClientRect().top);
      }

      const distanceFromBottom =
        document.documentElement.scrollHeight -
        (window.scrollY + window.innerHeight);

      setActiveId(
        pickScrollSpyId(
          idList,
          tops,
          offset,
          window.scrollY,
          distanceFromBottom,
        ),
      );
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
