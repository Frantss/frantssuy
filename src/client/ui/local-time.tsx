import { colors } from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { createSignal, onCleanup, onMount } from "solid-js";
import { cn } from "@/client/lib/cn";

const styles = stylex.create({
  offset: {
    color: colors.faint,
  },
  live: {
    color: colors.live,
  },
});

export function localTime_format(now: Date, utcOffset: number) {
  const shifted = new Date(now.getTime() + utcOffset * 3_600_000);
  const hours = String(shifted.getUTCHours()).padStart(2, "0");
  const minutes = String(shifted.getUTCMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

// Rendered as a placeholder on the server; the visitor's clock fills it after mount.
export function LocalTime(props: { utcOffset: number }) {
  const [time, setTime] = createSignal("--:--");

  onMount(() => {
    const update = () => setTime(localTime_format(new Date(), props.utcOffset));

    update();
    const interval = setInterval(update, 30_000);

    onCleanup(() => clearInterval(interval));
  });

  return (
    <span>
      <time>{time()}</time>{" "}
      <span {...stylex.attrs(styles.offset)}>
        // UTC{props.utcOffset >= 0 ? "+" : ""}
        {props.utcOffset}
      </span>{" "}
      <span aria-hidden="true" class={cn("local-time-live", stylex.attrs(styles.live).class)}>
        ●
      </span>
    </span>
  );
}
