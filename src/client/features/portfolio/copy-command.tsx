import {
  colors,
  spacing,
  typography,
  dimensions,
  borders,
  conditions,
} from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { createSignal, onCleanup, Show } from "solid-js";
import { IconCheck, IconCopy } from "@tabler/icons-solidjs";
import { IconButton } from "@/client/ui/icon-button";
import { Tooltip } from "@/client/ui/tooltip";
import { m } from "@/paraglide/messages";

const styles = stylex.create({
  root: {
    display: "flex",
    minWidth: 0,
    alignItems: "center",
    borderWidth: borders.borderRule,
    borderStyle: "solid",
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  command: {
    flex: "1",
    minWidth: 0,
    overflowX: "auto",
    paddingInline: spacing.space3,
    paddingBlock: spacing.space2,
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    color: colors.muted,
    whiteSpace: "pre",
    overflowWrap: "normal",
  },
  button: {
    flexShrink: 0,
    width: { default: dimensions.sizeTouch, [conditions.wide]: dimensions.sizeControl },
    height: { default: dimensions.sizeTouch, [conditions.wide]: dimensions.sizeControl },
    borderWidth: 0,
    borderLeftWidth: borders.borderRule,
  },
  status: {
    position: "absolute",
    width: dimensions.sizeScreenReader,
    height: dimensions.sizeScreenReader,
    padding: 0,
    margin: spacing.screenReaderOffset,
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
    borderWidth: 0,
  },
});

export function CopyCommand(props: { command: string }) {
  const [copy, setCopy] = createSignal<"idle" | "copied" | "failed">("idle");
  let reset: ReturnType<typeof setTimeout> | undefined;

  onCleanup(() => clearTimeout(reset));

  const copyCommand = async () => {
    clearTimeout(reset);
    try {
      await navigator.clipboard.writeText(props.command);
      setCopy("copied");
    } catch {
      setCopy("failed");
    }
    reset = setTimeout(() => setCopy("idle"), 2000);
  };

  const status = () =>
    ({ idle: "", copied: m.agents_command_copied(), failed: m.agents_copy_failed() })[copy()];

  return (
    <div {...stylex.attrs(styles.root)}>
      <code {...stylex.attrs(styles.command)}>{props.command}</code>
      <Tooltip label={m.agents_copy_command()}>
        {(triggerProps) => (
          <IconButton
            {...triggerProps({ onClick: copyCommand })}
            aria-label={m.agents_copy_command()}
            styles={styles.button}
          >
            <Show when={copy() === "copied"} fallback={<IconCopy size={16} aria-hidden="true" />}>
              <IconCheck size={16} aria-hidden="true" />
            </Show>
          </IconButton>
        )}
      </Tooltip>
      <span role="status" {...stylex.attrs(styles.status)}>
        {status()}
      </span>
    </div>
  );
}
