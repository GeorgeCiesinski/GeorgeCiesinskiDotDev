/**
 * Project thumbnail card for the home-page grid.
 */

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

/**
 * Thumbnail card linking to a project's detail page.
 *
 * @param props - Component props.
 * @param props.project - Project to display and link to.
 * @param props.priority - Whether to prioritize the thumbnail fetch for LCP.
 * @returns Linked thumbnail card for the home-page grid.
 */
export function ProjectCard({ project, priority = false }: ProjectCardProps) {
  return (
    <Link className="project-card" to={`/projects/${project.slug}`}>
      <img
        className="project-card__image"
        src={project.thumbnail}
        alt={`${project.title} thumbnail`}
        width={THUMB_WIDTH}
        height={THUMB_HEIGHT}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
      />
      <h3 className="project-card__title">{project.title}</h3>
    </Link>
  );
}
