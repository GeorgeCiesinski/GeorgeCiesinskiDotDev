/**
 * Unit tests for scroll-spy pure helpers (no DOM / React).
 */

import { describe, expect, it } from "vitest";
import {
  applyScrollSpyNearBottom,
  pickScrollSpyIdFromIntersecting,
  resolveScrollSpyActiveId,
} from "./useScrollSpy";

describe("pickScrollSpyIdFromIntersecting", () => {
  const ids = ["a", "b", "c"];

  it("returns null for an empty id list", () => {
    expect(pickScrollSpyIdFromIntersecting([], new Set())).toBeNull();
  });

  it("returns null when none are intersecting (keep previous in the hook)", () => {
    expect(pickScrollSpyIdFromIntersecting(ids, new Set())).toBeNull();
  });

  it("picks the last intersecting id in document order", () => {
    expect(pickScrollSpyIdFromIntersecting(ids, new Set(["a", "b"]))).toBe("b");
    expect(pickScrollSpyIdFromIntersecting(ids, new Set(["c", "a"]))).toBe("c");
  });
});

describe("applyScrollSpyNearBottom", () => {
  const ids = ["a", "b", "c"];

  it("returns null for an empty id list", () => {
    expect(applyScrollSpyNearBottom([], "a", 100, 40)).toBeNull();
  });

  it("does not force the last id at scrollY 0 even when near the document bottom", () => {
    expect(applyScrollSpyNearBottom(ids, "a", 0, 50)).toBe("a");
  });

  it("forces the last id when scrolled near the bottom", () => {
    expect(applyScrollSpyNearBottom(ids, "b", 400, 40)).toBe("c");
  });

  it("keeps the intersection pick when not near the bottom", () => {
    expect(applyScrollSpyNearBottom(ids, "b", 100, 400)).toBe("b");
  });
});

describe("resolveScrollSpyActiveId", () => {
  const ids = ["a", "b", "c"];

  it("returns null for an empty id list", () => {
    expect(resolveScrollSpyActiveId([], null, "a", 0, 500)).toBeNull();
  });

  it("keeps previous when IO reports nothing intersecting", () => {
    expect(resolveScrollSpyActiveId(ids, null, "b", 100, 400)).toBe("b");
  });

  it("uses IO pick when present", () => {
    expect(resolveScrollSpyActiveId(ids, "c", "b", 100, 400)).toBe("c");
  });

  it("falls back to the first id when IO and previous are empty", () => {
    expect(resolveScrollSpyActiveId(ids, null, null, 0, 500)).toBe("a");
  });

  it("forces the last id near the bottom even if IO is empty", () => {
    expect(resolveScrollSpyActiveId(ids, null, "b", 400, 40)).toBe("c");
  });
});
