---

## title: "Google Lighthouse Audits with AI"
description: "How I audited this portfolio with Google Lighthouse across pages, themes, and devices—then used Cursor to plan and fix accessibility, SEO, and related issues."
date: "2026-10-14"
tags: ["google lighthouse", "accessibility", "seo", "performance", "artificial intelligence"]
draft: false

Finding and fixing accessibility issues used to mean long manual checklists and a lot of guesswork. Automated audits help a lot, and AI coding tools can speed up the fix cycle, but they aren't a magic bullet. You still need to read the report, understand the root cause, and review the plan before anything ships.

This post covers how I audited this portfolio with Google Lighthouse, how I organized findings across pages and themes, and how I used Cursor to plan and implement fixes. The examples below are from real issues on this site.

## What Google Lighthouse is

[Google Lighthouse](https://developer.chrome.com/docs/lighthouse/overview) is an open-source audit tool for performance, accessibility, SEO, and best practices. You run it against a single page load; it returns category scores and a list of failing elements with selectors you can act on.

For me, the accessibility section is especially useful: contrast failures, missing accessible names, incorrect ARIA roles, and small touch targets show up with the exact nodes involved. 

SEO catches things like a missing or invalid `robots.txt`. 

Performance flags heavy images and LCP problems.

The tool also highlights Best Practices and how closely your site follows them. 

Lighthouse cannot replace manual testing—especially for keyboard flows and complex interactions—but it is a strong first pass.

## Running an audit

Lighthouse ships in Chrome DevTools: open DevTools → **Lighthouse**.

Typical setup:

1. Open the page you want to test.
2. Mode: **Navigation** (default).
3. Device: run **Desktop** and **Mobile** separately; they surface different issues.
4. Categories: leave the defaults unless you are focusing on one area.
5. Click **Analyze page load**.

Scores appear for Performance, Accessibility, Best Practices, and SEO. A score below 100 lists opportunities and failing elements. You can print or save a PDF summary from the report menu.

### Audit coverage that actually works

Lighthouse only tests the current page. For a thorough pass I treat each of these as a separate run:

- Each page template (home, project detail, blog index, blog post)
- Each theme (light and dark)
- Desktop and mobile

Dark mode can score 100 while light mode fails contrast on the same component. Home can look fine while project carousels and blog tags fail. I especially recommend testing each page template across different themes, desktop, and mobile mode, as problems can be highly specific (for example, light mode may have accessibility bugs with components that appear on a specific page). 

I track that matrix in a GitHub issue, paste the failing selectors and notes, then group related failures before fixing anything.

The benefit here is that the AI agent can fix a related group of bugs rather than trying to fix unrelated separate issues in one pass. 

## Working with Cursor on the findings

I use Cursor both as an IDE and as an agent for planning and edits. While accessibility should be designed in from the start, unexpected problems can crop up throughout development, which is why it is a good idea to test accessibility before shippint to production. 

AI is good at reading audit text, mapping selectors to components, and proposing a plan.

What worked for me:

1. Paste organized Lighthouse findings for a specific issue (not one giant dump of unrelated pages and problems).
2. Ask for a **plan first**, not an immediate refactor.
3. Read the plan: check root causes, contrast math, and whether the ARIA approach matches how the UI actually works.
4. Adjust the plan where needed, then implement (myself or via the agent).
5. (IMPORTANT) Review the resulting changes for bugs, bad practices, or mistakes.
6. Re-run Lighthouse on the same page/theme matrix and run the project’s tests.

In my case, most accessibility fixes were small: a few lines of JSX for names and roles, and SCSS/token changes for contrast and hit targets. The value provided by the AI were speed and consistency across files.

## Examples from this site

The fixes below are grouped the same way Lighthouse reports them.

### Accessibility



#### Icon-only controls need an accessible name

The theme menu was an icon-only button. Every SVG was `aria-hidden`, so screen readers announced only “button.” Lighthouse flagged `button.theme-menu-toggle`.

The fix was a clear `aria-label` (existing `aria-expanded` / `aria-haspopup` stayed):

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



#### Light-mode nav: white text on a lightened blue

Active nav links used a translucent white wash over the blue header. White on the solid header passed; white on a **25%** lightened background dropped to roughly **3.7:1** (below WCAG AA’s **4.5:1** for normal text). Dark mode still passed at 25%, which is why only light mode failed.

Theme tokens control overlay strength per theme:

```scss
// light
--nav-link-hover-mix: 10%;
--nav-link-active-mix: 12%;

// dark
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

Font weight still marks the active item; the wash is just strong enough to stay readable.

#### Carousel: wrong ARIA roles, caption contrast, tiny dots

Project pages scored poorly for three related carousel issues.

**Roles.** The root had `aria-roledescription="carousel"` without a role, and dots used `role="tablist"` without `role="tab"` children. The fix: `role="region"` on the carousel, `role="group"` on the dots, and `aria-current` on the active control instead of `aria-selected`.

**Caption contrast.** Captions used white text on `--color-primary`. In dark mode that primary is a lighter blue, so white-on-primary failed (~**2.8:1**). Caption color is now `--color-on-primary` (white in light, near-black in dark).

**Touch targets.** Dot buttons were **16×16px**. Lighthouse expects a larger hit area. Controls are now ~**44×44px** with a small visible marker via `::after`, so spacing and targets clear the audit without oversized dots.

#### Badges, pills, and “on” color tokens

Secondary badges and active blog filter pills used light text on `--color-secondary` (`#4aa3d4` in light mode)—again ~**2.8:1**. The same pattern hurt carousel prev/next labels.

A dedicated token avoids fighting `--color-text-inverse` (which is white in light mode for other surfaces):

```scss
--color-on-secondary: #1a1a1a;
```

Badges, active pills, and carousel buttons use that for text sitting *on* secondary fills. Primary fills already had `--color-on-primary`.

#### Identical link names, different destinations

Lighthouse’s identical-links rule flags the same accessible name pointing at different URLs.

On project pages, a **GitHub** button went to the project repo while the footer **GitHub** icon went to my profile—same name, different purpose. The project CTA is now distinct:

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

On the blog, tag chips could collide with post titles that share the same words. Visible text stays the tag; the accessible name states the action:

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

In light mode, prose links and `.hljs-string` used `--color-secondary` on muted backgrounds (~**2.4:1**). Body links elsewhere already used primary and passed.

Prose links now use `--color-primary` (still underlined). String/attr tokens use a theme token that stays AA on the code background:

```scss
--color-syntax-string: #1c658c; // light
--color-syntax-string: #6bb8de; // dark
```



### SEO



#### `robots.txt` was returning HTML

Lighthouse reported dozens of `robots.txt` syntax errors. There was no real robots file—Vite’s SPA fallback served `index.html` for `/robots.txt`.

Adding `public/robots.txt` fixed it:

```txt
User-agent: *
Allow: /

Sitemap: https://georgeciesinski.dev/sitemap.xml
```

Vite copies `public/` to the site root, so both local and production serve plain text. A build script later generates `sitemap.xml` from posts and projects so the Sitemap line stays useful.

### Performance



#### Heavy homepage images and LCP

On the home page, Lighthouse’s “Improve image delivery” opportunity pointed at large PNGs—especially the about photo (`me.png`, ~500 KiB) and several project thumbnails. Those downloads inflate LCP even when the layout looks fine.

The approach we planned (and the one that fits a static Vite `public/` asset set) is straightforward: convert the flagged files to compressed **WebP**, point `Home.tsx` / project thumbnail paths at the new files, and mark the LCP image with intrinsic `width`/`height` plus `fetchpriority="high"` (without lazy-loading it). Project cards already use `loading="lazy"`, which is appropriate for below-the-fold thumbs.

That work sits next to the accessibility/SEO fixes rather than mixed into the same PR—performance findings are easy to group once you have the failing URLs from the report.

## What I took away

- Audit **templates × themes × devices**, not a single homepage run.
- Contrast failures are often “accent color used as body text,” not “the page looks muddy to you.”
- Icon-only UI and shared labels (“GitHub”) need explicit accessible names.
- ARIA that looks fancy (`tablist` without tabs) fails harder than simpler `region` / `group` patterns.
- SEO failures can be as simple as a missing static file behind an SPA fallback.
- Performance often starts with image weight and LCP, separate from a11y token work.
- AI is fastest when you feed clustered findings, insist on a plan, and verify with Lighthouse and tests afterward.

Manual testing still matters. Lighthouse plus a careful AI-assisted fix loop cleared the issues above on this portfolio; it does not replace keyboard and screen-reader checks on interactive flows.

## Sources

- [Introduction to Lighthouse](https://developer.chrome.com/docs/lighthouse/overview)
- [WCAG 2.2 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [ARIA Authoring Practices: Carousel](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/)

