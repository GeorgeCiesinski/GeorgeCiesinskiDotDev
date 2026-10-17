---
title: "Google Lighthouse Audits with AI"
description: "How I audited this portfolio with Google Lighthouse across pages, themes, and devices—then used Cursor to plan and fix accessibility, SEO, and mobile performance issues."
date: "2026-10-14"
tags:
  [
    "google lighthouse",
    "accessibility",
    "seo",
    "performance",
    "artificial intelligence",
  ]
draft: false
---

Finding and fixing accessibility issues used to mean long manual checklists and a lot of guesswork. Automated audits help a lot, and AI coding tools can speed up the fix cycle, but they aren't a magic bullet. You still need to read the report, understand the root cause, and review the plan before anything ships.

This post covers how I audited this portfolio with Google Lighthouse, how I organized findings across pages and themes, and how I used Cursor to plan and implement fixes. The examples below are from real issues on this site.

## What Google Lighthouse is

[Google Lighthouse](https://developer.chrome.com/docs/lighthouse/overview) is an open-source audit tool for performance, accessibility, SEO, and best practices. You run it against a single page load; it returns category scores and a list of failing elements with selectors you can act on.

As someone who developed enterprise sites in the education sector, the accessibility section is especially useful to me: contrast failures, missing accessible names, incorrect ARIA roles, and small touch targets show up with the exact nodes involved.

SEO catches things like a missing or invalid `robots.txt`, or other things that hurt your search engine optimization.

Performance flags heavy images and LCP problems, which is especially useful to optimize the site for mobile users.

The tool also highlights Best Practices and how closely your site follows them.

Lighthouse cannot replace manual testing—especially for keyboard flows and complex interactions—but it is a strong first pass.

## Chrome Extensions

I feel like a warning is worth mentioning here. When I initially ran **Google Lighthouse**, it was throwing a bunch of unrelated warnings about apps like **Wappalyzer** which loads its own scripts to see what tech was used to build webpages. This tool is useful for trying to see how a page you like was built, but it increases loading times, and makes your site perform worse when tested locally.

To get an accurate report from **Lighthouse**, it is recommended to either disable extensions, or to test the page in an Incognito window.

## Running an audit

Lighthouse ships in Chrome DevTools: open DevTools → **Lighthouse**.

Typical setup:

1. Open the page you want to test.
2. Mode: **Navigation** (default).
3. Device: run **Desktop** and **Mobile** separately; they surface different issues.
4. Categories: leave the defaults unless you are focusing on one area.
5. Click **Analyze page load**.

After the page takes a moment to analyze, scores appear for Performance, Accessibility, Best Practices, and SEO. A score below 100 lists opportunities and failing elements. You can print or save a PDF summary from the report menu.

### Audit coverage that actually works

Lighthouse only tests the current page. For a thorough pass I treat each of these as a separate run:

- Each page template (home, project detail, blog index, blog post)
- Each theme (light and dark)
- Desktop and mobile

Dark mode can score 100 while light mode fails contrast on the same component. Home can look fine while project carousels and blog tags fail. I especially recommend testing each page template across different themes, desktop, and mobile mode, as problems can be highly specific (for example, light mode may have accessibility bugs with components that appear on a specific page).

There's a bit of manual work involved. I track items from the report in a GitHub issue where I organize failing sections into related pools. The benefit here is that the AI agent can form a plan to tackle related issues surgically instead of trying to solve Accessibility and SEO in the same pass.

## Working with Cursor on the findings

I use Cursor both as an IDE and as an agent for planning and edits. While accessibility should always be designed in from the start, accessibility bugs can crop up throughout development. This is where AI can speed things up. AI is good at reading audit text, mapping selectors to components, and formulating a plan to fix the issues.

What worked for me:

1. Paste organized Lighthouse findings for a specific issue (not one giant dump of unrelated pages and problems).
2. Use the `plan` feature to plan out the fix.
3. Read the plan: check root causes, contrast math, and whether the ARIA approach matches how the UI actually works.
4. Adjust the plan where needed, then implement (myself or via the agent).
5. (IMPORTANT) Review the resulting changes before committing them. It is important to take ownership of code and to understand what you commit, since AI can't take ownership of your mistakes.
6. Re-run Lighthouse on the same page/theme matrix and run the project’s tests.

In my case, most accessibility fixes were small: a few lines of JSX for names and roles, and SCSS/token changes for contrast and hit targets. The value provided by the AI was speed and consistency across files.

## Examples from this site

The fixes below are grouped the same way Lighthouse reports them.

### Accessibility

#### Icon-only controls need an accessible name

The site’s light/dark theme control is a compact icon button in the navbar. Visually that works well: sun and moon glyphs are enough for sighted users. For assistive technology, though, the button’s accessible name is what gets announced—and this one had none.

Every SVG inside the control was marked `aria-hidden="true"`, which correctly tells screen readers to ignore decorative graphics. The problem is that once those icons are hidden, nothing is left to name the control. Lighthouse therefore flagged `button.theme-menu-toggle` under “Buttons do not have an accessible name,” and a screen reader would only say “button.”

The fix was to add an explicit `aria-label`. The existing menu wiring (`aria-expanded`, `aria-haspopup`) was already fine and stayed in place:

```tsx
<button
  type="button"
  className={`theme-menu-toggle theme-menu-toggle--${resolveTheme(preference)}`}
  aria-label="Color theme"
  aria-expanded={open}
  aria-haspopup="menu"
  onClick={() => setOpen((v) => !v)}
>
```

This pattern shows up often on modern UIs: icon-only close buttons, carousels, and social links all need a text alternative even when the design is intentionally minimal.

#### Light-mode nav: white text on a lightened blue

Active and hover nav links use a translucent wash of the chrome color (white in light mode) over the solid blue header. On the unwashed header, white text already met contrast. Once the active state mixed in **25%** white, the effective background became a lighter blue, and the same white text fell to about **3.7:1**—under WCAG AA’s **4.5:1** requirement for normal-sized text.

What made this easy to miss is that dark mode still passed with the same 25% mix. The dark header is deep enough that lightening it a bit still leaves a strong ratio. Light mode does not have that headroom. This is an example of how auditing only one theme would have left the bug in production.

Instead of hard-coding different opacities in two places, I moved the mix percentages into theme tokens so each theme can tune the wash independently:

```scss
// light — weaker wash so white text stays ≥ ~4.5:1
--nav-link-hover-mix: 10%;
--nav-link-active-mix: 12%;

// dark — stronger wash still reads clearly on the darker bar
--nav-link-hover-mix: 15%;
--nav-link-active-mix: 25%;
```

```scss
.navbar__link {
  &:hover {
    background: color-mix(
      in srgb,
      var(--color-chrome) var(--nav-link-hover-mix),
      transparent
    );
  }

  &--active {
    background: color-mix(
      in srgb,
      var(--color-chrome) var(--nav-link-active-mix),
      transparent
    );
    font-weight: 700;
  }
}
```

The active item still reads as selected through bold weight; the background tint is only as strong as contrast allows.

#### Carousel: wrong ARIA roles, caption contrast, tiny dots

Project detail pages dropped into the low 80s on accessibility because of the screenshot carousel. Lighthouse reported three separate problems on the same component, which is a good reminder to fix related failures together.

**Roles.** The carousel root used `aria-roledescription="carousel"` without giving the element a real role such as `region`. Separately, the slide dots lived in a `role="tablist"` container, but the buttons inside were ordinary `<button>` elements—not `role="tab"`. Assistive tech expects tablist children to be tabs; when they are not, you get the “ARIA attributes do not match their roles” / missing required children failure. The cleaner fix for this UI was to stop pretending it was a tab widget: `role="region"` on the carousel, `role="group"` on the dots, and `aria-current` on the active dot instead of `aria-selected`.

**Caption contrast.** Captions sat on `--color-primary` with white text (`--color-text-white`). In light mode that primary is dark enough for white to pass. In dark mode primary is a brighter blue, so white-on-primary fell to roughly **2.8:1**. The durable fix was not “always use white,” but an “on primary” token that flips with the theme: white in light mode, near-black in dark mode (`--color-on-primary`).

**Touch targets.** Each slide dot was a **16×16px** circle. That is fine as a visual marker and too small as a hit target—Lighthouse wants at least **24×24px**, and **44×44px** is a safer mobile target. I kept the visible marker small with a `::after` pseudo-element and enlarged the button itself so fingers and pointers have room without turning the control strip into a row of giant discs.

#### Badges, pills, and “on” color tokens

Blog tag chips, active filter pills, and a few other “filled” controls used light text on `--color-secondary`. In light mode that secondary blue (`#4aa3d4`) is a mid tone: it looks lively as a brand accent, but white text on it only reaches about **2.8:1**. The same pairing showed up on carousel previous/next buttons.

I already had `--color-on-primary` for text that sits _on_ primary fills. Secondary needed the same idea. Reusing `--color-text-inverse` was tempting, but in light mode inverse is white—exactly the color that fails on secondary. A dedicated token keeps those concerns separate:

```scss
--color-on-secondary: #1a1a1a;
```

Badges, active pills, and carousel controls now pull text color from `--color-on-secondary` whenever the background is secondary. That keeps brand fills intact while meeting AA for the labels drawn on top of them.

#### Identical link names, different destinations

Lighthouse’s identical-links rule checks whether links that share the same accessible name also share the same purpose. If two controls both announce as “GitHub” but send you to different places, the audit fails—and for good reason: a screen-reader user building a links list cannot tell them apart.

That is what happened on project pages. The project CTA said **GitHub** and opened that project’s repository. The footer icon also announced **GitHub** and opened my profile. Same name, different destinations.

The project button now uses distinct visible text and a project-specific label to differentiate it from other projects, and from the generic Github profile link in the footer:

```tsx
<a
  className="btn btn--primary"
  href={project.github}
  target="_blank"
  rel="noreferrer"
  aria-label={`View ${project.title} on GitHub`}
>
  View on GitHub
</a>
```

A similar collision showed up on the blog index. Tag chips display short words like `css` or `react`, and those strings can also appear in post titles. Visually that is fine; for accessibility it helps if the tag’s accessible name describes the _action_ (filter the list) rather than only repeating the word. Visible text stays the tag; `aria-label` clarifies intent:

```tsx
<Link
  className="badge badge--secondary blog__tag-badge"
  to={`/blog?${tagParams.toString()}`}
  aria-label={`Filter by tag ${tag}`}
>
  {tag}
</Link>
```

#### Blog prose links and syntax highlighting

Contrast failures are not limited to buttons and nav. In light mode, in-article links and highlighted string tokens in code blocks both used `--color-secondary` against muted page or `pre` backgrounds. That pairing sat around **2.4:1**—readable if you squint, not AA. Links in the rest of the app already used primary and passed, so the blog prose stylesheet was simply out of sync with the safer token.

Prose links now use `--color-primary` and keep an underline so they are not color-only. For syntax highlighting, strings and attributes needed a color that stays on-brand _and_ readable on the code background, so they point at a dedicated theme token instead of raw secondary:

```scss
--color-syntax-string: #1c658c; // light — darker teal on muted code panels
--color-syntax-string: #6bb8de; // dark — brighter blue on near-black panels
```

The lesson here is the same as the badge work: an accent that works for borders or large headings is not automatically safe as small text on a tinted surface.

### SEO

The first problem highlighted was that `robots.txt` was returning HTML. The SEO category failed with dozens of `robots.txt` parse errors—lines like `<!doctype html>` and `<script type="module" …>`. That looks absurd until you realize what the crawler (and Lighthouse) actually downloaded.

There was no `robots.txt` in the project, a problem I overlooked. On this Vite SPA, unknown paths fall through to `index.html` so client-side routing works. A request to `/robots.txt` therefore returned the React shell. Lighthouse then tried to interpret HTML as robots directives and reported every line as invalid syntax.

The fix was to add a real static file under `public/`, which Vite copies to the site root unchanged:

```txt
User-agent: *
Allow: /

Sitemap: https://georgeciesinski.dev/sitemap.xml
```

After that, `/robots.txt` is plain text in both local dev and production. The `Sitemap:` line points crawlers at a URL list; a small build script generates `public/sitemap.xml` from published posts and project slugs so that pointer stays accurate as the site grows.

This is a classic SPA footgun: anything that must be a static document (`robots.txt`, `sitemap.xml`, well-known files) has to live in `public/` (or equivalent), or the HTML fallback will silently “succeed” with the wrong content type.

So thankfully, the SEO issues were far more limited than accessibility and easier to fix. Just to be clear, this isn't a full SEO program as I already added SEO to the site in the past. This is just issues I missed when I originally optimized the site.

### Performance

Mobile Lighthouse on the home page surfaced a second cluster of issues after the accessibility work: LCP timing, layout shift, a third-party request on the critical path, and a large amount of unused JavaScript. On desktop, these issues weren't noticeable, but most users access websites from their mobile devices where bandwith and speed are more noticeable.

I treated those as their own plan—same Cursor loop (paste findings → plan → review → implement → re-audit), separate from the a11y token PRs.

**Note:** Keep in mind, chasing a perfect performance score of 100 can have diminishing returns depending on the project. It's not super important to try to get this score maxed out, as long as you optimize for mobile and test the performance to see if it is acceptable.

#### Heavy homepage images

“Improve image delivery” pointed at large PNGs—especially the about photo (`me.png`, hundreds of KiB) and several project thumbnails. For a static Vite `public/` asset set the fix is straightforward: convert to compressed **WebP**, point `Home.tsx` / project thumbnail paths at the new files, and recompress until the bigger assets sit well under ~45 KiB where quality allows. A second compression pass brought the about photo down further after the initial WebP conversion.

**Note:** 45 KiB is not a standard to follow for images, however it worked for me and resolved this Lighthouse issue.

#### LCP: don’t lazy-load the above-the-fold image

**Largest Contentful Paint (LCP)** is the largest visible content that marks “main content appeared.” On mobile, Lighthouse identified a project-card thumbnail (`img.project-card__image`) as the LCP element—and every card used `loading="lazy"`.

Lazy loading tells the browser to delay the download until the image is near the viewport. That is great for below-the-fold thumbs and terrible for the LCP image: you are asking the browser to postpone the metric you care about. Eager loading (the default, or `loading="eager"`) fetches sooner. Separately, `fetchPriority="high"` tells the browser to schedule that request ahead of less important work. It does not replace eager/lazy; it only affects priority among resources already being fetched.

The first card is now prioritized; the rest stay lazy:

```tsx
<img
  className="project-card__image"
  src={project.thumbnail}
  alt={`${project.title} thumbnail`}
  width={510}
  height={400}
  loading={priority ? "eager" : "lazy"}
  fetchPriority={priority ? "high" : undefined}
/>
```

```tsx
{
  projects.map((project, index) => (
    <ProjectCard key={project.slug} project={project} priority={index === 0} />
  ));
}
```

There is a SPA-specific catch: Lighthouse also wants the LCP URL **discoverable in the initial HTML**. This portfolio boots from an empty `#root` and only renders images after React runs, so the chain is `HTML → JS → render <img> → discover URL → download`. A preload hint in `index.html` starts that fetch before the bundle executes:

```html
<link rel="preload" as="image" href="/img/front-page/galesage-thumb.webp" />
```

If the first project (and thus the LCP candidate) changes, that `href` needs to change with it.

#### CLS: unsized images

**Cumulative Layout Shift (CLS)** flagged the about photo and the navbar brand text. The about `<img>` and logo had no intrinsic `width`/`height`, so the layout jumped when the files arrived. CSS `aspect-ratio` / `height` helps, but HTML dimensions give the browser an early reserve.

```tsx
<img
  className="about__photo"
  src="/img/front-page/me.webp"
  alt="George Ciesinski"
  width={690}
  height={400}
/>
```

```tsx
<img src="/img/logo.svg" alt="" width={144} height={144} />
```

Project thumbs got the same treatment (`510×400`) alongside the LCP priority work above.

**Note:** Setting `alt=""` is fine if the brand name is elsewhere in the link. If the logo is the only name, it needs alt text.

#### Critical request chain: defer the GitHub calendar

Lighthouse’s network dependency tree showed:

`HTML → main JS → github-contributions-api → …`

The home page eagerly mounted a `react-github-calendar` component, which fetched contribution data as soon as React hydrated—even though the calendar sits far below the fold. That request competed with first paint.

The fix is to load the calendar only when `#github` approaches the viewport (`IntersectionObserver` with a root margin), keep a sized placeholder so CLS does not regress, and `React.lazy` the real component so its chunk stays out of the initial graph:

```tsx
import { lazy, Suspense } from "react";

const GitHubContributions = lazy(() =>
  import("./GitHubContributions").then((module) => ({
    default: module.GitHubContributions,
  })),
);

// When the section nears the viewport:
<Suspense
  fallback={
    <div
      className="github-contributions github-contributions--placeholder"
      aria-hidden="true"
    />
  }
>
  <GitHubContributions />
</Suspense>;
```

Until then, only the placeholder mounts—no calendar library, no API call on the critical path.

#### Unused JavaScript: `lazy()` and `<Suspense>` on routes

Lighthouse estimated ~120 KiB of JavaScript on the home page was unused. The root cause was simple: every route was a static import in `App.tsx`, so the blog markdown stack (`react-markdown`, `highlight.js`, and friends) shipped in the initial bundle even when you only opened `/`.

A static import means “load with the app”:

```tsx
import { BlogPost } from "./pages/BlogPost";
```

`React.lazy` plus a dynamic `import()` means “load when this component first renders.” Vite emits a separate chunk; the home visit never downloads it:

```tsx
const BlogPost = lazy(() =>
  import("./pages/BlogPost").then((module) => ({
    default: module.BlogPost,
  })),
);
```

`lazy` expects a module with a **default** export. These pages use named exports (`export function BlogPost`), so the `.then(...)` adapts them. `Home` stays a normal import—you want that code in the first paint.

While the chunk is downloading, React needs a boundary for the wait. That is `<Suspense>`:

```tsx
<Suspense fallback={null}>
  <Routes>
    <Route index element={<Home />} />
    <Route path="projects/:slug" element={<ProjectDetail />} />
    <Route path="blog" element={<BlogIndex />} />
    <Route path="blog/:slug" element={<BlogPost />} />
    <Route path="success" element={<Success />} />
  </Routes>
</Suspense>
```

- **Child ready** → render normally.
- **Child still loading** → show `fallback` (`null` here is a brief blank).
- **No** `Suspense` → rendering an unloaded lazy component errors.

Flow for `/blog/some-post`: navigate → React tries `<BlogPost />` → `lazy` starts `import("./pages/BlogPost")` → `Suspense` shows the fallback → chunk arrives → the post mounts.

On `/`, those routes never mount, so the heavy blog chunks don't bog down loading times.

**Note:** Setting fallback to `null` is fine for a portfolio project like this site, but it can flash blank on slow network and is not ideal for every project.

## What I took away

- Audit **each page template** with each theme and device, not a single homepage run.
- Contrast failures can affect one theme without affecting another.
- Icon-only UI and shared labels (“GitHub”) need explicit accessible names.
- SEO failures can be caused by a missing static file and an SPA fallback.
- Performance often starts with image weight and LCP, then CLS, critical-path third parties, and unused JS.
- Do not `loading="lazy"` the LCP image; use eager + `fetchPriority="high"`, and preload the URL in the initial HTML on SPAs.
- Static `imports` load with the app; `lazy` + dynamic `import()` loads on first render; `Suspense` shows a fallback during the wait.
- AI is fast and accurate when you feed clustered findings, plan the change, and review the result.
- Manual testing still matters. Lighthouse plus a careful AI-assisted fix loop cleared the issues above on this portfolio; it does not replace keyboard and screen-reader checks on interactive flows.

## Sources

- [Introduction to Lighthouse](https://developer.chrome.com/docs/lighthouse/overview)
- [Optimize LCP](https://developer.chrome.com/docs/performance/insights/lcp-discovery)
- [WCAG 2.2 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [ARIA Authoring Practices: Carousel](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/)
- [React.lazy](https://react.dev/reference/react/lazy)
- [\\<suspense\\>](https://react.dev/reference/react/Suspense)
