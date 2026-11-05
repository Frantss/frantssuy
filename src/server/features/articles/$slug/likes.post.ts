import "@tanstack/solid-start/server-only";
import { article_throwIfNotFound } from "@/server/features/articles/article-throw-if-not-found";
import { base } from "@/server/orpc/orpc.base";
import { api_rateLimits } from "@/server/orpc/orpc.ratelimit";

export const addArticleLike = base.articles.likes.add
  .use(api_rateLimits.likesWriteBurst)
  .use(api_rateLimits.likesWrite)
  .handler(({ input, context }) => {
    article_throwIfNotFound(input.slug);

    return context.likes.add(input.slug);
  });
