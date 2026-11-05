import { article_createManifest } from "@/lib/articles/article-manifest";
import { articles } from "./articles";

export default {
  revision: article_createManifest(articles).revision,
  articles: articles.map((article) => ({
    ...article,
    socialImage: { path: "/fixture.png", width: 1200, height: 630, alt: article.title },
  })),
};
