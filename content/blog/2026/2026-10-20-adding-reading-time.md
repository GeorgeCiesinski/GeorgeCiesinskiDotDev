---
title: "Adding Reading Time to Blog Posts"
description: "How I added estimated reading time to this blog — 200 WPM, Markdown word counts including code, and showing the estimate beside the date on the index and post pages."
date: "2026-10-20"
tags: ["TypeScript", "React"]
draft: false
---

I've been working on the blog feature for my portfolio site, and I keep thinking of ways to improve it and bring it to a standard I'm happy with.

Recently, when I was studying and reading articles posted on [Medium](https://medium.com/), I decided to add an estimated reading time to my posts.

## How to Calculate Reading Time?

First, I had to decide how to calculate reading time.

### Deciding on Words per Minute (WPM)

Let's start with speed. I researched adult reading speed in words per minute (WPM), and it seems most sources disagree about the exact value. According to [Scholar Within](https://scholarwithin.com/average-reading-speed?srsltid=AU7gw4XNaJnbJrjOCb2G64zw89WBc6Z60dCkfFV_BWCTNSV2YfOhisS1), college age adults can read at about 238 WPM. I believe medium uses about 265 WPM for its estimates which are on the high end. On the other end of the spectrum, the NPM [reading-time library](https://www.npmjs.com/package/reading-time) uses about 200 WPM for its estimates.

I decided to also use 200 WPM on my blog to have a more honest estimate that covers slower readers like myself.

### What to Count?

My blog posts are written as Markdown (`.md`) files with YAML front-matter at the top. This describes the blog post, but does not contribute to reading time.

```md
// Frontmatter
---

title: "Blog Title"
description: "Description of this blog."
date: "yyyy-mm-dd"
tags: ["tag 1", "tag 2"]
draft: false
---

// The prose, aka the content of the blog
This is my blog post
```

We are only interested in the prose when calculating reading time. Thankfully, the blog code already parses frontmatter and strips it when building the blog pages. We can use this to extract the prose for our calculation.

### Calculating Words per Minute

I decided to calculate the reading time while parsing posts (rather than pasting an estimate in the frontmatter) so that it changes dynamically as I edit the post.

We can use a formula like `Math.max(1, Math.ceil(wordCount / 200))` to calculate the minutes. This will ensure short posts or empty posts show an estimated reading time of at least 1 minute.

## Adding the Feature

In this section, I go over the changes to add this feature to the blog index, and blog post pages. These pages already exist, so I'll only be covering the changes.

### Write a new readingMinutes helper

First, we need to write a new helper that gets the blog content, and returns the estimated minutes.

We start by using regex to replace four different parts of a typical post:

- The backticks that open/close a fence (like code blocks)
- Image markdown
- Link markdown (which strips everything but the text)
- Leftover chrome (special characters used in markdown)

The reason for this is that a title like `# Title` would otherwise count as two words when it is one. Same thing goes for markdown code that the user can't see. The goal is to strip it down as close as possible to words and whitespace only.

After this, we trim the result, and split it by whitespace. This includes spaces, new lines, tabs, etc.

Finally, we return the result of the words per minute formula.

````TypeScript
/**
 * Calculates the reading time of a blog post and returns the estimated minutes.
 *
 * @param markdown - Markdown text to calculate reading time for.
 * @returns estimated minutes
 */
export function readingMinutes(markdown: string): number {
  const stripped = markdown
    .replace(/```[\w-]*\n?/g, " ")            // Replaces backticks that open/close a fence
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")    // Replaces image markdown with a space
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")  // Keep link text only
    .replace(/[#*_>~`]/g, " ");               // Replaces leftover chrome (#, *, _, >, ~, `) with a space

  const trimmed = stripped.trim();
  const wordCount = trimmed === "" ? 0 : trimmed.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}
````

Of course, after completing this helper, we write a series of unit tests to make sure posts under 200 words show as 1 minute, posts with 201 words show as 2 minutes, and that markdown doesn't change the length returned by our helper.

### Updating the Post interface

Blog posts rely on a `Post` interface that extends the `PostFrontmatter` interface. I added `readingMinutes` so `parsePost` can add this data.

```TypeScript
/** A fully parsed post ready for list/detail pages. */
export interface Post extends PostFrontmatter {
  /** URL segment for `/blog/:slug` (from the filename). */
  slug: string;
  /** Markdown body without frontmatter. */
  content: string;
  /** Estimated whole minutes to read the body (minimum 1). */
  readingMinutes: number;
}
```

