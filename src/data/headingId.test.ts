/**
 * Unit tests for heading slugify / unique ids / TOC extraction.
 */

import { describe, expect, it } from "vitest";
import {
  extractTocHeadings,
  slugifyHeading,
  uniqueHeadingIds,
} from "./headingId";

describe("slugifyHeading", () => {
  it("lowercases and hyphenates words", () => {
    expect(slugifyHeading("Hello World")).toBe("hello-world");
  });

  it("strips punctuation and collapses hyphens", () => {
    expect(slugifyHeading("What's Next?")).toBe("whats-next");
    expect(slugifyHeading("A — B")).toBe("a-b");
  });

  it("returns section when nothing usable remains", () => {
    expect(slugifyHeading("***")).toBe("section");
    expect(slugifyHeading("   ")).toBe("section");
  });

  it("strips combining accents via NFKD", () => {
    expect(slugifyHeading("Café Résumé")).toBe("cafe-resume");
  });
});

describe("uniqueHeadingIds", () => {
  it("keeps the first slug and suffixes later duplicates", () => {
    expect(uniqueHeadingIds(["Join", "Join", "Join"])).toEqual([
      "join",
      "join-2",
      "join-3",
    ]);
  });

  it("does not suffix distinct headings that share no base", () => {
    expect(uniqueHeadingIds(["Alpha", "Beta"])).toEqual(["alpha", "beta"]);
  });
});

describe("extractTocHeadings", () => {
  it("returns headings of all depths with ids in document order", () => {
    const md = `# Title\n\n## First\n\n### Nested\n\n## Second Section\n`;
    expect(extractTocHeadings(md)).toEqual([
      { id: "title", text: "Title", depth: 1 },
      { id: "first", text: "First", depth: 2 },
      { id: "nested", text: "Nested", depth: 3 },
      { id: "second-section", text: "Second Section", depth: 2 },
    ]);
  });

  it("ignores ## inside fenced code blocks", () => {
    const md = "```\n## Not a heading\n```\n\n## Real\n\n#### Deep\n";
    expect(extractTocHeadings(md)).toEqual([
      { id: "real", text: "Real", depth: 2 },
      { id: "deep", text: "Deep", depth: 4 },
    ]);
  });

  it("dedupes identical titles across levels", () => {
    const md = "## Overview\n\n### Overview\n";
    expect(extractTocHeadings(md)).toEqual([
      { id: "overview", text: "Overview", depth: 2 },
      { id: "overview-2", text: "Overview", depth: 3 },
    ]);
  });

  it("returns an empty list when there are no headings", () => {
    expect(extractTocHeadings("Just a paragraph.\n")).toEqual([]);
  });
});
