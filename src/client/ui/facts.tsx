import { colors, spacing, typography, dimensions, borders } from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import type { ParentProps } from "solid-js";

const styles = stylex.create({
  label: {
    display: "grid",
    width: dimensions.sizeLabel,
    flexShrink: 0,
    placeItems: "center",
    borderWidth: borders.borderRule,
    borderStyle: "solid",
    borderColor: colors.line,
    fontSize: typography.fontLabel,
    color: colors.faint,
    textTransform: "uppercase",
  },

  list: {
    margin: 0,
    display: "grid",
    gap: spacing.space1_5,
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    color: colors.muted,
  },
  item: {
    display: "flex",
    gap: spacing.space3,
  },
  value: {
    margin: 0,
  },
});

// Label/value pairs with boxed labels.
function FactsList(props: ParentProps) {
  return <dl {...stylex.attrs(styles.list)}>{props.children}</dl>;
}

function FactsItem(props: ParentProps<{ label: string; labelStyles?: stylex.StyleXStyles }>) {
  return (
    <div {...stylex.attrs(styles.item)}>
      <dt {...stylex.attrs(styles.label, props.labelStyles)}>{props.label}</dt>
      <dd {...stylex.attrs(styles.value)}>{props.children}</dd>
    </div>
  );
}

export const Facts = { List: FactsList, Item: FactsItem };
