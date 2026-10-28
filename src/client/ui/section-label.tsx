import { colors, spacing, typography } from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { Show, type JSX, type ParentProps } from "solid-js";
import { Dynamic } from "solid-js/web";

const styles = stylex.create({
  root: {
    margin: 0,
    display: "flex",
    flexWrap: "wrap",
    alignItems: "baseline",
    columnGap: spacing.space2,
    fontSize: typography.fontLabel,
    lineHeight: typography.leadingXs,
    fontWeight: typography.weightNormal,
    letterSpacing: typography.trackingLabel,
    textTransform: "uppercase",
    color: colors.faint,
  },
  count: {
    letterSpacing: "normal",
    textTransform: "none",
    color: colors.muted,
    fontVariantNumeric: "tabular-nums",
  },
});

// Small uppercase heading for a group of items, with an optional count beside it.
export function SectionLabel(
  props: ParentProps<{ level: "h2" | "h3"; id?: string; count?: JSX.Element }>,
) {
  return (
    <Dynamic component={props.level} id={props.id} {...stylex.attrs(styles.root)}>
      <span>{props.children}</span>
      <Show when={props.count}>
        <span {...stylex.attrs(styles.count)}>{props.count}</span>
      </Show>
    </Dynamic>
  );
}
