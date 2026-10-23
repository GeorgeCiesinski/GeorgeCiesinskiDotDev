/**
 * Landing page: about section, project grid, and contact form.
 *
 * When the URL hash is a known section (`#about`, `#projects`, '#experience`, #contact`),
 * scrolls that section into view after mount (e.g. arriving from another route).
 */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { CodeBackground } from "../components/CodeBackground";
import { Seo } from "../components/Seo";
import { ContactForm } from "../components/ContactForm";
import { DeferredGitHubContributions } from "../components/DeferredGitHubContributions";
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
    <div className="home">
      <CodeBackground />
      <div className="home__content container">
        <Seo
          title="George Ciesinski — Portfolio"
          description="Portfolio of George Ciesinski — software developer specializing in JavaScript, Python, and full-stack web development."
          path="/"
        />

        <section className="about" id="about" aria-labelledby="about-heading">
          <div className="about__container">
            <img
              className="about__photo"
              src="/img/front-page/me.webp"
              alt="George Ciesinski"
              width={690}
              height={400}
            />
            <div>
              <h2 className="about__title" id="about-heading">
                Hi — I’m George. 
              </h2>
              <p>
                I'm a software developer based in Toronto, Canada.
              </p>
              <p>  
                I'm experienced building and maintaining enterprise web apps in higher education. 
              </p>
              <p>
                My usual stack is React, TypeScript, and Node, but I also have some experience with Python, Flask and C#. 
              </p>
              <p>
                Check out my resume and my personal projects below!
              </p>
              <div className="resume-link">
                <a
                  className="btn btn--primary"
                  href="/files/GeorgeCiesinskiResume.pdf"
                >
                  Resume
                </a>
              </div>
            </div>
          </div>
        </section>

        <section
          className="projects"
          id="projects"
          aria-labelledby="projects-heading"
        >
          <h2 className="projects__title" id="projects-heading">
            Projects
          </h2>
          <div className="grid">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.slug}
                project={project}
                priority={index === 0}
              />
            ))}
          </div>
        </section>

        <section
          className="experience"
          id="experience"
          aria-labelledby="experience-heading"
        >
          <h2 className="experience__title" id="experience-heading">
            Experience
          </h2>
          <ExperienceSection />
        </section>

        <section
          className="github"
          id="github"
          aria-labelledby="github-heading"
        >
          <div className="github__inner">
            <h2 className="github__title" id="github-heading">
              Github Contributions
            </h2>
            <DeferredGitHubContributions />
          </div>
        </section>

        <section
          className="contact"
          id="contact"
          aria-labelledby="contact-heading"
        >
          <div className="contact__inner">
            <h2 className="contact__title" id="contact-heading">
              Contact Me
            </h2>
            <ContactForm />
          </div>
        </section>
      </div>
    </div>
  );
}
