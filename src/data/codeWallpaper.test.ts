/**
 * Unit tests for code wallpaper line wrapping / tiling helpers.
 */

import { describe, expect, it } from "vitest";
import { tileCodeLines, wrapCodeLines } from "./codeWallpaper";

describe("wrapCodeLines", () => {
  it("returns an empty array for an empty stream", () => {
    expect(wrapCodeLines("", 40)).toEqual([]);
  });

  it("wraps a stream into fixed-width chunks", () => {
    expect(wrapCodeLines("abcdefghij", 4)).toEqual(["abcd", "efgh", "ij"]);
  });

  it("clamps charsPerLine to at least 1", () => {
    expect(wrapCodeLines("ab", 0)).toEqual(["a", "b"]);
    expect(wrapCodeLines("ab", -3)).toEqual(["a", "b"]);
  });

  it("floors fractional widths", () => {
    expect(wrapCodeLines("abcdef", 2.9)).toEqual(["ab", "cd", "ef"]);
  });
});

describe("tileCodeLines", () => {
  it("returns empty when there are no lines", () => {
    expect(tileCodeLines([], 10)).toEqual([]);
  });

  it("returns the original lines when already long enough", () => {
    const lines = ["a", "b", "c"];
    expect(tileCodeLines(lines, 3)).toEqual(lines);
    expect(tileCodeLines(lines, 2)).toEqual(lines);
  });

  it("repeats lines until minLineCount is met", () => {
    expect(tileCodeLines(["x", "y"], 5)).toEqual([
      "x",
      "y",
      "x",
      "y",
      "x",
      "y",
    ]);
  });
});
