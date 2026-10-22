import {
  colors,
  spacing,
  typography,
  dimensions,
  borders,
  conditions,
} from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { cn } from "@/client/lib/cn";
import { createToaster, Toast, Toaster, type CreateToasterReturn } from "@ark-ui/solid/toast";
import { IconX } from "@tabler/icons-solidjs";
import { createContext, onCleanup, useContext, type ParentProps } from "solid-js";
import { Portal } from "solid-js/web";
import { IconButton } from "@/client/ui/icon-button";
import { m } from "@/paraglide/messages";

const styles = stylex.create({
  root: {
    display: "flex",
    width: `min(${dimensions.sizeToast}, calc(100vw - ${spacing.space8}))`,
    alignItems: "center",
    gap: spacing.space3,
    borderWidth: borders.borderRule,
    borderStyle: "solid",
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface,
    padding: spacing.space3,
    fontSize: typography.fontSm,
    lineHeight: typography.leadingSm,
    color: colors.fg,
  },
  title: {
    minWidth: 0,
    flex: "1",
  },
  close: {
    flexShrink: 0,
    width: { default: dimensions.sizeControl, [conditions.coarsePointer]: dimensions.sizeTouch },
    height: { default: dimensions.sizeControl, [conditions.coarsePointer]: dimensions.sizeTouch },
  },
});

export function ToastProvider(props: ParentProps) {
  const toaster = createToaster({
    placement: "bottom-end",
    duration: 5000,
    max: 3,
    offsets: {
      bottom: `calc(${dimensions.sizeDock} + ${spacing.space8} + env(safe-area-inset-bottom))`,
      top: spacing.space4,
      left: spacing.space4,
      right: spacing.space4,
    },
  });

  onCleanup(() => toaster.remove());

  return (
    <ToastContext.Provider value={toaster}>
      {props.children}
      <Portal>
        <Toaster toaster={toaster} aria-label={m.toast_notifications()}>
          {(toast) => (
            <Toast.Root
              {...stylex.attrs(styles.root)}
              class={cn("toast", stylex.attrs(styles.root).class)}
            >
              <Toast.Title {...stylex.attrs(styles.title)}>{toast().title}</Toast.Title>
              <Toast.CloseTrigger
                asChild={(triggerProps) => (
                  <IconButton
                    {...triggerProps()}
                    aria-label={m.toast_dismiss()}
                    styles={styles.close}
                  >
                    <IconX size={16} aria-hidden="true" />
                  </IconButton>
                )}
              />
            </Toast.Root>
          )}
        </Toaster>
      </Portal>
    </ToastContext.Provider>
  );
}

const ToastContext = createContext<CreateToasterReturn>();

export function useToast() {
  const toaster = useContext(ToastContext);

  if (!toaster) throw new Error("useToast requires ToastProvider");

  return toaster;
}
