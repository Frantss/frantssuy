import {
  colors,
  spacing,
  typography,
  dimensions,
  borders,
  conditions,
} from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import type { ParentProps } from "solid-js";

// Print keeps boxed labels in stacked rows, the layout the CV PDF is built around.
const styles = stylex.create({
  label: {
    display: { default: null, [conditions.print]: "grid" },
    width: { default: null, [conditions.print]: dimensions.sizeLabel },
    flexShrink: 0,
    placeItems: { default: null, [conditions.print]: "center" },
    borderWidth: { default: 0, [conditions.print]: borders.borderRule },
    borderStyle: "solid",
    borderColor: colors.line,
    fontSize: typography.fontLabel,
    letterSpacing: { default: typography.trackingLabel, [conditions.print]: "normal" },
    color: colors.faint,
    textTransform: "uppercase",
  },

  list: {
    margin: 0,
    display: "grid",
    gridTemplateColumns: { default: "auto 1fr", [conditions.print]: "none" },
    alignItems: { default: "baseline", [conditions.print]: "normal" },
    gap: { default: `${spacing.space1_5} ${spacing.space4}`, [conditions.print]: spacing.space1_5 },
    borderBlockWidth: { default: borders.borderRule, [conditions.print]: 0 },
    borderBlockStyle: "solid",
    borderColor: colors.line,
    paddingBlock: { default: spacing.space2_5, [conditions.print]: 0 },
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    color: colors.muted,
  },
  item: {
    display: { default: "contents", [conditions.print]: "flex" },
    gap: spacing.space3,
  },
  value: {
    margin: 0,
    color: { default: colors.fg, [conditions.print]: "inherit" },
  },
});

// Label/value pairs in a two-column table.
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
