import "@tanstack/solid-start/server-only";
import { article_throwIfNotFound } from "@/server/features/articles/article-throw-if-not-found";
import { base } from "@/server/orpc/orpc.base";
import { api_rateLimits } from "@/server/orpc/orpc.ratelimit";

export const getArticleLikes = base.articles.likes.get
  .use(api_rateLimits.likesRead)
  .handler(({ input, context }) => {
    article_throwIfNotFound(input.slug);

    return context.likes.get(input.slug);
  });
