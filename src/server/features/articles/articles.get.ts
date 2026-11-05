import "@tanstack/solid-start/server-only";
import { article_queryIndex } from "@/server/features/articles/article-index";
import { base } from "@/server/orpc/orpc.base";
import { api_rateLimits } from "@/server/orpc/orpc.ratelimit";

export const getArticles = base.articles.get
  .use(api_rateLimits.search)
  .handler(({ input }) => article_queryIndex(input));
