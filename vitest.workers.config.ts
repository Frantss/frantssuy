import { fileURLToPath } from "node:url";
import { cloudflareTest } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [
    cloudflareTest({
      config: false,
      remoteBindings: false,
      main: "./src/worker/tests/entry.ts",
      miniflare: {
        compatibilityDate: "2026-11-04",
        compatibilityFlags: ["nodejs_compat"],
        durableObjects: {
          ARTICLE_LIKES: { className: "ArticleLikes", useSQLite: true },
        },
        ratelimits: {
          SEARCH_RATE_LIMITER: { namespace_id: "1001", simple: { limit: 60, period: 60 } },
          LIKES_READ_RATE_LIMITER: { namespace_id: "1002", simple: { limit: 240, period: 60 } },
          LIKES_WRITE_BURST_RATE_LIMITER: {
            namespace_id: "1003",
            simple: { limit: 30, period: 10 },
          },
          LIKES_WRITE_RATE_LIMITER: { namespace_id: "1004", simple: { limit: 120, period: 60 } },
        },
      },
    }),
  ],
  resolve: {
    alias: {
      "@/lib": fileURLToPath(new URL("./lib", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "virtual:article-search": fileURLToPath(
        new URL("./src/worker/tests/search.ts", import.meta.url),
      ),
      "virtual:article-metadata": fileURLToPath(
        new URL("./src/worker/tests/metadata.ts", import.meta.url),
      ),
    },
  },
  test: {
    name: "workers",
    include: ["src/worker/tests/**/*.test.ts"],
  },
});
