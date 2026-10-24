import { createSignal } from "solid-js";
import { render } from "solid-js/web";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { ArticleSearchFilter } from "@/client/features/portfolio/article-search-filter";
import type { ArticleSearch } from "@/client/features/portfolio/articles.query";

let dispose: (() => void) | undefined;

afterEach(() => {
  dispose?.();
  dispose = undefined;
  vi.useRealTimers();
});

function mount(initial: ArticleSearch = {}) {
  const [search, setSearch] = createSignal(initial);
  const change = vi.fn((next: ArticleSearch) => setSearch(next));
  const container = document.createElement("div");

  document.body.append(container);
  const stop = render(
    () => <ArticleSearchFilter search={search()} tags={["notes", "web"]} onChange={change} />,
    container,
  );

  dispose = () => {
    stop();
    container.remove();
  };
  const input = container.querySelector("input")!;
  const button = (name: string) =>
    [...container.querySelectorAll("button")].find(
      (element) => element.textContent === name || element.getAttribute("aria-label") === name,
    )!;

  function type(value: string) {
    input.value = value;
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));
  }

  return { container, input, button, type, change, setSearch };
}

describe("article search filters", () => {
  it("keeps the selected filter toggle's keyboard focus color", async () => {
    const { button } = mount({ tag: "web" });
    const toggle = button("Filters");

    expect(getComputedStyle(toggle).color).toBe("rgb(109, 40, 217)");
    toggle.focus();
    expect(toggle.matches(":focus-visible")).toBe(true);
    await expect.poll(() => getComputedStyle(toggle).color).toBe("rgb(23, 23, 23)");
  });

  it("keeps tags collapsed and retains the selected filter after closing them", () => {
    const { container, button, change } = mount({ q: "solid", offset: 40 });
    const group = container.querySelector<HTMLElement>("[role='group']")!;

    expect(group.inert).toBe(true);
    expect(group.getAttribute("aria-hidden")).toBe("true");
    button("Filters").click();
    expect(group.inert).toBe(false);
    expect(group.getAttribute("aria-hidden")).toBe("false");
    button("web").click();
    expect(change).toHaveBeenCalledWith({ q: "solid", tag: "web" }, false);
    expect(button("web").getAttribute("aria-pressed")).toBe("true");
    button("Filters").click();
    expect(group.inert).toBe(true);
    expect(group.getAttribute("aria-hidden")).toBe("true");
    expect(getComputedStyle(button("Filters")).borderColor).toBe("rgb(109, 40, 217)");
  });

  it("debounces typing and flushes the latest query when a tag is selected", () => {
    vi.useFakeTimers();
    const { type, button, change } = mount({ offset: 20 });

    type("so");
    vi.advanceTimersByTime(200);
    type("solid");
    vi.advanceTimersByTime(249);
    expect(change).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(change).toHaveBeenLastCalledWith({ q: "solid", tag: undefined }, true);
    type("solid query");
    button("Filters").click();
    button("web").click();
    expect(change).toHaveBeenLastCalledWith({ q: "solid query", tag: "web" }, false);
    vi.advanceTimersByTime(250);
    expect(change).toHaveBeenCalledTimes(2);
    button("Clear filters").click();
    expect(change).toHaveBeenLastCalledWith({ q: undefined, tag: undefined }, false);
  });

  it("clears only the query, cancels pending typing, and returns focus to search", () => {
    vi.useFakeTimers();
    const { input, type, button, change } = mount({ q: "solid", tag: "web", offset: 20 });

    type("pending");
    button("Clear search").click();
    expect(input.value).toBe("");
    expect(document.activeElement).toBe(input);
    expect(change).toHaveBeenLastCalledWith({ q: undefined, tag: "web" }, true);
    vi.advanceTimersByTime(250);
    expect(change).toHaveBeenCalledTimes(1);
  });

  it("clears the query with Escape but leaves composed input alone", () => {
    const { input, change } = mount({ q: "solid", tag: "web" });

    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", isComposing: true, bubbles: true }),
    );
    expect(change).not.toHaveBeenCalled();
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(input.value).toBe("");
    expect(change).toHaveBeenLastCalledWith({ q: undefined, tag: "web" }, true);
  });

  it("removes the visible active tag while the filter panel is collapsed", () => {
    const { container, button, change } = mount({ q: "solid", tag: "web", offset: 20 });

    expect(container.querySelector<HTMLElement>("[role='group']")!.inert).toBe(true);
    expect(button("Remove tag: web").closest("[inert]")).toBeNull();
    button("Remove tag: web").click();
    expect(change).toHaveBeenLastCalledWith({ q: "solid", tag: undefined }, false);
    expect(document.activeElement).toBe(button("Filters"));
    expect(container.querySelector('[aria-label="Remove tag: web"]')).toBeNull();
  });

  it("clears every filter and returns focus to search", () => {
    const { input, button, change } = mount({ q: "solid", tag: "web", offset: 20 });

    button("Clear filters").click();
    expect(input.value).toBe("");
    expect(change).toHaveBeenLastCalledWith({ q: undefined, tag: undefined }, false);
    expect(document.activeElement).toBe(input);
  });

  it("toggles the selected tag off without clearing the query", () => {
    const { button, change } = mount({ q: "solid", tag: "web" });

    button("Filters").click();
    button("web").click();
    expect(change).toHaveBeenLastCalledWith({ q: "solid", tag: undefined }, false);
  });

  it("cancels a pending search when navigation restores another query or the control unmounts", () => {
    vi.useFakeTimers();
    const { input, type, change, setSearch } = mount({ q: "solid" });

    type("pending");
    setSearch({ q: "router", tag: "notes" });
    expect(input.value).toBe("router");
    vi.advanceTimersByTime(250);
    expect(change).not.toHaveBeenCalled();
    type("pending again");
    dispose?.();
    dispose = undefined;
    vi.advanceTimersByTime(250);
    expect(change).not.toHaveBeenCalled();
  });

  it("waits for composed input to finish before searching", () => {
    vi.useFakeTimers();
    const { input, change } = mount();

    input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    input.value = "日本";
    input.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: true }));
    vi.advanceTimersByTime(500);
    expect(change).not.toHaveBeenCalled();
    input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
    vi.advanceTimersByTime(250);
    expect(change).toHaveBeenCalledWith({ q: "日本", tag: undefined }, true);
  });
});
