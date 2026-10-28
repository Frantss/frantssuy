import {
  colors,
  spacing,
  typography,
  dimensions,
  borders,
  motion,
  conditions,
} from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { splitProps, type ComponentProps } from "solid-js";
import { cn } from "@/client/lib/cn";
import { style_merge } from "@/client/styles/style-props";

const styles = stylex.create({
  base: {
    position: "relative",
    display: "inline-flex",
    height: { default: dimensions.sizeControl, [conditions.coarsePointer]: dimensions.sizeTouch },
    flexShrink: 0,
    cursor: { default: "pointer", ":disabled": "not-allowed" },
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.space1_5,
    borderWidth: borders.borderRule,
    borderStyle: "solid",
    borderColor: { default: "transparent", ":disabled": colors.line },
    borderRadius: borders.radiusControl,
    backgroundColor: { default: "transparent", ":disabled": "transparent" },
    paddingInline: spacing.space3,
    fontFamily: "inherit",
    fontSize: typography.fontSm,
    lineHeight: 1,
    fontWeight: typography.weightMedium,
    letterSpacing: typography.trackingButton,
    whiteSpace: "nowrap",
    textDecoration: "none",
    color: { default: colors.fg, ":disabled": colors.faint },
    // A ring with a gap, drawn as a shadow so it follows the radius.
    outlineStyle: { default: null, ":focus-visible": "none" },
    boxShadow: {
      default: null,
      ":focus-visible": `0 0 0 ${borders.focusOffset} ${colors.bg}, 0 0 0 calc(${borders.focusOffset} + ${borders.borderEmphasis}) ${colors.accent}`,
    },
    translate: { default: null, ":active": { default: "0 1px", [conditions.reducedMotion]: null } },
    transitionProperty: {
      default: "color, background-color, border-color, box-shadow, translate",
      [conditions.reducedMotion]: "none",
    },
    transitionDuration: motion.durationColor,
    transitionTimingFunction: motion.easeColor,
  },
  // Raised controls carry a thicker bottom edge that compresses on press, like a key.
  keycap: {
    borderBottomWidth: {
      default: borders.borderEmphasis,
      ":active": borders.borderRule,
      ":disabled": borders.borderRule,
    },
    borderBottomColor: { default: colors.edge, ":disabled": colors.line },
    backgroundColor: {
      default: colors.surface,
      [conditions.hover]: { default: null, ":hover": colors.surfaceHover },
      ":disabled": "transparent",
    },
  },
  primary: {
    borderColor: { default: colors.accent, ":disabled": colors.line },
    borderBottomColor: { default: colors.accentEdge, ":disabled": colors.line },
    backgroundColor: {
      default: colors.accent,
      [conditions.hover]: { default: null, ":hover": colors.accentHover },
      ":disabled": colors.line,
    },
    fontWeight: typography.weightBold,
    color: { default: colors.onAccent, ":disabled": colors.faint },
  },
  secondary: {
    borderColor: {
      default: colors.lineStrong,
      [conditions.hover]: { default: null, ":hover": colors.faint },
      ":disabled": colors.line,
    },
  },
  quiet: {
    paddingInline: spacing.space1_5,
    color: {
      default: colors.muted,
      [conditions.hover]: { default: null, ":hover": colors.fg },
      ":focus-visible": colors.fg,
      ":disabled": colors.faint,
    },
    textDecorationLine: {
      default: null,
      [conditions.hover]: { default: null, ":hover": "underline" },
    },
    textUnderlineOffset: "0.25em",
  },
  icon: {
    width: { default: dimensions.sizeControl, [conditions.coarsePointer]: dimensions.sizeTouch },
    paddingInline: 0,
    borderColor: {
      default: colors.lineStrong,
      [conditions.hover]: { default: null, ":hover": colors.faint },
      ":disabled": colors.line,
    },
    color: {
      default: colors.muted,
      [conditions.hover]: { default: null, ":hover": colors.fg },
      ":focus-visible": colors.fg,
      ":disabled": colors.faint,
    },
  },
  // Chips keep a compact face and grow an invisible hit area on touch screens.
  toggle: {
    height: dimensions.sizeSmall,
    gap: spacing.space1,
    borderColor: {
      default: colors.line,
      [conditions.hover]: { default: null, ":hover": colors.faint },
    },
    paddingInline: spacing.space2,
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    color: {
      default: colors.muted,
      [conditions.hover]: { default: null, ":hover": colors.fg },
      ":focus-visible": colors.fg,
    },
    "::after": {
      content: { default: null, [conditions.coarsePointer]: '""' },
      position: "absolute",
      inset: `calc((${dimensions.sizeTouch} - ${dimensions.sizeSmall}) / -2) calc(-1 * ${spacing.space1})`,
    },
  },
  selected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentTint,
    color: colors.fg,
  },
});

export type ButtonVariant = "primary" | "secondary" | "quiet" | "icon" | "toggle";

function button_styles(variant: ButtonVariant, selected: boolean) {
  return [
    styles.base,
    (variant === "primary" || variant === "secondary" || variant === "icon") && styles.keycap,
    styles[variant],
    selected && styles.selected,
  ];
}

type ButtonOwnProps = { variant: ButtonVariant; styles?: stylex.StyleXStyles };

// Toggles read their selected look from aria-pressed, so state and style cannot drift. Controls
// that show an active state without being toggles, like an open filter panel, pass `selected`.
export function Button(props: ComponentProps<"button"> & ButtonOwnProps & { selected?: boolean }) {
  const [local, rest] = splitProps(props, ["class", "style", "styles", "variant", "selected"]);
  const selected = () =>
    local.selected ?? (rest["aria-pressed"] === true || rest["aria-pressed"] === "true");
  const attrs = () => stylex.attrs(button_styles(local.variant, selected()), local.styles);

  return (
    <button
      type="button"
      {...rest}
      class={cn(attrs().class, local.class)}
      style={style_merge(attrs().style, local.style)}
    />
  );
}

export function ButtonLink(props: ComponentProps<"a"> & ButtonOwnProps) {
  const [local, rest] = splitProps(props, ["class", "style", "styles", "variant"]);
  const attrs = () => stylex.attrs(button_styles(local.variant, false), local.styles);

  return (
    <a
      {...rest}
      class={cn(attrs().class, local.class)}
      style={style_merge(attrs().style, local.style)}
    />
  );
}
