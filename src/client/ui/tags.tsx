import { colors, spacing, typography, dimensions, borders } from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import type { ParentProps } from "solid-js";

const styles = stylex.create({
  list: {
    margin: 0,
    display: "flex",
    listStyleType: "none",
    flexWrap: "wrap",
    gap: spacing.space1_5,
    padding: 0,
  },
  item: {
    display: "inline-flex",
    height: dimensions.sizeSmall,
    alignItems: "center",
    borderWidth: borders.borderRule,
    borderStyle: "solid",
    borderColor: colors.line,
    paddingInline: spacing.space1_5,
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    color: colors.muted,
  },
});

function TagsList(props: ParentProps) {
  return <ul {...stylex.attrs(styles.list)}>{props.children}</ul>;
}

function TagsItem(props: ParentProps) {
  return <li {...stylex.attrs(styles.item)}>{props.children}</li>;
}

export const Tags = { List: TagsList, Item: TagsItem };
