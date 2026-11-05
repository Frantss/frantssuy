import server from "../server";
import type { WorkerServices } from "./services";
import { rateLimits } from "./rate-limits";

export { ArticleLikes } from "./article-likes";

export default {
  fetch(request: Request, _env: Cloudflare.Env, ctx: ExecutionContext) {
    const services: WorkerServices = {
      likes: {
        get: (slug) => ctx.exports.ArticleLikes.getByName(slug).getCount(),
        add: (slug) => ctx.exports.ArticleLikes.getByName(slug).addLike(),
      },
      rateLimits,
    };

    return server.fetch(request, { context: { services } });
  },
};
