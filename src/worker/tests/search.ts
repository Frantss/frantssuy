import { article_createManifest } from "@/lib/articles/article-manifest";
import { article_buildSearch } from "@/lib/articles/article-search";
import { articles } from "./articles";

export default article_buildSearch(article_createManifest(articles));
