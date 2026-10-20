---
title: "Adding Reading Time to Blog Posts"
description: ""
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

Additionally, since I use large examples in my blog posts, we will need a second slower WPM for fenced code blocks. This is because reading code isn't the same as reading fiction/non-fiction and can be slower. 
 
### Calculating Words per Minute

I decided to calculate the reading time while parsing posts (rather than pasting an estimate in the frontmatter) so that it changes dynamically as I edit the post. 

We can use a formula like `Math.max(1, Math.ceil(wordCount / 200))` to calculate the words per minute. This will ensure short posts or empty posts show an estimated reading time of at least 1 minute. 