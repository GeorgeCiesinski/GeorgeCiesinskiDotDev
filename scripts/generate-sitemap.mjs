/**
 * Builds `public/sitemap.xml` for search engines.
 *
 * Includes home, blog index, published posts (via `blog-fs.mjs`), and project
 * detail pages. Run with `npm run sitemap`, or automatically via `npm run build`.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadPublishedPosts, escapeEntities } from "./blog-fs.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const projectsFile = path.join(root, "src", "data", "projects.ts");
const outFile = path.join(root, "public", "sitemap.xml");
const SITE_URL = "https://georgeciesinski.dev";

/**
 * Reads project URL slugs from `src/data/projects.ts` via `slug: "..."` matches.
 *
 * @returns {string[]}
 */
function loadProjectSlugs() {
  const src = fs.readFileSync(projectsFile, "utf8");
  return [...src.matchAll(/^\s*slug:\s*"([^"]+)"/gm)].map((m) => m[1]);
}

/**
 * Formats one sitemap `<url>` entry.
 *
 * @param {string} loc - Absolute page URL.
 * @param {string} [lastmod] - Optional ISO date (`YYYY-MM-DD`).
 * @returns {string} XML fragment for a single `<url>` block.
 */
function urlEntry(loc, lastmod) {
  const lines = ["  <url>", `    <loc>${escapeEntities(loc)}</loc>`];
  if (lastmod) lines.push(`    <lastmod>${escapeEntities(lastmod)}</lastmod>`);
  lines.push("  </url>");
  return lines.join("\n");
}

/**
 * Writes `public/sitemap.xml` (home, blog, posts, projects).
 */
function main() {
  const posts = loadPublishedPosts();
  const projectSlugs = loadProjectSlugs();
  const entries = [
    urlEntry(`${SITE_URL}/`),
    urlEntry(`${SITE_URL}/blog`),
    ...posts.map((p) => urlEntry(`${SITE_URL}/blog/${p.slug}`, p.date)),
    ...projectSlugs.map((slug) => urlEntry(`${SITE_URL}/projects/${slug}`)),
  ];
  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...entries,
    `</urlset>`,
    ``,
  ].join("\n");
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, xml);
  console.log(
    `Wrote ${outFile} (${posts.length} posts, ${projectSlugs.length} projects)`,
  );
}

main();
