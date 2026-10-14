/**
 * Blog index: published posts newest-first, with optional ?year=, ?tag=,
 * ?q= search, and ?page= pagination (10 per page). Tag filter is hybrid
 * (top N + More) and sortable by usage (default) or alphabetically.
 */
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Seo } from "../components/Seo";
import {
  getAllPosts,
  getYearCounts,
  getAllTags,
  getAllYears,
  getPostsByYear,
  searchPosts,
  paginatePosts,
  type TagSortMode,
} from "../data/posts";
import { VISIBLE_TAG_COUNT, getHybridTagLists } from "../data/tagFilter";
import type { BlogListLocationState } from "../types/blogNavigation";

/** Blog index with year filter, hybrid tag filter, search, and pagination. */
export function BlogIndex() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTag = searchParams.get("tag");
  /** URL `q` — source of truth for filtering posts. */
  const activeQuery = searchParams.get("q") ?? "";
  const activeYear = searchParams.get("year");
  /** Tag list order: most-used first by default. */
  const [tagSort, setTagSort] = useState<TagSortMode>("usage");
  /** Whether the full tag list is expanded past the hybrid limit. */
  const [tagsExpanded, setTagsExpanded] = useState(false);
  /** Input value while typing; commits to the URL after debounce. */
  const [draftQuery, setDraftQuery] = useState(activeQuery);
  /** Last URL `q` we synced from — detects back/forward and shared links. */
  const [prevQuery, setPrevQuery] = useState(activeQuery);

  const blogDescription = "Notes on software development and projects.";

  const allTags = getAllTags(tagSort);
  const { visible: visibleTags, hiddenCount } = getHybridTagLists(
    allTags,
    activeTag,
    tagsExpanded,
  );

  const allYears = getAllYears();
  const yearCounts = getYearCounts();

  const unknownYear = Boolean(activeYear && !allYears.includes(activeYear));
  const unknownTag = Boolean(activeTag && !allTags.includes(activeTag));

  // Pipeline: year → tag → search → paginate (unknown year/tag → no matches)
  const byYear = unknownYear
    ? []
    : activeYear
      ? getPostsByYear(activeYear)
      : getAllPosts();

  const byTag = unknownTag
    ? []
    : activeTag
      ? byYear.filter((p) => p.tags.includes(activeTag))
      : byYear;

  const filtered = searchPosts(byTag, activeQuery);
  const totalPosts = getAllPosts().length;
  const matchCount = filtered.length;
  const hasFilter = Boolean(activeQuery || activeTag || activeYear);
  const postWord = matchCount === 1 ? "post" : "posts";
  const resultsLabel = hasFilter
    ? `${matchCount} of ${totalPosts} ${postWord}`
    : `${matchCount} ${postWord}`;

  const rawPage = Number(searchParams.get("page"));
  const { page, totalPages, items } = paginatePosts(
    filtered,
    Number.isFinite(rawPage) ? rawPage : 1,
  );

  /** Sets or clears `year` and resets `page` to 1 (preserves `tag` and `q`). */
  const selectYear = (year: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (year === null) next.delete("year");
    else next.set("year", year);
    next.delete("page");
    setSearchParams(next, { replace: true });
  };

  /** Sets or clears `tag` and resets `page` to 1 (preserves `year` and `q`). */
  const selectTag = (tag: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (tag === null) next.delete("tag");
    else next.set("tag", tag);
    next.delete("page");
    setSearchParams(next, { replace: true });
  };

  /** Updates `page` in the URL (preserves `year`, `tag` and `q`). */
  const goToPage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams);
    if (nextPage <= 1) next.delete("page");
    else next.set("page", String(nextPage));
    setSearchParams(next, { replace: true });
  };

  /** Switches tag sort and collapses the hybrid list so the new top N show. */
  const changeTagSort = (mode: TagSortMode) => {
    setTagSort(mode);
    setTagsExpanded(false);
  };

  // When URL `q` changes externally, reset the input to match (no useEffect).
  if (activeQuery !== prevQuery) {
    setPrevQuery(activeQuery);
    setDraftQuery(activeQuery);
  }

  // Debounce draft → URL so typing doesn't spam history.
  // Only touch params when `q` actually changes (then reset page to 1).
  // Skipping no-ops avoids clearing `?page=` when this effect re-runs after
  // pagination (e.g. `setSearchParams` identity changes).
  useEffect(() => {
    const id = window.setTimeout(() => {
      setSearchParams(
        (prev) => {
          const trimmed = draftQuery.trim();
          const currentQ = prev.get("q") ?? "";
          if (trimmed === currentQ) return prev;

          const next = new URLSearchParams(prev);
          if (trimmed) next.set("q", trimmed);
          else next.delete("q");
          next.delete("page");
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

      {allTags.length > 0 || allYears.length > 0 ? (
        <div className="blog__filters">
          {allTags.length > 0 ? (
            <div className="blog__tag-toolbar">
              <div
                className="blog__tag-sort"
                role="group"
                aria-label="Sort tags"
              >
                <button
                  type="button"
                  className={`blog__tag-sort-btn${tagSort === "usage" ? " blog__tag-sort-btn--active" : ""}`}
                  onClick={() => changeTagSort("usage")}
                  aria-pressed={tagSort === "usage"}
                >
                  Most used
                </button>
                <button
                  type="button"
                  className={`blog__tag-sort-btn${tagSort === "alpha" ? " blog__tag-sort-btn--active" : ""}`}
                  onClick={() => changeTagSort("alpha")}
                  aria-pressed={tagSort === "alpha"}
                >
                  A–Z
                </button>
              </div>

              <div
                className="blog__pill-filter"
                role="group"
                aria-label="Filter by tag"
              >
                <button
                  type="button"
                  className={`blog__pill${!activeTag ? " blog__pill--active" : ""}`}
                  onClick={() => selectTag(null)}
                >
                  All
                </button>
                {visibleTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`blog__pill${activeTag === tag ? " blog__pill--active" : ""}`}
                    onClick={() => selectTag(tag)}
                    aria-pressed={activeTag === tag}
                  >
                    {tag}
                  </button>
                ))}
                {hiddenCount > 0 ? (
                  <button
                    type="button"
                    className="blog__pill blog__pill--more"
                    onClick={() => setTagsExpanded(true)}
                  >
                    More ({hiddenCount})
                  </button>
                ) : null}
                {tagsExpanded && allTags.length > VISIBLE_TAG_COUNT ? (
                  <button
                    type="button"
                    className="blog__pill blog__pill--more"
                    onClick={() => setTagsExpanded(false)}
                  >
                    Less
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          {allYears.length > 0 ? (
            <div className="blog__year-toolbar">
              <div
                className="blog__pill-filter"
                role="group"
                aria-label="Filter by year"
              >
                <button
                  type="button"
                  className={`blog__pill${!activeYear ? " blog__pill--active" : ""}`}
                  onClick={() => selectYear(null)}
                >
                  All
                </button>
                {allYears.map((year) => (
                  <button
                    key={year}
                    type="button"
                    className={`blog__pill${activeYear === year ? " blog__pill--active" : ""}`}
                    onClick={() => selectYear(year)}
                    aria-pressed={activeYear === year}
                  >
                    {year} ({yearCounts.get(year) ?? 0})
                  </button>
                ))}
              </div>
            </div>
          ) : null}
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

      {activeYear && !allYears.includes(activeYear) ? (
        <p className="blog__filter-empty">
          Unknown year "{activeYear}".{" "}
          <button
            type="button"
            className="blog__clear-link"
            onClick={() => selectYear(null)}
          >
            Show all posts
          </button>
        </p>
      ) : null}

      <p className="blog__results-count" aria-live="polite">
        {resultsLabel}
      </p>

      {filtered.length === 0 ? (
        <p>
          {activeQuery || activeTag || activeYear
            ? "No posts match this search"
            : "No posts yet"}
          .
        </p>
      ) : (
        <ul className="blog__list">
          {items.map((item) => (
            <li key={item.slug} className="blog__item">
              <Link
                className="blog__item-link"
                to={`/blog/${item.slug}`}
                state={
                  {
                    blogSearch: searchParams.toString(),
                  } satisfies BlogListLocationState
                }
              >
                <h2 className="blog__item-title">{item.title}</h2>
              </Link>
              <time className="blog__item-date" dateTime={item.date}>
                {item.date}
              </time>
              <p className="blog__item-description">{item.description}</p>
              <div className="blog__tags">
                {item.tags.map((tag) => {
                  const tagParams = new URLSearchParams();
                  tagParams.set("tag", tag);
                  if (activeYear) tagParams.set("year", activeYear);
                  if (activeQuery) tagParams.set("q", activeQuery);
                  return (
                    <Link
                      key={tag}
                      className="badge badge--secondary blog__tag-badge"
                      to={`/blog?${tagParams.toString()}`}
                    >
                      {tag}
                    </Link>
                  );
                })}
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
