/**
 * Renders Markdown body with GFM, syntax-highlighted fenced blocks,
 * a language label from the fence tag, and a Copy control on multiline
 * `pre` blocks (not inline code). Copy fades in on hover via CSS.
 */
import { useRef, useState, type ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { Components } from "react-markdown";
import { getCodeLanguage, getLanguageLabel } from "../data/codeLanguage";

type MarkdownContentProps = {
  content: string; /** Markdown body only (no frontmatter). */
};

/**
 * Fenced code block with language label and clipboard Copy button
 * (hover-reveal styled in blog-prose SCSS).
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
