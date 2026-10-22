import {
  colors,
  spacing,
  typography,
  dimensions,
  borders,
  conditions,
} from "@/client/styles/theme.stylex";
import { splitProps, type ComponentProps } from "solid-js";
import { cn } from "@/client/lib/cn";
import * as stylex from "@stylexjs/stylex";
import { style_merge } from "@/client/styles/style-props";

const styles = stylex.create({
  root: {
    display: "inline-flex",
    height: {
      default: dimensions.sizeTouch,
      [conditions.wide]: dimensions.sizeControl,
    },
    alignItems: "center",
    paddingInline: spacing.space2,
    fontWeight: typography.weightBold,
    whiteSpace: "nowrap",
    textDecoration: "none",
  },
  solid: {
    backgroundColor: {
      default: colors.accent,
      [conditions.hover]: { default: null, ":hover": colors.accentHover },
      ":focus-visible": colors.accentHover,
    },
    color: colors.onAccent,
  },
  outline: {
    borderWidth: borders.borderRule,
    borderStyle: "solid",
    borderColor: colors.accent,
    color: colors.fg,
    backgroundColor: {
      default: "transparent",
      [conditions.hover]: { default: null, ":hover": colors.accentTint },
      ":focus-visible": colors.accentTint,
    },
  },
});

type ButtonLinkProps = ComponentProps<"a"> & { styles?: stylex.StyleXStyles };

function ButtonLinkSolid(props: ButtonLinkProps) {
  const [local, rest] = splitProps(props, ["class", "style", "styles"]);
  const attrs = () => stylex.attrs(styles.root, styles.solid, local.styles);

  return (
    <a
      {...rest}
      class={cn(attrs().class, local.class)}
      style={style_merge(attrs().style, local.style)}
    />
  );
}

function ButtonLinkOutline(props: ButtonLinkProps) {
  const [local, rest] = splitProps(props, ["class", "style", "styles"]);
  const attrs = () => stylex.attrs(styles.root, styles.outline, local.styles);

  return (
    <a
      {...rest}
      class={cn(attrs().class, local.class)}
      style={style_merge(attrs().style, local.style)}
    />
  );
}

export const ButtonLink = { Solid: ButtonLinkSolid, Outline: ButtonLinkOutline };
