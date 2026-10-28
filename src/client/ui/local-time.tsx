import { colors, dimensions, motion, conditions } from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { createSignal, onCleanup, onMount } from "solid-js";

const breathe = stylex.keyframes({
  "0%, 100%": { opacity: 1 },
  "50%": { opacity: 0.35 },
});

const styles = stylex.create({
  offset: {
    color: colors.faint,
  },
  // A slow breath says the clock is live; it stays still when the visitor reduces motion.
  // Drawn rather than typed: Geist Mono has no "●", and the fallback glyph sits off-center.
  // Lifting it by half the gap between the digits' cap height and its size centers it on them.
  live: {
    display: "inline-block",
    width: dimensions.sizeLiveDot,
    height: dimensions.sizeLiveDot,
    borderRadius: "50%",
    backgroundColor: colors.live,
    verticalAlign: `calc((1cap - ${dimensions.sizeLiveDot}) / 2)`,
    animationName: { default: null, [conditions.motion]: breathe },
    animationDuration: motion.durationBreathe,
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
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
      <span aria-hidden="true" {...stylex.attrs(styles.live)} />
    </span>
  );
}
