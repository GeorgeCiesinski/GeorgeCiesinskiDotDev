/**
 * Unit tests for shared Node blog filesystem helpers.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  escapeEntities,
  loadPublishedPosts,
  parseFrontmatter,
  walkMarkdown,
} from "./blog-fs.mjs";

/** Temp dirs created during a test run; removed in afterEach. */
const tempDirs = [];

/**
 * Creates a temporary directory under the OS temp folder.
 *
 * @returns {string} Absolute path to the new directory.
 */
function makeTempDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "blog-fs-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("parseFrontmatter", () => {
  it("parses a YAML frontmatter block and body", () => {
    const raw = `---
title: Hello
description: World
date: "2026-01-01"
tags:
  - vite
---
# Body

Paragraph.`;
    const { data, content } = parseFrontmatter(raw);
    expect(data).toEqual({
      title: "Hello",
      description: "World",
      date: "2026-01-01",
      tags: ["vite"],
    });
    expect(content).toContain("# Body");
    expect(content).toContain("Paragraph.");
  });

  it("returns empty data when fences are missing", () => {
    const raw = "# Just markdown\n";
    expect(parseFrontmatter(raw)).toEqual({ data: {}, content: raw });
  });

  it("returns empty data when YAML is invalid", () => {
    const raw = `---
title: [unterminated
---
body`;
    const { data, content } = parseFrontmatter(raw);
    expect(data).toEqual({});
    expect(content).toBe(raw);
  });
});

describe("escapeEntities", () => {
  it("escapes &, <, >, and double quotes", () => {
    expect(escapeEntities(`A & B <C> "D"`)).toBe(
      "A &amp; B &lt;C&gt; &quot;D&quot;",
    );
  });

  it("stringifies non-string values", () => {
    expect(escapeEntities(42)).toBe("42");
  });
});

describe("walkMarkdown", () => {
  it("returns an empty array when the directory is missing", () => {
    expect(
      walkMarkdown(path.join(os.tmpdir(), "missing-blog-dir-xyz")),
    ).toEqual([]);
  });

  it("recursively collects markdown files only", () => {
    const root = makeTempDir();
    fs.mkdirSync(path.join(root, "2026"), { recursive: true });
    fs.writeFileSync(
      path.join(root, "2026", "post.md"),
      "---\ntitle: A\n---\n",
    );
    fs.writeFileSync(path.join(root, "readme.txt"), "ignore");
    fs.writeFileSync(path.join(root, "nested.md"), "---\ntitle: B\n---\n");

    const files = walkMarkdown(root)
      .map((f) => path.basename(f))
      .sort();
    expect(files).toEqual(["nested.md", "post.md"]);
  });
});

describe("loadPublishedPosts", () => {
  it("skips drafts and invalid frontmatter, sorts by date desc", () => {
    const root = makeTempDir();
    fs.mkdirSync(path.join(root, "2025"), { recursive: true });
    fs.mkdirSync(path.join(root, "2026"), { recursive: true });

    fs.writeFileSync(
      path.join(root, "2026", "newer.md"),
      `---
title: Newer
description: desc
date: "2026-03-01"
tags:
  - a
---
body`,
    );
    fs.writeFileSync(
      path.join(root, "2025", "older.md"),
      `---
title: Older
description: desc
date: "2025-01-01"
tags:
  - b
---
body`,
    );
    fs.writeFileSync(
      path.join(root, "2026", "draft.md"),
      `---
title: Draft
description: desc
date: "2026-04-01"
tags:
  - c
draft: true
---
body`,
    );
    fs.writeFileSync(
      path.join(root, "2026", "invalid.md"),
      `---
title: Missing fields
---
body`,
    );

    const posts = loadPublishedPosts(root);
    expect(posts.map((p) => p.slug)).toEqual(["newer", "older"]);
    expect(posts[0].title).toBe("Newer");
    expect(posts.every((p) => !p.draft)).toBe(true);
  });
});
