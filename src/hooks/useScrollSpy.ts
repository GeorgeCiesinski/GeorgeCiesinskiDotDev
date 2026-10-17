/**
 * Generic scroll-spy: tracks which element id is “current” under the sticky nav.
 *
 * Uses IntersectionObserver so scroll updates do not call getBoundingClientRect
 * (avoids forced-reflow diagnostics from layout reads on every scroll).
 *
 * A thin observation band sits just under the sticky nav (matching blog heading
 * scroll-margin). The last intersecting id in document order is active; when
 * none intersect, the first id is used. Near the page bottom (after the user
 * has scrolled), the last id wins so short trailing sections can still activate.
 */

import { useEffect, useState } from "react";

/** Pixels from document end that count as “near bottom”. */
export const SCROLL_SPY_NEAR_BOTTOM_PX = 100;

/** Sticky nav + scroll-margin in rem (see `.blog-prose` heading scroll-margin). */
export const SCROLL_SPY_NAV_OFFSET_REM = 5.5;

/** Extra pixels of slack below the rem offset. */
export const SCROLL_SPY_NAV_OFFSET_SLACK_PX = 16;

/**
 * Picks the active id from headings currently intersecting the spy band.
 * Last intersecting id in document order wins; falls back to the first id.
 *
 * @param idList - Element ids in document order.
 * @param intersectingIds - Ids currently intersecting the observation band.
 * @returns Active id, or `null` when `idList` is empty.
 */
export function pickScrollSpyIdFromIntersecting(
  idList: readonly string[],
  intersectingIds: ReadonlySet<string>,
): string | null {
  if (idList.length === 0) return null;

  let current: string | null = null;
  for (const id of idList) {
    if (intersectingIds.has(id)) current = id;
  }

  return current ?? idList[0] ?? null;
}

/**
 * Forces the last id when scrolled near the document bottom (and not at y=0).
 *
 * @param idList - Element ids in document order.
 * @param current - Id chosen from intersection (may be null).
 * @param scrollY - `window.scrollY`.
 * @param distanceFromBottom - `scrollHeight - (scrollY + innerHeight)`.
 * @param nearBottomPx - Near-bottom threshold (default {@link SCROLL_SPY_NEAR_BOTTOM_PX}).
 * @returns Final active id, or `null` when `idList` is empty.
 */
export function applyScrollSpyNearBottom(
  idList: readonly string[],
  current: string | null,
  scrollY: number,
  distanceFromBottom: number,
  nearBottomPx: number = SCROLL_SPY_NEAR_BOTTOM_PX,
): string | null {
  if (idList.length === 0) return null;

  // Require scrollY > 0 so short pages that fit in the viewport do not
  // always force the last heading while still at the top.
  if (scrollY > 0 && distanceFromBottom <= nearBottomPx) {
    return idList[idList.length - 1] ?? current;
  }

  return current;
}

/**
 * Returns the id of the heading in the sticky-nav observation band.
 * Defaults to the first id when none intersect yet. Forces the last id when
 * scrolled near the document bottom (and not at y=0).
 *
 * @param ids - Element ids in document order (e.g. heading fragment ids).
 * @returns Active id, or `null` when `ids` is empty.
 */
export function useScrollSpy(ids: readonly string[]): string | null {
  const idsKey = ids.join("\0");
  const [activeId, setActiveId] = useState<string | null>(() => ids[0] ?? null);

  useEffect(() => {
    const idList = idsKey.length > 0 ? idsKey.split("\0") : [];
    // Empty list: no subscription; render path returns null (avoid setState in effect).
    if (idList.length === 0) return;

    const intersecting = new Set<string>();
    let observer: IntersectionObserver | null = null;

    const commit = () => {
      const fromIo = pickScrollSpyIdFromIntersecting(idList, intersecting);
      const distanceFromBottom =
        document.documentElement.scrollHeight -
        (window.scrollY + window.innerHeight);

      setActiveId(
        applyScrollSpyNearBottom(
          idList,
          fromIo,
          window.scrollY,
          distanceFromBottom,
        ),
      );
    };

    const observeAll = () => {
      observer?.disconnect();
      intersecting.clear();

      const rem =
        parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const offset =
        rem * SCROLL_SPY_NAV_OFFSET_REM + SCROLL_SPY_NAV_OFFSET_SLACK_PX;
      // 1px-tall band under the nav: heading becomes active as it crosses.
      const bottomMargin = -Math.max(window.innerHeight - offset - 1, 0);

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const id = entry.target.id;
            if (!id) continue;
            if (entry.isIntersecting) intersecting.add(id);
            else intersecting.delete(id);
          }
          commit();
        },
        {
          root: null,
          rootMargin: `-${offset}px 0px ${bottomMargin}px 0px`,
          threshold: 0,
        },
      );

      for (const id of idList) {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      }

      commit();
    };

    // Defer setup so setState is not synchronous in the effect body
    // (react-hooks/set-state-in-effect), same pattern as Navbar scroll-spy.
    const frame = requestAnimationFrame(observeAll);

    // Near-bottom override only (no heading box reads).
    window.addEventListener("scroll", commit, { passive: true });
    window.addEventListener("resize", observeAll);
    window.addEventListener("hashchange", commit);

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("scroll", commit);
      window.removeEventListener("resize", observeAll);
      window.removeEventListener("hashchange", commit);
    };
  }, [idsKey]);

  if (ids.length === 0) return null;
  return activeId;
}
