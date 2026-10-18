/**
 * Loads the GitHub contributions calendar only when its section nears the viewport.
 *
 * Keeps `react-github-calendar` and its API fetch off the initial critical path.
 */

import { lazy, Suspense, useEffect, useRef, useState } from "react";

const GitHubContributions = lazy(() =>
  import("./GitHubContributions").then((module) => ({
    default: module.GitHubContributions,
  })),
);

/** Start loading slightly before the section enters the viewport. */
const ROOT_MARGIN = "200px";

/**
 * Placeholder that reserves calendar height, then mounts the real calendar
 * once the `#github` section approaches the viewport.
 *
 * @returns Deferred contributions calendar (or a sized placeholder).
 */
export function DeferredGitHubContributions() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad) return;
    const el = rootRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: ROOT_MARGIN },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={rootRef}>
      {shouldLoad ? (
        <Suspense
          fallback={
            <div
              className="github-contributions github-contributions--placeholder"
              aria-hidden="true"
            />
          }
        >
          <GitHubContributions />
        </Suspense>
      ) : (
        <div
          className="github-contributions github-contributions--placeholder"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
