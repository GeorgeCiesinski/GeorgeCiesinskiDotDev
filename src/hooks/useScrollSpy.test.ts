/**
 * Unit tests for scroll-spy pure helpers (no DOM / React).
 */

import { describe, expect, it } from "vitest";
import {
  applyScrollSpyNearBottom,
  pickScrollSpyIdFromIntersecting,
} from "./useScrollSpy";

describe("pickScrollSpyIdFromIntersecting", () => {
  const ids = ["a", "b", "c"];

  it("returns null for an empty id list", () => {
    expect(pickScrollSpyIdFromIntersecting([], new Set())).toBeNull();
  });

  it("defaults to the first id when none are intersecting", () => {
    expect(pickScrollSpyIdFromIntersecting(ids, new Set())).toBe("a");
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
