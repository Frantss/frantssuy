import search from "virtual:article-search";
import { article_loadSearch } from "@/lib/articles/article-search";
import type { article_querySchema } from "@/shared/features/articles/articles.get.contract";
import type * as v from "valibot";

const index = article_loadSearch(search);

export function article_queryIndex(input: v.InferOutput<typeof article_querySchema>) {
  return index.query(input);
}
