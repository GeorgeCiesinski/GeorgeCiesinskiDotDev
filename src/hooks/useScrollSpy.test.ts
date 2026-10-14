/**
 * Unit tests for the pure scroll-spy picker (no DOM / React).
 */

import { describe, expect, it } from "vitest";
import { pickScrollSpyId } from "./useScrollSpy";

describe("pickScrollSpyId", () => {
  const ids = ["a", "b", "c"];

  it("returns null for an empty id list", () => {
    expect(pickScrollSpyId([], new Map(), 80, 0, 500)).toBeNull();
  });

  it("defaults to the first id when none have crossed the offset", () => {
    const tops = new Map([
      ["a", 200],
      ["b", 400],
      ["c", 600],
    ]);
    expect(pickScrollSpyId(ids, tops, 80, 0, 500)).toBe("a");
  });

  it("picks the last id whose top is at or above the offset", () => {
    const tops = new Map([
      ["a", -10],
      ["b", 50],
      ["c", 200],
    ]);
    expect(pickScrollSpyId(ids, tops, 80, 100, 400)).toBe("b");
  });

  it("does not force the last id at scrollY 0 even when near the document bottom", () => {
    const tops = new Map([
      ["a", 40],
      ["b", 120],
      ["c", 200],
    ]);
    // Short page: already "near bottom" at the top of the document.
    expect(pickScrollSpyId(ids, tops, 80, 0, 50)).toBe("a");
  });

  it("forces the last id when scrolled near the bottom", () => {
    const tops = new Map([
      ["a", -200],
      ["b", -80],
      ["c", 120],
    ]);
    expect(pickScrollSpyId(ids, tops, 80, 400, 40)).toBe("c");
  });
});
