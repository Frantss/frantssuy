import type { RateLimiter } from "@orpc/ratelimit";

export type WorkerServices = {
  likes: {
    get(slug: string): Promise<{ count: number }>;
    add(slug: string): Promise<{ count: number }>;
  };
  rateLimits: {
    search: RateLimiter;
    likesRead: RateLimiter;
    likesWriteBurst: RateLimiter;
    likesWrite: RateLimiter;
  };
};
