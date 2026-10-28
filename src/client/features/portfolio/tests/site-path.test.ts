import { describe, expect, it } from "vite-plus/test";
import { sitePath_crumbs } from "../site-path";

describe("site path crumbs", () => {
  it("names the home route after the about page", () => {
    expect(sitePath_crumbs("/")).toEqual([{ label: "about", href: "/" }]);
  });

  it("links each segment to its own route and ignores a trailing slash", () => {
    expect(sitePath_crumbs("/writing/til-string-raw/")).toEqual([
      { label: "writing", href: "/writing" },
      { label: "til-string-raw", href: "/writing/til-string-raw" },
    ]);
  });
});
