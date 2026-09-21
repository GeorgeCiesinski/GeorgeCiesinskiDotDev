/**
 * Blog catalog: load Markdown from content/blog via Vite glob + gray-matter.
 */

import matter from "gray-matter";
import type { Post, PostFrontmatter } from "../types/post";

const rawPosts = import.meta.glob("../../content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function slugFromPath(path: string): string {
  const file = path.split("/").pop() ?? path;
  return file.replace(/\.md$/, "");
}

function isPostFrontmatter(data: unknown): data is PostFrontmatter {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.title === "string" &&
    typeof d.description === "string" &&
    typeof d.date === "string" &&
    Array.isArray(d.tags) &&
    d.tags.every((t) => typeof t === "string")
  );
}

function parsePost(path: string, raw: string): Post | null {
  const { data, content } = matter(raw);
  if (!isPostFormatter(data)) {
    if (import.meta.env.DEV) {
      console.error(`[posts] Invalid frontmatter in ${path}`, data);
    }
    return null;
  }
  return {
    ...data,
    tags: data.tags,
    draft: data.draft ?? false,
    slug: slugFromPath(path),
    content: content.trim(),
  };
}

const allParsed: Post[] = Object.entries(rawPosts)
  .map(([path, raw]) => parsePost(path, raw))
  .filter((p): p is Post => p !== null);

/** Published posts, newest date first. */
export function getAllPosts(): Post[] {
  return allParsed
    .filter((p) => !p.draft)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

/** Sorted unique tags from published posts. */
export function getAllTags(): string[] {
  const tags = new Set<string>();
  for (const post of getAllPosts()) {
    for (const tag of post.tags) tags.add(tag);
  }
  return [...tags].sort((a, b) => a.localeCompare(b));
}

export function getPostsByTag(tag: string): Post[] {
  return getAllPosts().filter((p) => p.tags.includes(tag));
}
