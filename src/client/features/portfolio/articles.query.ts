import * as v from "valibot";
import type { Queries } from "@/client/orpc/orpc.query";
import { client } from "@/client/orpc/orpc.transport";
import { article_querySchema } from "@/shared/features/articles/articles.get.contract";

export type ArticleSearch = { q?: string; tag?: string; offset?: number };
export type ArticleSearchResult = Awaited<ReturnType<typeof client.articles.get>>;

const searchSchema = v.object({
  q: v.fallback(article_querySchema.entries.q, undefined),
  tag: v.fallback(article_querySchema.entries.tag, undefined),
  offset: v.fallback(article_querySchema.entries.offset, 0),
});

export function article_parseSearch(input: unknown): ArticleSearch {
  const search = v.parse(searchSchema, input);

  return { q: search.q, tag: search.tag, offset: search.offset || undefined };
}

export function article_searchStore(queries: Queries, search: ArticleSearch) {
  const input = { q: search.q, tag: search.tag, offset: search.offset ?? 0, limit: 20 };

  return queries.createFetcherStore(["articles:", JSON.stringify(input)], {
    fetcher: () => client.articles.get(input),
  });
}
