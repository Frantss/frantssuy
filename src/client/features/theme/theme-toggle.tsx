import * as stylex from "@stylexjs/stylex";
import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { IconMoon, IconSun } from "@tabler/icons-solidjs";
import { Button } from "@/client/ui/button";
import { Tooltip } from "@/client/ui/tooltip";
import { theme_current, theme_observe, theme_reveal, type Theme } from "./theme";
import { m } from "@/paraglide/messages";

export function ThemeToggle(props: { class?: string; styles?: stylex.StyleXStyles }) {
  const [theme, setTheme] = createSignal<Theme>();

  onMount(() => {
    setTheme(theme_current());
    onCleanup(theme_observe(setTheme));
  });

  const toggle = (event: MouseEvent & { currentTarget: HTMLButtonElement }) => {
    const next = theme_current() === "dark" ? "light" : "dark";

    void theme_reveal(next, event.currentTarget);
  };

  const label = () => (theme() === "dark" ? m.theme_light() : m.theme_dark());

  return (
    <Tooltip label={label()}>
      {(triggerProps) => (
        <Button
          variant="icon"
          {...triggerProps({ onClick: toggle })}
          aria-label={label()}
          class={props.class}
          styles={props.styles}
        >
          <Show when={theme() === "light"} fallback={<IconMoon size={18} aria-hidden="true" />}>
            <IconSun size={18} aria-hidden="true" />
          </Show>
        </Button>
      )}
    </Tooltip>
  );
}
