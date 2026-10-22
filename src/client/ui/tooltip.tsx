import { colors, spacing, typography, dimensions, borders } from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { createEffect, onCleanup, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { Tooltip as ArkTooltip, useTooltip, type TooltipTriggerProps } from "@ark-ui/solid/tooltip";

const styles = stylex.create({
  positioner: {
    zIndex: 30,
  },
  arrow: {
    "--arrow-size": "6px",
    "--arrow-background": colors.fg,
  },
  arrowTip: {
    borderTopWidth: borders.borderRule,
    borderTopStyle: "solid",
    borderLeftWidth: borders.borderRule,
    borderLeftStyle: "solid",
    borderColor: colors.lineStrong,
  },
  content: {
    maxWidth: `min(${dimensions.sizeTooltip}, calc(100vw - ${spacing.space4}))`,
    borderWidth: borders.borderRule,
    borderStyle: "solid",
    borderColor: colors.lineStrong,
    backgroundColor: colors.fg,
    paddingInline: spacing.space2,
    paddingBlock: spacing.space1,
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    color: colors.bg,
  },
});

export function Tooltip(props: {
  label: string;
  children: NonNullable<TooltipTriggerProps["asChild"]>;
}) {
  const api = useTooltip({
    interactive: true,
    closeOnEscape: false,
    positioning: { placement: "bottom", strategy: "fixed", gutter: 8 },
  });

  createEffect(() => {
    if (!api().open) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.isComposing) return;
      // Cancel native popover dismissal so Escape closes only the tooltip.
      event.preventDefault();
      event.stopPropagation();
      api().setOpen(false);
    };

    document.addEventListener("keydown", dismiss, true);
    onCleanup(() => document.removeEventListener("keydown", dismiss, true));
  });

  return (
    <ArkTooltip.RootProvider value={api}>
      <ArkTooltip.Trigger asChild={props.children} />
      <Show when={api().open}>
        {/* Keep dock tooltips in the native popover's top layer. */}
        <Portal
          mount={
            document.getElementById(api().getTriggerProps().id!)?.closest("[popover]") ??
            document.body
          }
        >
          <ArkTooltip.Positioner {...stylex.attrs(styles.positioner)}>
            <ArkTooltip.Arrow aria-hidden="true" {...stylex.attrs(styles.arrow)}>
              <ArkTooltip.ArrowTip {...stylex.attrs(styles.arrowTip)} />
            </ArkTooltip.Arrow>
            <ArkTooltip.Content {...stylex.attrs(styles.content)}>{props.label}</ArkTooltip.Content>
          </ArkTooltip.Positioner>
        </Portal>
      </Show>
    </ArkTooltip.RootProvider>
  );
}
