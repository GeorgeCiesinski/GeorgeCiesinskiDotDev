/**
 * Blog index: published posts newest-first, with optional ?tag=, ?q= search,
 * and ?page= pagination (10 per page).
 */
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Seo } from "../components/Seo";
import {
  getAllPosts,
  getAllTags,
  getPostsByTag,
  searchPosts,
  paginatePosts,
} from "../data/posts";

/** Blog index with tag filter, text search, and pagination. */
export function BlogIndex() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTag = searchParams.get("tag");
  /** URL `q` — source of truth for filtering posts. */
  const activeQuery = searchParams.get("q") ?? "";
  const allTags = getAllTags();
  /** Input value while typing; commits to the URL after debounce. */
  const [draftQuery, setDraftQuery] = useState(activeQuery);
  /** Last URL `q` we synced from — detects back/forward and shared links. */
  const [prevQuery, setPrevQuery] = useState(activeQuery);

  const blogDescription = "Notes on software development and projects.";

  // Pipeline: tag → search → paginate
  const base =
    activeTag && allTags.includes(activeTag)
      ? getPostsByTag(activeTag)
      : getAllPosts();

  const filtered = searchPosts(base, activeQuery);

  const { page, totalPages, items } = paginatePosts(
    filtered,
    Number(searchParams.get("page")) || 1,
  );

  /** Sets or clears `tag` and resets `page` to 1 (preserves `q`). */
  const selectTag = (tag: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (tag === null) next.delete("tag");
    else next.set("tag", tag);
    next.delete("page");
    setSearchParams(next, { replace: true });
  };

  /** Updates `page` in the URL (preserves `tag` and `q`). */
  const goToPage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams);
    if (nextPage <= 1) next.delete("page");
    else next.set("page", String(nextPage));
    setSearchParams(next, { replace: true });
  };

  // When URL `q` changes externally, reset the input to match (no useEffect).
  if (activeQuery !== prevQuery) {
    setPrevQuery(activeQuery);
    setDraftQuery(activeQuery);
  }

  // Debounce draft → URL so typing doesn't spam history; resets page to 1.
  useEffect(() => {
    const id = window.setTimeout(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const trimmed = draftQuery.trim();
          if (trimmed) next.set("q", trimmed);
          else next.delete("q");
          next.delete("page");
          if (next.toString() === prev.toString()) return prev;
          return next;
        },
        { replace: true },
      );
    }, 250);
    return () => window.clearTimeout(id);
  }, [draftQuery, setSearchParams]);

  return (
    <div className="container blog">
      <Seo title="Blog" description={blogDescription} path="/blog" />

      <h1 className="blog__title">Blog</h1>
      <p className="blog__intro">{blogDescription}</p>

      <label className="blog__search">
        <span className="visually-hidden">Search Posts</span>
        <input
          type="search"
          value={draftQuery}
          onChange={(e) => setDraftQuery(e.target.value)}
          placeholder="Search posts"
          aria-label="Search posts"
        />
      </label>

      {allTags.length > 0 ? (
        <div
          className="blog__tag-filter"
          role="group"
          aria-label="Filter by tag"
        >
          <button
            type="button"
            className={`blog__tag-filter-btn${!activeTag ? " blog__tag-filter-btn--active" : ""}`}
            onClick={() => selectTag(null)}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`blog__tag-filter-btn${activeTag === tag ? " blog__tag-filter-btn--active" : ""}`}
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

      {filtered.length === 0 ? (
        <p>
          {activeQuery || activeTag
            ? "No posts match this search"
            : "No posts yet"}
          .
        </p>
      ) : (
        <ul className="blog__list">
          {items.map((item) => (
            <li key={item.slug} className="blog__item">
              <Link className="blog__item-link" to={`/blog/${item.slug}`}>
                <h2 className="blog__item-title">{item.title}</h2>
              </Link>
              <time className="blog__item-date" dateTime={item.date}>
                {item.date}
              </time>
              <p className="blog__item-description">{item.description}</p>
              <div className="blog__tags">
                {item.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="badge badge--secondary blog__tag-badge"
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

      {filtered.length > 0 && totalPages > 1 ? (
        <nav className="blog__pagination" aria-label="Blog pages">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
          >
            Next
          </button>
        </nav>
      ) : null}
    </div>
  );
}
