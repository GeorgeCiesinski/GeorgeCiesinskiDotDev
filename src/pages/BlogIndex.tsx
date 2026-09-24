/**
 * Blog index: published posts newest-first, optional ?tag= filter.
 */

import { Link, useSearchParams } from "react-router-dom";
import { getAllPosts, getAllTags, getPostsByTag } from "../data/posts";

/** Lists all published posts. */
export function BlogIndex() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTag = searchParams.get("tag");
  const allTags = getAllTags();

  const posts = 
    activeTag && allTags.includes(activeTag)
      ? getPostsByTag(activeTag)
      : getAllPosts();
  
  /** Sets or clears the tag query param. */
  const selectTag = (tag: string | null) => {
    if (tag === null) {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ tag }, { replace: true });
    }
  };

  return (
    <div className="container blog">
      <h1 className="blog__title">Blog</h1>
      <p className="blog__intro">Notes on software development and projects.</p>

      {allTags.length > 0 ? (
        <div className="blog__tag-filter" role="group" aria-label="Filter by tag">
          <button
            type="button"
            className={`blog__tag-filter-btn${!activeTag ? " blog__tag-filter-btn--active": ""}`}
            onClick={() => selectTag(null)}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`blog__tag-filter-btn${activeTag === tag ? " blog__tag-filter-btn--active": ""}`}
              onClick={() => selectTag(tag)}
              aria-pressed={activeTag === tag}
            >
              {tag}
            </button>
          ))}
        </div>
      ) : null}

      {activeTag && !allTags.includes(activeTag) ? (
        <p className="blog__filter-empty">
          Unknown tag "{activeTag}".{" "}
          <button
            type="button"
            className="blog__clear-link"
            onClick={() => selectTag(null)}
          >
            Show all posts
          </button>
        </p>
      ) : null}

      {posts.length === 0 ? (
        <p>No posts{activeTag? ` tagged "${activeTag}"` : " yet"}.</p>
      ) : (
        <ul className="blog__list">
          {posts.map((post) => (
            <li key={post.slug} className="blog__item">
              <Link className="blog__item-link" to={`/blog/${post.slug}`}>
                <h2 className="blog__item-title">{post.title}</h2>
              </Link>
              <time className="blog__item-date" dateTime={post.date}>
                {post.date}
              </time>
              <p className="blog__item-description">{post.description}</p>
              <div className="blog__tags">
                {post.tags.map((tag) => (
                  <button 
                    key={tag}
                    type="button"
                    className="badge badge--secondary"
                    onClick={() => selectTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}