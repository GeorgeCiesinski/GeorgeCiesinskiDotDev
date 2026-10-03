/**
 * Site header navigation with responsive mobile menu and home-section scroll-spy.
 *
 * Hash links (`/#about`, `/#projects`, `/#experience`, `/#contact`) scroll to home sections from
 * any route. On `/`, the active link tracks scroll position under the sticky nav.
 */

import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeMenu } from "./ThemeMenu";

/** Home section element ids, in document order, used for scroll-spy and nav links. */
const SECTION_IDS = ["about", "projects", "experience", "contact"] as const;
type SectionId = (typeof SECTION_IDS)[number];

/**
 * Sticky site header with mobile collapse, section hash links, and active-link scroll-spy.
 *
 * Brand link scrolls to top on click.
 *
 * @returns The site header element.
 */
export function Navbar() {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<SectionId | null>(null);
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const isBlog = pathname === "/blog" || pathname.startsWith("/blog/");

  /** Closes the mobile nav menu. */
  const close = () => setOpen(false);

  // Only highlight section links on the home page; keep scroll-spy state otherwise.
  const visibleActiveId = isHome ? activeId : null;

  useEffect(() => {
    if (!isHome) return;

    /**
     * Sets `activeId` from scroll position: last section whose top has crossed
     * under the sticky nav; defaults to About at the top; forces Contact near
     * the page bottom when that section is too short to reach the nav.
     *
     * @returns Nothing.
     */
    const updateActive = () => {
      // Match sticky nav height ($nav-height: 5rem) plus a little slack.
      const offset =
        parseFloat(getComputedStyle(document.documentElement).fontSize) * 5 + 8;
      let current: SectionId | null = null;

      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        // Last section whose top has crossed under the nav wins.
        if (el.getBoundingClientRect().top - offset <= 0) {
          current = id;
        }
      }

      // Top of page: About sits below the nav so its top may not have crossed yet.
      if (current === null) {
        current = "about";
      }

      // Checks if scroll is near bottom as Contact section doesn't fill viewport.
      const nearBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 80;
      if (nearBottom) {
        current = SECTION_IDS[SECTION_IDS.length - 1];
      }

      setActiveId(current);
    };

    // Subscribe to scroll/resize; defer the initial read so setState is not
    // synchronous in the effect body (react-hooks/set-state-in-effect).
    const frame = requestAnimationFrame(updateActive);
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [isHome]);

  /**
   * Closes the mobile menu and marks the clicked section link active immediately.
   *
   * @param id - Home section id matching the clicked hash link.
   * @returns Nothing.
   */
  const handleNavClick = (id: SectionId) => {
    close();
    setActiveId(id);
  };

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link
          className="navbar__brand"
          to="/"
          onClick={() => {
            close();
            window.scrollTo(0, 0);
          }}
        >
          <img src="/img/logo.svg" alt="" />
          <div className="navbar__brand-text">
            <span className="navbar__title"> George Ciesinski</span>
            <span className="navbar__subtitle">Software Developer</span>
          </div>
        </Link>

        <button
          className="navbar__toggle"
          type="button"
          aria-expanded={open}
          aria-controls="primary-nav"
          aria-label="Toggle navigation"
          onClick={() => setOpen((value) => !value)}
        >
          ☰
        </button>

        <ul
          id="primary-nav"
          className={`navbar__links${open ? " navbar__links--open" : ""}`}
        >
          {/* Hash links so in-page section anchors work from any route. */}
          <li>
            <a
              className={`navbar__link${visibleActiveId === "about" ? " navbar__link--active" : ""}`}
              href="/#about"
              onClick={() => handleNavClick("about")}
            >
              About
            </a>
          </li>
          <li>
            <a
              className={`navbar__link${visibleActiveId === "projects" ? " navbar__link--active" : ""}`}
              href="/#projects"
              onClick={() => handleNavClick("projects")}
            >
              Projects
            </a>
          </li>
          <li>
            <a
              className={`navbar__link${visibleActiveId === "experience" ? " navbar__link--active" : ""}`}
              href="/#experience"
              onClick={() => handleNavClick("experience")}
            >
              Experience
            </a>
          </li>
          <li>
            <Link
              className={`navbar__link${isBlog ? " navbar__link--active" : ""}`}
              to="/blog"
              onClick={close}
            >
              Blog
            </Link>
          </li>
          <li>
            <a
              className={`navbar__link${visibleActiveId === "contact" ? " navbar__link--active" : ""}`}
              href="/#contact"
              onClick={() => handleNavClick("contact")}
            >
              Contact
            </a>
          </li>
          <li>
            <ThemeMenu />
          </li>
        </ul>
      </div>
    </header>
  );
}
