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
    gridTemplateColumns: { default: null, [conditions.wide]: `${dimensions.sizeRail} 1fr` },
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
  outline: {
    margin: 0,
    marginBlock: spacing.space1,
    display: "flex",
    listStyleType: "none",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: spacing.space1,
    padding: 0,
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
  },
  outlineItem: {
    position: "relative",
  },
  outlineLink: {
    color: {
      default: colors.faint,
      [conditions.hover]: { default: null, ":hover": colors.muted },
      ":focus-visible": colors.muted,
    },
    textDecoration: "none",
    transitionProperty: "color",
    transitionDuration: motion.durationColor,
    transitionTimingFunction: motion.easeColor,
  },
  outlineCurrent: {
    color: colors.fg,
  },
  // Sits on the rail's right rule: past the nav's inline padding and its transparent border.
  outlineBar: {
    position: "absolute",
    insetBlock: 0,
    right: `calc(-1 * (${spacing.space4} + ${borders.borderRule}))`,
    width: borders.borderEmphasis,
    backgroundColor: colors.accent,
    opacity: 0,
    transitionProperty: { default: null, [conditions.motion]: "opacity" },
    transitionDuration: motion.durationColor,
    transitionTimingFunction: motion.easeColor,
  },
  outlineBarCurrent: {
    opacity: 1,
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

// Section links for the current page, nested under its link.
function RailOutline(props: ParentProps<{ label: string }>) {
  return (
    <li {...stylex.attrs(styles.item)}>
      <ul aria-label={props.label} {...stylex.attrs(styles.outline)}>
        {props.children}
      </ul>
    </li>
  );
}

function RailOutlineLink(props: ParentProps<{ href: string; nested?: boolean; current: boolean }>) {
  return (
    <li {...stylex.attrs(styles.outlineItem)}>
      <a
        href={props.href}
        aria-current={props.current ? "location" : undefined}
        {...stylex.attrs(styles.outlineLink, props.current && styles.outlineCurrent)}
      >
        {props.children}
      </a>
      <span
        aria-hidden="true"
        {...stylex.attrs(styles.outlineBar, props.current && styles.outlineBarCurrent)}
      />
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
  Outline: RailOutline,
  OutlineLink: RailOutlineLink,
  Content: RailContent,
};
