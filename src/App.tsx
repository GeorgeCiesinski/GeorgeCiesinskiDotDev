/**
 * Root React app: browser routing and page composition.
 */

import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./theme/ThemeProvider";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";

const ProjectDetail = lazy(() =>
  import("./pages/ProjectDetail").then((module) => ({
    default: module.ProjectDetail,
  })),
);
const BlogIndex = lazy(() =>
  import("./pages/BlogIndex").then((module) => ({
    default: module.BlogIndex,
  })),
);
const BlogPost = lazy(() =>
  import("./pages/BlogPost").then((module) => ({
    default: module.BlogPost,
  })),
);
const Success = lazy(() =>
  import("./pages/Success").then((module) => ({
    default: module.Success,
  })),
);

/**
 * SPA routes under Layout:
 * `/`,
 * `/projects/:slug`,
 * `/blog`,
 * `/blog/:slug`,
 * `/success`;
 * unknown paths redirect home.
 *
 * Non-home routes are code-split so markdown/highlight and detail-page code
 * stay out of the initial home bundle.
 */
export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Suspense fallback={null}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="projects/:slug" element={<ProjectDetail />} />
              <Route path="blog" element={<BlogIndex />} />
              <Route path="blog/:slug" element={<BlogPost />} />
              <Route path="success" element={<Success />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}
