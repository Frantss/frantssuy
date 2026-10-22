import { colors, spacing, dimensions, borders, conditions } from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { createLink } from "@tanstack/solid-router";
import {
  createContext,
  createUniqueId,
  splitProps,
  useContext,
  type ComponentProps,
  type ParentProps,
} from "solid-js";
import { cn } from "@/client/lib/cn";

// Small-screen navigation: a bar fixed to the bottom edge whose trigger opens a sheet above it.
// The sheet is a native popover, so it opens, light-dismisses, and closes on Escape without JS;
// an in-flow spacer reserves the bar's height so it never covers the end of the page.
const DockContext = createContext<{ sheetId: string }>();

function useDock() {
  const context = useContext(DockContext);

  if (!context) throw new Error("Dock parts must be rendered inside Dock.Root");

  return context;
}

const styles = stylex.create({
  root: {
    display: { default: null, [conditions.wide]: "none" },
  },
  spacer: {
    height: `calc(${dimensions.sizeDock} + env(safe-area-inset-bottom))`,
  },
  bar: {
    insetInline: 0,
    bottom: 0,
    zIndex: 10,
    height: `calc(${dimensions.sizeDock} + env(safe-area-inset-bottom))`,
    paddingBottom: spacing.safeBottom,
    position: "fixed",
    borderTopWidth: borders.borderRule,
    borderTopStyle: "solid",
    borderColor: colors.line,
    backgroundColor: colors.bg,
  },
  trigger: {
    display: "flex",
    height: "100%",
    width: "100%",
    cursor: "pointer",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.space4,
    borderWidth: 0,
    backgroundColor: {
      default: "transparent",
      [conditions.hover]: { default: null, ":hover": colors.surface },
      ":focus-visible": colors.surface,
    },
    paddingInline: spacing.space4,
    fontFamily: "inherit",
    color: colors.fg,
  },
  menuLabel: {
    color: colors.muted,
  },
  closeLabel: {
    display: "none",
    color: colors.muted,
  },
  sheet: {
    insetInline: 0,
    top: "auto",
    bottom: `calc(${dimensions.sizeDock} + env(safe-area-inset-bottom))`,
    margin: 0,
    width: "100%",
    maxWidth: "none",
    overflow: "hidden",
    borderWidth: 0,
    backgroundColor: "transparent",
    padding: 0,
  },
  panel: {
    borderTopWidth: borders.borderRule,
    borderTopStyle: "solid",
    borderColor: colors.line,
    backgroundColor: colors.bg,
    paddingInline: spacing.space4,
    paddingBlock: spacing.space2,
    color: colors.fg,
  },
  list: {
    margin: 0,
    display: "grid",
    listStyleType: "none",
    padding: 0,
  },
  anchor: {
    display: "block",
    paddingBlock: spacing.space3,
    color: {
      default: colors.faint,
      [conditions.hover]: { default: null, ":hover": colors.muted },
      ":focus-visible": colors.muted,
    },
    textDecoration: "none",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.space2,
    borderTopWidth: borders.borderRule,
    borderTopStyle: "solid",
    borderColor: colors.line,
    paddingBlock: spacing.space2,
  },
});

function DockRoot(props: ParentProps) {
  const sheetId = createUniqueId();

  return (
    <DockContext.Provider value={{ sheetId }}>
      <div {...stylex.attrs(styles.root)} class={cn("dock-root", stylex.attrs(styles.root).class)}>
        <div {...stylex.attrs(styles.spacer)} aria-hidden="true" />
        {props.children}
      </div>
    </DockContext.Provider>
  );
}

function DockBar(props: ParentProps) {
  return <div {...stylex.attrs(styles.bar)}>{props.children}</div>;
}

function DockTrigger(props: ComponentProps<"button"> & { menuLabel: string; closeLabel: string }) {
  const dock = useDock();
  const [local, rest] = splitProps(props, ["menuLabel", "closeLabel", "children", "class"]);

  return (
    <button
      {...rest}
      type="button"
      popoverTarget={dock.sheetId}
      class={cn(stylex.attrs(styles.trigger).class, local.class)}
    >
      <span>{local.children}</span>
      <span class={cn("dock-menu-label", stylex.attrs(styles.menuLabel).class)}>
        {local.menuLabel} ≡
      </span>
      <span class={cn("dock-close-label", stylex.attrs(styles.closeLabel).class)}>
        {local.closeLabel} ×
      </span>
    </button>
  );
}

// Following a link closes the sheet; client-side navigation would otherwise leave it open.
// Slides out from behind the bar: the popover stays put and clips at the bar's edge while only the
// panel inside translates, so the motion stays on the compositor. Display and overlay transition
// discretely so closing animates too.
function DockSheet(props: ParentProps<{ label: string }>) {
  const dock = useDock();

  return (
    <nav
      id={dock.sheetId}
      popover
      aria-label={props.label}
      onClick={(event) => {
        if ((event.target as Element).closest("a")) event.currentTarget.hidePopover();
      }}
      {...stylex.attrs(styles.sheet)}
      class={cn("dock-sheet", stylex.attrs(styles.sheet).class)}
    >
      <div
        {...stylex.attrs(styles.panel)}
        class={cn("dock-panel", stylex.attrs(styles.panel).class)}
      >
        {props.children}
      </div>
    </nav>
  );
}

function DockList(props: ParentProps) {
  return <ul {...stylex.attrs(styles.list)}>{props.children}</ul>;
}

// The router sets aria-current on the active link; styling keys off it.
function DockAnchor(props: ComponentProps<"a">) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <li>
      <a {...rest} class={cn("nav-link", stylex.attrs(styles.anchor).class, local.class)} />
    </li>
  );
}

function DockFooter(props: ParentProps) {
  return <div {...stylex.attrs(styles.footer)}>{props.children}</div>;
}

export const Dock = {
  Root: DockRoot,
  Bar: DockBar,
  Trigger: DockTrigger,
  Sheet: DockSheet,
  List: DockList,
  Link: createLink(DockAnchor),
  Footer: DockFooter,
};
