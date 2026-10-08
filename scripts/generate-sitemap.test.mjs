/**
 * Unit tests for sitemap XML generation helpers.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  buildSitemapXml,
  loadProjectSlugs,
  urlEntry,
  writeSitemap,
} from "./generate-sitemap.mjs";

/** Temp dirs created during a test run; removed in afterEach. */
const tempDirs = [];

/**
 * Creates a temporary directory under the OS temp folder.
 *
 * @returns {string} Absolute path to the new directory.
 */
function makeTempDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sitemap-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("urlEntry", () => {
  it("formats a loc-only entry", () => {
    expect(urlEntry("https://example.com/blog")).toBe(
      ["  <url>", "    <loc>https://example.com/blog</loc>", "  </url>"].join(
        "\n",
      ),
    );
  });

  it("includes lastmod and escapes entities", () => {
    const xml = urlEntry("https://example.com/a&b", "2026-01-02");
    expect(xml).toContain("<loc>https://example.com/a&amp;b</loc>");
    expect(xml).toContain("<lastmod>2026-01-02</lastmod>");
  });
});

describe("buildSitemapXml", () => {
  it("includes home, blog index, posts, and projects", () => {
    const xml = buildSitemapXml(
      [{ slug: "hello-world", date: "2026-01-01" }],
      ["galesage"],
      "https://example.com",
    );

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain("<loc>https://example.com/</loc>");
    expect(xml).toContain("<loc>https://example.com/blog</loc>");
    expect(xml).toContain("<loc>https://example.com/blog/hello-world</loc>");
    expect(xml).toContain("<lastmod>2026-01-01</lastmod>");
    expect(xml).toContain("<loc>https://example.com/projects/galesage</loc>");
  });
});

describe("loadProjectSlugs", () => {
  it("extracts slug string literals from a projects catalog file", () => {
    const dir = makeTempDir();
    const filePath = path.join(dir, "projects.ts");
    fs.writeFileSync(
      filePath,
      `export const projects = [
  {
    slug: "alpha",
    title: "A",
  },
  {
    slug: "beta",
    title: "B",
  },
];
`,
    );
    expect(loadProjectSlugs(filePath)).toEqual(["alpha", "beta"]);
  });
});

describe("writeSitemap", () => {
  it("writes XML to the given output path", () => {
    const dir = makeTempDir();
    const outPath = path.join(dir, "sitemap.xml");
    const result = writeSitemap({
      posts: [{ slug: "post-one", date: "2026-02-02" }],
      projectSlugs: ["demo"],
      outPath,
      siteUrl: "https://example.com",
    });

    expect(result.outPath).toBe(outPath);
    expect(result.postCount).toBe(1);
    expect(result.projectCount).toBe(1);
    const written = fs.readFileSync(outPath, "utf8");
    expect(written).toContain("https://example.com/blog/post-one");
    expect(written).toContain("https://example.com/projects/demo");
  });
});
