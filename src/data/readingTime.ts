/**
 * Helper for calculating blog post reading time.
 */

/**
 * Calculates the reading time of a blog post and returns the estimated minutes.
 *
 * @param markdown - Markdown text to calculate reading time for.
 * @returns estimated minutes
 */
export function readingMinutes(markdown: string): number {
  const stripped = markdown
    .replace(/```[\w-]*\n?/g, " ") // Replaces backticks that open/close a fence
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ") // Replaces image markdown with a space
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Keep link text only
    .replace(/[#*_>~`]/g, " "); // Replaces leftover chrome (#, *, _, >, ~, `) with a space

  const trimmed = stripped.trim();
  const wordCount = trimmed === "" ? 0 : trimmed.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}
