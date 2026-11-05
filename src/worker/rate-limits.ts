import { env } from "cloudflare:workers";
import { CloudflareRateLimiter } from "@orpc/cloudflare";

export const rateLimits = {
  search: new CloudflareRateLimiter(env.SEARCH_RATE_LIMITER),
  likesRead: new CloudflareRateLimiter(env.LIKES_READ_RATE_LIMITER),
  likesWriteBurst: new CloudflareRateLimiter(env.LIKES_WRITE_BURST_RATE_LIMITER),
  likesWrite: new CloudflareRateLimiter(env.LIKES_WRITE_RATE_LIMITER),
};
