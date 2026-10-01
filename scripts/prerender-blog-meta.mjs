/**
 * After vite build: write dist/blog/**\/index.html shells with route-specific meta.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist");
const contentDir = path.join(root, "content", "blog");
const SITE_URL = "https://georgeciesinski.dev";
const SITE_NAME = "George Ciesinski";

function parseFrontmatter(raw) {
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

function loadPosts() {
  if (!fs.existsSync(contentDir)) return [];
  return fs
    .readdirSync(contentDir)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(contentDir, file), "utf8");
      const { data } = parseFrontmatter(raw);
      const slug = file.replace(/\.md$/, "");
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
    .sort((a, b) => b.date.localeCompare(a.date));
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function absoluteUrl(maybePath) {
  if (!maybePath) return undefined;
  if (maybePath.startsWith("http")) return maybePath;
  return `${SITE_URL}${maybePath.startsWith("/") ? "" : "/"}${maybePath}`;
}

function buildHeadTags({ title, description, path: pagePath, type, image }) {
  const fullTitle = title.includes(SITE_NAME)
    ? title
    : `${title} - ${SITE_NAME}`;
  const url = `${SITE_URL}${pagePath}`;
  const imageUrl = absoluteUrl(image);
  const twitterCard = imageUrl ? "summary_large_image" : "summary";

  const lines = [
    `<title>${escapeHtml(fullTitle)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<link rel="canonical" href="${escapeHtml(url)}" />`,
    `<meta property="og:title" content="${escapeHtml(fullTitle)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(url)}" />`,
    `<meta property="og:type" content="${escapeHtml(type)}" />`,
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
    `<meta name="twitter:card" content="${twitterCard}" />`,
    `<meta name="twitter:title" content="${escapeHtml(fullTitle)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
  ];
  if (imageUrl) {
    lines.push(
      `<meta property="og:image" content="${escapeHtml(imageUrl)}" />`,
    );
    lines.push(
      `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`,
    );
  }
  return lines.join("\n    ");
}

function injectMeta(html, headInner) {
  let out = html;
  // Replace existing title
  out = out.replace(/<title>[^<]*<\/title>/i, () => {
    // title is included in headInner; strip old and inject block once
    return "";
  });
  // Remove default description to prevent duplicate
  out = out.replace(/<meta\s+name=["']description["'][^>]*>\s*/i, "");
  // Insert after <head>
  out = out.replace(/<head[^>]*>/i, (open) => `${open}\n    ${headInner}\n`);
  return out;
}

function writeShell(relDir, meta) {
  const dir = path.join(distDir, relDir);
  fs.mkdirSync(dir, { recursive: true });
  const template = fs.readFileSync(path.join(distDir, "index.html"), "utf8");
  const html = injectMeta(template, buildHeadTags(meta));
  fs.writeFileSync(path.join(dir, "index.html"), html);
  console.log(`Write ${path.join(relDir, "index.html")}`);
}

function main() {
  if (!fs.existsSync(path.join(distDir, "index.html"))) {
    console.error("dist/index.html missing - run vite build first");
    process.exit(1);
  }

  const posts = loadPosts();

  writeShell("blog", {
    title: "Blog",
    description: "Notes on software development and projects.",
    path: "/blog",
    type: "website",
  });

  for (const post of posts) {
    writeShell(path.join("blog", post.slug), {
      title: post.title,
      description: post.description,
      path: `/blog/${post.slug}`,
      type: "article",
      image: post.cover,
    });
  }

  console.log(`Prerendered meta shells for ${posts.length} posts + index.`);
}

main();
