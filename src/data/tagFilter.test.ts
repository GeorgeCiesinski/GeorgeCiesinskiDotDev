/**
 * Unit tests for hybrid blog-index tag visibility helpers.
 */

import { describe, expect, it } from "vitest";
import { VISIBLE_TAG_COUNT, getHybridTagLists } from "./tagFilter";

function makeTags(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `tag-${String(i).padStart(2, "0")}`);
}

describe("getHybridTagLists", () => {
  it("returns the full list when at or under the visible limit", () => {
    const tags = makeTags(VISIBLE_TAG_COUNT);
    expect(getHybridTagLists(tags, null, false)).toEqual({
      visible: tags,
      hiddenCount: 0,
    });
  });

  it("shows the first N tags and a hidden remainder when collapsed", () => {
    const tags = makeTags(VISIBLE_TAG_COUNT + 5);
    const result = getHybridTagLists(tags, null, false);
    expect(result.visible).toEqual(tags.slice(0, VISIBLE_TAG_COUNT));
    expect(result.hiddenCount).toBe(5);
  });

  it("shows every tag when expanded", () => {
    const tags = makeTags(VISIBLE_TAG_COUNT + 3);
    expect(getHybridTagLists(tags, null, true)).toEqual({
      visible: tags,
      hiddenCount: 0,
    });
  });

  it("pins an active overflow tag into the visible set when collapsed", () => {
    const tags = makeTags(VISIBLE_TAG_COUNT + 4);
    const active = tags[VISIBLE_TAG_COUNT + 2]!;
    const result = getHybridTagLists(tags, active, false);

    expect(result.visible).toHaveLength(VISIBLE_TAG_COUNT);
    expect(result.visible.at(-1)).toBe(active);
    expect(result.visible.slice(0, -1)).toEqual(
      tags.slice(0, VISIBLE_TAG_COUNT - 1),
    );
    expect(result.hiddenCount).toBe(tags.length - VISIBLE_TAG_COUNT);
    expect(result.visible).not.toContain(tags[VISIBLE_TAG_COUNT - 1]);
  });

  it("does not reshuffle when the active tag is already in the head", () => {
    const tags = makeTags(VISIBLE_TAG_COUNT + 2);
    const active = tags[2]!;
    const result = getHybridTagLists(tags, active, false);

    expect(result.visible).toEqual(tags.slice(0, VISIBLE_TAG_COUNT));
    expect(result.hiddenCount).toBe(2);
  });
});
