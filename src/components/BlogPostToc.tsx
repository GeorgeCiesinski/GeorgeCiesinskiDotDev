/**
 * In-page table of contents for blog posts (all heading levels + scroll-spy).
 * Renders a collapsible block below lg and a sticky rail at lg+; only one is
 * visible / in the accessibility tree at a time via CSS `display`.
 */

import type { TocHeading } from "../data/headingId";

type BlogPostTocProps = {
  headings: TocHeading[];
  activeId: string | null;
};

/**
 * Shared link list for mobile and desktop TOC copies.
 * Visual nesting via padding from heading depth (flat list for a11y simplicity).
 *
 * @param headings - Heading entries in document order.
 * @param activeId - Scroll-spy current section id.
 */
function TocList({
  headings,
  activeId,
}: {
  headings: TocHeading[];
  activeId: string | null;
}) {
  const minDepth = Math.min(...headings.map((h) => h.depth));

  return (
    <ul className="blog-post__toc-list">
      {headings.map((heading) => {
        const isActive = heading.id === activeId;
        const indent = Math.max(0, heading.depth - minDepth);
        return (
          <li key={heading.id}>
            <a
              className={`blog-post__toc-link${isActive ? " blog-post__toc-link--active" : ""}`}
              href={`#${heading.id}`}
              style={indent > 0 ? { paddingLeft: `${0.55 + indent * 0.75}rem` } : undefined}
              {...(isActive ? { "aria-current": "location" as const } : {})}
            >
              {heading.text}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * @param props.headings - Extracted headings (empty → renders nothing).
 * @param props.activeId - Id highlighted by {@link useScrollSpy}.
 */
export function BlogPostToc({ headings, activeId }: BlogPostTocProps) {
  if (headings.length === 0) return null;

  return (
    <>
      <details className="blog-post__toc blog-post__toc--collapsible">
        <summary className="blog-post__toc-summary" id="blog-toc-label-mobile">
          On this page
        </summary>
        <nav aria-labelledby="blog-toc-label-mobile">
          <TocList headings={headings} activeId={activeId} />
        </nav>
      </details>

      <nav
        className="blog-post__toc blog-post__toc--rail"
        aria-labelledby="blog-toc-label-desktop"
      >
        <p className="blog-post__toc-title" id="blog-toc-label-desktop">
          On this page
        </p>
        <TocList headings={headings} activeId={activeId} />
      </nav>
    </>
  );
}
