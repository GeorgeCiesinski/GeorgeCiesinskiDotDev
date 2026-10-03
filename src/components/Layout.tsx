/**
 * Shared page shell: Navbar, ScrollToTop, routed Main content, and Footer.
 */

import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { ScrollToTop } from "./ScrollToTop";

/** Shell with Navbar, ScrollToTop, routed Main content, and Footer. */
export function Layout() {
  return (
    <div className="page">
      <Navbar />
      <ScrollToTop />
      <main className="page__main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
