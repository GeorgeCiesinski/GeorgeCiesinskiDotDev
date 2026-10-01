/**
 * Renders Markdown body with GFM, syntax-highlighted fenced blocks,
 * and a Copy control on multiline `pre` blocks (not inline code).
 */
import { useRef, useState, type ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { Components } from "react-markdown";

type MarkdownContentProps = {
  content: string; /** Markdown body only (no frontmatter). */
};

/**
 * Fenced code block with a clipboard Copy button.
 * Wired via react-markdown `components.pre` only — inline `code` is untouched.
 */
function PreWithCopy(props: ComponentPropsWithoutRef<"pre">) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  /** Copies plain text from the pre (includes nested highlighted code). */
  const handleCopy = async () => {
    const text = preRef.current?.textContent ?? "";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="blog-prose__pre-wrap">
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
