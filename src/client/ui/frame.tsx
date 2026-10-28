import { colors, dimensions, borders, conditions } from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { onCleanup, onMount, type JSX, type ParentProps } from "solid-js";
import { cn } from "@/client/lib/cn";

const styles = stylex.create({
  band: {
    display: "flex",
    flexDirection: "column",
    borderBottomWidth: { default: borders.borderRule, ":last-child": 0 },
    borderBottomStyle: "solid",
    borderColor: colors.line,
  },

  root: {
    display: "flex",
    height: { default: "100dvh", [conditions.print]: "auto" },
    flexDirection: "column",
  },
  column: {
    marginInline: "auto",
    display: "flex",
    width: "100%",
    maxWidth: dimensions.sizeFrame,
    flex: "1",
    flexDirection: "column",
    borderLeftWidth: borders.borderRule,
    borderRightWidth: borders.borderRule,
    borderLeftStyle: "solid",
    borderRightStyle: "solid",
    borderColor: colors.line,
  },
  fill: {
    position: "relative",
    display: "flex",
    minHeight: 0,
    flex: "1",
    flexDirection: "column",
    borderBottomWidth: { default: borders.borderRule, ":last-child": 0 },
    borderBottomStyle: "solid",
    borderColor: colors.line,
  },
  rules: {
    pointerEvents: "none",
    position: "absolute",
    insetBlock: 0,
    left: "50%",
    zIndex: 10,
    display: { default: "flex", [conditions.print]: "none" },
    width: "100%",
    maxWidth: dimensions.sizeFrame,
    translate: "-50% 0",
    borderLeftWidth: borders.borderRule,
    borderRightWidth: borders.borderRule,
    borderLeftStyle: "solid",
    borderRightStyle: "solid",
    borderColor: colors.line,
  },
  // Anchor links glide to their section; the router's own scroll to top stays instant.
  scroller: {
    scrollBehavior: { default: null, [conditions.motion]: "smooth" },
    minHeight: 0,
    flex: "1",
    overflowY: { default: "auto", [conditions.print]: "visible" },
    overflowX: { default: null, [conditions.print]: "visible" },
  },
  content: {
    marginInline: "auto",
    display: "flex",
    minHeight: "100%",
    width: "100%",
    maxWidth: dimensions.sizeFrame,
    flexDirection: "column",
    borderLeftWidth: borders.borderRule,
    borderRightWidth: borders.borderRule,
    borderLeftStyle: "solid",
    borderRightStyle: "solid",
    borderColor: { default: "transparent", [conditions.print]: colors.line },
  },
  // Dot grid behind the whole window that fades in from the edges of the page: the screen's left
  // and right sides, the top of the page, and the end of the page. The top and bottom fades move
  // with the scroll, so they follow the full scrollable height instead of the window.
  texture: {
    pointerEvents: "none",
    position: "fixed",
    inset: 0,
    zIndex: -1,
    display: { default: null, [conditions.print]: "none" },
    backgroundImage: `radial-gradient(circle, ${colors.texture} 0.75px, transparent 1px)`,
    backgroundSize: `${dimensions.sizeTextureTile} ${dimensions.sizeTextureTile}`,
    maskImage: `linear-gradient(to right, #000, transparent ${dimensions.sizeTextureEdgeX}, transparent calc(100% - ${dimensions.sizeTextureEdgeX}), #000), linear-gradient(to bottom, #000 calc(-1 * var(--page-above, 0px)), transparent calc(${dimensions.sizeTextureEdgeY} - var(--page-above, 0px))), linear-gradient(to top, #000 calc(-1 * var(--page-below, 0px)), transparent calc(${dimensions.sizeTextureEdgeY} - var(--page-below, 0px)))`,
  },
});

// Full-bleed horizontal rules with a centered column framed by vertical rules.
// Viewport-tall: the bands stay put and only the fill scrolls. Print falls back to document flow.
function FrameRoot(props: ParentProps) {
  let texture: HTMLDivElement | undefined;

  // Tells the texture how much page sits above and below the window, so its top and bottom fades
  // sit at the page's real edges. Content that grows or shrinks moves the bottom edge too.
  onMount(() => {
    const scroller = document.getElementById(fillId);

    if (!scroller || !texture) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const below = scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop;

      texture!.style.setProperty("--page-above", `${scroller.scrollTop}px`);
      texture!.style.setProperty("--page-below", `${Math.max(0, below)}px`);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const resize = new ResizeObserver(schedule);

    scroller.addEventListener("scroll", schedule, { passive: true });
    resize.observe(scroller);
    if (scroller.firstElementChild) resize.observe(scroller.firstElementChild);
    update();

    onCleanup(() => {
      scroller.removeEventListener("scroll", schedule);
      resize.disconnect();
      cancelAnimationFrame(frame);
    });
  });

  return (
    <div {...stylex.attrs(styles.root)}>
      <div ref={texture} aria-hidden="true" {...stylex.attrs(styles.texture)} />
      {props.children}
    </div>
  );
}

function BandShell(props: ParentProps<{ class?: string }>) {
  return (
    <div class={cn(stylex.attrs(styles.band).class, props.class)}>
      <div {...stylex.attrs(styles.column)}>{props.children}</div>
    </div>
  );
}

function FrameBand(props: ParentProps) {
  return <BandShell>{props.children}</BandShell>;
}

// Takes the remaining height and scrolls its own content. The router resets it to the top on
// navigation and restores it on back/forward.
const fillId = "frame-fill";

function FrameFill(props: ParentProps<{ overlay?: JSX.Element }>) {
  return (
    <div {...stylex.attrs(styles.fill)}>
      {/* Rules stay outside the scroll layer so native overscroll cannot expose a gap. */}
      <div aria-hidden="true" {...stylex.attrs(styles.rules)}>
        {props.overlay}
      </div>
      <div id={fillId} {...stylex.attrs(styles.scroller)}>
        <div {...stylex.attrs(styles.content)}>{props.children}</div>
      </div>
    </div>
  );
}

export const Frame = {
  Root: FrameRoot,
  Band: FrameBand,
  Fill: FrameFill,
  fillSelector: `#${fillId}`,
};