### Updating parsePost

`parsePost` is a function that parses a markdown file into the frontmatter and content, and returns a post.

This change is really simple. We just need to set `post.readingMinutes` to the result of `readingMinutes(content)`. This automatically will calculate the estimated reading time for every post.

```TypeScript
/**
 * Parses one Markdown file into a {@link Post}, or `null` if frontmatter is invalid.
 *
 * @param path - Vite glob path used for the slug and error context.
 * @param raw - Full Markdown source including frontmatter.
 * @returns A post ready for list/detail pages, or `null` when skipped.
 */
function parsePost(path: string, raw: string): Post | null {
  const { data, content } = parseFrontmatter(raw);
  if (!isPostFrontmatter(data)) {
    if (import.meta.env.DEV) {
      console.error(`[posts] Invalid frontmatter in ${path}`, data);
    }
    return null;
  }
  return {
    ...data,
    tags: data.tags,
    draft: data.draft ?? false,
    slug: slugFromPath(path),
    content: content.trim(),
    readingMinutes: readingMinutes(content),
  };
}
```

### Rendering the readingMinutes on BlogIndex and BlogPost

`BlogIndex` is the index page showing all blog posts, and `BlogPost` is the page for an individual post.

Currently, they both show some post information that looks like:

> Blog Title
> Blog Date
>
> ... content

I want to add the reading time beside the date so it looks like:

> Blog Title
> Blog Date (x min to read)
>
> ... content

This change is also pretty straight forward.

For `BlogIndex`, it currently looks like:

```TSX
<ul className="blog__list">
  {items.map((item) => (
    <li key={item.slug} className="blog__item">
      <Link
        className="blog__item-link"
        to={`/blog/${item.slug}`}
        state={
          {
            blogSearch: searchParams.toString(),
          } satisfies BlogListLocationState
        }
      >
        <h2 className="blog__item-title">{item.title}</h2>
      </Link>
      <time className="blog__post-date" dateTime={item.date}>
        {item.date}
      </time>

      ...
```

We just have to replace the `<time>` block with:

```TSX
<div className="blog__post-information">
  <time className="blog__post-date" dateTime={item.date}>
    {item.date}
  </time>
  <span className="blog__post-minutes">
    ({item.readingMinutes} min read)
  </span>
</div>
```

I put both into a `div` so we can style them with `display: flex` so they appear beside each other.

`BlogPost` is similar. Each post shows a header containing an `h1` and `<time>` element.

```TSX
<header className="blog-post__header">
  <h1 className="blog-post__title">{post.title}</h1>
  <time className="blog__post-date" dateTime={post.date}>
    {post.date}
  </time>

  ...
```

I structure this the same as `BlogIndex` so they can be styled similarly.

```TSX
<header className="blog-post__header">
  <h1 className="blog-post__title">{post.title}</h1>
  <div className="blog__post-information">
    <time className="blog__post-date" dateTime={post.date}>
      {post.date}
    </time>
    <span className="blog__post-minutes">
      ({post.readingMinutes} min read)
    </span>
  </div>

  ...
```

### Styling the Elements

The last part of the change is adding style. Much of the style already existed, so we just need to style `blog__post-information`, `blog__post-date` and `blog__post-minutes`.

```css
.blog__post-information {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.blog__post-date,
.blog__post-minutes {
  display: block;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}
```

## Conclusion

I wanted to wrap up this post by conceding this is a pretty simple change which made it perfect for a blog post.

Despite the simplicity, we still needed to alter 5 existing files, and create a new helper file and unit test for it, just to add an estimated reading time to our posts. While this takes a lot of work, the benefit is that the code maintains clear and easy to test and maintain over the long run.

I'm also really happy with the current state of my blog. The Blog Index has a simple search feature and tag filtering that lets users (and myself) narrow down posts based on key words or tags. It also has pagination which is useful as my blog posts increase in number. The list of posts show the estimated time to read beside the date. Individual blog posts are also great now and generate a table of contents based on the headings in the markdown files. Clicking these heading links scrolls to that part of the blog and highlights it in the table of contents. Lastly, since this is a programming blog, my code blocks highlight code depending on language used.

So for now, I'm going to take a break from updating the blog function on the site unless I think of something cool that would improve it.

Thanks for dropping by, and I hope you learned something! See you in my next post.
