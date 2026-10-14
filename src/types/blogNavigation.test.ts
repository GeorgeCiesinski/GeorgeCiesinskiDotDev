/**
 * Unit tests for blog list location-state parsing.
 */

import { describe, expect, it } from "vitest";
import { getBlogListLocationState } from "./blogNavigation";

describe("getBlogListLocationState", () => {
  it("returns typed state when blogSearch is a string", () => {
    expect(getBlogListLocationState({ blogSearch: "year=2024&tag=sql" })).toEqual({
      blogSearch: "year=2024&tag=sql",
    });
    expect(getBlogListLocationState({ blogSearch: "" })).toEqual({
      blogSearch: "",
    });
  });

  it("returns null for missing or malformed state", () => {
    expect(getBlogListLocationState(null)).toBeNull();
    expect(getBlogListLocationState(undefined)).toBeNull();
    expect(getBlogListLocationState("year=2024")).toBeNull();
    expect(getBlogListLocationState({ blogSearch: 2024 })).toBeNull();
    expect(getBlogListLocationState({ other: "x" })).toBeNull();
  });
});
