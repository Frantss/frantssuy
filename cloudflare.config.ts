import { bindings, defineConfig, exports } from "cf/config";
import * as entrypoint from "./src/worker/index.ts" with { type: "cf-worker" };

export default defineConfig(({ mode }) => {
  const name = mode === "staging" ? "frantssuy-staging" : "frantssuy";
  const namespaceBase = mode === "staging" ? 2000 : 1000;

  return {
    worker: {
      name,
      entrypoint,
      compatibilityDate: "2026-11-04",
      compatibilityFlags: ["nodejs_compat"],
      observability: { enabled: true, traces: { enabled: true } },
      exports: {
        ArticleLikes: exports.durableObject({ storage: "sqlite" }),
      },
      env: {
        SEARCH_RATE_LIMITER: bindings.rateLimit({
          namespace: String(namespaceBase + 1),
          simple: { limit: 60, period: 60 },
        }),
        LIKES_READ_RATE_LIMITER: bindings.rateLimit({
          namespace: String(namespaceBase + 2),
          simple: { limit: 240, period: 60 },
        }),
        LIKES_WRITE_BURST_RATE_LIMITER: bindings.rateLimit({
          namespace: String(namespaceBase + 3),
          simple: { limit: 30, period: 10 },
        }),
        LIKES_WRITE_RATE_LIMITER: bindings.rateLimit({
          namespace: String(namespaceBase + 4),
          simple: { limit: 120, period: 60 },
        }),
      },
    },
  };
});
