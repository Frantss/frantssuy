import {
  colors,
  spacing,
  typography,
  dimensions,
  borders,
  motion,
  conditions,
} from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { IconCheck, IconSearch, IconAdjustmentsHorizontal, IconX } from "@tabler/icons-solidjs";
import { createDebouncer } from "@tanstack/solid-pacer/debouncer";
import { createEffect, createSignal, createUniqueId, For, Show, type JSX } from "solid-js";
import { Button } from "@/client/ui/button";
import { m } from "@/paraglide/messages";
import type { ArticleSearch } from "@/client/features/portfolio/articles.query";

const styles = stylex.create({
  filters: {
    marginInline: `calc(-1 * ${spacing.space1})`,
    display: "grid",
    transitionProperty: {
      default: "grid-template-rows, visibility",
      [conditions.reducedMotion]: "none",
    },
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easeOut,
  },
  expanded: {
    visibility: "visible",
    gridTemplateRows: "1fr",
  },
  collapsed: {
    visibility: "hidden",
    gridTemplateRows: "0fr",
  },

  root: {
    display: "grid",
  },
  form: {
    display: "flex",
    alignItems: "center",
    gap: spacing.space2,
  },
  label: {
    display: "flex",
    height: { default: dimensions.sizeControl, [conditions.coarsePointer]: dimensions.sizeTouch },
    minWidth: 0,
    flex: "1",
    alignItems: "center",
    gap: spacing.space2,
    // Same frame as the raised buttons beside it, so the row reads as one height.
    borderWidth: borders.borderRule,
    borderBottomWidth: borders.borderEmphasis,
    borderStyle: "solid",
    borderColor: {
      default: colors.lineStrong,
      [conditions.hover]: { default: null, ":hover": colors.faint },
    },
    borderBottomColor: colors.edge,
    borderRadius: borders.radiusControl,
    paddingLeft: spacing.space2_5,
    paddingRight: spacing.space1,
    boxShadow: {
      default: null,
      ":has(:focus-visible)": `0 0 0 ${borders.focusOffset} ${colors.bg}, 0 0 0 calc(${borders.focusOffset} + ${borders.borderEmphasis}) ${colors.accent}`,
    },
  },
  icon: {
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
  input: {
    height: "100%",
    minWidth: 0,
    width: "100%",
    borderWidth: 0,
    backgroundColor: "transparent",
    padding: 0,
    fontFamily: "inherit",
    fontSize: { default: typography.fontBase, [conditions.wide]: typography.fontSm },
    lineHeight: { default: typography.leadingBase, [conditions.wide]: typography.leadingSm },
    color: { default: colors.fg, "::placeholder": colors.faint },
    outlineStyle: { default: null, ":focus-visible": "none" },
    WebkitAppearance: { default: null, "::-webkit-search-cancel-button": "none" },
  },
  clearQuery: {
    width: { default: dimensions.sizeTouch, [conditions.wide]: dimensions.sizeSmall },
    minWidth: { default: null, [conditions.coarsePointer]: dimensions.sizeTouch },
    height: "100%",
    paddingInline: 0,
  },
  clip: {
    minHeight: 0,
    overflow: "hidden",
  },
  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: spacing.space1_5,
    paddingInline: spacing.space1,
    paddingTop: spacing.space3,
    paddingBottom: spacing.space1,
  },
  summary: {
    marginTop: spacing.space3,
    display: "flex",
    flexWrap: "wrap",
    minHeight: { default: dimensions.sizeSmall, [conditions.coarsePointer]: dimensions.sizeTouch },
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.space3,
  },
  // Sized like the article count it sits beside, flush with the right edge of the row.
  clear: {
    marginLeft: "auto",
    height: { default: dimensions.sizeSmall, [conditions.coarsePointer]: dimensions.sizeTouch },
    paddingInline: 0,
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
  },
  activeTag: {
    maxWidth: "100%",
    overflowWrap: "anywhere",
  },
});

