declare module "virtual:article-metadata" {
  const metadata: {
    revision: string;
    articles: import("@/lib/articles/article-metadata").Article[];
  };

  export default metadata;
}

declare module "virtual:article-search" {
  const search: import("@/lib/articles/article-search").ArticleSearchBundle;

  export default search;
}
