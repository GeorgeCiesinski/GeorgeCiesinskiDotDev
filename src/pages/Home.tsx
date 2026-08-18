/**
 * Landing page: about section, project grid, and contact form.
 *
 * When the URL hash is a known section (`#about`, `#projects`, '#experience`, #contact`),
 * scrolls that section into view after mount (e.g. arriving from another route).
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ContactForm } from "../components/ContactForm";
import { GitHubContributions } from "../components/GitHubContributions";
import { ProjectCard } from "../components/ProjectCard";
import { ExperienceSection } from "../components/ExperienceSection";
import { projects } from "../data/projects";

/** Allowed location hashes that map to home section element ids. */
const HASH_SECTIONS = ["#about", "#projects", "#experience", "#contact"];

/**
 * Landing page: about, project grid, and contact form, with hash-based section scroll.
 *
 * @returns The home page content.
 */
export function Home() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!HASH_SECTIONS.includes(hash)) return;

    const id = hash.slice(1);
    // Defer until after paint so section elements are in the DOM.
    const frame = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView();
    });

    return () => cancelAnimationFrame(frame);
  }, [hash]);

  return (
    <div className="container">
      <section className="about" id="about" aria-labelledby="about-heading">
        <div className="about__container">
          <img
            className="about__photo"
            src="/img/front-page/me.png"
            alt="George Ciesinski"
          />
          <div>
            <h2 className="section__title about__title" id="about-heading">
              About
            </h2>
            <p>
              I am an avid programmer who enjoys learning new things about
              programming. I am most experienced in Javascript and Python, but I
              also have experience with C#, HTML/CSS, SASS and SQL.
            </p>
            <GitHubContributions />
          </div>
        </div>
      </section>

      <section
        className="projects"
        id="projects"
        aria-labelledby="projects-heading"
      >
        <h2 className="section__title projects__title" id="projects-heading">
          Projects
        </h2>
        <div className="grid">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>

      <section
        className="experience"
        id="experience"
        aria-labelledby="experience-heading"
      >
        <h2
          className="section__title experience__title"
          id="experience-heading"
        >
          Experience
        </h2>
        <ExperienceSection />
      </section>

      <section
        className="contact-me"
        id="contact"
        aria-labelledby="contact-heading"
      >
        <div className="contact">
          <h2 className="section__title contact__title" id="contact-heading">
            Contact Me
          </h2>
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
