import "@tanstack/solid-start/server-only";
import { os } from "@orpc/server";
import { ratelimit } from "@orpc/ratelimit";
import type { Context } from "@/server/orpc/orpc.context";

function api_rateLimit(bucket: keyof Context["rateLimits"]) {
  const check = ratelimit<Pick<Context, "clientIP" | "rateLimits">, unknown>({
    limiter: ({ context }) => context.rateLimits[bucket],
    key: ({ context }) => context.clientIP ?? "unknown",
  });

  return os
    .$context<Pick<Context, "clientIP" | "rateLimits">>()
    .middleware((options, input, done) => {
      if (options.context.clientIP === undefined) return options.next();

      return check(options, input, done);
    });
}

export const api_rateLimits = {
  search: api_rateLimit("search"),
  likesRead: api_rateLimit("likesRead"),
  likesWriteBurst: api_rateLimit("likesWriteBurst"),
  likesWrite: api_rateLimit("likesWrite"),
};
