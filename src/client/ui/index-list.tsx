import { colors, spacing, typography, borders, conditions } from "@/client/styles/theme.stylex";
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
  // A run of middle dots in the text's own font, clipped to the space between label and value: it
  // stays crisp at any zoom and sits on the text line. Print keeps the dotted border the CV uses.
  leader: {
    marginInline: spacing.space3,
    minWidth: spacing.space4,
    flex: "1",
    display: { default: null, [conditions.narrow]: "none" },
    // The dot run must not widen the row: only the leftover space decides its width.
    contain: { default: "inline-size", [conditions.print]: "none" },
    overflow: { default: "hidden", [conditions.print]: "visible" },
    whiteSpace: { default: "nowrap", [conditions.print]: "normal" },
    color: colors.lineStrong,
    translate: { default: null, [conditions.print]: "0 -0.35em" },
    borderBottomWidth: { default: 0, [conditions.print]: borders.borderRule },
    borderStyle: { default: "none", [conditions.print]: "dotted" },
    borderColor: colors.lineStrong,
    "::before": {
      content: {
        default:
          '"················································································································································································································································"',
        [conditions.print]: "none",
      },
    },
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
