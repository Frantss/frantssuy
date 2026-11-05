import { env } from "cloudflare:workers";
import type { WorkerServices } from "../services";
import { rateLimits } from "../rate-limits";

export const services: WorkerServices = {
  likes: {
    get: (slug) => env.ARTICLE_LIKES.getByName(slug).getCount(),
    add: (slug) => env.ARTICLE_LIKES.getByName(slug).addLike(),
  },
  rateLimits,
};
