/**
 * Unit tests that rehype heading ids stay in sync with extractTocHeadings.
 */

import { describe, expect, it } from "vitest";
import type { Element, Root } from "hast";
import {
  extractTocHeadings,
  rehypeUniqueHeadingIds,
  slugifyHeading,
} from "./headingId";

function textHeading(tagName: string, text: string): Element {
  return {
    type: "element",
    tagName,
    properties: {},
    children: [{ type: "text", value: text }],
  };
}

describe("rehypeUniqueHeadingIds", () => {
  it("assigns the same ids as extractTocHeadings for matching heading text", () => {
    const md = "## Alpha\n\n### Beta\n\n## Alpha\n";
    const extracted = extractTocHeadings(md);

    const tree: Root = {
      type: "root",
      children: [
        textHeading("h2", "Alpha"),
        textHeading("h3", "Beta"),
        textHeading("h2", "Alpha"),
      ],
    };

    rehypeUniqueHeadingIds()(tree);

    const ids = tree.children.map((node) => {
      const el = node as Element;
      return String(el.properties?.id ?? "");
    });

    expect(ids).toEqual(extracted.map((h) => h.id));
    expect(ids).toEqual(["alpha", "beta", "alpha-2"]);
  });

  it("ignores non-heading elements", () => {
    const tree: Root = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "p",
          properties: {},
          children: [{ type: "text", value: "Hello" }],
        },
        textHeading("h4", "Deep"),
      ],
    };

    rehypeUniqueHeadingIds()(tree);

    const paragraph = tree.children[0] as Element;
    const heading = tree.children[1] as Element;
    expect(paragraph.properties?.id).toBeUndefined();
    expect(heading.properties?.id).toBe(slugifyHeading("Deep"));
  });
});
