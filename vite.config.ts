/**
 * Vite + Vitest configuration for the portfolio app.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

/**
 * Reads the first `thumbnail: "..."` from the projects catalog (home-grid order).
 *
 * @returns Site-root thumbnail path, or `undefined` if none found.
 */
function firstProjectThumbnail(): string | undefined {
  const src = fs.readFileSync(
    path.join(root, "src/data/projects.ts"),
    "utf8",
  );
  return src.match(/thumbnail:\s*"([^"]+)"/)?.[1];
}

/**
 * Injects `<link rel="preload" as="image">` for the first project card so the
 * LCP URL is discoverable in the initial HTML (dev + production).
 *
 * @returns Vite plugin that transforms `index.html`.
 */
function lcpImagePreloadPlugin(): Plugin {
  return {
    name: "lcp-image-preload",
    transformIndexHtml() {
      const href = firstProjectThumbnail();
      if (!href) return;

      return [
        {
          tag: "link",
          attrs: {
            rel: "preload",
            as: "image",
            href,
          },
          injectTo: "head",
        },
      ];
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), lcpImagePreloadPlugin()],
  // Vitest: Node environment for serverless API unit tests (e.g. api/contact.test.ts).
  test: {
    environment: "node",
    passWithNoTests: true,
  },
});
