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
import { IconButton } from "@/client/ui/icon-button";
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
  toggle: {
    display: "inline-flex",
    minHeight: {
      default: `calc(${dimensions.sizeTouch} + 2 * ${borders.borderRule})`,
      [conditions.wide]: dimensions.sizeControl,
      [conditions.coarsePointer]: `calc(${dimensions.sizeTouch} + 2 * ${borders.borderRule})`,
    },
    flexShrink: 0,
    alignItems: "center",
    gap: spacing.space2,
    cursor: "pointer",
    borderWidth: borders.borderRule,
    borderStyle: "solid",
    borderColor: {
      default: colors.faint,
      [conditions.hover]: { default: null, ":hover": colors.muted },
    },
    backgroundColor: "transparent",
    paddingInline: spacing.space2_5,
    fontFamily: "inherit",
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    color: {
      default: colors.muted,
      [conditions.hover]: { default: null, ":hover": colors.fg },
      ":focus-visible": colors.fg,
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
      ":focus-visible": colors.fg,
    },
  },
  expanded: {
    visibility: "visible",
    gridTemplateRows: "1fr",
  },
  collapsed: {
    visibility: "hidden",
    gridTemplateRows: "0fr",
  },
  tag: {
    display: "inline-flex",
    minWidth: { default: null, [conditions.coarsePointer]: dimensions.sizeTouch },
    minHeight: { default: dimensions.sizeSmall, [conditions.coarsePointer]: dimensions.sizeTouch },
    cursor: "pointer",
    alignItems: "center",
    gap: spacing.space1,
    borderWidth: borders.borderRule,
    borderStyle: "solid",
    borderColor: {
      default: colors.faint,
      [conditions.hover]: { default: null, ":hover": colors.faint },
    },
    backgroundColor: "transparent",
    paddingInline: spacing.space2,
    fontFamily: "inherit",
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    color: {
      default: colors.muted,
      [conditions.hover]: { default: null, ":hover": colors.fg },
    },
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
    height: {
      default: `calc(${dimensions.sizeTouch} + 2 * ${borders.borderRule})`,
      [conditions.wide]: dimensions.sizeControl,
    },
    minHeight: {
      default: null,
      [conditions.coarsePointer]: `calc(${dimensions.sizeTouch} + 2 * ${borders.borderRule})`,
    },
    minWidth: 0,
    flex: "1",
    alignItems: "center",
    gap: spacing.space2,
    borderWidth: borders.borderRule,
    borderStyle: "solid",
    borderColor: colors.faint,
    paddingLeft: spacing.space2_5,
    paddingRight: spacing.space1,
    outlineStyle: { default: null, ":has(:focus-visible)": "solid" },
    outlineWidth: { default: null, ":has(:focus-visible)": borders.borderEmphasis },
    outlineColor: { default: null, ":has(:focus-visible)": colors.accent },
    outlineOffset: { default: null, ":has(:focus-visible)": borders.focusOffset },
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
    flexShrink: 0,
    borderWidth: 0,
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
  activeTag: {
    maxWidth: "100%",
    overflowWrap: "anywhere",
  },
  clear: {
    marginLeft: "auto",
    flexShrink: 0,
    cursor: "pointer",
    borderWidth: 0,
    backgroundColor: "transparent",
    padding: 0,
    fontFamily: "inherit",
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    color: colors.link,
    minHeight: { default: null, [conditions.coarsePointer]: dimensions.sizeTouch },
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
            <IconButton
              aria-label={m.writing_clear_search()}
              styles={styles.clearQuery}
              onClick={clearQuery}
            >
              <IconX size={16} aria-hidden="true" />
            </IconButton>
          </Show>
        </div>
        <button
          ref={(element) => (toggle = element)}
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded()}
          aria-controls={filtersId}
          {...stylex.attrs(styles.toggle, (expanded() || !!props.search.tag) && styles.selected)}
        >
          <IconAdjustmentsHorizontal size={16} aria-hidden="true" />
          {m.writing_filters()}
        </button>
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
                  <button
                    type="button"
                    aria-pressed={selected()}
                    {...stylex.attrs(styles.tag, selected() && styles.selected)}
                    onClick={() => change(selected() ? undefined : tag || undefined, false)}
                  >
                    <Show when={selected()}>
                      <IconCheck size={12} aria-hidden="true" />
                    </Show>
                    {tag || m.writing_all_tags()}
                  </button>
                );
              }}
            </For>
          </div>
        </div>
      </div>
      <div {...stylex.attrs(styles.summary)}>
        {props.children}
        <Show when={props.search.tag}>
          {(tag) => (
            <button
              type="button"
              aria-label={m.writing_remove_tag({ tag: tag() })}
              {...stylex.attrs(styles.tag, styles.selected, styles.activeTag)}
              onClick={() => {
                change(undefined, false);
                toggle?.focus();
              }}
            >
              {tag()}
              <IconX size={12} {...stylex.attrs(styles.icon)} aria-hidden="true" />
            </button>
          )}
        </Show>
        <Show when={draft() || props.search.tag}>
          <button
            type="button"
            {...stylex.attrs(styles.clear)}
            onClick={() => {
              setDraft("");
              change(undefined, false);
              input?.focus();
            }}
          >
            {m.writing_clear_filters()}
          </button>
        </Show>
      </div>
    </div>
  );
}
