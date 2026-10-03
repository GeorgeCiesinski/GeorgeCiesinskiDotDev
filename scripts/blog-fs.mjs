/**
 * Shared helpers for Node build scripts that read blog Markdown from disk.
 *
 * Used by `generate-sitemap.mjs` and `prerender-blog-meta.mjs`.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

/** Absolute path to `content/blog` (may contain year subfolders). */
export const contentDir = path.join(root, "content", "blog");

/**
 * Splits an optional leading `---` YAML frontmatter block from Markdown body.
 * On missing fences or invalid YAML, returns empty `data` and the original `raw` as `content`.
 *
 * @param {string} raw - Full markdown file contents.
 * @returns {{ data: Record<string, unknown>, content: string }}
 */
export function parseFrontmatter(raw) {
  const trimmed = raw.trimStart();
  const end = trimmed.indexOf("\n---", 3);
  if (!trimmed.startsWith("---") || end === -1) {
    return { data: {}, content: raw };
  }
  const yamlBlock = trimmed.slice(3, end).trim();
  const body = trimmed.slice(end + 4).replace(/^\r?\n/, "");
  try {
    return { data: parseYaml(yamlBlock) ?? {}, content: body };
  } catch {
    return { data: {}, content: raw };
  }
}

/**
 * Recursively collects absolute paths to `*.md` files under `dir`.
 *
 * @param {string} dir - Directory to walk (e.g. {@link contentDir}).
 * @returns {string[]} Markdown file paths (files only; empty if `dir` is missing).
 */
export function walkMarkdown(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkMarkdown(full));
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(full);
  }
  return files;
}

/**
 * Loads published posts from {@link contentDir}, newest `date` first.
 * Walks year subfolders; URL slug is the filename stem (year folder ignored).
 * Skips drafts and entries missing required frontmatter fields.
 *
 * @returns {Array<Record<string, unknown> & { slug: string }>}
 */
export function loadPublishedPosts() {
  return walkMarkdown(contentDir)
    .map((filePath) => {
      const raw = fs.readFileSync(filePath, "utf8");
      const { data } = parseFrontmatter(raw);
      const slug = path.basename(filePath, ".md");
      return { slug, ...data };
    })
    .filter(
      (p) =>
        typeof p.title === "string" &&
        typeof p.description === "string" &&
        typeof p.date === "string" &&
        Array.isArray(p.tags) &&
        !p.draft,
    )
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

/**
 * Escapes `&`, `<`, `>`, and `"` for safe use in HTML/XML text and attributes.
 *
 * @param {unknown} s - Value to stringify and escape.
 * @returns {string}
 */
export function escapeEntities(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
