/**
 * Unit tests for blog meta prerender helpers.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  absoluteUrl,
  buildHeadTags,
  injectMeta,
  prerenderBlogMeta,
} from "./prerender-blog-meta.mjs";

/** Temp dirs created during a test run; removed in afterEach. */
const tempDirs = [];

/**
 * Creates a temporary directory under the OS temp folder.
 *
 * @returns {string} Absolute path to the new directory.
 */
function makeTempDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "prerender-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("absoluteUrl", () => {
  it("returns undefined for missing paths", () => {
    expect(absoluteUrl(undefined)).toBeUndefined();
    expect(absoluteUrl("")).toBeUndefined();
  });

  it("leaves absolute URLs unchanged", () => {
    expect(absoluteUrl("https://cdn.example/img.png")).toBe(
      "https://cdn.example/img.png",
    );
  });

  it("prefixes site-relative paths", () => {
    expect(absoluteUrl("/img/cover.webp", "https://example.com")).toBe(
      "https://example.com/img/cover.webp",
    );
    expect(absoluteUrl("img/cover.webp", "https://example.com")).toBe(
      "https://example.com/img/cover.webp",
    );
  });
});

describe("buildHeadTags", () => {
  it("builds title, description, canonical, and OG tags", () => {
    const html = buildHeadTags(
      {
        title: "My Post",
        description: 'Notes & "quotes"',
        path: "/blog/my-post",
        type: "article",
      },
      { siteUrl: "https://example.com", siteName: "Example" },
    );

    expect(html).toContain("<title>My Post - Example</title>");
    expect(html).toContain('content="Notes &amp; &quot;quotes&quot;"');
    expect(html).toContain(
      '<link rel="canonical" href="https://example.com/blog/my-post" />',
    );
    expect(html).toContain('property="og:type" content="article"');
    expect(html).toContain('name="twitter:card" content="summary"');
    expect(html).not.toContain("og:image");
  });

  it("adds image tags and large Twitter card when a cover is present", () => {
    const html = buildHeadTags(
      {
        title: "Example",
        description: "desc",
        path: "/blog/x",
        type: "article",
        image: "/img/cover.webp",
      },
      { siteUrl: "https://example.com", siteName: "Example" },
    );

    expect(html).toContain(
      'property="og:image" content="https://example.com/img/cover.webp"',
    );
    expect(html).toContain('name="twitter:card" content="summary_large_image"');
  });

  it("does not double-append the site name when already present", () => {
    const html = buildHeadTags(
      {
        title: "Notes - Example",
        description: "desc",
        path: "/blog",
        type: "website",
      },
      { siteName: "Example", siteUrl: "https://example.com" },
    );
    expect(html).toContain("<title>Notes - Example</title>");
    expect(html).not.toContain("Notes - Example - Example");
  });
});

describe("injectMeta", () => {
  it("replaces the default title/description and inserts head tags", () => {
    const template = `<!doctype html>
<html>
  <head>
    <title>Default Title</title>
    <meta name="description" content="Default desc" />
    <link rel="stylesheet" href="/assets/app.css" />
  </head>
  <body></body>
</html>`;
    const out = injectMeta(
      template,
      '<title>New Title</title>\n    <meta name="description" content="New desc" />',
    );

    expect(out).toContain("<title>New Title</title>");
    expect(out).toContain('content="New desc"');
    expect(out).not.toContain("Default Title");
    expect(out).not.toContain("Default desc");
    expect(out).toContain('href="/assets/app.css"');
  });
});

describe("prerenderBlogMeta", () => {
  it("writes blog index and post shells with injected meta", () => {
    const distDir = makeTempDir();
    fs.writeFileSync(
      path.join(distDir, "index.html"),
      `<!doctype html>
<html>
  <head>
    <title>Portfolio</title>
    <meta name="description" content="Portfolio site" />
  </head>
  <body><div id="root"></div></body>
</html>`,
    );

    const result = prerenderBlogMeta({
      distDir,
      posts: [
        {
          slug: "hello-world",
          title: "Hello World",
          description: "First post",
          cover: "/img/blog/hello.webp",
        },
      ],
    });

    expect(result.postCount).toBe(1);

    const indexHtml = fs.readFileSync(
      path.join(distDir, "blog", "index.html"),
      "utf8",
    );
    expect(indexHtml).toContain("<title>Blog - George Ciesinski</title>");
    expect(indexHtml).toContain('href="https://georgeciesinski.dev/blog"');

    const postHtml = fs.readFileSync(
      path.join(distDir, "blog", "hello-world", "index.html"),
      "utf8",
    );
    expect(postHtml).toContain("<title>Hello World - George Ciesinski</title>");
    expect(postHtml).toContain('content="First post"');
    expect(postHtml).toContain(
      'content="https://georgeciesinski.dev/img/blog/hello.webp"',
    );
    expect(postHtml).not.toContain("Portfolio site");
  });

  it("throws when dist/index.html is missing", () => {
    const distDir = makeTempDir();
    expect(() => prerenderBlogMeta({ distDir, posts: [] })).toThrow(
      /dist\/index\.html missing/,
    );
  });
});
