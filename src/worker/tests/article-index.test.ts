import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { describe, expect, it } from "vite-plus/test";
import type { article_queryIndex } from "@/server/features/articles/article-index";
import { router } from "@/server/orpc/orpc.router";
import { services } from "./bindings";
import { articles } from "./articles";

const handler = new OpenAPIHandler(router);

async function request(search = "") {
  const { response } = await handler.handle(new Request(`http://localhost/api/articles${search}`), {
    prefix: "/api",
    context: { ...services, headers: new Headers() },
  });

  return response!;
}

describe("bundled article catalogue", () => {
  it("filters tags, paginates, and reports the filtered total", async () => {
    const response = await request("?tag=engineering&limit=1&offset=1");
    const [title] = articles;

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      items: [
        {
          slug: title.slug,
          title: title.title,
          description: title.description,
          date: title.date,
          tags: title.tags,
        },
      ],
      total: 2,
    });
    expect(await (await request("?tag=missing")).json()).toEqual({ items: [], total: 0 });
  });

  it("returns relevant search results with bilingual stemming and search/tag intersection", async () => {
    const result = await (
      await request("?q=drizzle")
    ).json<ReturnType<typeof article_queryIndex>>();

    expect(result.items.map((article: { slug: string }) => article.slug)).toEqual([
      "index-test-title",
      "index-test-body",
    ]);
    expect(await (await request("?q=desarrollar")).json()).toMatchObject({
      items: [{ slug: "index-test-spanish" }],
      total: 1,
    });
    expect(await (await request("?q=database&tag=log")).json()).toMatchObject({
      items: [{ slug: "index-test-body" }],
      total: 1,
    });
  });

  it("preserves quoted phrases, OR, and exclusion through the HTTP query", async () => {
    const q = '"typed queries" OR desarrollar -drizzle';
    const result = await (
      await request(`?q=${encodeURIComponent(q)}`)
    ).json<ReturnType<typeof article_queryIndex>>();

    expect(new Set(result.items.map((article: { slug: string }) => article.slug))).toEqual(
      new Set(["index-test-title", "index-test-spanish"]),
    );
    expect(result.total).toBe(2);
    expect(
      await (await request(`?q=${encodeURIComponent('drizzle -"typed queries"')}`)).json(),
    ).toMatchObject({
      items: [{ slug: "index-test-body" }],
      total: 1,
    });
  });

  it("bounds query input", async () => {
    for (const search of [
      "?limit=0",
      "?limit=101",
      "?limit=1.5",
      "?offset=-1",
      "?offset=oops",
      `?q=${"a".repeat(201)}`,
      "?q=%20",
    ]) {
      expect((await request(search)).status, search).toBe(400);
    }
  });
});
