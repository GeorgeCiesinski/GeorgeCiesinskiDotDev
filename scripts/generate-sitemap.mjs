/**
 * Builds `public/sitemap.xml` for search engines.
 *
 * Includes home, blog index, published posts (via `blog-fs.mjs`), and project
 * detail pages. Run with `npm run sitemap`, or automatically via `npm run build`.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadPublishedPosts, escapeEntities } from "./blog-fs.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const projectsFile = path.join(root, "src", "data", "projects.ts");
const outFile = path.join(root, "public", "sitemap.xml");
const SITE_URL = "https://georgeciesinski.dev";

/**
 * Reads project URL slugs from a projects catalog TypeScript source file.
 *
 * @param {string} [filePath] - Path to `projects.ts` (defaults to app catalog).
 * @returns {string[]}
 */
export function loadProjectSlugs(filePath = projectsFile) {
  const src = fs.readFileSync(filePath, "utf8");
  return [...src.matchAll(/^\s*slug:\s*"([^"]+)"/gm)].map((m) => m[1]);
}

/**
 * Formats one sitemap `<url>` entry.
 *
 * @param {string} loc - Absolute page URL.
 * @param {string} [lastmod] - Optional ISO date (`YYYY-MM-DD`).
 * @returns {string} XML fragment for a single `<url>` block.
 */
export function urlEntry(loc, lastmod) {
  const lines = ["  <url>", `    <loc>${escapeEntities(loc)}</loc>`];
  if (lastmod) lines.push(`    <lastmod>${escapeEntities(lastmod)}</lastmod>`);
  lines.push("  </url>");
  return lines.join("\n");
}

/**
 * Builds the full sitemap XML document string.
 *
 * @param {Array<{ slug: string, date?: string }>} posts - Published posts.
 * @param {string[]} projectSlugs - Project detail route slugs.
 * @param {string} [siteUrl] - Absolute site origin.
 * @returns {string}
 */
export function buildSitemapXml(posts, projectSlugs, siteUrl = SITE_URL) {
  const entries = [
    urlEntry(`${siteUrl}/`),
    urlEntry(`${siteUrl}/blog`),
    ...posts.map((p) => urlEntry(`${siteUrl}/blog/${p.slug}`, p.date)),
    ...projectSlugs.map((slug) => urlEntry(`${siteUrl}/projects/${slug}`)),
  ];
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...entries,
    `</urlset>`,
    ``,
  ].join("\n");
}

/**
 * Writes `public/sitemap.xml` (home, blog, posts, projects).
 *
 * @param {{
 *   posts?: Array<{ slug: string, date?: string }>,
 *   projectSlugs?: string[],
 *   outPath?: string,
 *   siteUrl?: string,
 * }} [options] - Optional overrides for tests.
 * @returns {{ outPath: string, postCount: number, projectCount: number }}
 */
export function writeSitemap(options = {}) {
  const posts = options.posts ?? loadPublishedPosts();
  const projectSlugs = options.projectSlugs ?? loadProjectSlugs();
  const outPath = options.outPath ?? outFile;
  const siteUrl = options.siteUrl ?? SITE_URL;
  const xml = buildSitemapXml(posts, projectSlugs, siteUrl);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, xml);
  return {
    outPath,
    postCount: posts.length,
    projectCount: projectSlugs.length,
  };
}

/**
 * CLI entry: writes the production sitemap and logs a summary.
 */
function main() {
  const { outPath, postCount, projectCount } = writeSitemap();
  console.log(
    `Wrote ${outPath} (${postCount} posts, ${projectCount} projects)`,
  );
}

const isDirectRun =
  process.argv[1] != null &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirectRun) {
  main();
}
