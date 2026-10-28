import {
  colors,
  spacing,
  typography,
  dimensions,
  borders,
  conditions,
} from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import type { JSX, ParentProps } from "solid-js";
import { cn } from "@/client/lib/cn";

const styles = stylex.create({
  root: {
    margin: 0,
    display: "grid",
    listStyleType: "none",
    gap: { default: spacing.space3, [conditions.wide]: spacing.space1 },
    padding: 0,
  },
  row: {
    display: "flex",
    flexDirection: { default: "column", [conditions.wide]: "row" },
    alignItems: { default: null, [conditions.wide]: "baseline" },
  },
  // Round dots drawn as a background, matching the page texture; a 1px dotted border renders as
  // dense, soft dashes. Print keeps the dotted border the CV is laid out with.
  leader: {
    marginInline: spacing.space3,
    minWidth: spacing.space4,
    flex: "1",
    display: { default: null, [conditions.narrow]: "none" },
    height: { default: dimensions.sizeLeaderDot, [conditions.print]: "auto" },
    // Whole-pixel lift keeps the dots crisp; -0.35em lands between pixel rows.
    translate: { default: "0 round(-0.35em, 1px)", [conditions.print]: "0 -0.35em" },
    borderBottomWidth: { default: 0, [conditions.print]: borders.borderRule },
    borderStyle: "dotted",
    borderColor: colors.lineStrong,
    backgroundImage: {
      default: `radial-gradient(circle, ${colors.lineStrong} 0.75px, transparent 1px)`,
      [conditions.print]: "none",
    },
    backgroundSize: `${dimensions.sizeLeaderGap} ${dimensions.sizeLeaderDot}`,
    backgroundRepeat: "repeat-x",
    backgroundPosition: "0 50%",
  },
  value: {
    flexShrink: 0,
    color: colors.faint,
    fontVariantNumeric: "tabular-nums",
    fontSize: { default: null, [conditions.narrow]: typography.fontXs },
    lineHeight: { default: null, [conditions.narrow]: typography.leadingXs },
  },
});

// Rows of "label ······ value", like a table of contents; on small screens the value sits
// under the label.
function IndexListRoot(props: ParentProps) {
  return <ul {...stylex.attrs(styles.root)}>{props.children}</ul>;
}

function IndexListRow(props: ParentProps<{ class?: string; style?: JSX.CSSProperties }>) {
  return (
    <li class={cn(stylex.attrs(styles.row).class, props.class)} style={props.style}>
      {props.children}
    </li>
  );
}

function IndexListLeader() {
  return <span aria-hidden="true" {...stylex.attrs(styles.leader)} />;
}

function IndexListValue(props: ParentProps) {
  return <span {...stylex.attrs(styles.value)}>{props.children}</span>;
}

export const IndexList = {
  Root: IndexListRoot,
  Row: IndexListRow,
  Leader: IndexListLeader,
  Value: IndexListValue,
};
