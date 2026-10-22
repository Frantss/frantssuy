import { colors, dimensions, borders, conditions } from "@/client/styles/theme.stylex";
import { splitProps, type ComponentProps } from "solid-js";
import { cn } from "@/client/lib/cn";
import * as stylex from "@stylexjs/stylex";
import { style_merge } from "@/client/styles/style-props";

const styles = stylex.create({
  root: {
    display: "grid",
    width: dimensions.sizeControl,
    height: dimensions.sizeControl,
    cursor: "pointer",
    placeItems: "center",
    borderWidth: borders.borderRule,
    borderStyle: "solid",
    borderColor: {
      default: colors.lineStrong,
      [conditions.hover]: { default: null, ":hover": colors.faint },
    },
    backgroundColor: "transparent",
    padding: 0,
    font: "inherit",
    color: {
      default: colors.muted,
      [conditions.hover]: { default: null, ":hover": colors.fg },
      ":focus-visible": colors.fg,
    },
  },
});

// Square control sized to match ButtonLink; callers provide an aria-label.
export function IconButton(
  props: ComponentProps<"button"> & { "aria-label": string; styles?: stylex.StyleXStyles },
) {
  const [local, rest] = splitProps(props, ["class", "style", "styles"]);
  const attrs = () => stylex.attrs(styles.root, local.styles);

  return (
    <button
      type="button"
      {...rest}
      class={cn(attrs().class, local.class)}
      style={style_merge(attrs().style, local.style)}
    />
  );
}