export function ArticleSearchFilter(props: {
  search: ArticleSearch;
  tags: string[];
  onChange: (search: ArticleSearch, replace: boolean) => void;
  children?: JSX.Element;
}) {
  const [draft, setDraft] = createSignal(props.search.q ?? "");
  const [expanded, setExpanded] = createSignal(false);
  const filtersId = createUniqueId();
  const inputId = createUniqueId();
  let input: HTMLInputElement | undefined;
  let toggle: HTMLButtonElement | undefined;
  let submittedQuery = props.search.q ?? "";
  const debouncedSearch = createDebouncer(() => change(props.search.tag, true), { wait: 250 });

  createEffect(() => {
    const query = props.search.q ?? "";

    if (query === submittedQuery) return;
    debouncedSearch.cancel();
    submittedQuery = query;
    setDraft(query);
  });

  function change(tag: string | undefined, replace: boolean) {
    debouncedSearch.cancel();
    submittedQuery = draft().trim();
    props.onChange({ q: submittedQuery || undefined, tag }, replace);
  }

  function clearQuery() {
    setDraft("");
    change(props.search.tag, true);
    input?.focus();
  }

  return (
    <div {...stylex.attrs(styles.root)}>
      <form
        role="search"
        {...stylex.attrs(styles.form)}
        onSubmit={(event) => {
          event.preventDefault();
          change(props.search.tag, true);
        }}
      >
        <div {...stylex.attrs(styles.label)}>
          <IconSearch size={16} {...stylex.attrs(styles.icon)} aria-hidden="true" />
          <label for={inputId} {...stylex.attrs(styles.srOnly)}>
            {m.writing_search()}
          </label>
          <input
            ref={(element) => (input = element)}
            id={inputId}
            type="search"
            enterkeyhint="search"
            maxLength={200}
            value={draft()}
            placeholder={m.writing_search_placeholder()}
            {...stylex.attrs(styles.input)}
            onInput={(event) => {
              setDraft(event.currentTarget.value);
              if (!event.isComposing) debouncedSearch.maybeExecute();
            }}
            onCompositionStart={() => debouncedSearch.cancel()}
            onCompositionEnd={() => debouncedSearch.maybeExecute()}
            onKeyDown={(event) => {
              if (event.key !== "Escape" || event.isComposing || !draft()) return;
              event.preventDefault();
              clearQuery();
            }}
          />
          <Show when={draft()}>
            <Button
              variant="quiet"
              aria-label={m.writing_clear_search()}
              styles={styles.clearQuery}
              onClick={clearQuery}
            >
              <IconX size={16} aria-hidden="true" />
            </Button>
          </Show>
        </div>
        <Button
          ref={(element) => (toggle = element)}
          variant="secondary"
          selected={expanded() || !!props.search.tag}
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded()}
          aria-controls={filtersId}
        >
          <IconAdjustmentsHorizontal size={16} aria-hidden="true" />
          {m.writing_filters()}
        </Button>
      </form>
      <div
        id={filtersId}
        role="group"
        aria-label={m.writing_filter_by_tag()}
        aria-hidden={!expanded()}
        inert={!expanded()}
        {...stylex.attrs(styles.filters, expanded() ? styles.expanded : styles.collapsed)}
      >
        <div {...stylex.attrs(styles.clip)}>
          <div {...stylex.attrs(styles.tags)}>
            <For each={["", ...props.tags]}>
              {(tag) => {
                const selected = () => (props.search.tag ?? "") === tag;

                return (
                  <Button
                    variant="toggle"
                    aria-pressed={selected()}
                    onClick={() => change(selected() ? undefined : tag || undefined, false)}
                  >
                    <Show when={selected()}>
                      <IconCheck size={12} aria-hidden="true" />
                    </Show>
                    {tag || m.writing_all_tags()}
                  </Button>
                );
              }}
            </For>
          </div>
        </div>
      </div>
      <div {...stylex.attrs(styles.summary)}>
        {props.children}
        {/* The open tag list already marks the active tag, so only show it here while closed. */}
        <Show when={!expanded() && props.search.tag}>
          {(tag) => (
            <Button
              variant="toggle"
              selected
              aria-label={m.writing_remove_tag({ tag: tag() })}
              styles={styles.activeTag}
              onClick={() => {
                change(undefined, false);
                toggle?.focus();
              }}
            >
              {tag()}
              <IconX size={12} {...stylex.attrs(styles.icon)} aria-hidden="true" />
            </Button>
          )}
        </Show>
        <Show when={draft() || props.search.tag}>
          <Button
            variant="quiet"
            styles={styles.clear}
            onClick={() => {
              setDraft("");
              change(undefined, false);
              input?.focus();
            }}
          >
            {m.writing_clear_filters()}
          </Button>
        </Show>
      </div>
    </div>
  );
}
