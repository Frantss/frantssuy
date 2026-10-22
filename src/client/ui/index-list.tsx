import { colors, spacing, typography, borders, conditions } from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import type { ParentProps } from "solid-js";

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
  leader: {
    marginInline: spacing.space3,
    minWidth: spacing.space4,
    flex: "1",
    display: { default: null, [conditions.narrow]: "none" },
    translate: "0 -0.35em",
    borderBottomWidth: borders.borderRule,
    borderStyle: "dotted",
    borderColor: colors.lineStrong,
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

function IndexListRow(props: ParentProps) {
  return <li {...stylex.attrs(styles.row)}>{props.children}</li>;
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
