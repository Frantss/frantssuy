import { createFileRoute } from "@tanstack/solid-router";
import { WritingPage } from "@/client/features/portfolio/writing-page";
import { article_likesStore } from "@/client/features/portfolio/article-likes.query";
import {
  article_parseSearch,
  article_searchStore,
} from "@/client/features/portfolio/articles.query";
import { article_list } from "@/lib/articles/article-metadata";
import { profile } from "@/client/features/portfolio/portfolio.data";
import { seo } from "@/shared/seo/seo";
import { site } from "@/shared/seo/site";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_site/writing/")({
  validateSearch: article_parseSearch,
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    if (!article_list().length) return;
    const result = await article_searchStore(context.queries, deps).fetch();

    await Promise.all(
      ("data" in result ? result.data.items : []).map((article) =>
        article_likesStore(context.queries, article.slug).fetch(),
      ),
    );
  },
  head: () => {
    const metadata = seo({
      title: `${m.page_writing()} · ${profile.name}`,
      description: m.meta_writing({ name: profile.name }),
      path: "/writing",
      image: site.socialImage,
    });

    return { meta: metadata.meta, links: metadata.links };
  },
  component: WritingPage,
});
