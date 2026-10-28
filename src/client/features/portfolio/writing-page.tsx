import { colors, spacing, typography, dimensions, conditions } from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { Link, useNavigate, useRouterState, useSearch } from "@tanstack/solid-router";
import { useStore } from "@nanostores/solid";
import { createEffect, createMemo, For, Show } from "solid-js";
import { useQueries } from "@/client/orpc/orpc.query";
import { IconCheck, IconHourglass } from "@tabler/icons-solidjs";
import { createDelayedPending } from "@/client/lib/create-delayed-pending";
import { createRateLimitCooldown } from "@/client/orpc/orpc.ratelimit";
import { IndexList } from "@/client/ui/index-list";
import { Page, PageTitle } from "@/client/ui/page";
import { ToastProvider } from "@/client/ui/toast";
import { Tags } from "@/client/ui/tags";
import { Button } from "@/client/ui/button";
import { ArticleDate } from "@/client/features/portfolio/article-date";
import { articles_groupByYear } from "@/client/features/portfolio/articles-by-year";
import { SectionLabel } from "@/client/ui/section-label";
import { ArticleLikeButton } from "@/client/features/portfolio/article-like-button";
import { ArticleSearchFilter } from "@/client/features/portfolio/article-search-filter";
import {
  article_searchStore,
  type ArticleSearch,
  type ArticleSearchResult,
} from "@/client/features/portfolio/articles.query";
import { article_list } from "@/lib/articles/article-metadata";
import { m } from "@/paraglide/messages";
import { analytics_autocapture } from "@/client/analytics/analytics";

const styles = stylex.create({
  empty: {
    margin: 0,
    color: colors.muted,
  },
  emptyResults: {
    display: "grid",
    gap: spacing.space2,
    paddingBlock: spacing.space4,
  },
  loading: {
    margin: 0,
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    color: colors.muted,
  },
  status: {
    margin: 0,
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    color: colors.muted,
  },
  statusGroup: {
    display: "flex",
    alignItems: "center",
    gap: spacing.space2,
  },
  pending: {
    display: "inline-flex",
    width: dimensions.sizeIconSmall,
    height: dimensions.sizeIconSmall,
    flexShrink: 0,
    color: colors.muted,
  },
  srOnly: {
    position: "absolute",
    width: dimensions.sizeScreenReader,
    height: dimensions.sizeScreenReader,
    padding: 0,
    margin: spacing.screenReaderOffset,
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
    borderWidth: 0,
  },
  years: {
    display: "grid",
    gap: spacing.space8,
  },
  year: {
    display: "grid",
    gap: spacing.space3,
  },
  results: {
    display: "grid",
    gap: spacing.space4,
  },
  error: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.space2,
  },
  errorMessage: {
    margin: 0,
    fontSize: typography.fontSm,
    lineHeight: typography.leadingSm,
    color: colors.muted,
  },
  entry: {
    display: "grid",
    minWidth: 0,
    gap: spacing.space1_5,
  },
  link: {
    color: {
      default: colors.fg,
      [conditions.hover]: { default: null, ":hover": colors.link },
      ":focus-visible": colors.link,
    },
  },
  tags: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.space1_5,
  },
  pagination: {
    display: "flex",
    justifyContent: "space-between",
    gap: spacing.space2,
  },
});

export function WritingPage() {
  return (
    <ToastProvider>
      <Page>
        <PageTitle>{m.page_writing()}</PageTitle>
        <Show
          when={article_list().length > 0}
          fallback={<p {...stylex.attrs(styles.empty)}>{m.writing_empty()}</p>}
        >
          <WritingArticles />
        </Show>
      </Page>
    </ToastProvider>
  );
}

