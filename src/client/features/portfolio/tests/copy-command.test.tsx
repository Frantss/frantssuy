import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import type { JSX } from "solid-js";
import { render } from "solid-js/web";
import { CopyCommand } from "@/client/features/portfolio/copy-command";
import { setLocale } from "@/paraglide/runtime";

const command = "npx skills add Frantss/frantss-skills";

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

beforeEach(async () => {
  await setLocale("en", { reload: false });
});

afterEach(() => {
  dispose?.();
  vi.restoreAllMocks();
});

describe("CopyCommand", () => {
  it("copies the command", async () => {
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    const container = mount(() => <CopyCommand command={command} />);
    const button = container.querySelector("button")!;

    expect(container.querySelector("code")?.textContent).toBe(command);
    expect(button.getAttribute("aria-label")).toBe("Copy command");

    button.click();

    await expect
      .poll(() => container.querySelector('[role="status"]')?.textContent)
      .toBe("Command copied");
    expect(writeText).toHaveBeenCalledWith(command);
  });

  it("announces when copying fails", async () => {
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("denied"));
    const container = mount(() => <CopyCommand command={command} />);

    container.querySelector("button")!.click();

    await expect
      .poll(() => container.querySelector('[role="status"]')?.textContent)
      .toBe("Couldn't copy the command");
  });
});
