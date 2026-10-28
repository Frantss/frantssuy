import { createSignal, onCleanup, onMount, type Accessor } from "solid-js";

// Where the reading line sits among section headings, as a fractional index: 1.5 is halfway from
// the second heading to the third. Undefined before the first heading reaches the line.
export function activeSection_position(tops: readonly number[], line: number) {
  let index = -1;

  tops.forEach((top, current) => {
    if (top <= line) index = current;
  });
  if (index === -1) return undefined;
  const next = tops[index + 1];

  if (next === undefined || next <= tops[index]!) return index;

  return index + Math.min(1, (line - tops[index]!) / (next - tops[index]!));
}

// The active section is the last one whose heading has scrolled past a line a quarter of the way
// down the scroller; `position` follows the same line continuously between headings. At the end of
// the scroller the last section wins, since a short final section never reaches the line. A
// section reached through an in-page link stays active until the reader scrolls by hand: jumping
// to a section near the end would otherwise mark the last one.
export function createActiveSection(
  ids: Accessor<readonly string[]>,
  scrollerSelector: string,
): { active: Accessor<string | undefined>; position: Accessor<number | undefined> } {
  const [active, setActive] = createSignal<string>();
  const [position, setPosition] = createSignal<number>();

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
        setPosition(sections.indexOf(pinned));

        return;
      }
      if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1) {
        setActive(sections.at(-1));
        setPosition(sections.length - 1);

        return;
      }
      const line = scroller.getBoundingClientRect().top + scroller.clientHeight / 4;
      const tops = sections.map(
        (id) => document.getElementById(id)?.getBoundingClientRect().top ?? Infinity,
      );
      const next = activeSection_position(tops, line);

      setActive(next === undefined ? undefined : sections[Math.floor(next)]);
      setPosition(next);
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

  return { active, position };
}
