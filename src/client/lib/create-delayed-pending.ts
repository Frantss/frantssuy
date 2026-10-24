import { createEffect, createSignal, onCleanup, type Accessor } from "solid-js";

export function createDelayedPending(
  pending: Accessor<boolean>,
  { delayMs = 300 }: { delayMs?: number } = {},
): Accessor<boolean> {
  const [visible, setVisible] = createSignal(false);

  createEffect(() => {
    if (!pending()) {
      setVisible(false);

      return;
    }
    const timer = setTimeout(() => setVisible(true), delayMs);

    onCleanup(() => clearTimeout(timer));
  });

  return visible;
}
