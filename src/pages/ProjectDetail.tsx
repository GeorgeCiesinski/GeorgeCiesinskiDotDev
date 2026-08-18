/**
 * Project detail page resolved from the `/projects/:slug` route.
 */

import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ProjectCarousel } from "../components/ProjectCarousel";
import { getProjectBySlug } from "../data/projects";

/** Resolves `:slug` and redirects home when the project is missing. */
export function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const project = slug ? getProjectBySlug(slug) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!project) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container">
      <Link className="back-link" to="/#projects">
        ← Back to projects
      </Link>

      <div className="project-detail">
        <ProjectCarousel slides={project.slides} title={project.title} />

        <div>
          <h1 className="project__name">{project.title}</h1>

          <p>{project.description}</p>

          <h2 className="project__daterange">
            {project.datestart} — {project.dateend}
          </h2>

          <div className="project-detail__meta">
            {project.tech.map((item) => (
              <span key={item} className="badge badge--secondary">
                {item}
              </span>
            ))}
          </div>

          <span
            className="badge badge--primary"
            style={{ marginRight: "0.65rem" }}
          >
            {project.category}
          </span>

          <div className="project-detail__actions">
            {project.github ? (
              <a
                className="btn btn--primary"
                href={project.github}
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            ) : null}
            {project.demo ? (
              <a
                className="btn btn--primary"
                href={project.demo}
                target="_blank"
                rel="noreferrer"
              >
                Live Demo
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
