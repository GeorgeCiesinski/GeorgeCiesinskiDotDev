/**
 * Blog post frontmatter and parsed post shape.
 */

/** YAML frontmatter fields authored in each Markdown file. */
export interface PostFrontmatter {
  title: string;
  description: string;
  /** ISO date string, e.g. "2026-09-21". */
  date: string;
  /** Optional last-updated ISO date. */
  updated?: string;
  tags: string[];
  /** When true, omit from production lists. */
  draft?: boolean;
  /** Public path, e.g. "/img/blog/hello-world.jpg". */
  cover?: string;
}

/** A fully parsed post ready for list/detail pages. */
export interface Post extends PostFrontmatter {
  /** URL segment for `/blog/:slug` (from the filename). */
  slug: string;
  /** Markdown body without frontmatter. */
  content: string;
}
