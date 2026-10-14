/**
 * React Router location.state when navigating from the blog index to a post.
 * Carries the index query string so “Back to blog” can restore filters.
 */
export type BlogListLocationState = {
  /** `URLSearchParams.toString()` from `/blog` (may be empty). */
  blogSearch: string;
};

/**
 * Reads {@link BlogListLocationState} from an unknown location.state value.
 *
 * @param state - `useLocation().state`.
 * @returns The typed state, or `null` if missing / malformed.
 */
export function getBlogListLocationState(
  state: unknown,
): BlogListLocationState | null {
  if (
    typeof state === "object" &&
    state !== null &&
    "blogSearch" in state &&
    typeof (state as BlogListLocationState).blogSearch === "string"
  ) {
    return state as BlogListLocationState;
  }
  return null;
}
