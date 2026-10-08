/**
 * Hybrid tag-filter helpers for the blog index: show a fixed number of pills,
 * hide the rest behind More, and pin an active overflow tag when collapsed.
 */

/** How many tag pills to show before the More control. */
export const VISIBLE_TAG_COUNT = 10;

/**
 * Splits a sorted tag list into visible pills and a hidden remainder.
 * When collapsed, pins an active overflow tag into the visible set.
 *
 * @param sortedTags - Tags already ordered (usage or alpha).
 * @param activeTag - Currently selected `?tag=` value, or null.
 * @param expanded - Whether the full list is shown.
 * @returns Visible tags and how many remain hidden.
 */
export function getHybridTagLists(
  sortedTags: string[],
  activeTag: string | null,
  expanded: boolean,
): { visible: string[]; hiddenCount: number } {
  if (expanded || sortedTags.length <= VISIBLE_TAG_COUNT) {
    return { visible: sortedTags, hiddenCount: 0 };
  }

  const head = sortedTags.slice(0, VISIBLE_TAG_COUNT);
  const rest = sortedTags.slice(VISIBLE_TAG_COUNT);

  if (activeTag && rest.includes(activeTag)) {
    const visible = [...head.slice(0, VISIBLE_TAG_COUNT - 1), activeTag];
    return {
      visible,
      hiddenCount: sortedTags.length - visible.length,
    };
  }

  return { visible: head, hiddenCount: rest.length };
}
