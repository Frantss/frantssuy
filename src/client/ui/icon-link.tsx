import { colors, dimensions, borders, conditions } from "@/client/styles/theme.stylex";
import { splitProps, type ComponentProps } from "solid-js";
import { cn } from "@/client/lib/cn";
import * as stylex from "@stylexjs/stylex";
import { style_merge } from "@/client/styles/style-props";

const styles = stylex.create({
  root: {
    display: "grid",
    width: {
      default: dimensions.sizeTouch,
      [conditions.wide]: dimensions.sizeControl,
    },
    height: {
      default: dimensions.sizeTouch,
      [conditions.wide]: dimensions.sizeControl,
    },
    flexShrink: 0,
    placeItems: "center",
    borderWidth: borders.borderRule,
    borderStyle: "solid",
    borderColor: {
      default: colors.lineStrong,
      [conditions.hover]: { default: null, ":hover": colors.faint },
    },
    backgroundColor: "transparent",
    padding: 0,
    color: {
      default: colors.muted,
      [conditions.hover]: { default: null, ":hover": colors.fg },
      ":focus-visible": colors.fg,
    },
    textDecoration: "none",
  },
});

export function IconLink(
  props: ComponentProps<"a"> & { "aria-label": string; styles?: stylex.StyleXStyles },
) {
  const [local, rest] = splitProps(props, ["class", "style", "styles"]);
  const attrs = () => stylex.attrs(styles.root, local.styles);

  return (
    <a
      {...rest}
      class={cn(attrs().class, local.class)}
      style={style_merge(attrs().style, local.style)}
    />
  );
}
