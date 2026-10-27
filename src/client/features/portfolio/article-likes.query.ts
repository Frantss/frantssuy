import type { Queries } from "@/client/orpc/orpc.query";
import { client } from "@/client/orpc/orpc.transport";

export function article_likesStore(queries: Queries, slug: string) {
  const store = queries.createFetcherStore<{ count: number }>(`article-likes:${slug}`, {
    fetcher: async (): Promise<{ count: number }> => {
      const output = await client.articles.likes.get({ slug });

      return { count: Math.max(store.get().data?.count ?? 0, output.count) };
    },
  });

  return store;
}

export function article_addLikeStore(queries: Queries) {
  return queries.createMutatorStore<string, { count: number }>(
    async ({ data: slug, getCacheUpdater }) => {
      const output = await client.articles.likes.add({ slug });
      const [update, previous] = getCacheUpdater<{ count: number }>(`article-likes:${slug}`, false);

      update({ count: Math.max(previous?.count ?? 0, output.count) });

      return output;
    },
    { throttleCalls: false },
  );
}
