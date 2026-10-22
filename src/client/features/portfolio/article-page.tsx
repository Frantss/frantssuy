import { colors, spacing, typography, dimensions } from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { cn } from "@/client/lib/cn";
import { Link } from "@tanstack/solid-router";
import { Suspense } from "solid-js";
import { Dynamic } from "solid-js/web";
import { Page, PageTitle } from "@/client/ui/page";
import { ToastProvider } from "@/client/ui/toast";
import { article_content } from "@/lib/articles/article-content";
import { ArticleDate } from "@/client/features/portfolio/article-date";
import { ArticleTags } from "@/client/features/portfolio/article-tags";
import { ArticleShare } from "@/client/features/portfolio/article-share";
import { ArticleLikeButton } from "@/client/features/portfolio/article-like-button";
import type { Article } from "@/lib/articles/article-metadata";
import { m } from "@/paraglide/messages";

const styles = stylex.create({
  root: {
    minWidth: 0,
    maxWidth: dimensions.sizeArticle,
  },
  meta: {
    display: "grid",
    gap: spacing.space2,
  },
  date: {
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    color: colors.faint,
  },
  body: {
    minWidth: 0,
  },
  footer: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.space4,
  },
  back: {
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
  },
  actions: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: spacing.space2,
  },
});

export function ArticlePage(props: { article: Article }) {
  return (
    <ToastProvider>
      <Page styles={styles.root}>
        <PageTitle>{props.article.title}</PageTitle>
        <div {...stylex.attrs(styles.meta)}>
          <ArticleDate date={props.article.date} styles={styles.date} />
          <ArticleTags tags={props.article.tags} />
        </div>
        <article
          {...stylex.attrs(styles.body)}
          class={cn("article-body", stylex.attrs(styles.body).class)}
        >
          <Suspense fallback={<p role="status">Loading article…</p>}>
            <Dynamic component={article_content(props.article.slug)} />
          </Suspense>
        </article>
        <div {...stylex.attrs(styles.footer)}>
          <Link to="/writing" {...stylex.attrs(styles.back)}>
            {m.article_all_writing()}
          </Link>
          <div {...stylex.attrs(styles.actions)}>
            <ArticleLikeButton slug={props.article.slug} />
            <ArticleShare article={props.article} />
          </div>
        </div>
      </Page>
    </ToastProvider>
  );
}
