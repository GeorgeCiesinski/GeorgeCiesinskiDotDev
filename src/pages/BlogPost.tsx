/**
 * Single blog post from `/blog/:slug`.
 */

import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { MarkdownContent } from "../components/MarkdownContent";
import { Seo } from "../components/Seo";
import { getPostBySlug } from "../data/posts";

/** Resolves `:slug`; redirects to `/blog` when missing. */
export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

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

      <Link className="back-link" to="/blog">
        ← Back to blog
      </Link>

      <header className="blog-post__header">
        <h1 className="blog-post__title">{post.title}</h1>
        <time className="blog-post__date" dateTime={post.date}>
          {post.date}
        </time>
        <div className="blog__tags">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              className="badge badge--secondary blog__tag-badge"
              to={`/blog?tag=${encodeURIComponent(tag)}`}
            >
              {tag}
            </Link>
          ))}
        </div>
      </header>

      <MarkdownContent content={post.content} />
    </div>
  );
}
