/**
 * Renders Markdown body with GFM, syntax-highlighted fenced blocks,
 * a language label from the fence tag, and a Copy control on multiline
 * `pre` blocks (not inline code).
 */
import {
  useRef,
  useState,
  isValidElement,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { Components } from "react-markdown";

type MarkdownContentProps = {
  content: string; /** Markdown body only (no frontmatter). */
};

/** Fence aliases → consistent display labels (highlighting still uses the fence tag). */
const LANGUAGE_LABELS: Record<string, string> = {
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

/** Reads `language-*` from the nested `code` child (fence info string). */
function getCodeLanguage(children: ReactNode): string | null {
  const child = Array.isArray(children) ? children[0] : children;
  if (!isValidElement<{ className?: string }>(child)) return null;
  const match = /language-([\w-]+)/.exec(child.props.className ?? "");
  return match?.[1] ?? null;
}

/** Maps a fence token to a consistent Title Case / dialect label. */
function getLanguageLabel(lang: string): string {
  return LANGUAGE_LABELS[lang.toLowerCase()] ?? lang;
}

/**
 * Fenced code block with language label and clipboard Copy button.
 * Wired via react-markdown `components.pre` only — inline `code` is untouched.
 */
function PreWithCopy(props: ComponentPropsWithoutRef<"pre">) {
  const preRef = useRef<HTMLPreElement>(null);
  const language = getCodeLanguage(props.children);
  const [copied, setCopied] = useState(false);

  const wrapClass = language
    ? "blog-prose__pre-wrap blog-prose__pre-wrap--has-lang"
    : "blog-prose__pre-wrap";

  /** Copies plain text from the pre (includes nested highlighted code). */
  const handleCopy = async () => {
    const text = preRef.current?.textContent ?? "";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className={wrapClass}>
      {language ? (
        <span className="blog-prose__lang">{getLanguageLabel(language)}</span>
      ) : null}
      <button
        type="button"
        className="blog-prose__copy"
        aria-label="Copy code"
        onClick={handleCopy}
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <pre ref={preRef} {...props} />
    </div>
  );
}

const components: Components = {
  a: ({ href, children, ...props }) => {
    const external = href?.startsWith("http");
    return (
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      >
        {children}
      </a>
    );
  },
  img: ({ src, alt, ...props }) => (
    <img src={src} alt={alt ?? ""} loading="lazy" {...props} />
  ),
  pre: PreWithCopy,
};

/**
 * @param content - Post Markdown body from the loader.
 */
export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="blog-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
