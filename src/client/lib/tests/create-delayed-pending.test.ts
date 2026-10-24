import { createRoot, createSignal } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { createDelayedPending } from "@/client/lib/create-delayed-pending";

const disposers: Array<() => void> = [];

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  disposers.splice(0).forEach((dispose) => dispose());
  vi.useRealTimers();
});

function mount(initial = false, options?: { delayMs?: number }) {
  return createRoot((dispose) => {
    disposers.push(dispose);
    const [pending, setPending] = createSignal(initial);
    const visible = createDelayedPending(pending, options);

    return { pending, setPending, visible, dispose };
  });
}

describe("delayed pending", () => {
  it("stays hidden until pending lasts for the default delay", () => {
    const { setPending, visible } = mount();

    expect(visible()).toBe(false);
    setPending(true);
    vi.advanceTimersByTime(299);
    expect(visible()).toBe(false);
    vi.advanceTimersByTime(1);
    expect(visible()).toBe(true);
  });

  it("starts hidden when mounted during an operation and respects the configured delay", () => {
    const { visible } = mount(true, { delayMs: 100 });

    expect(visible()).toBe(false);
    vi.advanceTimersByTime(99);
    expect(visible()).toBe(false);
    vi.advanceTimersByTime(1);
    expect(visible()).toBe(true);
  });

  it("cancels short operations and starts a fresh delay for the next one", () => {
    const { setPending, visible } = mount();

    setPending(true);
    vi.advanceTimersByTime(200);
    setPending(false);
    expect(vi.getTimerCount()).toBe(0);
    setPending(true);
    vi.advanceTimersByTime(100);
    expect(visible()).toBe(false);
    vi.advanceTimersByTime(199);
    expect(visible()).toBe(false);
    vi.advanceTimersByTime(1);
    expect(visible()).toBe(true);
  });

  it("hides immediately when pending ends and defers the next operation", () => {
    const { pending, setPending, visible } = mount(true);

    vi.advanceTimersByTime(300);
    expect(visible()).toBe(true);
    setPending(false);
    expect(pending()).toBe(false);
    expect(visible()).toBe(false);
    setPending(true);
    expect(pending()).toBe(true);
    expect(visible()).toBe(false);
  });

  it("clears its timer on disposal", () => {
    const { visible, dispose } = mount(true);

    expect(vi.getTimerCount()).toBe(1);
    dispose();
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(300);
    expect(visible()).toBe(false);
  });

  it("keeps independent operations isolated", () => {
    const first = mount(true);
    const second = mount();

    vi.advanceTimersByTime(200);
    second.setPending(true);
    vi.advanceTimersByTime(100);
    expect(first.visible()).toBe(true);
    expect(second.visible()).toBe(false);
    first.setPending(false);
    vi.advanceTimersByTime(200);
    expect(first.visible()).toBe(false);
    expect(second.visible()).toBe(true);
  });
});
