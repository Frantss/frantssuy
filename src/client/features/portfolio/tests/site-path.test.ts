import { describe, expect, it } from "vite-plus/test";
import { sitePath_segments } from "../site-path";

describe("site path segments", () => {
  it("names the home route after the about page", () => {
    expect(sitePath_segments("/")).toEqual(["about"]);
  });

  it("splits nested routes and ignores a trailing slash", () => {
    expect(sitePath_segments("/writing/til-string-raw/")).toEqual(["writing", "til-string-raw"]);
  });
});
