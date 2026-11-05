import { describe, expect, it } from "vite-plus/test";
import { article_createManifest, type ArticleIndexEntry } from "@/lib/articles/article-manifest";
import {
  article_buildSearch,
  article_loadSearch,
  type ArticleSearch,
} from "@/lib/articles/article-search";

const entry: ArticleIndexEntry = {
  slug: "article",
  title: "A title",
  description: "A description",
  date: "2026.10.01",
  tags: ["engineering"],
  keywords: [],
  language: "en",
  bodyText: "Some prose",
};

function index(articles: ArticleIndexEntry[]) {
  const bundle = article_buildSearch(article_createManifest(articles));

  return article_loadSearch(JSON.parse(JSON.stringify(bundle)));
}

const page = { limit: 20, offset: 0 };

function slugs(search: ArticleSearch, q?: string) {
  return search.query({ ...page, q }).items.map(({ slug }) => slug);
}

describe("bundled article search", () => {
  it("returns an empty catalogue and no matches without an external index", () => {
    const search = index([]);

    expect(search.query(page)).toEqual({ items: [], total: 0 });
    expect(search.query({ ...page, q: "drizzle" })).toEqual({ items: [], total: 0 });
  });

  it("sorts by date then slug and applies exact tags before pagination and totals", () => {
    const search = index([
      { ...entry, slug: "older" },
      { ...entry, slug: "z-newer", date: "2026.10.03" },
      { ...entry, slug: "a-newer", date: "2026.10.03" },
      { ...entry, slug: "other", date: "2026.10.04", tags: ["engineering-notes"] },
    ]);

    expect(slugs(search)).toEqual(["other", "a-newer", "z-newer", "older"]);
    expect(search.query({ tag: "engineering", limit: 1, offset: 1 })).toEqual({
      items: [
        {
          slug: "z-newer",
          title: entry.title,
          description: entry.description,
          date: "2026.10.03",
          tags: entry.tags,
        },
      ],
      total: 3,
    });
    expect(search.query({ tag: "engineering", limit: 1, offset: 20 })).toEqual({
      items: [],
      total: 3,
    });
    expect(search.query({ ...page, tag: "Engineering" })).toEqual({ items: [], total: 0 });
  });

  it("ranks titles above descriptions and keywords, and both above body-only matches", () => {
    const search = index([
      { ...entry, slug: "title", title: "Drizzle schema", date: "2026.09.01" },
      { ...entry, slug: "description", description: "Drizzle schema" },
      { ...entry, slug: "keywords", keywords: ["Drizzle", "schema"] },
      { ...entry, slug: "body", bodyText: "Drizzle schema", date: "2026.10.03" },
    ]);
    const result = slugs(search, "drizzle");

    expect(result[0]).toBe("title");
    expect(result.indexOf("description")).toBeLessThan(result.indexOf("body"));
    expect(result.indexOf("keywords")).toBeLessThan(result.indexOf("body"));
    expect(search.query({ ...page, q: "drizzle", tag: "missing" })).toEqual({
      items: [],
      total: 0,
    });
  });

  it("stems queries with each article's language and ignores language-specific stopwords", () => {
    const search = index([
      { ...entry, slug: "english", title: "Developing applications", bodyText: "Running workers" },
      {
        ...entry,
        slug: "spanish",
        language: "es",
        title: "Desarrollando aplicaciones",
        description: "Guía práctica",
        bodyText: "Artículos en español",
      },
    ]);

    expect(slugs(search, "develop application")).toEqual(["english"]);
    expect(slugs(search, "run")).toEqual(["english"]);
    expect(slugs(search, "desarrollar aplicación")).toEqual(["spanish"]);
    expect(slugs(search, "el desarrollar")).toEqual(["spanish"]);
    expect(slugs(search, "THE developing")).toEqual(["english"]);
    expect(slugs(search, "the el")).toEqual([]);
    expect(slugs(search, "developingx")).toEqual([]);
  });

  it("requires quoted phrases in order, in one field, with stemming and stopword positions", () => {
    const search = index([
      { ...entry, slug: "phrase", bodyText: "Building typed queries with workers" },
      { ...entry, slug: "reverse", bodyText: "Building queries typed with workers" },
      { ...entry, slug: "gap", bodyText: "Building typed safe queries with workers" },
      { ...entry, slug: "fields", title: "Typed", bodyText: "Queries" },
    ]);

    expect(slugs(search, '"typed queries"')).toEqual(["phrase"]);
    expect(new Set(slugs(search, "typed queries"))).toEqual(
      new Set(["phrase", "reverse", "gap", "fields"]),
    );
    expect(slugs(search, '"typed and queries"')).toEqual(["gap"]);
    expect(slugs(search, '"typed query with worker"')).toEqual(["phrase"]);
    expect(slugs(search, '"typed queries')).toEqual(["phrase"]);
  });

  it("combines OR branches with AND terms and excludes words and quoted phrases", () => {
    const search = index([
      { ...entry, slug: "typed", bodyText: "Typed queries using Drizzle" },
      { ...entry, slug: "unsafe", bodyText: "Unsafe queries using Drizzle" },
      { ...entry, slug: "workers", bodyText: "Workers running at the edge" },
      { ...entry, slug: "other", bodyText: "Other subjects" },
    ]);

    expect(slugs(search, "drizzle -unsafe")).toEqual(["typed"]);
    expect(new Set(slugs(search, "drizzle -unsafe OR workers"))).toEqual(
      new Set(["typed", "workers"]),
    );
    expect(new Set(slugs(search, "drizzle -unsafe or workers"))).toEqual(
      new Set(["typed", "workers"]),
    );
    expect(new Set(slugs(search, 'drizzle -"unsafe queries"'))).toEqual(new Set(["typed"]));
    expect(slugs(search, "drizzle workers")).toEqual([]);
    expect(new Set(slugs(search, "-drizzle"))).toEqual(new Set(["workers", "other"]));
    expect(slugs(search, "OR drizzle -unsafe OR")).toEqual(["typed"]);
    expect(slugs(search, "drizzle impossible OR workers")).toEqual(["workers"]);
    expect(slugs(search, "-drizzle impossible")).toEqual([]);
    expect(slugs(search, "the OR drizzle -unsafe")).toEqual(["typed"]);
  });

  it("uses date/slug tie breaks for search and preserves filtered totals past the last page", () => {
    const search = index([
      { ...entry, slug: "z", title: "Drizzle schema", date: "2026.10.03" },
      { ...entry, slug: "a", title: "Drizzle schema", date: "2026.10.03" },
      { ...entry, slug: "old", title: "Drizzle schema" },
      { ...entry, slug: "excluded", title: "Drizzle schema", tags: ["other"] },
    ]);

    expect(search.query({ q: "drizzle", tag: "engineering", limit: 1, offset: 1 })).toEqual({
      items: [
        {
          slug: "z",
          title: "Drizzle schema",
          description: entry.description,
          date: "2026.10.03",
          tags: entry.tags,
        },
      ],
      total: 3,
    });
    expect(search.query({ q: "drizzle", tag: "engineering", limit: 1, offset: 3 })).toEqual({
      items: [],
      total: 3,
    });
  });
});
