/**
 * Shared page shell: Navbar, ScrollToTop, routed Main content, and Footer.
 */

import type { MouseEvent } from "react";
import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { ScrollToTop } from "./ScrollToTop";

/**
 * Moves keyboard focus into main after the skip link is activated.
 *
 * @param event - Click from the skip link.
 */
function skipToMainContent(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  document.getElementById("main-content")?.focus();
}

/** Shell with Navbar, ScrollToTop, routed Main content, and Footer. */
export function Layout() {
  return (
    <div className="page">
      <a className="skip-link" href="#main-content" onClick={skipToMainContent}>
        Skip to main content
      </a>
      <Navbar />
      <ScrollToTop />
      <main id="main-content" className="page__main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
