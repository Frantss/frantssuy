import { colors, spacing, dimensions, borders, conditions } from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { createLink } from "@tanstack/solid-router";
import { splitProps, type ComponentProps, type ParentProps } from "solid-js";
import { cn } from "@/client/lib/cn";

const styles = stylex.create({
  anchor: {
    color: {
      default: colors.faint,
      [conditions.hover]: { default: null, ":hover": colors.muted },
      ":focus-visible": colors.muted,
    },
    textDecoration: "none",
  },

  root: {
    display: "grid",
    flex: "1",
    alignContent: { default: "start", [conditions.wide]: "stretch" },
    gridTemplateColumns: { default: null, [conditions.wide]: "9rem 1fr" },
  },
  rule: {
    width: dimensions.sizeRail,
    flexShrink: 0,
    borderRightWidth: borders.borderRule,
    borderRightStyle: "solid",
    borderColor: colors.line,
    display: { default: null, [conditions.narrow]: "none" },
  },
  nav: {
    borderRightWidth: borders.borderRule,
    borderRightStyle: "solid",
    borderColor: { default: "transparent", [conditions.print]: colors.line },
    paddingInline: spacing.space4,
    paddingBlock: spacing.space6,
    display: { default: null, [conditions.narrow]: "none" },
  },
  list: {
    position: "sticky",
    top: spacing.space6,
    margin: 0,
    display: "flex",
    listStyleType: "none",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: spacing.space1,
    padding: 0,
  },
  item: {
    whiteSpace: "nowrap",
  },
  content: {
    paddingInline: { default: spacing.space4, [conditions.wide]: spacing.space8 },
    paddingBlock: spacing.space6,
  },
});

// Sidebar navigation beside a content column; hidden on small screens, where Dock takes over.
function RailRoot(props: ParentProps) {
  return <div {...stylex.attrs(styles.root)}>{props.children}</div>;
}

function RailRule() {
  return <div {...stylex.attrs(styles.rule)} />;
}

function RailNav(props: ParentProps<{ label: string }>) {
  return (
    <nav aria-label={props.label} {...stylex.attrs(styles.nav)}>
      <ul {...stylex.attrs(styles.list)}>{props.children}</ul>
    </nav>
  );
}

// The router sets aria-current on the active link; styling keys off it.
function RailAnchor(props: ComponentProps<"a">) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <li {...stylex.attrs(styles.item)}>
      <a {...rest} class={cn("nav-link", stylex.attrs(styles.anchor).class, local.class)} />
    </li>
  );
}

function RailContent(props: ParentProps) {
  return <main {...stylex.attrs(styles.content)}>{props.children}</main>;
}

export const Rail = {
  Root: RailRoot,
  Rule: RailRule,
  Nav: RailNav,
  Link: createLink(RailAnchor),
  Content: RailContent,
};
