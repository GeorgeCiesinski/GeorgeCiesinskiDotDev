/**
 * Single blog post from `/blog/:slug`.
 */

import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { MarkdownContent } from "../components/MarkdownContent";
import { getPostBySlug } from "../data/posts";

/** Resolves `:slug`; redirects to `/blog` when missing. */
export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug? getPostBySlug(slug) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) {
    return <Navigate to="/blog" replace/>;
  }

  return (
    <div className="container blog-post">
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
            <span key={tag} className="badge badge--secondary">
              {tag}
            </span>
          ))}
        </div>
      </header>

      <MarkdownContent content={post.content} />
    </div>
  );
}