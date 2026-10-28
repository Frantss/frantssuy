import { describe, expect, it } from "vite-plus/test";
import { articles_groupByYear } from "../articles-by-year";

describe("articles grouped by year", () => {
  it("groups consecutive articles from the same year in order", () => {
    const groups = articles_groupByYear([
      { date: "2026.10.16" },
      { date: "2026.10.03" },
      { date: "2025.12.01" },
    ]);

    expect(groups.map((group) => [group.year, group.articles.length])).toEqual([
      ["2026", 2],
      ["2025", 1],
    ]);
  });

  it("returns no groups for no articles", () => {
    expect(articles_groupByYear([])).toEqual([]);
  });
});
