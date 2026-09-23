/**
 * Renders Markdown body with GFM and syntax-highlighted code blocks.
 */

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { Components } from "react-markdown";

type MarkdownContentProps = {
  content: string;  /** Markdown body only (no frontmatter). */
};

const components: Components = {
  a: ({ href, children, ...props }) => {
    const external = href?.startsWith("http");
    return (
      <a
        href={href}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        {...props}
      >
        {children}
      </a>
    );
  },
  img: ({ src, alt, ...props }) => (
    <img src={src} alt={alt ?? ""} loading="lazy" {...props} />
  ),
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

