# [frantssuy](https://frantss.uy)

Personal website with an about page, work history, projects, and writing.

## Run locally

Requires Node.js 24+, pnpm, Portless, and Docker running. Install Portless once:

```bash
pnpm add --global portless
```

On macOS, start a per-user HTTP proxy without administrator permissions:

```bash
portless proxy start --unprivileged --port 80
```

Add this to `.env`:

```dotenv
DATABASE_URL=postgresql://frantssb:frantssb@localhost:5432/frantssb
```

```bash
pnpm install
pnpm db:up
pnpm db:migrate
pnpm articles:sync:dev
pnpm dev
```

Open the URL printed by Portless. The main checkout uses `frantssuy.localhost`;
linked Git worktrees get a branch-name subdomain. Portless assigns the app port
and starts its shared proxy when needed, reusing the existing proxy settings.
With the HTTP proxy above, open [frantssuy.localhost](http://frantssuy.localhost).
See [Portless setup](https://github.com/vercel-labs/portless#run-your-app) for
HTTPS, other platforms, and administrator permission requirements.

Other settings are optional; see [`.env.schema`](.env.schema).

After editing articles, run `pnpm articles:sync:dev` to update local filtering
and search results.

## Generate the CV

The CV is English-only, regardless of the site's selected language. Its summary
reuses the About introduction and AI paragraph from `messages/en.json`. The
featured project selection comes from
`src/client/features/portfolio/portfolio.data.ts`. After changing these, run
`pnpm generate:cv` to refresh `public/cv-en.pdf`.
Check that the PDF still fits on one A4 page.
