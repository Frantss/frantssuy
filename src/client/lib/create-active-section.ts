import { createSignal, onCleanup, onMount, type Accessor } from "solid-js";

// How far down the scroller the reading line sits, from 0 (top) to 1 (bottom). It rests a quarter
// of the way down, then slides to the bottom over the last screen of scrolling, so short sections
// near the end each cross it before the scroller runs out.
export function activeSection_lineRatio(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number,
) {
  const remaining = scrollHeight - clientHeight - scrollTop;
  const progress = Math.min(1, Math.max(0, 1 - remaining / clientHeight));

  return 0.25 + 0.75 * progress;
}

// The id of the last section whose heading has scrolled past the reading line. A section reached
// through an in-page link stays active until the reader scrolls by hand: jumping to a section near
// the end would otherwise mark a later one.
export function createActiveSection(
  ids: Accessor<readonly string[]>,
  scrollerSelector: string,
): Accessor<string | undefined> {
  const [active, setActive] = createSignal<string>();

  onMount(() => {
    const scroller = document.querySelector(scrollerSelector);

    if (!scroller) return;
    let frame = 0;
    let pinned: string | undefined;

    const update = () => {
      frame = 0;
      const sections = ids();

      if (pinned && sections.includes(pinned)) {
        setActive(pinned);

        return;
      }
      const line =
        scroller.getBoundingClientRect().top +
        scroller.clientHeight *
          activeSection_lineRatio(scroller.scrollTop, scroller.scrollHeight, scroller.clientHeight);

      setActive(
        sections
          .filter((id) => {
            const heading = document.getElementById(id);

            return heading != null && heading.getBoundingClientRect().top <= line;
          })
          .at(-1),
      );
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    // A section link holds its section; any other link releases the hold, since it either leaves
    // the page or scrolls it somewhere the reading line should decide.
    const pin = (event: MouseEvent) => {
      const link = (event.target as Element).closest<HTMLAnchorElement>("a[href]");

      if (!link) return;
      const id = link.hash.slice(1);

      pinned = link.getAttribute("href")?.startsWith("#") && ids().includes(id) ? id : undefined;
      schedule();
    };

    const unpin = () => {
      if (!pinned) return;
      pinned = undefined;
      schedule();
    };

    pinned = decodeURIComponent(location.hash.slice(1)) || undefined;
    scroller.addEventListener("scroll", schedule, { passive: true });
    scroller.addEventListener("wheel", unpin, { passive: true });
    scroller.addEventListener("touchstart", unpin, { passive: true });
    window.addEventListener("keydown", unpin);
    window.addEventListener("resize", schedule);
    document.addEventListener("click", pin);
    schedule();

    onCleanup(() => {
      scroller.removeEventListener("scroll", schedule);
      scroller.removeEventListener("wheel", unpin);
      scroller.removeEventListener("touchstart", unpin);
      window.removeEventListener("keydown", unpin);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("click", pin);
      cancelAnimationFrame(frame);
    });
  });

  return active;
}
