/**
 * After `vite build`: writes per-route `index.html` shells under `dist/blog/`
 * with title/description/OG meta for crawlers.
 *
 * Loads published posts from `blog-fs.mjs` (including year subfolders).
 * Run automatically at the end of `npm run build`.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadPublishedPosts, escapeEntities } from "./blog-fs.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const defaultDistDir = path.join(root, "dist");
const SITE_URL = "https://georgeciesinski.dev";
const SITE_NAME = "George Ciesinski";

/**
 * Resolves a site-relative path or absolute URL to an absolute URL.
 *
 * @param {string | undefined} maybePath - Path like `/img/...` or a full URL.
 * @param {string} [siteUrl] - Absolute site origin.
 * @returns {string | undefined}
 */
export function absoluteUrl(maybePath, siteUrl = SITE_URL) {
  if (!maybePath) return undefined;
  if (maybePath.startsWith("http")) return maybePath;
  return `${siteUrl}${maybePath.startsWith("/") ? "" : "/"}${maybePath}`;
}

/**
 * Builds the inner `<head>` meta block for one route (title, description, OG, Twitter).
 *
 * @param {{
 *   title: string,
 *   description: string,
 *   path: string,
 *   type: string,
 *   image?: string,
 * }} meta - Route SEO fields (`path` is the site path, e.g. `/blog/slug`).
 * @param {{ siteUrl?: string, siteName?: string }} [options] - Site branding overrides.
 * @returns {string} HTML fragment to inject after `<head>`.
 */
export function buildHeadTags(
  { title, description, path: pagePath, type, image },
  { siteUrl = SITE_URL, siteName = SITE_NAME } = {},
) {
  const fullTitle = title.includes(siteName) ? title : `${title} - ${siteName}`;
  const url = `${siteUrl}${pagePath}`;
  const imageUrl = absoluteUrl(image, siteUrl);
  const twitterCard = imageUrl ? "summary_large_image" : "summary";

  const lines = [
    `<title>${escapeEntities(fullTitle)}</title>`,
    `<meta name="description" content="${escapeEntities(description)}" />`,
    `<link rel="canonical" href="${escapeEntities(url)}" />`,
    `<meta property="og:title" content="${escapeEntities(fullTitle)}" />`,
    `<meta property="og:description" content="${escapeEntities(description)}" />`,
    `<meta property="og:url" content="${escapeEntities(url)}" />`,
    `<meta property="og:type" content="${escapeEntities(type)}" />`,
    `<meta property="og:site_name" content="${escapeEntities(siteName)}" />`,
    `<meta name="twitter:card" content="${twitterCard}" />`,
    `<meta name="twitter:title" content="${escapeEntities(fullTitle)}" />`,
    `<meta name="twitter:description" content="${escapeEntities(description)}" />`,
  ];
  if (imageUrl) {
    lines.push(
      `<meta property="og:image" content="${escapeEntities(imageUrl)}" />`,
    );
    lines.push(
      `<meta name="twitter:image" content="${escapeEntities(imageUrl)}" />`,
    );
  }
  return lines.join("\n    ");
}

/**
 * Replaces the default title/description in a Vite `index.html` shell with
 * route-specific meta from {@link buildHeadTags}.
 *
 * @param {string} html - Template HTML (usually `dist/index.html`).
 * @param {string} headInner - Meta markup to insert after `<head>`.
 * @returns {string}
 */
export function injectMeta(html, headInner) {
  let out = html;
  // Strip existing title; replacement is included in headInner.
  out = out.replace(/<title>[^<]*<\/title>/i, () => {
    return "";
  });
  // Remove default description to prevent duplicate.
  out = out.replace(/<meta\s+name=["']description["'][^>]*>\s*/i, "");
  out = out.replace(/<head[^>]*>/i, (open) => `${open}\n    ${headInner}\n`);
  return out;
}

/**
 * Writes `dist/<relDir>/index.html` with injected meta for one route.
 *
 * @param {string} distDir - Absolute path to the Vite `dist` directory.
 * @param {string} relDir - Path under `dist/` (e.g. `blog` or `blog/my-slug`).
 * @param {{
 *   title: string,
 *   description: string,
 *   path: string,
 *   type: string,
 *   image?: string,
 * }} meta - SEO fields passed to {@link buildHeadTags}.
 * @returns {string} Absolute path of the written HTML file.
 */
export function writeShell(distDir, relDir, meta) {
  const dir = path.join(distDir, relDir);
  fs.mkdirSync(dir, { recursive: true });
  const template = fs.readFileSync(path.join(distDir, "index.html"), "utf8");
  const html = injectMeta(template, buildHeadTags(meta));
  const outPath = path.join(dir, "index.html");
  fs.writeFileSync(outPath, html);
  return outPath;
}

/**
 * Prerenders blog index + each published post shell under `dist/blog/`.
 *
 * @param {{
 *   distDir?: string,
 *   posts?: Array<Record<string, unknown> & { slug: string, title: string, description: string, cover?: string }>,
 * }} [options] - Optional overrides for tests.
 * @returns {{ postCount: number }}
 */
export function prerenderBlogMeta(options = {}) {
  const distDir = options.distDir ?? defaultDistDir;
  const indexPath = path.join(distDir, "index.html");
  if (!fs.existsSync(indexPath)) {
    throw new Error("dist/index.html missing - run vite build first");
  }

  const posts = options.posts ?? loadPublishedPosts();

  writeShell(distDir, "blog", {
    title: "Blog",
    description: "Notes on software development and projects.",
    path: "/blog",
    type: "website",
  });

  for (const post of posts) {
    writeShell(distDir, path.join("blog", post.slug), {
      title: post.title,
      description: post.description,
      path: `/blog/${post.slug}`,
      type: "article",
      image: post.cover,
    });
  }

  return { postCount: posts.length };
}

/**
 * CLI entry: prerenders production meta shells or exits when dist is missing.
 */
function main() {
  try {
    const { postCount } = prerenderBlogMeta();
    console.log(`Prerendered meta shells for ${postCount} posts + index.`);
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

const isDirectRun =
  process.argv[1] != null &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirectRun) {
  main();
}
