import { describe, expect, it } from "vite-plus/test";
import { activeSection_position } from "../create-active-section";

describe("active section position", () => {
  const tops = [100, 300, 500];

  it("is undefined before the first heading reaches the line", () => {
    expect(activeSection_position(tops, 50)).toBeUndefined();
  });

  it("moves continuously between headings", () => {
    expect(activeSection_position(tops, 100)).toBe(0);
    expect(activeSection_position(tops, 200)).toBe(0.5);
    expect(activeSection_position(tops, 450)).toBe(1.75);
  });

  it("stops at the last heading", () => {
    expect(activeSection_position(tops, 900)).toBe(2);
  });
});