function WritingArticles() {
  const search = useSearch({ from: "/_site/writing/" });
  const navigate = useNavigate();
  const isNavigating = useRouterState({ select: (state) => state.isLoading });
  const queries = useQueries();
  const store = createMemo(() => article_searchStore(queries, search()));
  const subscription = createMemo(() => useStore(store()));
  const query = () => subscription()();
  const data = createMemo<ArticleSearchResult | undefined>(
    (previous) => query().data ?? (query().loading ? previous : undefined),
  );
  const cooldown = createRateLimitCooldown();
  const tags = [...new Set(article_list().flatMap((article) => article.tags))].sort();
  const offset = () => search().offset ?? 0;
  const pending = () => isNavigating() || query().loading;
  // Text search orders by relevance, so year headings only apply to the date-ordered list.
  const groups = (): {
    year?: string;
    articles: NonNullable<ReturnType<typeof data>>["items"];
  }[] =>
    search().q ? [{ articles: data()?.items ?? [] }] : articles_groupByYear(data()?.items ?? []);
  const showLoading = createDelayedPending(pending);

  createEffect(() => cooldown.handle(query().error));

  function change(next: ArticleSearch, replace = false) {
    void navigate({
      to: "/writing",
      search: next,
      replace,
      resetScroll: false,
      viewTransition: false,
    });
  }

  return (
    <>
      <ArticleSearchFilter search={search()} tags={tags} onChange={change}>
        <div {...stylex.attrs(styles.statusGroup)}>
          <Show
            when={data() || query().error}
            fallback={
              <p {...stylex.attrs(styles.loading)} role="status">
                {m.writing_loading()}
              </p>
            }
          >
            <Show when={!query().error}>
              <p {...stylex.attrs(styles.status)} role="status">
                {data()?.total === 1
                  ? m.writing_one_article()
                  : m.writing_articles_count({ count: data()?.total ?? 0 })}
              </p>
            </Show>
          </Show>
          <span role="status" {...stylex.attrs(styles.pending)}>
            <Show when={showLoading()}>
              <IconHourglass size={14} aria-hidden="true" />
              <span {...stylex.attrs(styles.srOnly)}>{m.writing_updating()}</span>
            </Show>
          </span>
        </div>
      </ArticleSearchFilter>
      <Show
        when={data() || query().error}
        fallback={
          <p {...stylex.attrs(styles.loading)} role="status">
            {m.writing_loading()}
          </p>
        }
      >
        <div {...stylex.attrs(styles.results)} aria-busy={pending()}>
          <Show when={query().error}>
            <div {...stylex.attrs(styles.error)}>
              <Show when={!cooldown.limited()}>
                <p role="alert" {...stylex.attrs(styles.errorMessage)}>
                  {m.writing_search_error()}
                </p>
              </Show>
              <Button
                variant="secondary"
                disabled={cooldown.remaining() > 0}
                onClick={() => store().revalidate()}
              >
                {m.writing_retry()}
              </Button>
            </div>
          </Show>
          <Show when={!query().error}>
            <Show
              when={data()?.items.length}
              fallback={
                <div {...stylex.attrs(styles.emptyResults)}>
                  <p {...stylex.attrs(styles.empty)}>{m.writing_no_results()}</p>
                  <p {...stylex.attrs(styles.loading)}>{m.writing_no_results_hint()}</p>
                </div>
              }
            >
              <div {...stylex.attrs(styles.years)}>
                <For each={groups()}>
                  {(group) => (
                    <section {...stylex.attrs(styles.year)}>
                      <Show when={group.year}>
                        {(year) => <SectionLabel level="h2">{year()}</SectionLabel>}
                      </Show>
                      <IndexList.Root>
                        <For each={group.articles}>
                          {(article) => (
                            <IndexList.Row>
                              <div {...stylex.attrs(styles.entry)}>
                                <Link
                                  to="/writing/$slug"
                                  params={{ slug: article.slug }}
                                  {...stylex.attrs(styles.link)}
                                  {...analytics_autocapture({
                                    id: "article-link",
                                    article_slug: article.slug,
                                  })}
                                >
                                  {article.title}
                                </Link>
                                <div {...stylex.attrs(styles.tags)}>
                                  <Tags.List>
                                    <For each={article.tags}>
                                      {(tag) => {
                                        const selected = () => search().tag === tag;

                                        return (
                                          <li>
                                            <Button
                                              variant="toggle"
                                              aria-pressed={selected()}
                                              onClick={() =>
                                                change({
                                                  q: search().q,
                                                  tag: selected() ? undefined : tag,
                                                })
                                              }
                                            >
                                              <Show when={selected()}>
                                                <IconCheck size={12} aria-hidden="true" />
                                              </Show>
                                              {tag}
                                            </Button>
                                          </li>
                                        );
                                      }}
                                    </For>
                                  </Tags.List>
                                  <ArticleLikeButton slug={article.slug} size="sm" />
                                </div>
                              </div>
                              <IndexList.Leader />
                              <IndexList.Value>
                                <ArticleDate date={article.date} short={!!group.year} />
                              </IndexList.Value>
                            </IndexList.Row>
                          )}
                        </For>
                      </IndexList.Root>
                    </section>
                  )}
                </For>
              </div>
            </Show>
            <Show when={(data()?.total ?? 0) > 20 || offset() > 0}>
              <nav aria-label={m.writing_pagination()} {...stylex.attrs(styles.pagination)}>
                <Button
                  variant="secondary"
                  disabled={offset() === 0 || pending()}
                  onClick={() =>
                    change({ ...search(), offset: Math.max(0, offset() - 20) || undefined })
                  }
                >
                  {m.writing_previous()}
                </Button>
                <Button
                  variant="secondary"
                  disabled={offset() + 20 >= (data()?.total ?? 0) || pending()}
                  onClick={() => change({ ...search(), offset: offset() + 20 })}
                >
                  {m.writing_next()}
                </Button>
              </nav>
            </Show>
          </Show>
        </div>
      </Show>
    </>
  );
}
