import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { render } from "solid-js/web";
import { AgentsPage } from "../agents-page";
import { portfolio_agents_outline } from "../portfolio.data";

let dispose: (() => void) | undefined;

afterEach(() => {
  dispose?.();
  dispose = undefined;
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

function renderPage() {
  const container = document.createElement("div");

  document.body.append(container);
  dispose = render(() => <AgentsPage />, container);

  return container;
}

function section(page: HTMLElement, id: string) {
  return page.querySelector(`section[aria-labelledby="${id}"]`);
}

describe("agents page", () => {
  it("gives the instruction files, the BDD workflow, and each everyday skill a heading that links to itself", () => {
    const page = renderPage();
    const headings = [...page.querySelectorAll<HTMLAnchorElement>("section h2 a")].map((link) => [
      link.textContent,
      link.getAttribute("href"),
      link.closest("h2")?.id,
    ]);

    expect(headings).toEqual([
      ["/agents.md", "#agents-md", "agents-md"],
      ["/orchestration.md", "#orchestration-md", "orchestration-md"],
      ["/bdd", "#bdd", "bdd"],
      ["/communicate", "#communicate", "communicate"],
      ["/refactoring", "#refactoring", "refactoring"],
      ["/atomic-commits", "#atomic-commits", "atomic-commits"],
    ]);
    expect(page.textContent).not.toContain("team-digest");
  });

  it("names the coding standards as emphasized terms", () => {
    const page = renderPage();
    const terms = [...(section(page, "agents-md")?.querySelectorAll("strong") ?? [])].map(
      (term) => term.textContent,
    );

    expect(terms).toEqual(expect.arrayContaining(["YAGNI", "KISS", "DIE", "SOLID"]));
  });

  it("shows the BDD workflow as ordered steps, each with what it produces", () => {
    const page = renderPage();
    const workflow = section(page, "bdd");
    const steps = [...(workflow?.querySelectorAll("ol > li") ?? [])];

    expect(workflow?.querySelector("h2")?.textContent).toContain("work in progress");
    expect(steps).toHaveLength(6);
    expect(steps[3]?.textContent).toBe("4/formulate-behavior→ Gherkin specs");
  });

  it("copies the Claude Code install commands by default", async () => {
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    const page = renderPage();

    expect(page.querySelector('button[aria-pressed="true"]')?.textContent).toBe("claude");
    page.querySelector<HTMLButtonElement>('button[aria-label="Copy command"]')?.click();

    await vi.waitFor(() =>
      expect(page.querySelector('[role="status"]')?.textContent).toBe("Command copied"),
    );
    expect(writeText).toHaveBeenCalledWith(
      "claude plugin marketplace add Frantss/frantss-skills\nclaude plugin install frantss-skills@frantss",
    );
  });

  it("switches to the npx skills installer", async () => {
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    const page = renderPage();
    const npx = [...page.querySelectorAll<HTMLButtonElement>('[role="group"] button')].find(
      (button) => button.textContent === "npx skills",
    );

    npx?.click();
    page.querySelector<HTMLButtonElement>('button[aria-label="Copy command"]')?.click();

    expect(npx?.getAttribute("aria-pressed")).toBe("true");
    expect(page.querySelector("code")?.textContent).toBe("npx skills add Frantss/frantss-skills");
    await vi.waitFor(() =>
      expect(writeText).toHaveBeenCalledWith("npx skills add Frantss/frantss-skills"),
    );
  });

  it("outlines every section", () => {
    expect(portfolio_agents_outline()).toEqual([
      { id: "agents-md", label: "agents.md" },
      { id: "orchestration-md", label: "orchestration.md" },
      { id: "bdd", label: "bdd" },
      { id: "communicate", label: "communicate" },
      { id: "refactoring", label: "refactoring" },
      { id: "atomic-commits", label: "atomic-commits" },
    ]);
  });
});
