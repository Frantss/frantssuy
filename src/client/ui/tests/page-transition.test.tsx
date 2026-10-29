import { afterEach, expect, it } from "vite-plus/test";
import { createSignal, Show } from "solid-js";
import { render } from "solid-js/web";
import { Page } from "@/client/ui/page";
import { Frame } from "@/client/ui/frame";
import "@/client/styles/global.css";

let dispose: (() => void) | undefined;

afterEach(() => dispose?.());

it("keeps the incoming page snapshot above the footer", async () => {
  const container = document.createElement("div");

  document.body.append(container);
  const [page, setPage] = createSignal("old");
  const stop = render(
    () => (
      <Frame.Root>
        <Frame.Band>Header</Frame.Band>
        <Frame.Fill>
          <Show when={page()} keyed>
            {(name) => (
              <Page>
                <h1>{name}</h1>
                <p>{"Page content ".repeat(1000)}</p>
              </Page>
            )}
          </Show>
        </Frame.Fill>
        <Frame.Band>
          <footer>Footer</footer>
        </Frame.Band>
      </Frame.Root>
    ),
    container,
  );

  dispose = () => {
    stop();
    container.remove();
  };

  const transition = document.startViewTransition(() => setPage("new"));

  try {
    await transition.ready;
    const snapshot = getComputedStyle(
      document.documentElement,
      "::view-transition-group(page-content)",
    );
    const scroller = container.querySelector(Frame.fillSelector)!;
    const footer = container.querySelector("footer")!;
    const snapshotBottom = new DOMMatrix(snapshot.transform).m42 + parseFloat(snapshot.height);

    expect(parseFloat(snapshot.height)).toBeCloseTo(scroller.getBoundingClientRect().height, 1);
    expect(snapshotBottom).toBeLessThanOrEqual(footer.getBoundingClientRect().top);
  } finally {
    transition.skipTransition();
    await transition.finished;
  }
});

it("replaces the outgoing page without overlapping its snapshot and staggers the new content", async () => {
  const container = document.createElement("div");

  document.body.append(container);
  const [page, setPage] = createSignal("old");
  const stop = render(
    () => (
      <Frame.Root>
        <Frame.Fill>
          <Show when={page()} keyed>
            {(name) => (
              <Page>
                <h1>{name}</h1>
                <p>Second section</p>
                <p>Third section</p>
              </Page>
            )}
          </Show>
        </Frame.Fill>
      </Frame.Root>
    ),
    container,
  );

  dispose = () => {
    stop();
    container.remove();
  };

  const transition = document.startViewTransition(() => {
    setPage("new");
  });

  await transition.ready;
  const outgoing = getComputedStyle(
    document.documentElement,
    "::view-transition-old(page-content)",
  );
  const outgoingVisible =
    outgoing.display !== "none" && outgoing.visibility !== "hidden" && Number(outgoing.opacity) > 0;

  expect(outgoingVisible).toBe(false);
  expect(container.querySelector("h1")?.textContent).toBe("new");

  await transition.finished;
  const sections = container.querySelector(".page-content")!.children;

  for (const section of sections) {
    for (const animation of section.getAnimations()) {
      animation.pause();
      animation.currentTime = 30;
    }
  }
  const opacities = Array.from(sections, (section) => Number(getComputedStyle(section).opacity));

  expect(opacities[0]).toBeGreaterThan(opacities[1]!);
  expect(opacities[1]).toBeGreaterThanOrEqual(opacities[2]!);
});
