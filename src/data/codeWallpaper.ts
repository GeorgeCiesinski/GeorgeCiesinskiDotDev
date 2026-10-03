/**
 * Build-time source stream for the home code wallpaper.
 *
 * Loads an allowlist of owner-authored modules via Vite `?raw`, flattens them
 * into a continuous inline string (no structured line breaks), and exposes
 * helpers to wrap that stream into canvas lines.
 */

const rawModules = import.meta.glob(
  [
    "../theme/theme.ts",
    "../theme/ThemeProvider.tsx",
    "../theme/theme-context.ts",
    "../App.tsx",
    "../styles/mixins/_breakpoints.scss",
    "../types/post.ts",
    "../components/MarkdownContent.tsx",
  ],
  {
    query: "?raw",
    import: "default",
    eager: true,
  },
) as Record<string, string>;

/**
 * Removes block comments and collapses all whitespace into single spaces so
 * source reads as long continuous lines rather than pretty-printed code.
 *
 * @param source - Raw file contents.
 * @returns Flattened inline source fragment.
 */
function flattenSource(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Flattened allowlisted source joined into one continuous stream. */
export const codeWallpaperStream: string = Object.keys(rawModules)
  .sort()
  .map((path) => flattenSource(rawModules[path] ?? ""))
  .filter(Boolean)
  .join(" ");

/**
 * Wraps a continuous character stream into fixed-width lines for canvas drawing.
 *
 * @param stream - Flattened source text.
 * @param charsPerLine - Characters that fit the canvas width at the current font.
 * @returns Array of line strings (no trailing newlines).
 */
export function wrapCodeLines(stream: string, charsPerLine: number): string[] {
  const width = Math.max(1, Math.floor(charsPerLine));
  if (!stream) return [];

  const lines: string[] = [];
  for (let i = 0; i < stream.length; i += width) {
    lines.push(stream.slice(i, i + width));
  }
  return lines;
}

/**
 * Tiles wrapped lines until the vertical coverage meets `minLineCount`.
 *
 * @param lines - Base wrapped lines from the source stream.
 * @param minLineCount - Minimum number of lines needed for parallax overshoot.
 * @returns Tiled line list (empty if `lines` is empty).
 */
export function tileCodeLines(lines: string[], minLineCount: number): string[] {
  if (lines.length === 0) return [];
  if (lines.length >= minLineCount) return lines;

  const tiled: string[] = [];
  while (tiled.length < minLineCount) {
    tiled.push(...lines);
  }
  return tiled;
}
