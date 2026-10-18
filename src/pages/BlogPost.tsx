/**
 * Single blog post from `/blog/:slug`, with a multi-level table of contents.
 */

import { useMemo } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { BlogPostToc } from "../components/BlogPostToc";
import { MarkdownContent } from "../components/MarkdownContent";
import { ScrollToTopButton } from "../components/ScrollToTopButton";
import { Seo } from "../components/Seo";
import { extractTocHeadings } from "../data/headingId";
import { getPostBySlug } from "../data/posts";
import { useScrollSpy } from "../hooks/useScrollSpy";
import { getBlogListLocationState } from "../types/blogNavigation";

/** Resolves `:slug`; redirects to `/blog` when missing. */
export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const post = slug ? getPostBySlug(slug) : undefined;

  const headings = useMemo(
    () => (post ? extractTocHeadings(post.content) : []),
    [post],
  );
  const headingIds = useMemo(
    () => headings.map((heading) => heading.id),
    [headings],
  );
  const activeId = useScrollSpy(headingIds);

  const listState = getBlogListLocationState(location.state);
  const backTo = listState?.blogSearch
    ? `/blog?${listState.blogSearch}`
    : "/blog";

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <div className="container blog-post">
      <Seo
        title={post.title}
        description={post.description}
        path={`/blog/${post.slug}`}
        type="article"
        image={post.cover}
      />

      <Link className="back-link" to={backTo}>
        ← Back to blog
      </Link>

      <header className="blog-post__header">
        <h1 className="blog-post__title">{post.title}</h1>
        <time className="blog-post__date" dateTime={post.date}>
          {post.date}
        </time>
        <div className="blog__tags">
          {post.tags.map((tag) => {
            const tagParams = new URLSearchParams();
            tagParams.set("tag", tag);
            if (listState?.blogSearch) {
              const prev = new URLSearchParams(listState.blogSearch);
              const year = prev.get("year");
              const q = prev.get("q");
              if (year) tagParams.set("year", year);
              if (q) tagParams.set("q", q);
            }
            return (
              <Link
                key={tag}
                className="badge badge--secondary blog__tag-badge"
                to={`/blog?${tagParams.toString()}`}
                aria-label={`Filter by tag ${tag}`}
              >
                {tag}
              </Link>
            );
          })}
        </div>
      </header>

      <div className="blog-post__layout">
        <BlogPostToc headings={headings} activeId={activeId} />
        <div className="blog-post__body">
          <MarkdownContent content={post.content} />
        </div>
      </div>

      <ScrollToTopButton />
    </div>
  );
}
