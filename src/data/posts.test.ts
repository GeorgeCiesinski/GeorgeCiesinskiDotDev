/**
 * Unit tests for blog list/search/pagination helpers.
 * Uses inline fixture posts so catalog copy can change without breaking tests.
 */

import { describe, expect, it } from "vitest";
import type { Post } from "../types/post";
import {
  POSTS_PER_PAGE,
  getAllPosts,
  getAllTags,
  getPostBySlug,
  getPostsByTag,
  getTagCounts,
  paginatePosts,
  postMatchesQuery,
  searchPosts,
} from "./posts";

/**
 * Builds a minimal published {@link Post} for helper tests.
 *
 * @param overrides - Fields to merge over the default fixture.
 * @returns A complete post object.
 */
function makePost(overrides: Partial<Post> = {}): Post {
  return {
    title: "Hello World",
    description: "A short description about testing.",
    date: "2026-01-15",
    tags: ["testing", "vite"],
    draft: false,
    slug: "hello-world",
    content: "Body with **markdown** and a `code` token.",
    ...overrides,
  };
}

describe("postMatchesQuery", () => {
  const post = makePost({
    title: "Two Sum Walkthrough",
    description: "LeetCode array problem notes",
    tags: ["algorithms", "javascript"],
    content:
      "Use a hash map for O(1) lookups.\n```js\nconst map = {};\n```\nDone.",
  });

  it("matches all posts when the query is empty or whitespace", () => {
    expect(postMatchesQuery(post, "")).toBe(true);
    expect(postMatchesQuery(post, "   ")).toBe(true);
  });

  it("matches title, description, and tags case-insensitively", () => {
    expect(postMatchesQuery(post, "two sum")).toBe(true);
    expect(postMatchesQuery(post, "LEETCODE")).toBe(true);
    expect(postMatchesQuery(post, "Algo")).toBe(true);
  });

  it("matches body text and ignores fenced code blocks", () => {
    expect(postMatchesQuery(post, "hash map")).toBe(true);
    expect(postMatchesQuery(post, "const map")).toBe(false);
  });

  it("returns false when nothing matches", () => {
    expect(postMatchesQuery(post, "postgresql")).toBe(false);
  });
});

describe("searchPosts", () => {
  const posts = [
    makePost({ slug: "a", title: "Alpha", tags: ["css"] }),
    makePost({ slug: "b", title: "Beta", description: "About TypeScript" }),
    makePost({ slug: "c", title: "Gamma", content: "mentions Alpha in body" }),
  ];

  it("filters to matching posts and preserves input order", () => {
    expect(searchPosts(posts, "alpha").map((p) => p.slug)).toEqual(["a", "c"]);
  });

  it("returns the full list for an empty query", () => {
    expect(searchPosts(posts, "")).toEqual(posts);
  });
});

describe("paginatePosts", () => {
  const posts = Array.from({ length: 23 }, (_, i) =>
    makePost({ slug: `post-${i + 1}`, title: `Post ${i + 1}` }),
  );

  it("returns the first page by default window size", () => {
    const result = paginatePosts(posts, 1);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(3);
    expect(result.items).toHaveLength(POSTS_PER_PAGE);
    expect(result.items[0]?.slug).toBe("post-1");
  });

  it("returns the final partial page", () => {
    const result = paginatePosts(posts, 3);
    expect(result.page).toBe(3);
    expect(result.items).toHaveLength(3);
    expect(result.items[0]?.slug).toBe("post-21");
  });

  it("clamps invalid page numbers", () => {
    expect(paginatePosts(posts, 0).page).toBe(1);
    expect(paginatePosts(posts, 99).page).toBe(3);
  });

  it("keeps a single empty page when there are no posts", () => {
    const result = paginatePosts([], 1);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.items).toEqual([]);
  });
});

describe("catalog helpers (live content invariants)", () => {
  it("returns published posts sorted newest-first with required fields", () => {
    const posts = getAllPosts();
    expect(posts.length).toBeGreaterThan(0);
    for (const post of posts) {
      expect(post.draft).toBeFalsy();
      expect(post.title).toBeTruthy();
      expect(post.description).toBeTruthy();
      expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}/);
      expect(Array.isArray(post.tags)).toBe(true);
      expect(post.slug).toBeTruthy();
      expect(typeof post.content).toBe("string");
    }
    for (let i = 1; i < posts.length; i++) {
      expect(
        posts[i - 1]!.date.localeCompare(posts[i]!.date),
      ).toBeGreaterThanOrEqual(0);
    }
  });

  it("looks up posts by slug and returns undefined for unknown slugs", () => {
    const first = getAllPosts()[0];
    expect(first).toBeDefined();
    expect(getPostBySlug(first!.slug)).toEqual(first);
    expect(getPostBySlug("definitely-not-a-real-slug")).toBeUndefined();
  });

  it("collects unique tags sorted by usage by default, or alphabetically", () => {
    const counts = getTagCounts();
    const byUsage = getAllTags();
    const byAlpha = getAllTags("alpha");

    expect(byUsage.length).toBeGreaterThan(0);
    expect(new Set(byUsage).size).toBe(byUsage.length);
    expect(byAlpha).toEqual([...byAlpha].sort((a, b) => a.localeCompare(b)));

    for (let i = 1; i < byUsage.length; i++) {
      const prev = counts.get(byUsage[i - 1]!) ?? 0;
      const next = counts.get(byUsage[i]!) ?? 0;
      expect(prev).toBeGreaterThanOrEqual(next);
      if (prev === next) {
        expect(byUsage[i - 1]!.localeCompare(byUsage[i]!)).toBeLessThanOrEqual(
          0,
        );
      }
    }

    const tagged = getPostsByTag(byUsage[0]!);
    expect(tagged.length).toBeGreaterThan(0);
    expect(tagged.every((p) => p.tags.includes(byUsage[0]!))).toBe(true);
  });
});
