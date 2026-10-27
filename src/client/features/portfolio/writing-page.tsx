import {
  colors,
  spacing,
  typography,
  dimensions,
  borders,
  conditions,
} from "@/client/styles/theme.stylex";
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
import { ArticleDate } from "@/client/features/portfolio/article-date";
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
  tag: {
    display: "inline-flex",
    minHeight: { default: dimensions.sizeSmall, [conditions.coarsePointer]: dimensions.sizeTouch },
    cursor: "pointer",
    alignItems: "center",
    gap: spacing.space1,
    borderWidth: borders.borderRule,
    borderStyle: "solid",
    borderColor: {
      default: colors.line,
      [conditions.hover]: { default: null, ":hover": colors.faint },
    },
    backgroundColor: "transparent",
    paddingInline: spacing.space1_5,
    fontFamily: "inherit",
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    color: {
      default: colors.muted,
      [conditions.hover]: { default: null, ":hover": colors.fg },
    },
  },
  selected: {
    borderColor: {
      default: colors.accent,
      [conditions.hover]: { default: null, ":hover": colors.faint },
    },
    color: {
      default: colors.accent,
      [conditions.hover]: { default: null, ":hover": colors.fg },
    },
  },

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
  retry: {
    cursor: { default: "pointer", ":disabled": "wait" },
    borderWidth: borders.borderRule,
    borderStyle: "solid",
    borderColor: colors.lineStrong,
    backgroundColor: "transparent",
    paddingInline: spacing.space2,
    paddingBlock: spacing.space1,
    fontFamily: "inherit",
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    color: {
      default: colors.muted,
      [conditions.hover]: { default: null, ":hover": colors.fg },
    },
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
  paginationButton: {
    cursor: { default: "pointer", ":disabled": "default" },
    borderWidth: borders.borderRule,
    borderStyle: "solid",
    borderColor: colors.lineStrong,
    backgroundColor: "transparent",
    paddingInline: spacing.space2,
    paddingBlock: spacing.space1,
    fontFamily: "inherit",
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    color: {
      default: colors.muted,
      [conditions.hover]: { default: null, ":hover": colors.fg },
    },
    opacity: { default: null, ":disabled": 0.5 },
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
              <button
                type="button"
                disabled={cooldown.remaining() > 0}
                {...stylex.attrs(styles.retry)}
                onClick={() => store().revalidate()}
              >
                {m.writing_retry()}
              </button>
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
              <IndexList.Root>
                <For each={data()?.items ?? []}>
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
                                    <button
                                      type="button"
                                      aria-pressed={selected()}
                                      {...stylex.attrs(styles.tag, selected() && styles.selected)}
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
                                    </button>
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
                        <ArticleDate date={article.date} />
                      </IndexList.Value>
                    </IndexList.Row>
                  )}
                </For>
              </IndexList.Root>
            </Show>
            <Show when={(data()?.total ?? 0) > 20 || offset() > 0}>
              <nav aria-label={m.writing_pagination()} {...stylex.attrs(styles.pagination)}>
                <button
                  type="button"
                  disabled={offset() === 0 || pending()}
                  {...stylex.attrs(styles.paginationButton)}
                  onClick={() =>
                    change({ ...search(), offset: Math.max(0, offset() - 20) || undefined })
                  }
                >
                  {m.writing_previous()}
                </button>
                <button
                  type="button"
                  disabled={offset() + 20 >= (data()?.total ?? 0) || pending()}
                  {...stylex.attrs(styles.paginationButton)}
                  onClick={() => change({ ...search(), offset: offset() + 20 })}
                >
                  {m.writing_next()}
                </button>
              </nav>
            </Show>
          </Show>
        </div>
      </Show>
    </>
  );
}
