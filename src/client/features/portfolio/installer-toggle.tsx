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
import { For } from "solid-js";
import { SegmentGroup } from "@ark-ui/solid/segment-group";
import { m } from "@/paraglide/messages";

const styles = stylex.create({
  root: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.space3,
  },
  label: {
    fontSize: typography.fontLabel,
    color: colors.muted,
    textTransform: "uppercase",
  },
  items: {
    display: "flex",
    borderWidth: borders.borderRule,
    borderStyle: "solid",
    borderColor: colors.line,
  },
  item: {
    display: "inline-flex",
    minHeight: { default: dimensions.sizeTouch, [conditions.wide]: dimensions.sizeControl },
    alignItems: "center",
    cursor: "pointer",
    paddingInline: spacing.space3,
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    color: {
      default: colors.muted,
      [conditions.hover]: { default: null, ":hover": colors.fg },
    },
    outlineOffset: `calc(-1 * ${borders.borderEmphasis})`,
    outlineStyle: { default: null, ":has(:focus-visible)": "solid" },
    outlineWidth: borders.borderEmphasis,
    outlineColor: colors.accent,
    transitionProperty: "color, background-color",
    transitionDuration: motion.durationColor,
    transitionTimingFunction: motion.easeColor,
  },
  checked: {
    backgroundColor: colors.accentTint,
    color: colors.fg,
  },
  divider: {
    borderLeftWidth: borders.borderRule,
    borderLeftStyle: "solid",
    borderLeftColor: colors.line,
  },
});

export function InstallerToggle(props: {
  installers: readonly { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <SegmentGroup.Root
      value={props.value}
      onValueChange={(details) => {
        if (details.value) props.onChange(details.value);
      }}
      {...stylex.attrs(styles.root)}
    >
      <SegmentGroup.Label {...stylex.attrs(styles.label)}>
        {m.agents_installer()}
      </SegmentGroup.Label>
      <div {...stylex.attrs(styles.items)}>
        <For each={props.installers}>
          {(installer, index) => (
            <SegmentGroup.Item
              value={installer.id}
              {...stylex.attrs(
                styles.item,
                index() > 0 && styles.divider,
                props.value === installer.id && styles.checked,
              )}
            >
              <SegmentGroup.ItemText>{installer.label}</SegmentGroup.ItemText>
              <SegmentGroup.ItemHiddenInput />
            </SegmentGroup.Item>
          )}
        </For>
      </div>
    </SegmentGroup.Root>
  );
}
