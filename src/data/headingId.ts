/**
 * Heading id helpers for blog TOC: slugify plain text and extract headings
 * from Markdown in document order (fenced code ignored via mdast).
 * Also exports a rehype plugin so rendered headings get matching fragment ids.
 */

import { fromMarkdown } from "mdast-util-from-markdown";
import { toString } from "mdast-util-to-string";
import { visit } from "unist-util-visit";
import type { Root as HastRoot, Element as HastElement } from "hast";

/** Heading levels included in the TOC and id plugin (`h1`–`h6`). */
const HEADING_TAGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

/** One TOC entry: stable fragment id, visible label, and markdown depth. */
export type TocHeading = {
  id: string;
  text: string;
  /** Markdown / HTML heading level (`1`–`6`). */
  depth: number;
};

/**
 * Turns heading text into a URL-safe fragment slug.
 *
 * @param text - Plain heading text (may include punctuation / accents).
 * @returns Lowercase hyphenated slug, or `"section"` if empty after cleanup.
 */
export function slugifyHeading(text: string): string {
  const slug = text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "section";
}

/**
 * Assigns unique fragment ids for a list of heading texts in order.
 * First occurrence keeps the base slug; later duplicates get `-2`, `-3`, …
 *
 * @param texts - Heading labels in document order.
 * @returns Parallel array of unique ids.
 */
export function uniqueHeadingIds(texts: string[]): string[] {
  const counts = new Map<string, number>();

  return texts.map((text) => {
    const base = slugifyHeading(text);
    const next = (counts.get(base) ?? 0) + 1;
    counts.set(base, next);
    return next === 1 ? base : `${base}-${next}`;
  });
}

/**
 * Collects all headings from a Markdown body for the post TOC.
 *
 * @param markdown - Post body (no frontmatter).
 * @returns `{ id, text, depth }` entries in document order.
 */
export function extractTocHeadings(markdown: string): TocHeading[] {
  const tree = fromMarkdown(markdown);
  const collected: { text: string; depth: number }[] = [];

  visit(tree, "heading", (node) => {
    collected.push({ text: toString(node), depth: node.depth });
  });

  const ids = uniqueHeadingIds(collected.map((h) => h.text));
  return collected.map((h, i) => ({
    id: ids[i]!,
    text: h.text,
    depth: h.depth,
  }));
}

/**
 * Collects plain text from a hast element tree (enough for heading labels).
 *
 * @param node - Hast element (e.g. an `h2`).
 * @returns Concatenated text node values.
 */
function hastText(node: HastElement): string {
  let out = "";
  for (const child of node.children) {
    if (child.type === "text") out += child.value;
    else if (child.type === "element") out += hastText(child);
  }
  return out;
}

/**
 * Rehype plugin: assigns unique `id`s on `h1`–`h6` using the same rules as
 * {@link extractTocHeadings}, so TOC links match rendered headings.
 *
 * @returns A rehype transformer.
 */
export function rehypeUniqueHeadingIds() {
  return (tree: HastRoot) => {
    const counts = new Map<string, number>();

    visit(tree, "element", (node) => {
      if (!HEADING_TAGS.has(node.tagName)) return;

      const text = hastText(node);
      const base = slugifyHeading(text);
      const next = (counts.get(base) ?? 0) + 1;
      counts.set(base, next);
      const id = next === 1 ? base : `${base}-${next}`;

      node.properties = { ...node.properties, id };
    });
  };
}
