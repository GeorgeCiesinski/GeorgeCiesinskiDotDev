/**
 * Blog catalog: load Markdown from `content/blog` via Vite `import.meta.glob`,
 * parse YAML frontmatter with the `yaml` package, and expose list/lookup helpers.
 */

import { parse as parseYaml } from "yaml";
import type { Post, PostFrontmatter } from "../types/post";

const rawPosts = import.meta.glob("../../content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

/**
 * Derives the URL slug from a Vite glob path (filename without `.md`).
 *
 * @param path - Glob key, e.g. `../../content/blog/hello-world.md`.
 * @returns Slug segment for `/blog/:slug`.
 */
function slugFromPath(path: string): string {
  const file = path.split("/").pop() ?? path;
  return file.replace(/\.md$/, "");
}

/**
 * Type guard for required YAML frontmatter fields on a post.
 *
 * @param data - Parsed frontmatter object (unknown until validated).
 * @returns Whether `data` satisfies {@link PostFrontmatter}.
 */
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

/**
 * Splits a Markdown string into YAML frontmatter and body.
 * Expects an optional leading `---` … `---` block; on missing or invalid YAML,
 * returns empty `data` and the original `raw` as `content`.
 *
 * @param raw - Full file contents from the Vite raw glob.
 * @returns Parsed `data` object and Markdown `content` after the fence.
 */
function parseFrontmatter(raw: string): { data: unknown; content: string } {
  // Trim whitespace
  const trimmed = raw.trimStart();
  const end = trimmed.indexOf("\n---", 3);

  // If opening or closing fence missing, not frontmatter - return empty data and original raw
  if (!trimmed.startsWith("---") || end === -1) {
    return { data: {}, content: raw };
  }

  // Slices yamlBlock between the fences
  const yamlBlock = trimmed.slice(3, end).trim();

  /**
   * Slices body after \n + --- (4 characters), then removes one newline from the start
   * Matches either Mac/Linux (\n) or optionally Windows (\r\n)
   */
  const body = trimmed.slice(end + 4).replace(/^\r?\n/, "");

  try {
    return { data: parseYaml(yamlBlock) ?? {}, content: body };
  } catch {
    return { data: {}, content: raw };
  }
}

/**
 * Parses one Markdown file into a {@link Post}, or `null` if frontmatter is invalid.
 *
 * @param path - Vite glob path used for the slug and error context.
 * @param raw - Full Markdown source including frontmatter.
 * @returns A post ready for list/detail pages, or `null` when skipped.
 */
function parsePost(path: string, raw: string): Post | null {
  const { data, content } = parseFrontmatter(raw);
  if (!isPostFrontmatter(data)) {
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

/**
 * Returns published posts only, newest `date` first.
 *
 * @returns Sorted non-draft posts.
 */
export function getAllPosts(): Post[] {
  return allParsed
    .filter((p) => !p.draft)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Looks up a published post by its route slug.
 *
 * @param slug - URL slug from `/blog/:slug` (filename stem).
 * @returns Matching post, or `undefined` if unknown or draft.
 */
export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

/**
 * Collects unique tags from published posts, sorted alphabetically.
 *
 * @returns Sorted tag strings.
 */
export function getAllTags(): string[] {
  const tags = new Set<string>();
  for (const post of getAllPosts()) {
    for (const tag of post.tags) tags.add(tag);
  }
  return [...tags].sort((a, b) => a.localeCompare(b));
}

/**
 * Filters published posts that include the given tag.
 *
 * @param tag - Tag string to match (exact).
 * @returns Matching posts in the same order as {@link getAllPosts}.
 */
export function getPostsByTag(tag: string): Post[] {
  return getAllPosts().filter((p) => p.tags.includes(tag));
}
