/**
 * Fence-language display helpers for blog code blocks.
 * Highlighting still uses the raw fence token; these map aliases to labels.
 */
import { isValidElement, type ReactNode } from "react";

/** Fence aliases → consistent display labels. */
export const LANGUAGE_LABELS: Record<string, string> = {
  ts: "TypeScript",
  typescript: "TypeScript",
  tsx: "TSX",
  js: "JavaScript",
  javascript: "JavaScript",
  jsx: "JSX",
  html: "HTML",
  css: "CSS",
  bash: "Bash",
  sh: "Bash",
  shell: "Bash",
};

/**
 * Reads `language-*` from the nested `code` child (fence info string).
 *
 * @param children - `pre` children from react-markdown (typically one `code`).
 * @returns Fence language token, or null when absent.
 */
export function getCodeLanguage(children: ReactNode): string | null {
  const child = Array.isArray(children) ? children[0] : children;
  if (!isValidElement<{ className?: string }>(child)) return null;
  const match = /language-([\w-]+)/.exec(child.props.className ?? "");
  return match?.[1] ?? null;
}

/**
 * Maps a fence token to a consistent Title Case / dialect label.
 *
 * @param lang - Raw fence language (e.g. `ts`, `JavaScript`).
 * @returns Display label, or the original token when unmapped.
 */
export function getLanguageLabel(lang: string): string {
  return LANGUAGE_LABELS[lang.toLowerCase()] ?? lang;
}
