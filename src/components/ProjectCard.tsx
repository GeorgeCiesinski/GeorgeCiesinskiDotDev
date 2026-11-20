/**
 * Project thumbnail card for the home-page grid.
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Project } from "../data/projects";

/** Intrinsic dimensions of front-page project thumbnails. */
const THUMB_WIDTH = 510;
const THUMB_HEIGHT = 400;

interface ProjectCardProps {
  project: Project;
  /**
   * When true, fetches the thumbnail eagerly with high priority.
   * Use for the first above-the-fold card (LCP candidate).
   */
  priority?: boolean;
}

/** Safety cap so a layout bug cannot spawn unbounded DOM nodes. */
const MAX_COPIES = 12;

/**
 * Returns an even copy count so the track is ≥ 2× the visible width
 * and translateX(-50%) lands on a group boundary.
 *
 * @param metaWidth - Visible width of the clipped meta container.
 * @param groupWidth - Width of one tech-tag group.
 * @returns Even copy count between 2 and {@link MAX_COPIES}.
 */
function copiesForWidth(metaWidth: number, groupWidth: number): number {
  if (groupWidth <= 0 || metaWidth <= 0) return 2;
  let copies = Math.max(2, Math.ceil((metaWidth * 2) / groupWidth));
  if (copies % 2 !== 0) copies += 1;
  return Math.min(copies, MAX_COPIES);
}

/**
 * Thumbnail card linking to a project's detail page.
 *
 * @param props - Component props.
 * @param props.project - Project to display and link to.
 * @param props.priority - Whether to prioritize the thumbnail fetch for LCP.
 * @returns Linked thumbnail card for the home-page grid.
 */
export function ProjectCard({ project, priority = false }: ProjectCardProps) {
  const metaRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(2);

  useEffect(() => {
    const meta = metaRef.current;
    const group = groupRef.current;
    if (!meta || !group) return;

    const updateCopies = () => {
      const next = copiesForWidth(meta.clientWidth, group.offsetWidth);
      setCopies((prev) => (prev === next ? prev : next));
    };

    updateCopies();

    // Only observe the clipped container — not the track/group — so growing
    // copies cannot feed a ResizeObserver → setState loop.
    const observer = new ResizeObserver(updateCopies);
    observer.observe(meta);

    return () => observer.disconnect();
  }, [project.tech]);

  return (
    <Link className="project-card" to={`/projects/${project.slug}`}>
      <h3 className="project-card__title">{project.title}</h3>
      <img
        className="project-card__image"
        src={project.thumbnail}
        alt={`${project.title} thumbnail`}
        width={THUMB_WIDTH}
        height={THUMB_HEIGHT}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
      />
      <div className="project-card__meta" ref={metaRef}>
        <div className="project-card__meta-track">
          {Array.from({ length: copies }, (_, copyIndex) => (
            <div
              key={copyIndex}
              className="project-card__meta-group"
              ref={copyIndex === 0 ? groupRef : undefined}
              aria-hidden={copyIndex > 0 ? true : undefined}
            >
              {project.tech.map((item) => (
                <span
                  key={`${copyIndex}-${item}`}
                  className="badge badge--secondary"
                >
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}
