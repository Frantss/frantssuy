import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { render } from "solid-js/web";
import { createSignal, type JSX } from "solid-js";
import * as stylex from "@stylexjs/stylex";
import { ButtonLink } from "@/client/ui/button-link";
import { Entry } from "@/client/ui/entry";
import { Facts } from "@/client/ui/facts";
import { IconButton } from "@/client/ui/icon-button";
import { IndexList } from "@/client/ui/index-list";
import { colors, dimensions } from "@/client/styles/theme.stylex";

const styles = stylex.create({
  full: { width: "100%" },
  touch: {
    width: dimensions.sizeTouch,
    height: dimensions.sizeTouch,
  },
  active: { color: colors.accent },
  dynamic: (width: string) => ({ width }),
});

let dispose: (() => void) | undefined;

function mount(ui: () => JSX.Element) {
  const container = document.createElement("div");

  document.body.append(container);
  const stop = render(ui, container);

  dispose = () => {
    stop();
    container.remove();
  };

  return container;
}

afterEach(() => dispose?.());

describe("ButtonLink", () => {
  it("forwards anchor attributes and merges classes", () => {
    const container = mount(() => (
      <ButtonLink.Solid
        href="mailto:a@b.c"
        target="_blank"
        class="caller-hook"
        styles={styles.full}
      >
        Mail
      </ButtonLink.Solid>
    ));
    const anchor = container.querySelector("a")!;

    expect(anchor.getAttribute("href")).toBe("mailto:a@b.c");
    expect(anchor.target).toBe("_blank");
    expect(getComputedStyle(anchor).backgroundColor).toBe("rgb(109, 40, 217)");
    expect(anchor.classList).toContain("caller-hook");
  });

  it("keeps the variants visually distinct", () => {
    const container = mount(() => <ButtonLink.Outline href="#">CV</ButtonLink.Outline>);
    const anchor = container.querySelector("a")!;

    expect(getComputedStyle(anchor).borderColor).toBe("rgb(109, 40, 217)");
    expect(getComputedStyle(anchor).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  });
});

describe("IconButton", () => {
  it("defaults to a non-submitting button and forwards handlers", () => {
    const onClick = vi.fn();
    const container = mount(() => (
      <IconButton aria-label="Toggle" onClick={onClick}>
        ☾
      </IconButton>
    ));
    const button = container.querySelector("button")!;

    expect(button.type).toBe("button");
    expect(button.getAttribute("aria-label")).toBe("Toggle");
    button.click();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("composes reactive caller styles after its defaults", async () => {
    const [active, setActive] = createSignal(false);
    const container = mount(() => (
      <IconButton aria-label="Toggle" styles={[styles.touch, active() && styles.active]} />
    ));
    const button = container.querySelector("button")!;

    expect(getComputedStyle(button).width).toBe("44px");
    expect(getComputedStyle(button).height).toBe("44px");
    expect(getComputedStyle(button).color).toBe("rgb(77, 77, 77)");
    setActive(true);
    await expect.poll(() => getComputedStyle(button).color).toBe("rgb(109, 40, 217)");
  });

  it("preserves vendor inline styles alongside dynamic StyleX variables", () => {
    const [width, setWidth] = createSignal("48px");
    const container = mount(() => (
      <IconButton
        aria-label="Positioned"
        styles={styles.dynamic(width())}
        style={{ "--arrow-size": "6px", transform: "translateX(2px)" }}
      />
    ));
    const button = container.querySelector("button")!;

    expect(getComputedStyle(button).width).toBe("48px");
    expect(button.style.getPropertyValue("--arrow-size")).toBe("6px");
    expect(button.style.transform).toBe("translateX(2px)");
    setWidth("52px");
    expect(getComputedStyle(button).width).toBe("52px");
    expect(button.style.getPropertyValue("--arrow-size")).toBe("6px");
  });
});

describe("compound parts", () => {
  it("pairs fact labels with values in a definition list", () => {
    const container = mount(() => (
      <Facts.List>
        <Facts.Item label="role">Engineer</Facts.Item>
      </Facts.List>
    ));

    expect(container.querySelector("dl dt")?.textContent).toBe("role");
    expect(container.querySelector("dl dd")?.textContent).toBe("Engineer");
  });

  it("hides the index leader from assistive technology", () => {
    const container = mount(() => (
      <IndexList.Root>
        <IndexList.Row>
          <span>Title</span>
          <IndexList.Leader />
          <IndexList.Value>2026</IndexList.Value>
        </IndexList.Row>
      </IndexList.Root>
    ));

    expect(container.querySelector("li [aria-hidden='true']")).not.toBeNull();
    expect(container.querySelector("li")?.textContent).toBe("Title2026");
  });

  it("renders entry bullets with a decorative marker", () => {
    const container = mount(() => (
      <Entry.Bullets>
        <Entry.Bullet>Shipped it</Entry.Bullet>
      </Entry.Bullets>
    ));
    const item = container.querySelector("ul > li")!;

    expect(item.querySelector("[aria-hidden='true']")?.textContent).toBe("›");
    expect(item.textContent).toContain("Shipped it");
  });
});
