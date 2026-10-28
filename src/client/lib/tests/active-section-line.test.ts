import { describe, expect, it } from "vite-plus/test";
import { activeSection_lineRatio } from "../create-active-section";

describe("active section reading line", () => {
  it("rests a quarter of the way down until the last screen of scrolling", () => {
    expect(activeSection_lineRatio(0, 3000, 800)).toBe(0.25);
    expect(activeSection_lineRatio(1400, 3000, 800)).toBe(0.25);
  });

  it("slides to the bottom as the scroller reaches its end", () => {
    expect(activeSection_lineRatio(1800, 3000, 800)).toBe(0.625);
    expect(activeSection_lineRatio(2200, 3000, 800)).toBe(1);
  });

  it("starts lower on a page shorter than two screens", () => {
    expect(activeSection_lineRatio(0, 1200, 800)).toBe(0.625);
  });
});
