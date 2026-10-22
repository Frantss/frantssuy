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
import { IconCheck, IconSearch, IconAdjustmentsHorizontal } from "@tabler/icons-solidjs";
import { createDebouncer } from "@tanstack/solid-pacer/debouncer";
import { createEffect, createSignal, createUniqueId, For, Show, type JSX } from "solid-js";
import { IconButton } from "@/client/ui/icon-button";
import { Tooltip } from "@/client/ui/tooltip";
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
    width: { default: dimensions.sizeTouch, [conditions.wide]: dimensions.sizeControl },
    height: { default: dimensions.sizeTouch, [conditions.wide]: dimensions.sizeControl },
    flexShrink: 0,
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
    minHeight: { default: dimensions.sizeSmall, [conditions.coarsePointer]: dimensions.sizeTouch },
    cursor: "pointer",
    alignItems: "center",
    gap: spacing.space1,
    borderWidth: borders.borderRule,
    borderStyle: "solid",
    borderColor: {
      default: colors.lineStrong,
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
    height: { default: dimensions.sizeTouch, [conditions.wide]: dimensions.sizeControl },
    minWidth: 0,
    flex: "1",
    alignItems: "center",
    gap: spacing.space2,
    borderWidth: borders.borderRule,
    borderStyle: "solid",
    borderColor: colors.lineStrong,
    paddingInline: spacing.space2_5,
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
    minHeight: { default: dimensions.sizeSmall, [conditions.coarsePointer]: dimensions.sizeTouch },
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.space3,
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
        <label {...stylex.attrs(styles.label)}>
          <IconSearch size={16} {...stylex.attrs(styles.icon)} aria-hidden="true" />
          <span {...stylex.attrs(styles.srOnly)}>{m.writing_search()}</span>
          <input
            type="search"
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
          />
        </label>
        <Tooltip label={m.writing_filters()}>
          {(triggerProps) => (
            <IconButton
              {...triggerProps({ onClick: () => setExpanded((value) => !value) })}
              aria-label={m.writing_filters()}
              aria-expanded={expanded()}
              aria-controls={filtersId}
              styles={[styles.toggle, (expanded() || !!props.search.tag) && styles.selected]}
            >
              <IconAdjustmentsHorizontal size={18} aria-hidden="true" />
            </IconButton>
          )}
        </Tooltip>
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
                    onClick={() => change(tag || undefined, false)}
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
        <Show when={draft() || props.search.tag}>
          <button
            type="button"
            {...stylex.attrs(styles.clear)}
            onClick={() => {
              setDraft("");
              change(undefined, false);
            }}
          >
            {m.writing_clear_filters()}
          </button>
        </Show>
      </div>
    </div>
  );
}
