import { createSignal, onCleanup } from "solid-js";

export type ClipboardCopyState = "idle" | "copied" | "failed";

// Copies text and reports the outcome for two seconds, so a button can show a check or an error.
export function createClipboardCopy() {
  const [state, setState] = createSignal<ClipboardCopyState>("idle");
  let reset: ReturnType<typeof setTimeout> | undefined;

  onCleanup(() => clearTimeout(reset));

  async function copy(text: string) {
    clearTimeout(reset);
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
    reset = setTimeout(() => setState("idle"), 2000);

    return state() === "copied";
  }

  return { state, copy };
}
