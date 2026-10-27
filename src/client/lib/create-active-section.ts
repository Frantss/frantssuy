import { createSignal, onCleanup, onMount, type Accessor } from "solid-js";

// The id of the last section whose heading has scrolled past a line a quarter of the way down
// the scroller. At the end of the scroller the last section wins, since a short final section
// never reaches the line. A section reached through an in-page link stays active until the reader
// scrolls by hand: jumping to a section near the end would otherwise mark the last one.
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
      if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1) {
        setActive(sections.at(-1));

        return;
      }
      const line = scroller.getBoundingClientRect().top + scroller.clientHeight / 4;

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

    const pin = (event: MouseEvent) => {
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
      const id = link?.hash.slice(1);

      if (!id || !ids().includes(id)) return;
      pinned = id;
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
