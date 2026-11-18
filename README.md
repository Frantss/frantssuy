# [frantssuy](https://frantss.uy)

Personal website with an about page, work history, projects, and writing.

## Run locally

Requires Node.js 24+, pnpm, and Portless. Install Portless once:

```bash
pnpm add --global portless
```

On macOS, start a per-user HTTP proxy without administrator permissions:

```bash
portless proxy start --unprivileged --port 80
```

```bash
pnpm install
pnpm dev
```

Open the URL printed by Portless. The main checkout uses `frantssuy.localhost`;
linked Git worktrees get a branch-name subdomain. Portless assigns the app port
and starts its shared proxy when needed, reusing the existing proxy settings.
With the HTTP proxy above, open [frantssuy.localhost](http://frantssuy.localhost).
See [Portless setup](https://github.com/vercel-labs/portless#run-your-app) for
HTTPS, other platforms, and administrator permission requirements.

All environment settings are optional; see [`.env.schema`](.env.schema).
No database server, Docker container, or `DATABASE_URL` is required.

The app runs in the local Cloudflare Workers runtime through `cf` and the
Cloudflare Vite plugin. SQLite-backed Durable Objects store article likes;
their local state is separate from production and persists across server
restarts. Remote bindings are disabled.

Native Cloudflare rate-limit bindings protect the public API through oRPC's
`CloudflareRateLimiter`. Limits are approximate and apply per Cloudflare
location, not globally. Rejected calls return HTTP 429 without remaining-count
or reset-time metadata, so the UI offers manual retry without a countdown.

Local like counters start at zero unless this checkout already has saved
Durable Object state. Existing PostgreSQL counts are not imported.

If another checkout or dev server already owns the Portless hostname, use:

```bash
pnpm generate:articles
pnpm exec varlock run -- vp dev --host 127.0.0.1 --port 5174 --strictPort
```

Open `http://127.0.0.1:5174`. Stop that server before reusing the port.

Article edits regenerate the bundled search index and reload the development
server automatically. Builds generate the index too; there is no sync command.

## Check and preview the Worker

```bash
pnpm check
pnpm build
pnpm preview --host 127.0.0.1 --port 5175 --strictPort
```

Open `http://127.0.0.1:5175` to exercise the built Worker locally. Build and
preview do not deploy the application.
The CLI and Vite integration are pinned beta releases.

`pnpm check` generates binding types and checks browser and Worker TypeScript
projects separately. Worker runtime globals must not be added to the browser
project because they conflict with DOM types.

To add a server dependency, extend `WorkerServices` in `src/worker/services.ts`
and construct it in `src/worker/index.ts`. The Worker supplies services through
TanStack's request context; API handlers and SSR clients receive them in oRPC
context. Keep service objects server-only: do not include binding handles or
functions in dehydrated query data.

Run the Node, browser, and Workers-runtime tests without a database:

```bash
pnpm test
```

The Workers suite uses `@cloudflare/vitest-plugin` to run API transport,
search, and rate-limit tests in `workerd`. Rate-limit tests use native bindings;
likes tests use local SQLite Durable Objects to check concurrency and persistence
across eviction. To run these tests alone, use `pnpm test:workers`; no Cloudflare
login is needed.

## Deploy to production

Production uses the `frantssuy` Worker. `cloudflare.config.ts` declares
`frantss.uy` only in `production` mode; development and staging do not claim it.
Cloudflare manages the custom domain's DNS and TLS certificate. Before the
first cutover, wait for an active edge certificate.

```bash
APP_ENV=production pnpm build
pnpm exec cf deploy --prebuilt --mode production
```

The Cloudflare zone's `Canonical domain redirects` ruleset handles `www` to
apex and HTTP to HTTPS for the portfolio and documentation subdomains,
preserving paths and query strings. These zone rules are separate from
Worker deployments. Cloudflare manages the sites' DNS records.

Production's migrated like counters retain the imported PostgreSQL total in
`likes.legacy_count`. To repeat an import, atomically add only the increase
above that watermark and advance it. Never overwrite `count` with a legacy
total or lower the watermark; that would lose new likes or double-count imports.

## Generate the CV

The CV is English-only, regardless of the site's selected language. Its summary
reuses the About introduction and AI paragraph from `messages/en.json`. The
featured project selection comes from
`src/client/features/portfolio/portfolio.data.ts`. After changing these, run
`pnpm generate:cv` to refresh `public/cv-en.pdf`.
Check that the PDF still fits on one A4 page.
