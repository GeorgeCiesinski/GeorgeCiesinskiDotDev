# George Ciesinski — Portfolio

Welcome to my portfolio. Check it out at [https://georgeciesinski.dev](https://georgeciesinski.dev)

Deployed on Vercel.

## Develop

```bash
npm install
npm run dev
```

For the SPA plus `/api` serverless functions (including the contact form):

```bash
npm run vercel
```

`npm run vercel` uses `[vercel-dev.json](vercel-dev.json)` (no catch-all SPA rewrite) so Vite can serve modules and deep links. Production `[vercel.json](vercel.json)` rewrites non-API routes to `index.html` and leaves `/api/*` for serverless functions.

### Contact form env (server-only)

Copy `[.env.example](.env.example)` to `.env` and set:

| Var              | Purpose                              |
| ---------------- | ------------------------------------ |
| `RESEND_API_KEY` | Resend API key                       |
| `EMAIL_ADDRESS`  | Inbox that receives form submissions |

Local contact submissions need `npm run vercel` (plain `npm run dev` does not serve `/api/contact`).

### Additional Scripts

| Script               | Purpose                                              |
| -------------------- | ---------------------------------------------------- |
| `npm run check`      | Format, lint, and typecheck                          |
| `npm run validate`   | `check` plus tests                                   |
| `npm run format:fix` | Formats files with prettier                          |
| `npm run lint:fix`   | Fixes and flags lint errors with ESLint              |
| `npm run sitemap`    | Regenerates `public/sitemap.xml` from posts/projects |

## Build

```bash
npm run build
npm run preview
```

`npm run build` regenerates the sitemap, runs Vite, then prerenders blog `index.html` shells with route-specific meta (`scripts/generate-sitemap.mjs`, `scripts/prerender-blog-meta.mjs`). Static SEO files live in `public/` (`robots.txt`, `sitemap.xml`).

## Technology

- React
- TypeScript
- Vite & Vitest
- SCSS
- Vercel serverless + Resend (contact)

## Also uses

- [React Github Calendar](<[https://www.npmjs.com/package/react-github-calendar](https://www.npmjs.com/package/react-github-calendar)>)
